import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { Role, TicketStatus, ITPriority } from "@prisma/client";
import {
  requireAuth,
  requirePasswordChanged,
  requireRole,
} from "../middleware/auth.js";

export const dashboardRouter = Router();

// Helper to format ticket for dashboard lists
function formatDashboardTicket(t: any) {
  return {
    id: t.id,
    ticketNumber: t.ticketNumber,
    summary: t.summary,
    category: t.category?.name || "General",
    status: t.status,
    itPriority: t.itPriority,
    isResolutionIndicated: t.isResolutionIndicated ?? false,
    owner: t.owner ? { fullName: t.owner.fullName } : null,
    actionsCount: t._count ? t._count.actionsTaken : 0,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/requester — Requester Dashboard Metrics (AC-06, FR-07, BR-07)
// ---------------------------------------------------------------------------
dashboardRouter.get(
  "/requester",
  requireAuth,
  requirePasswordChanged,
  requireRole(Role.REQUESTER),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const prisma = getPrisma();
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Execute authoritative aggregations in parallel strictly isolated to authenticated user
      const [
        myOpenTickets,
        waitingForRequester,
        recentlyUpdated,
        recentlyResolved,
        recentTicketsRaw,
      ] = await Promise.all([
        // 1. Open active tickets (NEW, OPEN, IN_PROGRESS, PENDING, REOPENED)
        prisma.ticket.count({
          where: {
            requesterId: user.id,
            status: {
              in: [
                TicketStatus.NEW,
                TicketStatus.OPEN,
                TicketStatus.IN_PROGRESS,
                TicketStatus.PENDING,
                TicketStatus.REOPENED,
              ],
            },
          },
        }),
        // 2. Waiting for requester input
        prisma.ticket.count({
          where: {
            requesterId: user.id,
            status: TicketStatus.WAITING_FOR_REQUESTER,
          },
        }),
        // 3. Updated within past 7 days
        prisma.ticket.count({
          where: {
            requesterId: user.id,
            updatedAt: { gte: sevenDaysAgo },
          },
        }),
        // 4. Formally resolved or closed within past 30 days
        prisma.ticket.count({
          where: {
            requesterId: user.id,
            status: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
            updatedAt: { gte: thirtyDaysAgo },
          },
        }),
        // 5. Recent tickets owned by requester
        prisma.ticket.findMany({
          where: { requesterId: user.id },
          orderBy: { updatedAt: "desc" },
          take: 10,
          include: {
            category: { select: { name: true } },
            owner: { select: { fullName: true } },
            _count: { select: { actionsTaken: true } },
          },
        }),
      ]);

      const recentTickets = recentTicketsRaw.map(formatDashboardTicket);

      return res.status(200).json({
        metrics: {
          myOpenTickets,
          waitingForRequester,
          recentlyUpdated,
          recentlyResolved,
        },
        recentTickets,
      });
    } catch (error) {
      console.error("Error fetching requester dashboard:", error);
      return res.status(500).json({ error: "Failed to fetch requester dashboard metrics" });
    }
  }
);

// Helper to compute staff operational metrics
async function computeStaffOperationalMetrics(userId: number) {
  const prisma = getPrisma();
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    unassignedTickets,
    myAssignedTickets,
    statusGroup,
    priorityGroup,
    recentlyUpdatedCount,
    urgentTicketsRaw,
    recentTicketsRaw,
  ] = await Promise.all([
    // 1. Unassigned tickets in queue (active tickets only per BR-10)
    prisma.ticket.count({
      where: {
        ownerId: null,
        status: {
          notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED],
        },
      },
    }),
    // 2. Tickets assigned to authenticated staff member (active tickets only per BR-10)
    prisma.ticket.count({
      where: {
        ownerId: userId,
        status: {
          notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED],
        },
      },
    }),
    // 3. Distribution breakdown by ticket status
    prisma.ticket.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    // 4. Distribution breakdown by IT priority (active operational workload only per BR-10)
    prisma.ticket.groupBy({
      by: ["itPriority"],
      where: {
        status: {
          notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED],
        },
      },
      _count: { itPriority: true },
    }),
    // 5. Tickets updated within the past 24 hours
    prisma.ticket.count({
      where: { updatedAt: { gte: twentyFourHoursAgo } },
    }),
    // 6. Urgent tickets for operational triage (active, not closed/cancelled/resolved)
    prisma.ticket.findMany({
      where: {
        itPriority: ITPriority.URGENT,
        status: {
          notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED],
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        category: { select: { name: true } },
        owner: { select: { fullName: true } },
        _count: { select: { actionsTaken: true } },
      },
    }),
    // 7. Recent tickets overall
    prisma.ticket.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        category: { select: { name: true } },
        owner: { select: { fullName: true } },
        _count: { select: { actionsTaken: true } },
      },
    }),
  ]);

  // Construct byStatus with guaranteed 0 for all enum values (Section 3.4 Zero Metric Guarantees)
  const byStatus: Record<string, number> = {
    NEW: 0,
    OPEN: 0,
    IN_PROGRESS: 0,
    WAITING_FOR_REQUESTER: 0,
    PENDING: 0,
    RESOLVED: 0,
    CLOSED: 0,
    REOPENED: 0,
    CANCELLED: 0,
  };
  for (const item of statusGroup) {
    byStatus[item.status] = item._count.status;
  }

  // Construct byPriority with guaranteed 0 for all enum values
  const byPriority: Record<string, number> = {
    URGENT: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };
  for (const item of priorityGroup) {
    byPriority[item.itPriority] = item._count.itPriority;
  }

  return {
    metrics: {
      unassignedTickets,
      myAssignedTickets,
      byStatus,
      byPriority,
      recentlyUpdatedCount,
    },
    urgentTickets: urgentTicketsRaw.map(formatDashboardTicket),
    recentTickets: recentTicketsRaw.map(formatDashboardTicket),
  };
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/staff — IT Staff Dashboard Metrics (AC-08, FR-09)
// ---------------------------------------------------------------------------
dashboardRouter.get(
  "/staff",
  requireAuth,
  requirePasswordChanged,
  requireRole(Role.IT_STAFF, Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const staffMetrics = await computeStaffOperationalMetrics(user.id);
      return res.status(200).json(staffMetrics);
    } catch (error) {
      console.error("Error fetching staff dashboard:", error);
      return res.status(500).json({ error: "Failed to fetch IT staff dashboard metrics" });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/dashboard/admin — Administrator Dashboard & User Counts (FR-11)
// ---------------------------------------------------------------------------
dashboardRouter.get(
  "/admin",
  requireAuth,
  requirePasswordChanged,
  requireRole(Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const prisma = getPrisma();

      // Parallelize operational metrics and system user statistics
      const [staffMetrics, totalUsers, activeRequesters, activeStaff, administrators, inactiveUsers] =
        await Promise.all([
          computeStaffOperationalMetrics(user.id),
          prisma.user.count(),
          prisma.user.count({ where: { role: Role.REQUESTER, isActive: true } }),
          prisma.user.count({ where: { role: Role.IT_STAFF, isActive: true } }),
          prisma.user.count({ where: { role: Role.ADMINISTRATOR, isActive: true } }),
          prisma.user.count({ where: { isActive: false } }),
        ]);

      return res.status(200).json({
        systemUserStats: {
          totalUsers,
          activeRequesters,
          activeStaff,
          administrators,
          inactiveUsers,
        },
        operationalMetrics: staffMetrics.metrics,
        urgentTickets: staffMetrics.urgentTickets,
        recentTickets: staffMetrics.recentTickets,
      });
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
      return res.status(500).json({ error: "Failed to fetch administrator dashboard metrics" });
    }
  }
);

