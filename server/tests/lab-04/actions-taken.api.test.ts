import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";
import { Role, ActionTakenStatus } from "@prisma/client";

describe("Actions Taken Backend REST APIs (API-01..06 / Issue 31)", () => {
  const prisma = getPrisma();

  let staffToken: string;
  let staff2Token: string;
  let adminToken: string;
  let requesterToken: string;
  let requester2Token: string;

  let staffId: number;
  let staff2Id: number;
  let inactiveStaffId: number;
  let adminId: number;
  let requesterId: number;
  let requester2Id: number;

  let testTicketId: number;
  let requester2TicketId: number;

  const createdTicketIds: number[] = [];

  beforeAll(async () => {
    // 1. Fetch seed users
    const staff = await prisma.user.findFirstOrThrow({
      where: { email: "kevin.patel@toktickit.com" },
    });
    const staff2 = await prisma.user.findFirstOrThrow({
      where: { email: "emily.davis@toktickit.com" },
    });
    const inactiveStaff = await prisma.user.findFirstOrThrow({
      where: { email: "robert.wilson@toktickit.com" },
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
    staff2Id = staff2.id;
    inactiveStaffId = inactiveStaff.id;
    adminId = admin.id;
    requesterId = requester.id;
    requester2Id = requester2.id;

    // Ensure staff/admin/requester have mustChangePassword = false for testing
    await prisma.user.update({
      where: { id: staffId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: staff2Id },
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

    // 2. Generate test JWT tokens
    staffToken = jwt.sign({ userId: staffId, email: staff.email, role: Role.IT_STAFF }, JWT_SECRET, { expiresIn: "1h" });
    staff2Token = jwt.sign({ userId: staff2Id, email: staff2.email, role: Role.IT_STAFF }, JWT_SECRET, { expiresIn: "1h" });
    adminToken = jwt.sign({ userId: adminId, email: admin.email, role: Role.ADMINISTRATOR }, JWT_SECRET, { expiresIn: "1h" });
    requesterToken = jwt.sign({ userId: requesterId, email: requester.email, role: Role.REQUESTER }, JWT_SECRET, { expiresIn: "1h" });
    requester2Token = jwt.sign({ userId: requester2Id, email: requester2.email, role: Role.REQUESTER }, JWT_SECRET, { expiresIn: "1h" });

    // 3. Create test tickets
    const category = await prisma.category.findFirstOrThrow();
    const system = await prisma.relatedSystem.findFirstOrThrow();

    const t1 = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-${Date.now()}-1`,
        requesterId,
        ownerId: staffId,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: "Test Ticket for Actions Taken API",
        description: "Testing CRUD and concurrency rules for actions taken under this ticket.",
        requestedPriority: "MEDIUM",
        itPriority: "HIGH",
        status: "OPEN",
      },
    });
    testTicketId = t1.id;
    createdTicketIds.push(t1.id);

    const t2 = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-${Date.now()}-2`,
        requesterId: requester2Id,
        ownerId: staff2Id,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: "Requester 2 Private Ticket",
        description: "Testing role isolation for actions taken on requester 2 ticket.",
        requestedPriority: "LOW",
        itPriority: "LOW",
        status: "OPEN",
      },
    });
    requester2TicketId = t2.id;
    createdTicketIds.push(t2.id);
  });

  afterAll(async () => {
    // Clean up created actions and tickets
    for (const tid of createdTicketIds) {
      await prisma.actionTaken.deleteMany({ where: { ticketId: tid } });
      await prisma.ticket.deleteMany({ where: { id: tid } });
    }
  });

  // =========================================================================
  // API-01 / AC-01: Create Action Taken by IT Staff
  // =========================================================================
  describe("POST /api/tickets/:id/actions", () => {
    it("API-01 (AC-01 / FR-01): creates a valid Action Taken under Ticket by IT Staff, binds creator automatically", async () => {
      const payload = {
        actionDescription: "Replaced faulty RAM stick in slot 2 and ran memory diagnostic test.",
        result: "Diagnostic completed with 0 errors across 4 passes.",
        assigneeId: staff2Id,
        status: "COMPLETED",
        followUpRequired: false,
        attachmentNotes: "memtest_pass_report.txt",
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.ticketId).toBe(testTicketId);
      expect(res.body.actionDescription).toBe(payload.actionDescription);
      expect(res.body.result).toBe(payload.result);
      expect(res.body.performedById).toBe(staffId);
      expect(res.body.assigneeId).toBe(staff2Id);
      expect(res.body.status).toBe("COMPLETED");
      expect(res.body.followUpRequired).toBe(false);
      expect(res.body.performedBy).toBeDefined();
      expect(res.body.performedBy.id).toBe(staffId);
      expect(res.body.assignee).toBeDefined();
      expect(res.body.assignee.id).toBe(staff2Id);
    });

    // =========================================================================
    // API-02 / AC-02: Follow-up required validation guard
    // =========================================================================
    it("API-02 (AC-02 / FR-04): rejects creation with 400 Bad Request when followUpRequired is true but followUpNote is empty", async () => {
      const payload = {
        actionDescription: "Applied temporary patch to routing table on core gateway.",
        followUpRequired: true,
        followUpNote: "", // Missing/empty note
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.field).toBe("followUpNote");
    });

    it("API-02b: succeeds when followUpRequired is true and followUpNote is properly provided (>= 5 chars)", async () => {
      const payload = {
        actionDescription: "Configured temporary static IP lease for the research lab server.",
        followUpRequired: true,
        followUpNote: "Revert back to dynamic DHCP reservation after migration next Monday.",
        status: "IN_PROGRESS",
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.followUpRequired).toBe(true);
      expect(res.body.followUpNote).toBe(payload.followUpNote);
    });

    // =========================================================================
    // API-03 / AC-03: Requester authorization guard
    // =========================================================================
    it("API-03 (AC-03 / FR-06): rejects Action Taken creation by Requester with 403 Forbidden", async () => {
      const payload = {
        actionDescription: "Requester attempting to record action taken on ticket.",
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    // =========================================================================
    // API-05 / AC-05: Inactive assignee rejection
    // =========================================================================
    it("API-05 (AC-05 / BR-05): rejects assignee assignment with 422 Unprocessable Entity if user is inactive", async () => {
      const payload = {
        actionDescription: "Assigning action to an inactive staff member.",
        assigneeId: inactiveStaffId,
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(payload);

      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty("error");
      expect(res.body.field).toBe("assigneeId");
    });

    it("API-05b (BR-05): rejects assignee assignment with 422 Unprocessable Entity if user has role REQUESTER", async () => {
      const payload = {
        actionDescription: "Assigning action to a requester account.",
        assigneeId: requesterId,
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(payload);

      expect(res.status).toBe(422);
      expect(res.body.field).toBe("assigneeId");
    });

    it("rejects creation if actionDescription is shorter than 5 characters with 400 Bad Request", async () => {
      const payload = {
        actionDescription: "Fix", // Less than 5 chars
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.field).toBe("actionDescription");
    });

    it("returns 404 Not Found if ticket does not exist", async () => {
      const res = await request(app)
        .post("/api/tickets/999999/actions")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ actionDescription: "Valid action description on non-existent ticket." });

      expect(res.status).toBe(404);
    });

    it("allows Administrator to create an Action Taken", async () => {
      const payload = {
        actionDescription: "Administrator executed manual cache eviction and restarted service.",
        status: "COMPLETED",
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.performedById).toBe(adminId);
    });
  });

  // =========================================================================
  // API-07 / AC-01 / AC-03: List Actions Taken
  // =========================================================================
  describe("GET /api/tickets/:id/actions", () => {
    it("API-07 (AC-01): lists all actions taken for a ticket in ascending chronological order", async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("performedBy");
      expect(res.body[0].performedBy).toHaveProperty("fullName");
    });

    it("API-08 (AC-03): allows authenticated requester to view actions taken on their own ticket", async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("API-09 (AC-03): blocks requester from viewing actions on another user's ticket with 403 Forbidden", async () => {
      // Requester 1 attempts to view Requester 2's ticket actions
      const res = await request(app)
        .get(`/api/tickets/${requester2TicketId}/actions`)
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 Unauthorized when request lacks authorization token", async () => {
      const res = await request(app).get(`/api/tickets/${testTicketId}/actions`);
      expect(res.status).toBe(401);
    });

    it("returns 400 Bad Request if ticket id is invalid string", async () => {
      const res = await request(app)
        .get("/api/tickets/abc-invalid/actions")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(400);
    });

    it("returns 404 Not Found if ticket does not exist", async () => {
      const res = await request(app)
        .get("/api/tickets/999999/actions")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(404);
    });
  });

  // =========================================================================
  // API-04 / AC-04: Action Taken status lifecycle transitions
  // =========================================================================
  describe("PATCH /api/tickets/:id/actions/:actionId/status", () => {
    it("API-04 (AC-04 / FR-03): transitions Action Taken status: PENDING -> IN_PROGRESS -> COMPLETED", async () => {
      // 1. Create a PENDING action
      const createRes = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          actionDescription: "Scheduled firmware flashing for edge gateway.",
          status: "PENDING",
        });
      expect(createRes.status).toBe(201);
      const actionId = createRes.body.id;

      // 2. Transition PENDING -> IN_PROGRESS
      const patch1 = await request(app)
        .patch(`/api/tickets/${testTicketId}/actions/${actionId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS", result: "Firmware flashing initiated via TFTP." });

      expect(patch1.status).toBe(200);
      expect(patch1.body.status).toBe("IN_PROGRESS");
      expect(patch1.body.result).toBe("Firmware flashing initiated via TFTP.");

      // 3. Transition IN_PROGRESS -> COMPLETED
      const patch2 = await request(app)
        .patch(`/api/tickets/${testTicketId}/actions/${actionId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "COMPLETED", result: "Firmware flashed and verified checksum OK." });

      expect(patch2.status).toBe(200);
      expect(patch2.body.status).toBe("COMPLETED");
    });

    it("rejects transition from COMPLETED to another status with 422 Unprocessable Entity (BR-03 terminal state)", async () => {
      // Create a completed action
      const createRes = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          actionDescription: "Finalized audit test action for terminal state.",
          status: "COMPLETED",
        });
      const actionId = createRes.body.id;

      // Attempt to change COMPLETED -> PENDING
      const patchRes = await request(app)
        .patch(`/api/tickets/${testTicketId}/actions/${actionId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "PENDING" });

      expect(patchRes.status).toBe(422);
      expect(patchRes.body).toHaveProperty("error");
    });

    it("rejects transition from CANCELLED to another status with 422 Unprocessable Entity (BR-03 terminal state)", async () => {
      // Create a cancelled action
      const createRes = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          actionDescription: "Action that will be cancelled immediately.",
          status: "CANCELLED",
        });
      const actionId = createRes.body.id;

      // Attempt to change CANCELLED -> IN_PROGRESS
      const patchRes = await request(app)
        .patch(`/api/tickets/${testTicketId}/actions/${actionId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });

      expect(patchRes.status).toBe(422);
    });

    it("rejects invalid status enum with 400 Bad Request", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/actions/1/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "NOT_A_VALID_STATUS" });

      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // API-06 / AC-11: Stale update optimistic concurrency detection
  // =========================================================================
  describe("PUT /api/tickets/:id/actions/:actionId", () => {
    it("API-06 (AC-11 / FR-14): returns 409 Conflict when expectedUpdatedAt does not match current record timestamp", async () => {
      // 1. Create an action to update
      const createRes = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          actionDescription: "Concurrency baseline action record.",
          status: "IN_PROGRESS",
        });
      expect(createRes.status).toBe(201);
      const actionId = createRes.body.id;
      const initialUpdatedAt = createRes.body.updatedAt;

      // 2. Simulate User A modifying the action, updating updatedAt
      await new Promise((r) => setTimeout(r, 50));
      const midUpdate = await request(app)
        .put(`/api/tickets/${testTicketId}/actions/${actionId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          actionDescription: "Updated by User A with fresh details.",
        });
      expect(midUpdate.status).toBe(200);

      // 3. User B attempts update with stale expectedUpdatedAt (the initial one)
      const staleUpdate = await request(app)
        .put(`/api/tickets/${testTicketId}/actions/${actionId}`)
        .set("Authorization", `Bearer ${staff2Token}`)
        .send({
          actionDescription: "Overwriting update from User B based on stale data.",
          expectedUpdatedAt: initialUpdatedAt, // Stale timestamp!
        });

      expect(staleUpdate.status).toBe(409);
      expect(staleUpdate.body).toHaveProperty("code", "CONCURRENCY_CONFLICT");
      expect(staleUpdate.body).toHaveProperty("currentAction");
      expect(staleUpdate.body.currentAction.id).toBe(actionId);
    });

    it("successfully updates Action Taken when expectedUpdatedAt matches or is omitted", async () => {
      const createRes = await request(app)
        .post(`/api/tickets/${testTicketId}/actions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          actionDescription: "Original description before update.",
          status: "IN_PROGRESS",
        });
      const actionId = createRes.body.id;

      const updateRes = await request(app)
        .put(`/api/tickets/${testTicketId}/actions/${actionId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          actionDescription: "Successfully revised action description with more details.",
          result: "Updated outcome notes.",
          followUpRequired: true,
          followUpNote: "Review in next shift.",
          assigneeId: staff2Id,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.actionDescription).toBe("Successfully revised action description with more details.");
      expect(updateRes.body.followUpRequired).toBe(true);
      expect(updateRes.body.assigneeId).toBe(staff2Id);
    });

    it("rejects PUT update when called by Requester with 403 Forbidden", async () => {
      const res = await request(app)
        .put(`/api/tickets/${testTicketId}/actions/1`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ actionDescription: "Requester unauthorized modification." });

      expect(res.status).toBe(403);
    });

    it("returns 404 Not Found when updating an action that does not exist under the ticket", async () => {
      const res = await request(app)
        .put(`/api/tickets/${testTicketId}/actions/999999`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ actionDescription: "Updating non-existent action." });

      expect(res.status).toBe(404);
    });
  });
});
