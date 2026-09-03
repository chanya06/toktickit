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
