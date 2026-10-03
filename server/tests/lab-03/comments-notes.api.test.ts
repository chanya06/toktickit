import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";
import { Role, TicketStatus } from "@prisma/client";

describe("Public Comments & Private Internal Notes (API-05, API-09 / Issue 25)", () => {
  let staffToken: string;
  let adminToken: string;
  let requester1Token: string;
  let requester2Token: string;
  let mustChangeStaffToken: string;

  let staffUserId: number;
  let adminUserId: number;
  let requester1UserId: number;
  let requester2UserId: number;
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
    const adminUser = await prisma.user.findFirstOrThrow({
      where: { email: "admin@toktickit.com" },
    });
    const requester1User = await prisma.user.findFirstOrThrow({
      where: { email: "jennifer.anderson@example.com" },
    });
    const requester2User = await prisma.user.findFirstOrThrow({
      where: { email: "michael.brown@example.com" },
    });
    const mustChangeStaff = await prisma.user.findFirstOrThrow({
      where: { email: "emily.davis@toktickit.com" },
    });

    staffUserId = staffUser.id;
    adminUserId = adminUser.id;
    requester1UserId = requester1User.id;
    requester2UserId = requester2User.id;
    mustChangeStaffId = mustChangeStaff.id;

    await prisma.user.update({
      where: { id: staffUserId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: adminUserId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: requester1UserId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: requester2UserId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: mustChangeStaffId },
      data: { mustChangePassword: true, isActive: true },
    });

    staffToken = jwt.sign(
      { userId: staffUserId, email: staffUser.email, role: Role.IT_STAFF },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    adminToken = jwt.sign(
      { userId: adminUserId, email: adminUser.email, role: Role.ADMINISTRATOR },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    requester1Token = jwt.sign(
      { userId: requester1UserId, email: requester1User.email, role: Role.REQUESTER },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    requester2Token = jwt.sign(
      { userId: requester2UserId, email: requester2User.email, role: Role.REQUESTER },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    mustChangeStaffToken = jwt.sign(
      { userId: mustChangeStaffId, email: mustChangeStaff.email, role: Role.IT_STAFF },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const category = await prisma.category.findFirstOrThrow();
    const system = await prisma.relatedSystem.findFirstOrThrow();
    testCategoryId = category.id;
    testSystemId = system.id;
  });

  afterAll(async () => {
    // Cleanup created tickets and their comments / notes
    for (const tId of createdTicketIds) {
      await prisma.publicComment.deleteMany({ where: { ticketId: tId } }).catch(() => {});
      await prisma.internalNote.deleteMany({ where: { ticketId: tId } }).catch(() => {});
      await prisma.ticket.delete({ where: { id: tId } }).catch(() => {});
    }
  });

  async function createTestTicket(overrides: Partial<{
    requesterId: number;
    status: TicketStatus;
    summary: string;
  }> = {}) {
    const ticketNumber = `TKT-2026-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        summary: overrides.summary || "Test ticket for comments & notes",
        description: "Test description for comment and note lifecycle",
        requesterId: overrides.requesterId || requester1UserId,
        categoryId: testCategoryId,
        relatedSystemId: testSystemId,
        status: overrides.status || TicketStatus.OPEN,
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
      },
    });
    createdTicketIds.push(ticket.id);
    return ticket;
  }

  // ===========================================================================
  // 1. PUBLIC COMMENTS (GET & POST /api/tickets/:id/comments)
  // ===========================================================================
  describe("Public Comments APIs (/api/tickets/:id/comments)", () => {
    it("allows the ticket requester to post a public comment and retrieves it", async () => {
      const ticket = await createTestTicket();

      // Post comment
      const postRes = await request(app)
        .post(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${requester1Token}`)
        .send({ content: "Hello, this is a comment from the requester." });

      expect(postRes.status).toBe(201);
      expect(postRes.body.message).toBe("Comment added successfully");
      expect(postRes.body.comment.content).toBe("Hello, this is a comment from the requester.");
      expect(postRes.body.comment.author.id).toBe(requester1UserId);
      expect(postRes.body.comment.author.role).toBe(Role.REQUESTER);

      // Fetch comments
      const getRes = await request(app)
        .get(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${requester1Token}`);

      expect(getRes.status).toBe(200);
      expect(Array.isArray(getRes.body)).toBe(true);
      expect(getRes.body.length).toBe(1);
      expect(getRes.body[0].content).toBe("Hello, this is a comment from the requester.");
      expect(getRes.body[0].author.fullName).toBeDefined();
    });

    it("allows IT Staff and Administrators to view and post public comments", async () => {
      const ticket = await createTestTicket();

      // Staff posts comment
      const staffRes = await request(app)
        .post(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "We are investigating this hardware issue now." });

      expect(staffRes.status).toBe(201);
      expect(staffRes.body.comment.author.role).toBe(Role.IT_STAFF);

      // Admin posts comment
      const adminRes = await request(app)
        .post(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ content: "Administrator verified customer SLA." });

      expect(adminRes.status).toBe(201);
      expect(adminRes.body.comment.author.role).toBe(Role.ADMINISTRATOR);

      // Both comments are visible in chronological order
      const getRes = await request(app)
        .get(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.length).toBe(2);
      expect(getRes.body[0].content).toBe("We are investigating this hardware issue now.");
      expect(getRes.body[1].content).toBe("Administrator verified customer SLA.");
    });

    it("rejects non-owner Requester from viewing or posting comments with 403 Forbidden (Data Isolation)", async () => {
      const ticket = await createTestTicket({ requesterId: requester1UserId });

      // Requester 2 attempts to post on Requester 1's ticket
      const postRes = await request(app)
        .post(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${requester2Token}`)
        .send({ content: "Sneaky comment on another ticket" });

      expect(postRes.status).toBe(403);
      expect(postRes.body.error).toContain("Forbidden");

      // Requester 2 attempts to view Requester 1's ticket comments
      const getRes = await request(app)
        .get(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${requester2Token}`);

      expect(getRes.status).toBe(403);
      expect(getRes.body.error).toContain("Forbidden");
    });

    it("automatically transitions WAITING_FOR_REQUESTER -> IN_PROGRESS when a comment is posted (BR-14)", async () => {
      const ticket = await createTestTicket({ status: TicketStatus.WAITING_FOR_REQUESTER });

      const res = await request(app)
        .post(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${requester1Token}`)
        .send({ content: "Here is the screenshot you requested." });

      expect(res.status).toBe(201);
      expect(res.body.ticket).toBeDefined();
      expect(res.body.ticket.status).toBe(TicketStatus.IN_PROGRESS);

      // Verify in database
      const dbTicket = await prisma.ticket.findUniqueOrThrow({ where: { id: ticket.id } });
      expect(dbTicket.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it("validates content length: rejects <2 chars and >2000 chars with 400 Bad Request (BR-18)", async () => {
      const ticket = await createTestTicket();

      // Too short (<2 chars)
      const resShort = await request(app)
        .post(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${requester1Token}`)
        .send({ content: "a" });
      expect(resShort.status).toBe(400);
      expect(resShort.body.error).toContain("between 2 and 2000 characters");

      // Empty or whitespace only
      const resEmpty = await request(app)
        .post(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${requester1Token}`)
        .send({ content: "   " });
      expect(resEmpty.status).toBe(400);

      // Too long (>2000 chars)
      const longContent = "x".repeat(2001);
      const resLong = await request(app)
        .post(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${requester1Token}`)
        .send({ content: longContent });
      expect(resLong.status).toBe(400);
    });

    it("returns 404 Not Found when commenting on a non-existent ticket", async () => {
      const res = await request(app)
        .post("/api/tickets/999999/comments")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "Comment on missing ticket" });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Ticket not found");
    });
  });

  // ===========================================================================
  // 2. INTERNAL NOTES (GET & POST /api/tickets/:id/notes — API-05 & API-09)
  // ===========================================================================
  describe("Internal Notes APIs (/api/tickets/:id/notes — API-05, API-09)", () => {
    it("API-05: rejects Requester requesting Internal Notes endpoint with 403 Forbidden without leaking note data (BR-16, AC-04)", async () => {
      const ticket = await createTestTicket({ requesterId: requester1UserId });

      // First create a note as staff so data exists
      await prisma.internalNote.create({
        data: {
          ticketId: ticket.id,
          authorId: staffUserId,
          content: "Confidential internal diagnostic findings: motherboard issue",
        },
      });

      // Requester attempts GET /api/tickets/:id/notes
      const getRes = await request(app)
        .get(`/api/tickets/${ticket.id}/notes`)
        .set("Authorization", `Bearer ${requester1Token}`);

      expect(getRes.status).toBe(403);
      expect(getRes.body.error).toContain("Forbidden");
      expect(JSON.stringify(getRes.body)).not.toContain("Confidential");

      // Requester attempts POST /api/tickets/:id/notes
      const postRes = await request(app)
        .post(`/api/tickets/${ticket.id}/notes`)
        .set("Authorization", `Bearer ${requester1Token}`)
        .send({ content: "Attempting to create internal note as requester" });

      expect(postRes.status).toBe(403);
      expect(postRes.body.error).toContain("Forbidden");
    });

    it("API-09: allows IT Staff and Admin to create and fetch Internal Notes (AC-08, FR-14)", async () => {
      const ticket = await createTestTicket();

      // IT Staff posts internal note
      const staffRes = await request(app)
        .post(`/api/tickets/${ticket.id}/notes`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "Replaced RAM module; running overnight burn-in test." });

      expect(staffRes.status).toBe(201);
      expect(staffRes.body.message).toBe("Internal note added successfully");
      expect(staffRes.body.note.content).toBe("Replaced RAM module; running overnight burn-in test.");
      expect(staffRes.body.note.author.id).toBe(staffUserId);
      expect(staffRes.body.note.author.role).toBe(Role.IT_STAFF);

      // Admin posts internal note
      const adminRes = await request(app)
        .post(`/api/tickets/${ticket.id}/notes`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ content: "Escalated to vendor warranty replacement." });

      expect(adminRes.status).toBe(201);
      expect(adminRes.body.note.author.role).toBe(Role.ADMINISTRATOR);

      // Fetch internal notes as staff
      const getRes = await request(app)
        .get(`/api/tickets/${ticket.id}/notes`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(getRes.status).toBe(200);
      expect(Array.isArray(getRes.body)).toBe(true);
      expect(getRes.body.length).toBe(2);
      expect(getRes.body[0].content).toBe("Replaced RAM module; running overnight burn-in test.");
      expect(getRes.body[1].content).toBe("Escalated to vendor warranty replacement.");
    });

    it("validates internal note content: rejects <2 chars and >2000 chars with 400 Bad Request", async () => {
      const ticket = await createTestTicket();

      const resShort = await request(app)
        .post(`/api/tickets/${ticket.id}/notes`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "x" });
      expect(resShort.status).toBe(400);

      const resEmpty = await request(app)
        .post(`/api/tickets/${ticket.id}/notes`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "   " });
      expect(resEmpty.status).toBe(400);
    });

    it("returns 404 Not Found when creating internal note on non-existent ticket", async () => {
      const res = await request(app)
        .post("/api/tickets/999999/notes")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "Note on missing ticket" });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Ticket not found");
    });
  });

  // ===========================================================================
  // 3. SECURITY & INTEGRITY (BR-17, Auth & Session Guards)
  // ===========================================================================
  describe("Security & Integrity Guards (BR-17, Auth)", () => {
    it("rejects unauthenticated requests with 401 Unauthorized", async () => {
      const ticket = await createTestTicket();

      const resComments = await request(app).get(`/api/tickets/${ticket.id}/comments`);
      expect(resComments.status).toBe(401);

      const resNotes = await request(app).get(`/api/tickets/${ticket.id}/notes`);
      expect(resNotes.status).toBe(401);
    });

    it("blocks users with mustChangePassword: true with 403 Forbidden", async () => {
      const ticket = await createTestTicket();

      const res = await request(app)
        .get(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${mustChangeStaffToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("MUST_CHANGE_PASSWORD");
    });

    it("enforces append-only integrity (BR-17): PUT / DELETE requests return 404 or 405", async () => {
      const ticket = await createTestTicket();

      const resPut = await request(app)
        .put(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "Attempting edit" });
      expect([404, 405]).toContain(resPut.status);

      const resDel = await request(app)
        .delete(`/api/tickets/${ticket.id}/comments`)
        .set("Authorization", `Bearer ${staffToken}`);
      expect([404, 405]).toContain(resDel.status);
    });
  });
});
