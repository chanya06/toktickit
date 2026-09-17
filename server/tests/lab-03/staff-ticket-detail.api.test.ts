import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";
import { Role, TicketStatus, ITPriority } from "@prisma/client";

describe("IT Staff Ticket Operations & Status Matrix (API-07, API-08 / Issue 24)", () => {
  let staffToken: string;
  let adminToken: string;
  let requesterToken: string;
  let mustChangeStaffToken: string;

  let staffUserId: number;
  let staff2UserId: number;
  let adminUserId: number;
  let requesterUserId: number;
  let inactiveStaffUserId: number;
  let mustChangeStaffId: number;

  let testCategoryId: number;
  let testSystemId: number;

  const createdTicketIds: number[] = [];
  const prisma = getPrisma();

  beforeAll(async () => {
    // 1. Fetch seed users
    const staffUser = await prisma.user.findFirstOrThrow({
      where: { email: "kevin.patel@toktickit.com" },
    });
    const staff2User = await prisma.user.findFirstOrThrow({
      where: { email: "lisa.martinez@toktickit.com" },
    });
    const adminUser = await prisma.user.findFirstOrThrow({
      where: { email: "admin@toktickit.com" },
    });
    const requesterUser = await prisma.user.findFirstOrThrow({
      where: { email: "jennifer.anderson@example.com" },
    });
    const inactiveStaff = await prisma.user.findFirstOrThrow({
      where: { email: "robert.wilson@toktickit.com" },
    });
    const mustChangeStaff = await prisma.user.findFirstOrThrow({
      where: { email: "emily.davis@toktickit.com" },
    });

    staffUserId = staffUser.id;
    staff2UserId = staff2User.id;
    adminUserId = adminUser.id;
    requesterUserId = requesterUser.id;
    inactiveStaffUserId = inactiveStaff.id;
    mustChangeStaffId = mustChangeStaff.id;

    await prisma.user.update({
      where: { id: staffUserId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: staff2UserId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: adminUserId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: requesterUserId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: inactiveStaffUserId },
      data: { isActive: false },
    });
    await prisma.user.update({
      where: { id: mustChangeStaffId },
      data: { mustChangePassword: true, isActive: true },
    });

    staffToken = jwt.sign(
      { userId: staffUser.id, email: staffUser.email, role: staffUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    adminToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    requesterToken = jwt.sign(
      { userId: requesterUser.id, email: requesterUser.email, role: requesterUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    mustChangeStaffToken = jwt.sign(
      { userId: mustChangeStaff.id, email: mustChangeStaff.email, role: mustChangeStaff.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const category = await prisma.category.findFirstOrThrow({ where: { isActive: true } });
    const system = await prisma.relatedSystem.findFirstOrThrow({ where: { isActive: true } });
    testCategoryId = category.id;
    testSystemId = system.id;
  });

  afterAll(async () => {
    if (createdTicketIds.length > 0) {
      await prisma.ticket.deleteMany({
        where: { id: { in: createdTicketIds } },
      });
    }
  });

  async function createTestTicket(overrides: Partial<any> = {}) {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-OP-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        requesterId: requesterUserId,
        categoryId: testCategoryId,
        relatedSystemId: testSystemId,
        summary: "Ticket Operations Test Summary",
        description: "Test description for ticket operations suite.",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        status: "NEW",
        ...overrides,
      },
    });
    createdTicketIds.push(ticket.id);
    return ticket;
  }

  // ---------------------------------------------------------------------------
  // Access Control & Role Protection
  // ---------------------------------------------------------------------------
  describe("Route Protection & Role Authorization", () => {
    it("returns 401 Unauthorized when no Authorization token is provided", async () => {
      const ticket = await createTestTicket();
      const res = await request(app).patch(`/api/staff/tickets/${ticket.id}/claim`);
      expect(res.status).toBe(401);
    });

    it("returns 403 Forbidden when caller is a REQUESTER", async () => {
      const ticket = await createTestTicket();
      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/claim`)
        .set("Authorization", `Bearer ${requesterToken}`);
      expect(res.status).toBe(403);
    });

    it("returns 403 Forbidden with MUST_CHANGE_PASSWORD code when mustChangePassword is true", async () => {
      const ticket = await createTestTicket();
      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/claim`)
        .set("Authorization", `Bearer ${mustChangeStaffToken}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe("MUST_CHANGE_PASSWORD");
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/staff/assignees
  // ---------------------------------------------------------------------------
  describe("GET /api/staff/assignees", () => {
    it("returns list of active staff and administrators, omitting inactive and requesters", async () => {
      const res = await request(app)
        .get("/api/staff/assignees")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const userIds = res.body.map((u: any) => u.id);
      expect(userIds).toContain(staffUserId);
      expect(userIds).toContain(adminUserId);
      expect(userIds).not.toContain(inactiveStaffUserId); // Inactive staff omitted
      expect(userIds).not.toContain(requesterUserId); // Requester omitted
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/staff/tickets/:id/claim (API-07 / AC-06 / FR-11)
  // ---------------------------------------------------------------------------
  describe("PATCH /api/staff/tickets/:id/claim (API-07 / AC-06)", () => {
    it("allows IT Staff to claim an unassigned ticket, auto-transitioning NEW -> OPEN", async () => {
      const ticket = await createTestTicket({ status: "NEW", ownerId: null });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/claim`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("claimed successfully");
      expect(res.body.ticket.ownerId).toBe(staffUserId);
      expect(res.body.ticket.owner.id).toBe(staffUserId);
      expect(res.body.ticket.status).toBe("OPEN"); // Auto-transitioned from NEW to OPEN per BR-14
    });

    it("allows Administrator to claim a ticket without changing status if already IN_PROGRESS", async () => {
      const ticket = await createTestTicket({ status: "IN_PROGRESS", ownerId: staffUserId });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/claim`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.ticket.ownerId).toBe(adminUserId);
      expect(res.body.ticket.status).toBe("IN_PROGRESS");
    });

    it("returns 404 when claiming a non-existent ticket", async () => {
      const res = await request(app)
        .patch("/api/staff/tickets/9999999/claim")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Ticket not found");
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/staff/tickets/:id/assign (API-07 / AC-06 / FR-11)
  // ---------------------------------------------------------------------------
  describe("PATCH /api/staff/tickets/:id/assign (API-07 / AC-06)", () => {
    it("assigns ticket to another active IT Staff user and transitions NEW -> OPEN", async () => {
      const ticket = await createTestTicket({ status: "NEW", ownerId: null });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/assign`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ ownerId: staff2UserId });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("assigned successfully");
      expect(res.body.ticket.ownerId).toBe(staff2UserId);
      expect(res.body.ticket.owner.id).toBe(staff2UserId);
      expect(res.body.ticket.status).toBe("OPEN");
    });

    it("allows unassigning a ticket with ownerId: null", async () => {
      const ticket = await createTestTicket({ status: "OPEN", ownerId: staffUserId });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/assign`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ ownerId: null });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("unassigned successfully");
      expect(res.body.ticket.ownerId).toBeNull();
    });

    it("rejects assignment to an inactive user with 422 Unprocessable Entity", async () => {
      const ticket = await createTestTicket({ status: "OPEN" });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/assign`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ ownerId: inactiveStaffUserId });

      expect(res.status).toBe(422);
      expect(res.body.error).toContain("inactive");
    });

    it("rejects assignment to a Requester user with 422 Unprocessable Entity", async () => {
      const ticket = await createTestTicket({ status: "OPEN" });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/assign`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ ownerId: requesterUserId });

      expect(res.status).toBe(422);
      expect(res.body.error).toContain("IT_STAFF or ADMINISTRATOR");
    });

    it("rejects invalid non-numeric ownerId with 400 Bad Request", async () => {
      const ticket = await createTestTicket({ status: "OPEN" });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/assign`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ ownerId: "not-a-number" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("ownerId must be a valid positive integer or null");
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/staff/tickets/:id/it-priority (FR-12 / AC-05)
  // ---------------------------------------------------------------------------
  describe("PATCH /api/staff/tickets/:id/it-priority (FR-12)", () => {
    it("updates ticket IT Priority independently of requestedPriority", async () => {
      const ticket = await createTestTicket({ requestedPriority: "LOW", itPriority: "LOW" });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/it-priority`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ itPriority: "URGENT" });

      expect(res.status).toBe(200);
      expect(res.body.ticket.itPriority).toBe("URGENT");
      expect(res.body.ticket.requestedPriority).toBe("LOW"); // requestedPriority unchanged
    });

    it("rejects invalid IT priority values with 400 Bad Request", async () => {
      const ticket = await createTestTicket();

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/it-priority`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ itPriority: "CRITICAL" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid itPriority");
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/staff/tickets/:id/status (API-08 / AC-07 / FR-13 / BR-14)
  // ---------------------------------------------------------------------------
  describe("PATCH /api/staff/tickets/:id/status & BR-14 Matrix (API-08 / AC-07)", () => {
    it("permits valid transitions through full ticket lifecycle", async () => {
      const ticket = await createTestTicket({ status: "NEW" });

      // 1. NEW -> OPEN
      const res1 = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "OPEN" });
      expect(res1.status).toBe(200);
      expect(res1.body.ticket.status).toBe("OPEN");

      // 2. OPEN -> IN_PROGRESS
      const res2 = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });
      expect(res2.status).toBe(200);
      expect(res2.body.ticket.status).toBe("IN_PROGRESS");

      // 3. IN_PROGRESS -> WAITING_FOR_REQUESTER
      const res3 = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "WAITING_FOR_REQUESTER" });
      expect(res3.status).toBe(200);
      expect(res3.body.ticket.status).toBe("WAITING_FOR_REQUESTER");

      // 4. WAITING_FOR_REQUESTER -> RESOLVED
      const res4 = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED" });
      expect(res4.status).toBe(200);
      expect(res4.body.ticket.status).toBe("RESOLVED");

      // 5. RESOLVED -> CLOSED
      const res5 = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "CLOSED" });
      expect(res5.status).toBe(200);
      expect(res5.body.ticket.status).toBe("CLOSED");

      // 6. CLOSED -> REOPENED
      const res6 = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "REOPENED" });
      // Wait, REOPENED transitions from CLOSED
      expect(res6.status).toBe(200);
      expect(res6.body.ticket.status).toBe("REOPENED");
    });

    it("permits OPEN -> CANCELLED and CANCELLED -> OPEN", async () => {
      const ticket = await createTestTicket({ status: "OPEN" });

      // OPEN -> CANCELLED
      const cancelRes = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "CANCELLED" });
      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.ticket.status).toBe("CANCELLED");

      // CANCELLED -> OPEN
      const openRes = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "OPEN" });
      expect(openRes.status).toBe(200);
      expect(openRes.body.ticket.status).toBe("OPEN");
    });

    it("rejects invalid status transitions with 422 Unprocessable Entity", async () => {
      // 1. NEW cannot jump directly to RESOLVED or CLOSED
      const newTicket = await createTestTicket({ status: "NEW" });
      const res1 = await request(app)
        .patch(`/api/staff/tickets/${newTicket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED" });
      expect(res1.status).toBe(422);
      expect(res1.body.error).toContain("Invalid status transition");

      const res2 = await request(app)
        .patch(`/api/staff/tickets/${newTicket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "CLOSED" });
      expect(res2.status).toBe(422);

      // 2. OPEN cannot jump directly to CLOSED
      const openTicket = await createTestTicket({ status: "OPEN" });
      const res3 = await request(app)
        .patch(`/api/staff/tickets/${openTicket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "CLOSED" });
      expect(res3.status).toBe(422);

      // 3. CANCELLED cannot jump directly to RESOLVED
      const cancelledTicket = await createTestTicket({ status: "CANCELLED" });
      const res4 = await request(app)
        .patch(`/api/staff/tickets/${cancelledTicket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED" });
      expect(res4.status).toBe(422);
    });

    it("returns 200 without mutation when status remains unchanged", async () => {
      const ticket = await createTestTicket({ status: "OPEN" });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "OPEN" });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("status unchanged");
    });

    it("returns 400 Bad Request when status string is not a valid enum", async () => {
      const ticket = await createTestTicket({ status: "OPEN" });

      const res = await request(app)
        .patch(`/api/staff/tickets/${ticket.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "INVALID_STATUS_VALUE" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid status parameter");
    });
  });
});
