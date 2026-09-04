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

    // Build filter criteria
    const where: any = {
      requesterId: numericRequesterId,
    };

    // Category filter
    if (categoryId !== undefined && isPositiveInteger(categoryId)) {
      where.categoryId = Number(categoryId);
    }

    // Related System filter
    if (relatedSystemId !== undefined && isPositiveInteger(relatedSystemId)) {
      where.relatedSystemId = Number(relatedSystemId);
    }

    // Priority filter (supports requestedPriority or priority)
    const priorityVal = (requestedPriority || priority) as string | undefined;
    if (priorityVal && VALID_PRIORITIES.includes(priorityVal.toUpperCase())) {
      where.requestedPriority = priorityVal.toUpperCase();
    }

    // Status filter
    if (status && typeof status === "string" && VALID_STATUSES.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    // Search query filter (across ticketNumber, summary, description)
    if (search && typeof search === "string" && search.trim() !== "") {
      const searchStr = search.trim();
      where.OR = [
        { ticketNumber: { contains: searchStr, mode: "insensitive" } },
        { summary: { contains: searchStr, mode: "insensitive" } },
        { description: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    // Sorting
    const sortField = typeof sortBy === "string" && ALLOWED_SORT_FIELDS.includes(sortBy)
      ? sortBy
      : "createdAt";
    const sortDirection = typeof sortOrder === "string" && sortOrder.toLowerCase() === "asc"
      ? "asc"
      : "desc";

    // Pagination
    const pageNum = parseInt(String(page || 1), 10);
    const currentPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;

    const sizeVal = pageSize || limit || 10;
    const sizeNum = parseInt(String(sizeVal), 10);
    const perPage = isNaN(sizeNum) || sizeNum < 1 ? 10 : Math.min(sizeNum, 100);

    const skip = (currentPage - 1) * perPage;
    const take = perPage;

    const prisma = getPrisma();

    const [tickets, totalItems] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: {
          [sortField]: sortDirection,
        },
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
