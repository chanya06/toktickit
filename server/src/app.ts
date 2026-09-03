import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
import { generateNextTicketNumber } from "./utils/ticketNumber.js";
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

// ---------------------------------------------------------------------------
// Create Ticket Endpoint (Issue 8)
// ---------------------------------------------------------------------------
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const { requesterId, categoryId, relatedSystemId, requestedPriority, summary, description } = req.body;

    // 1. Missing fields validation -> 400 Bad Request
    if (!requesterId || !categoryId || !relatedSystemId || !requestedPriority || summary === undefined || description === undefined) {
      return res.status(400).json({ error: "Missing required ticket fields" });
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

    // 5. Generate Ticket Number & create Ticket
    const ticketNumber = await generateNextTicketNumber(prisma);

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        requesterId: Number(requesterId),
        categoryId: Number(categoryId),
        relatedSystemId: Number(relatedSystemId),
        requestedPriority: requestedPriority as RequestedPriority,
        summary: trimmedSummary,
        description: trimmedDescription,
        itPriority: "MEDIUM",
        status: "NEW",
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        relatedSystem: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json(newTicket);
  } catch (error) {
    console.error("Create ticket error:", error);
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

export default app;
