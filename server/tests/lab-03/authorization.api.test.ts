import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";

describe("Requester Session Authorization & Data Isolation (API-04 / Issue 21)", () => {
  let user1Token: string;
  let user2Token: string;
  let mustChangeToken: string;

  let user1Id: number;
  let user2Id: number;
  let mustChangeUserId: number;

  let user1TicketId: number;
  let user2TicketId: number;

  const prisma = getPrisma();

  beforeAll(async () => {
    // 1. Ensure User 1 (Jennifer Anderson) and User 2 (Michael Brown) have mustChangePassword: false for testing
    const user1 = await prisma.user.findFirstOrThrow({
      where: { email: "jennifer.anderson@example.com" },
    });
    const user2 = await prisma.user.findFirstOrThrow({
      where: { email: "michael.brown@example.com" },
    });
    const mustChangeUser = await prisma.user.findFirstOrThrow({
      where: { email: "sarah.johnson@example.com" },
    });

    user1Id = user1.id;
    user2Id = user2.id;
    mustChangeUserId = mustChangeUser.id;

    await prisma.user.update({
      where: { id: user1Id },
      data: { mustChangePassword: false },
    });
    await prisma.user.update({
      where: { id: user2Id },
      data: { mustChangePassword: false },
    });
    await prisma.user.update({
      where: { id: mustChangeUserId },
      data: { mustChangePassword: true },
    });

    user1Token = jwt.sign(
      { userId: user1.id, email: user1.email, role: user1.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    user2Token = jwt.sign(
      { userId: user2.id, email: user2.email, role: user2.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    mustChangeToken = jwt.sign(
      { userId: mustChangeUser.id, email: mustChangeUser.email, role: mustChangeUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 2. Create sample tickets for User 1 and User 2
    const category = await prisma.category.findFirstOrThrow({ where: { isActive: true } });
    const system = await prisma.relatedSystem.findFirstOrThrow({ where: { isActive: true } });

    const t1 = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-${Date.now()}-01`,
        requesterId: user1Id,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: "User 1 Confidential Ticket",
        description: "Confidential detailed problem description for user 1.",
        requestedPriority: "MEDIUM",
        status: "OPEN",
      },
    });
    user1TicketId = t1.id;

    const t2 = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-${Date.now()}-02`,
        requesterId: user2Id,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: "User 2 Confidential Ticket",
        description: "Confidential detailed problem description for user 2.",
        requestedPriority: "HIGH",
        status: "OPEN",
      },
    });
    user2TicketId = t2.id;
  });

  afterAll(async () => {
    // Cleanup created test tickets
    const ids = [user1TicketId, user2TicketId].filter(Boolean);
    if (ids.length > 0) {
      await prisma.ticket.deleteMany({
        where: { id: { in: ids } },
      });
    }
  });

  describe("Session-based Requester data isolation (API-04 / AC-03 / FR-07)", () => {
    it("GET /api/tickets: returns only tickets owned by authenticated requester and ignores client-supplied requesterId", async () => {
      const res = await request(app)
        .get(`/api/tickets?requesterId=${user2Id}&pageSize=100`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);

      // All returned tickets must belong to user 1
      for (const t of res.body.data) {
        expect(t.requesterId).toBe(user1Id);
      }
      expect(res.body.data.some((t: any) => t.id === user1TicketId)).toBe(true);
      expect(res.body.data.some((t: any) => t.id === user2TicketId)).toBe(false);
    });

    it("GET /api/tickets/:id: permits access to own ticket and returns 403 Forbidden on cross-requester access", async () => {
      // User 1 accesses own ticket -> 200 OK
      const ownRes = await request(app)
        .get(`/api/tickets/${user1TicketId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(ownRes.status).toBe(200);
      expect(ownRes.body.id).toBe(user1TicketId);
      expect(ownRes.body.requesterId).toBe(user1Id);

      // User 1 accesses User 2's ticket -> 403 Forbidden
      const crossRes = await request(app)
        .get(`/api/tickets/${user2TicketId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(crossRes.status).toBe(403);
      expect(crossRes.body).toHaveProperty("error");
      expect(crossRes.body.error).toMatch(/forbidden|access/i);
    });

    it("POST /api/tickets: enforces requesterId from authenticated session and ignores client-supplied spoofed requesterId (BR-03)", async () => {
      const category = await prisma.category.findFirstOrThrow({ where: { isActive: true } });
      const system = await prisma.relatedSystem.findFirstOrThrow({ where: { isActive: true } });

      const spoofedPayload = {
        requesterId: user2Id, // Attempting to spoof User 2
        categoryId: category.id,
        relatedSystemId: system.id,
        requestedPriority: "MEDIUM",
        summary: "Ticket created with session auth",
        description: "Ensuring that the backend overrides body requesterId with token user.",
      };

      const res = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(spoofedPayload);

      expect(res.status).toBe(201);
      expect(res.body.requesterId).toBe(user1Id); // Must be bound to user 1

      // Cleanup
      await prisma.ticket.delete({ where: { id: res.body.id } });
    });

    it("GET /api/tickets/:id/attachments: rejects cross-requester attachment metadata access with 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/tickets/${user2TicketId}/attachments`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden|access/i);
    });

    it("POST /api/tickets/:id/attachments: rejects cross-requester attachment upload with 403 Forbidden", async () => {
      const res = await request(app)
        .post(`/api/tickets/${user2TicketId}/attachments`)
        .set("Authorization", `Bearer ${user1Token}`)
        .attach("file", Buffer.from("%PDF-1.4 test file"), "sample.pdf");

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden|access/i);
    });

    it("enforces BR-02: blocks requests with 403 MUST_CHANGE_PASSWORD when mustChangePassword is true", async () => {
      const res = await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${mustChangeToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("code", "MUST_CHANGE_PASSWORD");
    });
  });
});
