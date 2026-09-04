import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
import { createTicketAtomically } from "./utils/ticketNumber.js";
import { RequestedPriority } from "@prisma/client";

export const app = express();

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Health check endpoint
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// Categories endpoint
// ---------------------------------------------------------------------------
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ---------------------------------------------------------------------------
// Related Systems endpoint
// ---------------------------------------------------------------------------
app.get("/api/related-systems", async (_req: Request, res: Response) => {
  try {
    const systems = await getPrisma().relatedSystem.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    res.status(200).json(systems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch related systems" });
  }
});

// ---------------------------------------------------------------------------
// Development Requesters endpoint (Issue 7)
// ---------------------------------------------------------------------------
app.get("/api/requesters", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().developmentRequester.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        isActive: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    res.status(200).json(requesters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active development requesters" });
  }
});

// Helper to validate positive integer IDs (prevents NaN / invalid string formats causing 500 errors)
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

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const VALID_STATUSES = ["NEW", "OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];
const ALLOWED_SORT_FIELDS = ["createdAt", "ticketNumber", "summary", "status", "requestedPriority", "itPriority", "updatedAt"];

// Helper to parse multi-select query params (comma-separated string or array of strings)
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

// ---------------------------------------------------------------------------
// Get Owned Tickets (My Tickets) endpoint (Issue 10)
// ---------------------------------------------------------------------------
app.get("/api/tickets", async (req: Request, res: Response) => {
  try {
    const {
      requesterId,
      search,
      categoryId,
      relatedSystemId,
      requestedPriority,
      priority,
      status,
      sortBy,
      sortOrder,
      page,
      pageSize,
      limit,
    } = req.query;

    // 1. Mandatory requesterId parameter validation -> 400 Bad Request
    if (requesterId === undefined || requesterId === null || requesterId === "") {
      return res.status(400).json({ error: "requesterId parameter is required" });
    }

    if (!isPositiveInteger(requesterId)) {
      return res.status(400).json({ error: "requesterId must be a valid positive integer" });
    }

    const numericRequesterId = Number(requesterId);

    // 2. Pagination parameter validation -> 400 Bad Request
    let currentPage = 1;
    if (page !== undefined && page !== null && page !== "") {
      if (!isPositiveInteger(page)) {
        return res.status(400).json({ error: "page must be a valid positive integer" });
      }
      currentPage = Number(page);
    }

    let perPage = 10;
    const rawSize = pageSize !== undefined && pageSize !== null && pageSize !== "" ? pageSize : limit;
    if (rawSize !== undefined && rawSize !== null && rawSize !== "") {
      if (!isPositiveInteger(rawSize)) {
        return res.status(400).json({ error: "pageSize must be a valid positive integer" });
      }
      perPage = Math.min(Number(rawSize), 100);
    }

    // 3. Sorting parameter validation -> 400 Bad Request
    let sortField = "createdAt";
    if (sortBy !== undefined && sortBy !== null && sortBy !== "") {
      if (typeof sortBy !== "string" || !ALLOWED_SORT_FIELDS.includes(sortBy)) {
        return res.status(400).json({ error: "Invalid sortBy parameter" });
      }
      sortField = sortBy;
    }

    let sortDirection: "asc" | "desc" = "desc";
    if (sortOrder !== undefined && sortOrder !== null && sortOrder !== "") {
      if (typeof sortOrder !== "string" || !["asc", "desc"].includes(sortOrder.toLowerCase())) {
        return res.status(400).json({ error: "Invalid sortOrder parameter" });
      }
      sortDirection = sortOrder.toLowerCase() as "asc" | "desc";
    }

    // Build filter criteria
    const where: any = {
      requesterId: numericRequesterId,
    };

    // Category filter (supports multi-select comma-separated or array)
    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      const categoryStrList = parseMultiSelectParam(categoryId);
      if (categoryStrList.length === 0 || !categoryStrList.every(isPositiveInteger)) {
        return res.status(400).json({ error: "categoryId must be valid positive integer(s)" });
      }
      const categoryIds = categoryStrList.map(Number);
      where.categoryId = categoryIds.length === 1 ? categoryIds[0] : { in: categoryIds };
    }

    // Related System filter (supports multi-select comma-separated or array)
    if (relatedSystemId !== undefined && relatedSystemId !== null && relatedSystemId !== "") {
      const systemStrList = parseMultiSelectParam(relatedSystemId);
      if (systemStrList.length === 0 || !systemStrList.every(isPositiveInteger)) {
        return res.status(400).json({ error: "relatedSystemId must be valid positive integer(s)" });
      }
      const systemIds = systemStrList.map(Number);
      where.relatedSystemId = systemIds.length === 1 ? systemIds[0] : { in: systemIds };
    }

    // Priority filter (supports multi-select comma-separated or array for requestedPriority / priority)
    const priorityRaw = requestedPriority || priority;
    if (priorityRaw !== undefined && priorityRaw !== null && priorityRaw !== "") {
      const priorityStrList = parseMultiSelectParam(priorityRaw).map((s) => s.toUpperCase());
      if (priorityStrList.length === 0 || !priorityStrList.every((p) => VALID_PRIORITIES.includes(p))) {
        return res.status(400).json({ error: "Invalid priority filter value" });
      }
      where.requestedPriority = priorityStrList.length === 1 ? priorityStrList[0] : { in: priorityStrList };
    }

    // Status filter (supports multi-select comma-separated or array)
    if (status !== undefined && status !== null && status !== "") {
      const statusStrList = parseMultiSelectParam(status).map((s) => s.toUpperCase());
      if (statusStrList.length === 0 || !statusStrList.every((s) => VALID_STATUSES.includes(s))) {
        return res.status(400).json({ error: "Invalid status filter value" });
      }
      where.status = statusStrList.length === 1 ? statusStrList[0] : { in: statusStrList };
    }

    // Search query filter (contract specified: across ticketNumber and summary ONLY)
    if (search !== undefined && search !== null && search !== "") {
      const searchStr = String(search).trim();
      if (searchStr !== "") {
        where.OR = [
          { ticketNumber: { contains: searchStr, mode: "insensitive" } },
          { summary: { contains: searchStr, mode: "insensitive" } },
        ];
      }
    }

    const skip = (currentPage - 1) * perPage;
    const take = perPage;

    const prisma = getPrisma();

    const [tickets, totalItems] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: [
          { [sortField]: sortDirection },
          { id: sortDirection }, // Deterministic secondary sorting
        ],
        skip,
        take,
        select: {
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
          createdAt: true,
          updatedAt: true,
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
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
          attachments: {
            where: {
              isRemoved: false,
            },
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    const formattedData = tickets.map((ticket) => {
      const { attachments, ...rest } = ticket;
      return {
        ...rest,
        attachmentCount: attachments ? attachments.length : 0,
      };
    });

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / perPage);

    return res.status(200).json({
      data: formattedData,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        pageSize: perPage,
      },
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    return res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// ---------------------------------------------------------------------------
// Get Owned Ticket Detail endpoint with Ownership Guard (Issue 12)
// ---------------------------------------------------------------------------
app.get("/api/tickets/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const headerRequesterId = req.headers["x-requester-id"];
    const queryRequesterId = req.query.requesterId;
    const rawRequesterId = queryRequesterId !== undefined && queryRequesterId !== null && queryRequesterId !== ""
      ? queryRequesterId
      : headerRequesterId;

    // 1. Ticket ID format validation -> 400 Bad Request
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    // 2. Requester ID mandatory validation -> 400 Bad Request
    if (rawRequesterId === undefined || rawRequesterId === null || rawRequesterId === "") {
      return res.status(400).json({ error: "requesterId parameter is required" });
    }

    if (!isPositiveInteger(rawRequesterId)) {
      return res.status(400).json({ error: "requesterId must be a valid positive integer" });
    }

    const ticketId = Number(id);
    const numericRequesterId = Number(rawRequesterId);

    const prisma = getPrisma();

    // 3. Find target ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
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
        createdAt: true,
        updatedAt: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
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
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // 4. Enforce strict requester ownership check -> 403 Forbidden
    if (ticket.requesterId !== numericRequesterId) {
      return res.status(403).json({ error: "Forbidden: You do not have access to this ticket" });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Get ticket detail error:", error);
    return res.status(500).json({ error: "Failed to fetch ticket detail" });
  }
});

app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const { requesterId, categoryId, relatedSystemId, requestedPriority, summary, description } = req.body;

    // 1. Missing fields validation -> 400 Bad Request
    if (
      requesterId === undefined ||
      categoryId === undefined ||
      relatedSystemId === undefined ||
      !requestedPriority ||
      summary === undefined ||
      description === undefined
    ) {
      return res.status(400).json({ error: "Missing required ticket fields" });
    }

    // 2. ID format validation -> 400 Bad Request
    if (
      !isPositiveInteger(requesterId) ||
      !isPositiveInteger(categoryId) ||
      !isPositiveInteger(relatedSystemId)
    ) {
      return res.status(400).json({ error: "requesterId, categoryId, and relatedSystemId must be valid positive integers" });
    }

    // 2. Enum validation -> 400 Bad Request
    if (!VALID_PRIORITIES.includes(requestedPriority)) {
      return res.status(400).json({ error: "Invalid requestedPriority value" });
    }

    const trimmedSummary = String(summary).trim();
    const trimmedDescription = String(description).trim();

    // 3. String length validation -> 422 Unprocessable Entity
    if (trimmedSummary.length < 5 || trimmedSummary.length > 120) {
      return res.status(422).json({ error: "Ticket Summary must be between 5 and 120 characters" });
    }

    if (trimmedDescription.length < 10 || trimmedDescription.length > 2000) {
      return res.status(422).json({ error: "Ticket Description must be between 10 and 2000 characters" });
    }

    const prisma = getPrisma();

    // 4. Active entities validation -> 422 Unprocessable Entity
    const requester = await prisma.developmentRequester.findFirst({
      where: { id: Number(requesterId), isActive: true },
    });
    if (!requester) {
      return res.status(422).json({ error: "Active Development Requester not found" });
    }

    const category = await prisma.category.findFirst({
      where: { id: Number(categoryId), isActive: true },
    });
    if (!category) {
      return res.status(422).json({ error: "Active Category not found" });
    }

    const relatedSystem = await prisma.relatedSystem.findFirst({
      where: { id: Number(relatedSystemId), isActive: true },
    });
    if (!relatedSystem) {
      return res.status(422).json({ error: "Active Related System not found" });
    }

    // 5. Generate Ticket Number & create Ticket atomically (handles concurrency & collisions via transaction retry)
    const newTicket = await createTicketAtomically(prisma, {
      requesterId: Number(requesterId),
      categoryId: Number(categoryId),
      relatedSystemId: Number(relatedSystemId),
      requestedPriority: requestedPriority as RequestedPriority,
      summary: trimmedSummary,
      description: trimmedDescription,
      itPriority: "MEDIUM",
      status: "NEW",
    });

    return res.status(201).json(newTicket);
  } catch (error) {
    console.error("Create ticket error:", error);
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

export default app;
