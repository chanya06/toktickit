import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { Role, TicketStatus } from "@prisma/client";

export const commentsRouter = Router();

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

// ---------------------------------------------------------------------------
// GET /api/tickets/:id/comments — Fetch Public Comments (BR-15)
// ---------------------------------------------------------------------------
commentsRouter.get("/:id/comments", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Authentication required" });
    }

    if (req.user.mustChangePassword) {
      return res.status(403).json({
        error: "Password change required before accessing the application",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    const ticketId = Number(id);
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, requesterId: true },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Role check: If caller is REQUESTER, must be owner of the ticket
    if (req.user.role === Role.REQUESTER && ticket.requesterId !== req.user.id) {
      return res.status(403).json({
        error: "Forbidden: You can only view comments on your own tickets",
      });
    }

    const comments = await prisma.publicComment.findMany({
      where: { ticketId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/tickets/:id/comments — Add Public Comment (BR-15, BR-18, BR-14)
// ---------------------------------------------------------------------------
commentsRouter.post("/:id/comments", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Authentication required" });
    }

    if (req.user.mustChangePassword) {
      return res.status(403).json({
        error: "Password change required before accessing the application",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    const ticketId = Number(id);
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, requesterId: true, status: true },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Role check: If caller is REQUESTER, must be owner of the ticket
    if (req.user.role === Role.REQUESTER && ticket.requesterId !== req.user.id) {
      return res.status(403).json({
        error: "Forbidden: You can only comment on your own tickets",
      });
    }

    const { content } = req.body;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const trimmed = content.trim();
    if (trimmed.length < 2 || trimmed.length > 2000) {
      return res.status(400).json({
        error: "Comment content must be between 2 and 2000 characters",
      });
    }

    // Auto-transition: WAITING_FOR_REQUESTER -> IN_PROGRESS (BR-14)
    const shouldAutoTransition = ticket.status === TicketStatus.WAITING_FOR_REQUESTER;

    if (shouldAutoTransition) {
      const [newComment, updatedTicket] = await prisma.$transaction([
        prisma.publicComment.create({
          data: {
            ticketId,
            authorId: req.user.id,
            content: trimmed,
          },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                role: true,
                email: true,
              },
            },
          },
        }),
        prisma.ticket.update({
          where: { id: ticketId },
          data: { status: TicketStatus.IN_PROGRESS },
        }),
      ]);

      return res.status(201).json({
        message: "Comment added successfully",
        comment: newComment,
        ticket: updatedTicket,
      });
    } else {
      const newComment = await prisma.publicComment.create({
        data: {
          ticketId,
          authorId: req.user.id,
          content: trimmed,
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              role: true,
              email: true,
            },
          },
        },
      });

      return res.status(201).json({
        message: "Comment added successfully",
        comment: newComment,
      });
    }
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ error: "Failed to create comment" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/tickets/:id/notes — Fetch Internal Notes (BR-16, AC-04, FR-14)
// ---------------------------------------------------------------------------
commentsRouter.get("/:id/notes", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Authentication required" });
    }

    if (req.user.mustChangePassword) {
      return res.status(403).json({
        error: "Password change required before accessing the application",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    // Role check: Strictly forbidden for REQUESTER (BR-16, AC-04)
    if (req.user.role === Role.REQUESTER) {
      return res.status(403).json({
        error: "Forbidden: Requesters are not permitted to view internal notes",
      });
    }

    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    const ticketId = Number(id);
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const notes = await prisma.internalNote.findMany({
      where: { ticketId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching internal notes:", error);
    return res.status(500).json({ error: "Failed to fetch internal notes" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/tickets/:id/notes — Add Internal Note (BR-16, AC-08, FR-14)
// ---------------------------------------------------------------------------
commentsRouter.post("/:id/notes", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Authentication required" });
    }

    if (req.user.mustChangePassword) {
      return res.status(403).json({
        error: "Password change required before accessing the application",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    // Role check: Strictly forbidden for REQUESTER (BR-16, AC-08)
    if (req.user.role === Role.REQUESTER) {
      return res.status(403).json({
        error: "Forbidden: Requesters are not permitted to create internal notes",
      });
    }

    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    const ticketId = Number(id);
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const { content } = req.body;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Internal note content is required" });
    }

    const trimmed = content.trim();
    if (trimmed.length < 2 || trimmed.length > 2000) {
      return res.status(400).json({
        error: "Internal note content must be between 2 and 2000 characters",
      });
    }

    const newNote = await prisma.internalNote.create({
      data: {
        ticketId,
        authorId: req.user.id,
        content: trimmed,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Internal note added successfully",
      note: newNote,
    });
  } catch (error) {
    console.error("Error creating internal note:", error);
    return res.status(500).json({ error: "Failed to create internal note" });
  }
});
