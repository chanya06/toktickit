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
