import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";
import { Role, TicketStatus, ActionTakenStatus } from "@prisma/client";

describe("Ticket Workflow Hardening, Resolution Gate & Concurrency APIs (API-09, API-10 / Issue 35)", () => {
  const prisma = getPrisma();

  let staffToken: string;
  let adminToken: string;
  let requesterToken: string;
  let requester2Token: string;

  let staffId: number;
  let adminId: number;
  let requesterId: number;
  let requester2Id: number;

  let categoryId: number;
  let systemId: number;

  const createdTicketIds: number[] = [];

  beforeAll(async () => {
    // 1. Fetch seed users
    const staff = await prisma.user.findFirstOrThrow({
      where: { email: "kevin.patel@toktickit.com" },
    });
    const admin = await prisma.user.findFirstOrThrow({
      where: { email: "admin@toktickit.com" },
    });
    const requester = await prisma.user.findFirstOrThrow({
      where: { email: "jennifer.anderson@example.com" },
    });
    const requester2 = await prisma.user.findFirstOrThrow({
      where: { email: "michael.brown@example.com" },
    });

    staffId = staff.id;
    adminId = admin.id;
    requesterId = requester.id;
    requester2Id = requester2.id;

    await prisma.user.update({
      where: { id: staffId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: adminId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: requesterId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: requester2Id },
      data: { mustChangePassword: false, isActive: true },
    });

    staffToken = jwt.sign(
      { userId: staff.id, email: staff.email, role: staff.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    adminToken = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    requesterToken = jwt.sign(
      { userId: requester.id, email: requester.email, role: requester.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    requester2Token = jwt.sign(
      { userId: requester2.id, email: requester2.email, role: requester2.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const category = await prisma.category.findFirstOrThrow();
    const system = await prisma.relatedSystem.findFirstOrThrow();
    categoryId = category.id;
    systemId = system.id;
  });

  afterAll(async () => {
    if (createdTicketIds.length > 0) {
      await prisma.publicComment.deleteMany({
        where: { ticketId: { in: createdTicketIds } },
      });
      await prisma.actionTaken.deleteMany({
        where: { ticketId: { in: createdTicketIds } },
      });
      await prisma.ticket.deleteMany({
        where: { id: { in: createdTicketIds } },
      });
    }
  });

  async function createTestTicket(status: TicketStatus = TicketStatus.OPEN, ownerUserId?: number, reqUserId: number = requesterId) {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-WF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        requesterId: reqUserId,
        categoryId,
        relatedSystemId: systemId,
        summary: `Workflow Test Ticket (${status})`,
        description: `Automated test ticket for state ${status}`,
        requestedPriority: "HIGH",
        itPriority: "HIGH",
        status,
        ownerId: ownerUserId || null,
        isResolutionIndicated: false,
      },
    });
    createdTicketIds.push(ticket.id);
    return ticket;
  }

  // -------------------------------------------------------------------------
  // API-09: Requester Resolution Indication Advisory Gate
  // -------------------------------------------------------------------------
  describe("API-09: Requester Advisory Resolution Gate (POST /api/tickets/:id/resolve-indication)", () => {
    it("API-09a: sets isResolutionIndicated: true without changing status to RESOLVED and records public audit comment", async () => {
      const ticket = await createTestTicket(TicketStatus.IN_PROGRESS, staffId);

      const res = await request(app)
        .post(`/api/tickets/${ticket.id}/resolve-indication`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ comment: "The issue with the display driver was resolved after restart." });

      expect(res.status).toBe(200);
      expect(res.body.ticket.isResolutionIndicated).toBe(true);
      // Status MUST remain IN_PROGRESS (not RESOLVED)
      expect(res.body.ticket.status).toBe(TicketStatus.IN_PROGRESS);

      // Verify database record
      const dbTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
      expect(dbTicket?.isResolutionIndicated).toBe(true);
      expect(dbTicket?.status).toBe(TicketStatus.IN_PROGRESS);

      // Verify automated audit comment
      const comments = await prisma.publicComment.findMany({ where: { ticketId: ticket.id } });
      expect(comments.length).toBeGreaterThan(0);
      expect(comments[0].content).toContain("Requester indicated that the problem appears resolved");
    });

    it("API-09b: rejects resolution indication from requester on another user's ticket with 403 Forbidden", async () => {
      const ticket = await createTestTicket(TicketStatus.OPEN, staffId, requesterId);

      const res = await request(app)
        .post(`/api/tickets/${ticket.id}/resolve-indication`)
        .set("Authorization", `Bearer ${requester2Token}`)
        .send({ comment: "Trying to indicate on another user ticket" });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Forbidden");
    });

    it("API-09c: rejects resolution indication on invalid status (NEW, CLOSED, CANCELLED) with 422", async () => {
      const newTicket = await createTestTicket(TicketStatus.NEW);

      const res = await request(app)
        .post(`/api/tickets/${newTicket.id}/resolve-indication`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ comment: "Problem resolved on unassigned new ticket" });

      expect(res.status).toBe(422);
      expect(res.body.error).toContain("Cannot indicate resolution");
    });
  });

  // -------------------------------------------------------------------------
  // API-10: Formal Ticket Status Transition & 8+1 Transition Matrix
  // -------------------------------------------------------------------------
  describe("API-10: Status Transition Matrix Enforcement & Action Completion Gate (BR-07, BR-08)", () => {
    it("API-10a: strictly enforces BR-07 8+1 status transition matrix (rejects illegal jumps with 422)", async () => {
      const openTicket = await createTestTicket(TicketStatus.OPEN, staffId);

      // 1. OPEN -> RESOLVED is ILLEGAL under BR-07 (must go through IN_PROGRESS, WAITING_FOR_REQUESTER, or PENDING)
      const jumpRes = await request(app)
        .patch(`/api/staff/tickets/${openTicket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED" });

      expect(jumpRes.status).toBe(422);
      expect(jumpRes.body.error).toContain("Invalid status transition: Cannot transition from OPEN to RESOLVED");

      // 2. OPEN -> IN_PROGRESS is LEGAL
      const validRes = await request(app)
        .patch(`/api/staff/tickets/${openTicket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });

      expect(validRes.status).toBe(200);
      expect(validRes.body.ticket.status).toBe("IN_PROGRESS");

      // 3. CLOSED is terminal (cannot transition to anything)
      const closedTicket = await createTestTicket(TicketStatus.CLOSED, staffId);
      const closedRes = await request(app)
        .patch(`/api/staff/tickets/${closedTicket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "REOPENED" });

      expect(closedRes.status).toBe(422);
      expect(closedRes.body.error).toContain("Invalid status transition: Cannot transition from CLOSED to REOPENED");

      // 4. CANCELLED is terminal (cannot transition to anything)
      const cancelledTicket = await createTestTicket(TicketStatus.CANCELLED, staffId);
      const cancelledRes = await request(app)
        .patch(`/api/staff/tickets/${cancelledTicket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "OPEN" });

      expect(cancelledRes.status).toBe(422);
      expect(cancelledRes.body.error).toContain("Invalid status transition: Cannot transition from CANCELLED to OPEN");
    });

    it("API-10b: rejects transition to RESOLVED if any child ActionTaken is PENDING or IN_PROGRESS (BR-08)", async () => {
      const ticket = await createTestTicket(TicketStatus.IN_PROGRESS, staffId);

      // Create a child ActionTaken in PENDING status
      const action = await prisma.actionTaken.create({
        data: {
          ticketId: ticket.id,
          actionDescription: "Investigating power supply unit",
          performedById: staffId,
          status: ActionTakenStatus.PENDING,
          followUpRequired: false,
        },
      });

      // Attempt transition to RESOLVED
      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED" });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe("Cannot resolve ticket: all child actions taken must be completed or cancelled first");
      expect(res.body.pendingActionsCount).toBe(1);

      // Update action to IN_PROGRESS -> still rejected
      await prisma.actionTaken.update({
        where: { id: action.id },
        data: { status: ActionTakenStatus.IN_PROGRESS },
      });

      const resInProgress = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED" });

      expect(resInProgress.status).toBe(422);
      expect(resInProgress.body.pendingActionsCount).toBe(1);

      // Complete the action -> now RESOLVED succeeds
      await prisma.actionTaken.update({
        where: { id: action.id },
        data: { status: ActionTakenStatus.COMPLETED, result: "Power supply replaced and tested" },
      });

      const resSuccess = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "RESOLVED",
          resolutionNote: "Replaced hardware component successfully",
        });

      expect(resSuccess.status).toBe(200);
      expect(resSuccess.body.ticket.status).toBe("RESOLVED");

      // Verify resolution note comment
      const comments = await prisma.publicComment.findMany({ where: { ticketId: ticket.id } });
      expect(comments.some((c) => c.content.includes("Resolution note: Replaced hardware component successfully"))).toBe(true);
    });

    it("API-10c: permits transitioning to RESOLVED if child action is CANCELLED (BR-08)", async () => {
      const ticket = await createTestTicket(TicketStatus.IN_PROGRESS, staffId);

      await prisma.actionTaken.create({
        data: {
          ticketId: ticket.id,
          actionDescription: "Vendor RMA inquiry",
          performedById: staffId,
          status: ActionTakenStatus.CANCELLED,
          followUpRequired: false,
        },
      });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED" });

      expect(res.status).toBe(200);
      expect(res.body.ticket.status).toBe("RESOLVED");
    });

    it("API-10d: role authority guard on PATCH /api/tickets/:id/status (Requesters can ONLY reopen own resolved ticket)", async () => {
      const inProgressTicket = await createTestTicket(TicketStatus.IN_PROGRESS, staffId, requesterId);

      // 1. Requester cannot resolve ticket -> 403
      const reqResolve = await request(app)
        .patch(`/api/tickets/${inProgressTicket.id}/status`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ status: "RESOLVED" });

      expect(reqResolve.status).toBe(403);
      expect(reqResolve.body.error).toContain("Forbidden");

      // 2. Resolve ticket by Staff
      const resolvedTicket = await prisma.ticket.update({
        where: { id: inProgressTicket.id },
        data: { status: TicketStatus.RESOLVED },
      });

      // 3. Other requester cannot reopen -> 403
      const otherReopen = await request(app)
        .patch(`/api/tickets/${resolvedTicket.id}/status`)
        .set("Authorization", `Bearer ${requester2Token}`)
        .send({ status: "REOPENED" });

      expect(otherReopen.status).toBe(403);

      // 4. Owning requester CAN reopen own resolved ticket -> 200 OK
      const ownerReopen = await request(app)
        .patch(`/api/tickets/${resolvedTicket.id}/status`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ status: "REOPENED" });

      expect(ownerReopen.status).toBe(200);
      expect(ownerReopen.body.ticket.status).toBe("REOPENED");
    });

    it("API-10e: optimistic concurrency control detects stale updates and returns 409 Conflict", async () => {
      const ticket = await createTestTicket(TicketStatus.IN_PROGRESS, staffId);

      // Provide stale expectedUpdatedAt timestamp (1 hour in the past)
      const staleTime = new Date(Date.now() - 3600000).toISOString();

      const conflictRes = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "WAITING_FOR_REQUESTER",
          expectedUpdatedAt: staleTime,
        });

      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.error).toContain("Conflict: Ticket has been modified by another user");
      expect(conflictRes.body.code).toBe("CONCURRENCY_CONFLICT");

      // Provide matching expectedUpdatedAt -> succeeds
      const freshRes = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "WAITING_FOR_REQUESTER",
          expectedUpdatedAt: ticket.updatedAt.toISOString(),
        });

      expect(freshRes.status).toBe(200);
      expect(freshRes.body.ticket.status).toBe("WAITING_FOR_REQUESTER");
    });
  });
});
