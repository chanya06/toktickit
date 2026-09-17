import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { Role, TicketStatus, ITPriority, Prisma } from "@prisma/client";
import {
  requireAuth,
  requirePasswordChanged,
  requireRole,
} from "../middleware/auth.js";

export const staffRouter = Router();

// Enforce IT_STAFF or ADMINISTRATOR role with active session and changed password (BR-02, AC-05, FR-10)
staffRouter.use(requireAuth);
staffRouter.use(requirePasswordChanged);
staffRouter.use(requireRole(Role.IT_STAFF, Role.ADMINISTRATOR));

function isPositiveInteger(val: any): boolean {
  if (typeof val === "number") {
    return Number.isInteger(val) && val > 0;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    return /^\d+$/.test(trimmed) && Number(trimmed) > 0;
  }
  return false;
}

function parseMultiSelectParam(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.flatMap((item) => String(item).split(",")).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof val === "string") {
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [String(val).trim()].filter(Boolean);
}

const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "itPriority",
  "status",
  "ticketNumber",
  "summary",
  "updatedAt",
  "requestedPriority",
];

// ---------------------------------------------------------------------------
// GET /api/staff/tickets — IT Staff Ticket Queue & Query Engine (FR-10, AC-05)
// ---------------------------------------------------------------------------
staffRouter.get("/tickets", async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const {
      search,
      category,
      categoryId,
      status,
      itPriority,
      priority,
      ownerId,
      page,
      limit,
      pageSize,
      sortBy,
      sortDir,
      sortOrder,
    } = req.query;

    const where: Prisma.TicketWhereInput = {};

    // 1. Text search across ticketNumber OR summary (case-insensitive substring)
    if (search && typeof search === "string" && search.trim() !== "") {
      const query = search.trim();
      where.OR = [
        { ticketNumber: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
      ];
    }

    // 2. Category filter (supports category or categoryId, single or comma-separated)
    const rawCategory = category || categoryId;
    if (rawCategory) {
      const categoryIds = parseMultiSelectParam(rawCategory)
        .map(Number)
        .filter((id) => !isNaN(id) && id > 0);
      if (categoryIds.length === 1) {
        where.categoryId = categoryIds[0];
      } else if (categoryIds.length > 1) {
        where.categoryId = { in: categoryIds };
      }
    }

    // 3. Status filter (supports single or comma-separated TicketStatus enums)
    if (status) {
      const validStatuses = Object.values(TicketStatus);
      const parsedStatuses = parseMultiSelectParam(status)
        .map((s) => s.toUpperCase())
        .filter((s): s is TicketStatus => validStatuses.includes(s as TicketStatus));

      if (parsedStatuses.length === 1) {
        where.status = parsedStatuses[0];
      } else if (parsedStatuses.length > 1) {
        where.status = { in: parsedStatuses };
      } else {
        where.status = { in: [] };
      }
    }

    // 4. IT Priority filter (supports itPriority or priority, single or comma-separated)
    const rawPriority = itPriority || priority;
    if (rawPriority) {
      const validPriorities = Object.values(ITPriority);
      const parsedPriorities = parseMultiSelectParam(rawPriority)
        .map((p) => p.toUpperCase())
        .filter((p): p is ITPriority => validPriorities.includes(p as ITPriority));

      if (parsedPriorities.length === 1) {
        where.itPriority = parsedPriorities[0];
      } else if (parsedPriorities.length > 1) {
        where.itPriority = { in: parsedPriorities };
      } else {
        where.itPriority = { in: [] };
      }
    }

    // 5. OwnerId filter ('unassigned' | 'me' | integer user ID)
    if (ownerId !== undefined && ownerId !== null && String(ownerId).trim() !== "") {
      const ownerStr = String(ownerId).trim().toLowerCase();
      if (ownerStr === "unassigned" || ownerStr === "none" || ownerStr === "null") {
        where.ownerId = null;
      } else if (ownerStr === "me") {
        where.ownerId = req.user!.id;
      } else if (ownerStr !== "all") {
        const numId = Number(ownerStr);
        if (!isNaN(numId) && numId > 0) {
          where.ownerId = numId;
        }
      }
    }

    // 6. Pagination parameters
    let pageNum = 1;
    if (page && isPositiveInteger(page)) {
      pageNum = Number(page);
    }

    let limitNum = 10;
    const rawLimit = limit || pageSize;
    if (rawLimit && isPositiveInteger(rawLimit)) {
      limitNum = Math.min(100, Math.max(1, Number(rawLimit)));
    }

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    // 7. Sorting parameters
    let sortField = "createdAt";
    if (sortBy && typeof sortBy === "string" && ALLOWED_SORT_FIELDS.includes(sortBy)) {
      sortField = sortBy;
    }

    let sortDirection: "asc" | "desc" = "desc";
    const rawDir = (sortDir || sortOrder || "").toString().toLowerCase();
    if (rawDir === "asc" || rawDir === "desc") {
      sortDirection = rawDir;
    }

    // Execute query and total count in parallel
    const [tickets, totalCount] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { [sortField]: sortDirection },
        skip,
        take,
        select: {
          id: true,
          ticketNumber: true,
          summary: true,
          description: true,
          status: true,
          requestedPriority: true,
          itPriority: true,
          isResolutionIndicated: true,
          ownerId: true,
          categoryId: true,
          relatedSystemId: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: { id: true, name: true },
          },
          relatedSystem: {
            select: { id: true, name: true },
          },
          requester: {
            select: {
              id: true,
              fullName: true,
              name: true,
              email: true,
              department: true,
            },
          },
          owner: {
            select: {
              id: true,
              fullName: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              attachments: { where: { isRemoved: false } },
              publicComments: true,
              internalNotes: true,
            },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    const mappedData = tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      summary: t.summary,
      description: t.description,
      category: t.category,
      relatedSystem: t.relatedSystem,
      requestedPriority: t.requestedPriority,
      itPriority: t.itPriority,
      status: t.status,
      currentStatus: t.status,
      isResolutionIndicated: t.isResolutionIndicated,
      requesterId: t.requester?.id,
      requester: t.requester
        ? {
            id: t.requester.id,
            fullName: t.requester.fullName || t.requester.name || "",
            email: t.requester.email,
            department: t.requester.department,
          }
        : null,
      ownerId: t.ownerId,
      owner: t.owner
        ? {
            id: t.owner.id,
            fullName: t.owner.fullName || t.owner.name || "",
            email: t.owner.email,
            role: t.owner.role,
          }
        : null,
      ticketOwner: t.owner ? t.owner.fullName || t.owner.name || "IT Staff" : "Unassigned",
      attachmentCount: t._count?.attachments ?? 0,
      publicCommentCount: t._count?.publicComments ?? 0,
      internalNoteCount: t._count?.internalNotes ?? 0,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return res.status(200).json({
      data: mappedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        totalItems: totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching staff tickets queue:", error);
    return res.status(500).json({ error: "Failed to fetch staff tickets queue" });
  }
});

// ---------------------------------------------------------------------------
// Permitted Status Transition Matrix (BR-14, FR-13, AC-07)
// ---------------------------------------------------------------------------
export const PERMITTED_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.NEW]: [TicketStatus.OPEN, TicketStatus.CANCELLED],
  [TicketStatus.OPEN]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.WAITING_FOR_REQUESTER,
    TicketStatus.RESOLVED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.IN_PROGRESS]: [
    TicketStatus.WAITING_FOR_REQUESTER,
    TicketStatus.RESOLVED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.WAITING_FOR_REQUESTER]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.REOPENED],
  [TicketStatus.CLOSED]: [TicketStatus.REOPENED],
  [TicketStatus.CANCELLED]: [TicketStatus.OPEN],
};

const defaultTicketDetailSelect = {
  id: true,
  ticketNumber: true,
  requesterId: true,
  categoryId: true,
  relatedSystemId: true,
  summary: true,
  description: true,
  requestedPriority: true,
  itPriority: true,
  status: true,
  ticketOwner: true,
  ownerId: true,
  isResolutionIndicated: true,
  createdAt: true,
  updatedAt: true,
  requester: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  owner: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  relatedSystem: {
    select: {
      id: true,
      name: true,
    },
  },
};

function formatDetailResponse(t: any) {
  return {
    ...t,
    createdAt: t.createdAt.toISOString ? t.createdAt.toISOString() : t.createdAt,
    updatedAt: t.updatedAt.toISOString ? t.updatedAt.toISOString() : t.updatedAt,
    requester: t.requester
      ? {
          ...t.requester,
          name: t.requester.fullName,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// GET /api/staff/assignees — Active Staff & Admins for Ticket Assignment
// ---------------------------------------------------------------------------
staffRouter.get("/assignees", async (_req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: [Role.IT_STAFF, Role.ADMINISTRATOR] },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
      orderBy: { fullName: "asc" },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching staff assignees:", error);
    return res.status(500).json({ error: "Failed to fetch staff assignees" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/staff/tickets/:id/claim — Claim Ticket Ownership (FR-11, AC-06, API-07)
// ---------------------------------------------------------------------------
staffRouter.patch("/tickets/:id/claim", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    const ticketId = Number(id);
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const currentUserId = req.user!.id;
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    // Auto-transition NEW -> OPEN upon claim (BR-14)
    const newStatus = ticket.status === TicketStatus.NEW ? TicketStatus.OPEN : ticket.status;

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        ownerId: currentUserId,
        ticketOwner: currentUser?.fullName || req.user!.email,
        status: newStatus,
      },
      select: defaultTicketDetailSelect,
    });

    return res.status(200).json({
      message: "Ticket claimed successfully",
      ticket: formatDetailResponse(updated),
    });
  } catch (error) {
    console.error("Error claiming ticket:", error);
    return res.status(500).json({ error: "Failed to claim ticket" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/staff/tickets/:id/assign — Assign Ticket Ownership (FR-11, AC-06, API-07)
// ---------------------------------------------------------------------------
staffRouter.patch("/tickets/:id/assign", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    const ticketId = Number(id);
    const { ownerId } = req.body;
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Support unassigning
    if (ownerId === null || ownerId === undefined || ownerId === "unassigned" || ownerId === "") {
      const updated = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          ownerId: null,
          ticketOwner: null,
        },
        select: defaultTicketDetailSelect,
      });

      return res.status(200).json({
        message: "Ticket unassigned successfully",
        ticket: formatDetailResponse(updated),
      });
    }

    if (!isPositiveInteger(ownerId)) {
      return res.status(400).json({ error: "ownerId must be a valid positive integer or null" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: Number(ownerId) },
    });

    if (!targetUser) {
      return res.status(422).json({ error: "Target assignee user not found" });
    }

    if (!targetUser.isActive) {
      return res.status(422).json({ error: "Cannot assign ticket to an inactive user" });
    }

    if (targetUser.role !== Role.IT_STAFF && targetUser.role !== Role.ADMINISTRATOR) {
      return res.status(422).json({ error: "Ticket owner must have IT_STAFF or ADMINISTRATOR role" });
    }

    // Auto-transition NEW -> OPEN upon assignment (BR-14)
    const newStatus = ticket.status === TicketStatus.NEW ? TicketStatus.OPEN : ticket.status;

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        ownerId: targetUser.id,
        ticketOwner: targetUser.fullName,
        status: newStatus,
      },
      select: defaultTicketDetailSelect,
    });

    return res.status(200).json({
      message: "Ticket assigned successfully",
      ticket: formatDetailResponse(updated),
    });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return res.status(500).json({ error: "Failed to assign ticket" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/staff/tickets/:id/it-priority — Update IT Priority (FR-12, AC-05)
// ---------------------------------------------------------------------------
staffRouter.patch("/tickets/:id/it-priority", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    const ticketId = Number(id);
    const { itPriority } = req.body;

    if (
      !itPriority ||
      typeof itPriority !== "string" ||
      !Object.values(ITPriority).includes(itPriority.toUpperCase() as ITPriority)
    ) {
      return res.status(400).json({
        error: "Invalid itPriority parameter. Permitted values: LOW, MEDIUM, HIGH, URGENT",
      });
    }

    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        itPriority: itPriority.toUpperCase() as ITPriority,
      },
      select: defaultTicketDetailSelect,
    });

    return res.status(200).json({
      message: "Ticket IT Priority updated successfully",
      ticket: formatDetailResponse(updated),
    });
  } catch (error) {
    console.error("Error updating IT priority:", error);
    return res.status(500).json({ error: "Failed to update IT priority" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/staff/tickets/:id/status — Status Transition Matrix Enforcement (FR-13, BR-14, AC-07, API-08)
// ---------------------------------------------------------------------------
staffRouter.patch("/tickets/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    const ticketId = Number(id);
    const { status } = req.body;

    if (
      !status ||
      typeof status !== "string" ||
      !Object.values(TicketStatus).includes(status.toUpperCase() as TicketStatus)
    ) {
      return res.status(400).json({
        error: "Invalid status parameter. Must be a valid TicketStatus value",
      });
    }

    const targetStatus = status.toUpperCase() as TicketStatus;
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const currentStatus = ticket.status;

    // If status is identical, return current ticket state
    if (currentStatus === targetStatus) {
      const formatted = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: defaultTicketDetailSelect,
      });
      return res.status(200).json({
        message: "Ticket status unchanged",
        ticket: formatDetailResponse(formatted!),
      });
    }

    // Validate transition against BR-14 status matrix
    const permittedNext = PERMITTED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!permittedNext.includes(targetStatus)) {
      return res.status(422).json({
        error: `Invalid status transition: Cannot transition from ${currentStatus} to ${targetStatus}`,
        currentStatus,
        targetStatus,
        permittedStatuses: permittedNext,
      });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: targetStatus,
      },
      select: defaultTicketDetailSelect,
    });

    return res.status(200).json({
      message: "Ticket status updated successfully",
      ticket: formatDetailResponse(updated),
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res.status(500).json({ error: "Failed to update ticket status" });
  }
});

