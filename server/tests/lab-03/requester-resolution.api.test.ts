import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";

describe("Requester Resolution Indication Endpoint (API-14 / FR-09 / BR-19)", () => {
  let requesterToken: string;
  let otherRequesterToken: string;
  let mustChangeToken: string;

  let requesterId: number;
  let otherRequesterId: number;

  let openTicketId: number;
  let inProgressTicketId: number;
  let newTicketId: number;
  let closedTicketId: number;

  const prisma = getPrisma();

  beforeAll(async () => {
    const user1 = await prisma.user.findFirstOrThrow({
      where: { email: "jennifer.anderson@example.com" },
    });
    const user2 = await prisma.user.findFirstOrThrow({
      where: { email: "michael.brown@example.com" },
    });
    const mustChangeUser = await prisma.user.findFirstOrThrow({
      where: { email: "sarah.johnson@example.com" },
    });

    requesterId = user1.id;
    otherRequesterId = user2.id;

    await prisma.user.update({
      where: { id: requesterId },
      data: { mustChangePassword: false },
    });
    await prisma.user.update({
      where: { id: otherRequesterId },
      data: { mustChangePassword: false },
    });

    requesterToken = jwt.sign(
      { userId: user1.id, email: user1.email, role: user1.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    otherRequesterToken = jwt.sign(
      { userId: user2.id, email: user2.email, role: user2.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    mustChangeToken = jwt.sign(
      { userId: mustChangeUser.id, email: mustChangeUser.email, role: mustChangeUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const category = await prisma.category.findFirstOrThrow({ where: { isActive: true } });
    const system = await prisma.relatedSystem.findFirstOrThrow({ where: { isActive: true } });

    // 1. OPEN ticket
    const tOpen = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-RESOLVE-${Date.now()}-01`,
        requesterId,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: "Open ticket for resolution indication",
        description: "Testing resolution indication on open status ticket.",
        requestedPriority: "MEDIUM",
        status: "OPEN",
        isResolutionIndicated: false,
      },
    });
    openTicketId = tOpen.id;

    // 2. IN_PROGRESS ticket
    const tInProgress = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-RESOLVE-${Date.now()}-02`,
        requesterId,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: "In progress ticket for resolution indication",
        description: "Testing resolution indication on in_progress status ticket.",
        requestedPriority: "HIGH",
        status: "IN_PROGRESS",
        isResolutionIndicated: false,
      },
    });
    inProgressTicketId = tInProgress.id;

    // 3. NEW ticket
    const tNew = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-RESOLVE-${Date.now()}-03`,
        requesterId,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: "New ticket not yet picked up",
        description: "Testing resolution indication rejection on new status.",
        requestedPriority: "LOW",
        status: "NEW",
        isResolutionIndicated: false,
      },
    });
    newTicketId = tNew.id;

    // 4. CLOSED ticket
    const tClosed = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-RESOLVE-${Date.now()}-04`,
        requesterId,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: "Already closed ticket",
        description: "Testing resolution indication rejection on closed status.",
        requestedPriority: "LOW",
        status: "CLOSED",
        isResolutionIndicated: false,
      },
    });
    closedTicketId = tClosed.id;
  });

  afterAll(async () => {
    const ids = [openTicketId, inProgressTicketId, newTicketId, closedTicketId].filter(Boolean);
    if (ids.length > 0) {
      await prisma.publicComment.deleteMany({
        where: { ticketId: { in: ids } },
      });
      await prisma.ticket.deleteMany({
        where: { id: { in: ids } },
      });
    }
  });

  it("API-14: sets isResolutionIndicated: true and creates PublicComment on OPEN ticket without changing status (BR-19)", async () => {
    const res = await request(app)
      .post(`/api/tickets/${openTicketId}/resolve-indication`)
      .set("Authorization", `Bearer ${requesterToken}`)
      .send({ comment: "The issue seems to be fixed after restarting." });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Resolution indication recorded successfully");
    expect(res.body.ticket).toHaveProperty("isResolutionIndicated", true);
    // BR-19: Must maintain OPEN status, NOT mutate to RESOLVED or CLOSED
    expect(res.body.ticket.status).toBe("OPEN");

    // Verify database state
    const dbTicket = await prisma.ticket.findUnique({ where: { id: openTicketId } });
    expect(dbTicket?.isResolutionIndicated).toBe(true);
    expect(dbTicket?.status).toBe("OPEN");

    // Verify PublicComment created
    const comments = await prisma.publicComment.findMany({ where: { ticketId: openTicketId } });
    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0].content).toContain("The issue seems to be fixed after restarting.");
    expect(comments[0].authorId).toBe(requesterId);
  });

  it("works on IN_PROGRESS status ticket and handles empty comment gracefully", async () => {
    const res = await request(app)
      .post(`/api/tickets/${inProgressTicketId}/resolve-indication`)
      .set("Authorization", `Bearer ${requesterToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.ticket.isResolutionIndicated).toBe(true);
    expect(res.body.ticket.status).toBe("IN_PROGRESS");

    const comments = await prisma.publicComment.findMany({ where: { ticketId: inProgressTicketId } });
    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0].content).toContain("Requester indicated that the problem appears resolved.");
  });

  it("rejects resolution indication on NEW status ticket with 422 Unprocessable Entity", async () => {
    const res = await request(app)
      .post(`/api/tickets/${newTicketId}/resolve-indication`)
      .set("Authorization", `Bearer ${requesterToken}`)
      .send({ comment: "Should fail on NEW" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/OPEN or IN_PROGRESS/i);
  });

  it("rejects resolution indication on CLOSED status ticket with 422 Unprocessable Entity", async () => {
    const res = await request(app)
      .post(`/api/tickets/${closedTicketId}/resolve-indication`)
      .set("Authorization", `Bearer ${requesterToken}`)
      .send({ comment: "Should fail on CLOSED" });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/OPEN or IN_PROGRESS/i);
  });

  it("rejects attempt by another requester with 403 Forbidden", async () => {
    const res = await request(app)
      .post(`/api/tickets/${openTicketId}/resolve-indication`)
      .set("Authorization", `Bearer ${otherRequesterToken}`)
      .send({ comment: "Unauthorized requester attempt" });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden|own ticket/i);
  });

  it("rejects unauthenticated request with 401 Unauthorized", async () => {
    const res = await request(app)
      .post(`/api/tickets/${openTicketId}/resolve-indication`)
      .send({ comment: "No token" });

    expect(res.status).toBe(401);
  });

  it("rejects request when mustChangePassword is true with 403 MUST_CHANGE_PASSWORD", async () => {
    const res = await request(app)
      .post(`/api/tickets/${openTicketId}/resolve-indication`)
      .set("Authorization", `Bearer ${mustChangeToken}`)
      .send({ comment: "Must change password first" });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("code", "MUST_CHANGE_PASSWORD");
  });
});
