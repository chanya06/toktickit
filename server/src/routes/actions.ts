import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { Role, ActionTakenStatus } from "@prisma/client";
import {
  requireAuth,
  requirePasswordChanged,
  requireRole,
} from "../middleware/auth.js";

export const actionsRouter = Router();

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

const safeUserSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
};

// ---------------------------------------------------------------------------
// GET /api/tickets/:id/actions — List Actions Taken for Ticket (AC-01, AC-03)
// ---------------------------------------------------------------------------
actionsRouter.get(
  "/:id/actions",
  requireAuth,
  requirePasswordChanged,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
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

      // Role authorization check:
      // Requesters can only view actions on tickets they own (AC-03)
      if (user.role === Role.REQUESTER && ticket.requesterId !== user.id) {
        return res.status(403).json({
          error: "Forbidden: You can only view actions on your own tickets",
        });
      }

      const actions = await prisma.actionTaken.findMany({
        where: { ticketId },
        include: {
          performedBy: { select: safeUserSelect },
          assignee: { select: safeUserSelect },
        },
        orderBy: [
          { actionDateTime: "asc" },
          { id: "asc" },
        ],
      });

      return res.status(200).json(actions);
    } catch (error) {
      console.error("Error fetching actions taken:", error);
      return res.status(500).json({ error: "Failed to fetch actions taken" });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/tickets/:id/actions — Create Action Taken (AC-01, AC-02, AC-05, BR-01, BR-02, BR-04, BR-05, BR-06)
// ---------------------------------------------------------------------------
actionsRouter.post(
  "/:id/actions",
  requireAuth,
  requirePasswordChanged,
  requireRole(Role.IT_STAFF, Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
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

      const {
        actionDescription,
        actionDateTime,
        result,
        assigneeId,
        status,
        followUpRequired,
        followUpNote,
        attachmentNotes,
      } = req.body;

      // 1. Validate actionDescription (minimum 5 chars)
      if (!actionDescription || typeof actionDescription !== "string" || actionDescription.trim().length < 5) {
        return res.status(400).json({
          error: "actionDescription must be at least 5 characters long",
          field: "actionDescription",
        });
      }

      // 2. Validate followUpRequired and followUpNote (BR-04 / AC-02)
      const isFollowUpRequired = Boolean(followUpRequired);
      let trimmedFollowUpNote: string | null = null;
      if (isFollowUpRequired) {
        if (!followUpNote || typeof followUpNote !== "string" || followUpNote.trim().length < 5) {
          return res.status(400).json({
            error: "followUpNote is required and must be at least 5 characters when followUpRequired is true",
            field: "followUpNote",
          });
        }
        trimmedFollowUpNote = followUpNote.trim();
      } else if (followUpNote && typeof followUpNote === "string") {
        trimmedFollowUpNote = followUpNote.trim() || null;
      }

      // 3. Validate status (must be valid ActionTakenStatus enum)
      const validStatuses = Object.values(ActionTakenStatus);
      const actionStatus = status ? (status as ActionTakenStatus) : ActionTakenStatus.COMPLETED;
      if (status && !validStatuses.includes(actionStatus)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          field: "status",
        });
      }

      // 4. Validate assigneeId if provided (BR-05 / AC-05: active IT Staff or Administrator)
      let parsedAssigneeId: number | null = null;
      if (assigneeId !== undefined && assigneeId !== null && assigneeId !== "") {
        if (!isPositiveInteger(assigneeId)) {
          return res.status(422).json({
            error: "assigneeId must be a valid positive integer referencing an active staff member",
            field: "assigneeId",
          });
        }
        parsedAssigneeId = Number(assigneeId);
        const assignee = await prisma.user.findUnique({
          where: { id: parsedAssigneeId },
          select: { id: true, role: true, isActive: true },
        });

        if (!assignee || !assignee.isActive || assignee.role === Role.REQUESTER) {
          return res.status(422).json({
            error: "Assignee must be an active IT Staff or Administrator account",
            field: "assigneeId",
          });
        }
      }

      // 5. Parse actionDateTime
      let parsedDate = new Date();
      if (actionDateTime) {
        const d = new Date(actionDateTime);
        if (isNaN(d.getTime())) {
          return res.status(400).json({
            error: "actionDateTime must be a valid ISO date string",
            field: "actionDateTime",
          });
        }
        parsedDate = d;
      }

      // 6. Create ActionTaken (performer automatically bound to authenticated user)
      const createdAction = await prisma.actionTaken.create({
        data: {
          ticketId,
          actionDescription: actionDescription.trim(),
          actionDateTime: parsedDate,
          result: result && typeof result === "string" ? result.trim() : null,
          performedById: user.id,
          assigneeId: parsedAssigneeId,
          status: actionStatus,
          followUpRequired: isFollowUpRequired,
          followUpNote: trimmedFollowUpNote,
          attachmentNotes: attachmentNotes && typeof attachmentNotes === "string" ? attachmentNotes.trim() : null,
        },
        include: {
          performedBy: { select: safeUserSelect },
          assignee: { select: safeUserSelect },
        },
      });

      return res.status(201).json(createdAction);
    } catch (error) {
      console.error("Error creating action taken:", error);
      return res.status(500).json({ error: "Failed to create action taken" });
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/tickets/:id/actions/:actionId — Update Action Taken (AC-05, AC-11, FR-14)
// ---------------------------------------------------------------------------
actionsRouter.put(
  "/:id/actions/:actionId",
  requireAuth,
  requirePasswordChanged,
  requireRole(Role.IT_STAFF, Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const { id, actionId } = req.params;
      if (!isPositiveInteger(id) || !isPositiveInteger(actionId)) {
        return res.status(400).json({ error: "Ticket id and action id must be valid positive integers" });
      }

      const ticketId = Number(id);
      const actionNumId = Number(actionId);
      const prisma = getPrisma();

      // Check ticket exists
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { id: true },
      });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Check action exists under ticket
      const existingAction = await prisma.actionTaken.findFirst({
        where: { id: actionNumId, ticketId },
        include: {
          performedBy: { select: safeUserSelect },
          assignee: { select: safeUserSelect },
        },
      });
      if (!existingAction) {
        return res.status(404).json({ error: "Action taken not found under this ticket" });
      }

      const {
        actionDescription,
        actionDateTime,
        result,
        assigneeId,
        status,
        followUpRequired,
        followUpNote,
        attachmentNotes,
        expectedUpdatedAt,
      } = req.body;

      // Optimistic Concurrency Check (AC-11 / FR-14)
      if (expectedUpdatedAt) {
        const expectedTime = new Date(expectedUpdatedAt).getTime();
        const actualTime = new Date(existingAction.updatedAt).getTime();
        if (expectedTime !== actualTime) {
          return res.status(409).json({
            error: "Conflict: Action Taken has been modified by another user",
            code: "CONCURRENCY_CONFLICT",
            currentAction: existingAction,
          });
        }
      }

      // Validate actionDescription if provided
      if (actionDescription !== undefined) {
        if (typeof actionDescription !== "string" || actionDescription.trim().length < 5) {
          return res.status(400).json({
            error: "actionDescription must be at least 5 characters long",
            field: "actionDescription",
          });
        }
      }

      // Validate followUpRequired and followUpNote (BR-04)
      const isFollowUpRequired = followUpRequired !== undefined ? Boolean(followUpRequired) : existingAction.followUpRequired;
      let trimmedFollowUpNote: string | null = existingAction.followUpNote;
      if (isFollowUpRequired) {
        const candidateNote = followUpNote !== undefined ? followUpNote : existingAction.followUpNote;
        if (!candidateNote || typeof candidateNote !== "string" || candidateNote.trim().length < 5) {
          return res.status(400).json({
            error: "followUpNote is required and must be at least 5 characters when followUpRequired is true",
            field: "followUpNote",
          });
        }
        trimmedFollowUpNote = candidateNote.trim();
      } else if (followUpRequired !== undefined && !followUpRequired) {
        trimmedFollowUpNote = null;
      }

      // Validate status if provided
      const validStatuses = Object.values(ActionTakenStatus);
      if (status !== undefined) {
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            field: "status",
          });
        }
      }

      // Validate assigneeId if provided (BR-05 / AC-05)
      let parsedAssigneeId: number | null = existingAction.assigneeId;
      if (assigneeId !== undefined) {
        if (assigneeId === null || assigneeId === "") {
          parsedAssigneeId = null;
        } else {
          if (!isPositiveInteger(assigneeId)) {
            return res.status(422).json({
              error: "assigneeId must be a valid positive integer referencing an active staff member",
              field: "assigneeId",
            });
          }
          parsedAssigneeId = Number(assigneeId);
          const assignee = await prisma.user.findUnique({
            where: { id: parsedAssigneeId },
            select: { id: true, role: true, isActive: true },
          });

          if (!assignee || !assignee.isActive || assignee.role === Role.REQUESTER) {
            return res.status(422).json({
              error: "Assignee must be an active IT Staff or Administrator account",
              field: "assigneeId",
            });
          }
        }
      }

      // Parse actionDateTime if provided
      let parsedDate = existingAction.actionDateTime;
      if (actionDateTime !== undefined) {
        const d = new Date(actionDateTime);
        if (isNaN(d.getTime())) {
          return res.status(400).json({
            error: "actionDateTime must be a valid ISO date string",
            field: "actionDateTime",
          });
        }
        parsedDate = d;
      }

      const updatedAction = await prisma.actionTaken.update({
        where: { id: actionNumId },
        data: {
          actionDescription: actionDescription !== undefined ? actionDescription.trim() : existingAction.actionDescription,
          actionDateTime: parsedDate,
          result: result !== undefined ? (result && typeof result === "string" ? result.trim() : null) : existingAction.result,
          assigneeId: parsedAssigneeId,
          status: status !== undefined ? (status as ActionTakenStatus) : existingAction.status,
          followUpRequired: isFollowUpRequired,
          followUpNote: trimmedFollowUpNote,
          attachmentNotes: attachmentNotes !== undefined ? (attachmentNotes && typeof attachmentNotes === "string" ? attachmentNotes.trim() : null) : existingAction.attachmentNotes,
        },
        include: {
          performedBy: { select: safeUserSelect },
          assignee: { select: safeUserSelect },
        },
      });

      return res.status(200).json(updatedAction);
    } catch (error) {
      console.error("Error updating action taken:", error);
      return res.status(500).json({ error: "Failed to update action taken" });
    }
  }
);

// ---------------------------------------------------------------------------
// PATCH /api/tickets/:id/actions/:actionId/status — Transition Action Status (AC-04 / BR-03)
// ---------------------------------------------------------------------------
actionsRouter.patch(
  "/:id/actions/:actionId/status",
  requireAuth,
  requirePasswordChanged,
  requireRole(Role.IT_STAFF, Role.ADMINISTRATOR),
  async (req: Request, res: Response) => {
    try {
      const { id, actionId } = req.params;
      if (!isPositiveInteger(id) || !isPositiveInteger(actionId)) {
        return res.status(400).json({ error: "Ticket id and action id must be valid positive integers" });
      }

      const ticketId = Number(id);
      const actionNumId = Number(actionId);
      const prisma = getPrisma();

      const { status, result } = req.body;
      const validStatuses = Object.values(ActionTakenStatus);
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          field: "status",
        });
      }

      // Check ticket exists
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { id: true },
      });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Check action exists under ticket
      const existingAction = await prisma.actionTaken.findFirst({
        where: { id: actionNumId, ticketId },
      });
      if (!existingAction) {
        return res.status(404).json({ error: "Action taken not found under this ticket" });
      }

      const newStatus = status as ActionTakenStatus;
      const currentStatus = existingAction.status;

      // Status transition rules (BR-03):
      // - COMPLETED is final: cannot transition to another status
      // - CANCELLED is final: cannot transition to another status
      if (currentStatus === ActionTakenStatus.COMPLETED && newStatus !== ActionTakenStatus.COMPLETED) {
        return res.status(422).json({
          error: "Illegal transition: Completed actions are finalized audit records and cannot be transitioned to another status",
          field: "status",
        });
      }
      if (currentStatus === ActionTakenStatus.CANCELLED && newStatus !== ActionTakenStatus.CANCELLED) {
        return res.status(422).json({
          error: "Illegal transition: Cancelled actions are final and cannot be transitioned to another status",
          field: "status",
        });
      }

      // Update action status and optional result
      const updatedAction = await prisma.actionTaken.update({
        where: { id: actionNumId },
        data: {
          status: newStatus,
          result: result !== undefined ? (result && typeof result === "string" ? result.trim() : null) : existingAction.result,
        },
        include: {
          performedBy: { select: safeUserSelect },
          assignee: { select: safeUserSelect },
        },
      });

      return res.status(200).json(updatedAction);
    } catch (error) {
      console.error("Error transitioning action status:", error);
      return res.status(500).json({ error: "Failed to transition action status" });
    }
  }
);
