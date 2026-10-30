import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";
import { Role, TicketStatus, RequestedPriority, ITPriority } from "@prisma/client";

describe("Requester Dashboard Backend REST API (API-07 / FR-07 / AC-06)", () => {
  const prisma = getPrisma();

  let requesterToken: string;
  let requester2Token: string;
  let staffToken: string;
  let adminToken: string;

  let requesterId: number;
  let requester2Id: number;
  let staffId: number;
  let adminId: number;
  let categoryId: number;
  let relatedSystemId: number;

  const testTicketIds: number[] = [];

  beforeAll(async () => {
    const requester = await prisma.user.findFirstOrThrow({
      where: { email: "jennifer.anderson@example.com" },
    });
    const requester2 = await prisma.user.findFirstOrThrow({
      where: { email: "michael.brown@example.com" },
    });
    const staff = await prisma.user.findFirstOrThrow({
      where: { email: "kevin.patel@toktickit.com" },
    });
    const admin = await prisma.user.findFirstOrThrow({
      where: { email: "admin@toktickit.com" },
    });

    const category = await prisma.category.findFirstOrThrow();
    const relatedSystem = await prisma.relatedSystem.findFirstOrThrow();

    requesterId = requester.id;
    requester2Id = requester2.id;
    staffId = staff.id;
    adminId = admin.id;
    categoryId = category.id;
    relatedSystemId = relatedSystem.id;

    await prisma.user.update({
      where: { id: requesterId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: requester2Id },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: staffId },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: adminId },
      data: { mustChangePassword: false, isActive: true },
    });

    requesterToken = jwt.sign(
      { userId: requesterId, email: requester.email, role: requester.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    requester2Token = jwt.sign(
      { userId: requester2Id, email: requester2.email, role: requester2.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    staffToken = jwt.sign(
      { userId: staffId, email: staff.email, role: staff.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    adminToken = jwt.sign(
      { userId: adminId, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    if (testTicketIds.length > 0) {
      await prisma.actionTaken.deleteMany({
        where: { ticketId: { in: testTicketIds } },
      });
      await prisma.ticket.deleteMany({
        where: { id: { in: testTicketIds } },
      });
    }
    await prisma.user.updateMany({
      where: { email: "david.lee@example.com" },
      data: { mustChangePassword: true },
    });
  });

  it("API-07a: returns 200 OK with accurate metric counts and recent tickets for requester", async () => {
    // Create specific controlled tickets for requesterId
    const now = new Date();
    const t1 = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-REQ1-${Date.now()}`,
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "Dashboard Test Open Ticket",
        description: "Testing active open ticket count",
        requestedPriority: RequestedPriority.MEDIUM,
        itPriority: ITPriority.MEDIUM,
        status: TicketStatus.IN_PROGRESS,
        createdAt: now,
        updatedAt: now,
      },
    });
    testTicketIds.push(t1.id);

    const t2 = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-REQ2-${Date.now()}`,
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "Dashboard Test Waiting Ticket",
        description: "Testing waiting for requester count",
        requestedPriority: RequestedPriority.HIGH,
        itPriority: ITPriority.HIGH,
        status: TicketStatus.WAITING_FOR_REQUESTER,
        createdAt: now,
        updatedAt: now,
      },
    });
    testTicketIds.push(t2.id);

    const t3 = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-REQ3-${Date.now()}`,
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "Dashboard Test Resolved Ticket",
        description: "Testing resolved ticket count",
        requestedPriority: RequestedPriority.LOW,
        itPriority: ITPriority.LOW,
        status: TicketStatus.RESOLVED,
        createdAt: now,
        updatedAt: now,
      },
    });
    testTicketIds.push(t3.id);

    const res = await request(app)
      .get("/api/dashboard/requester")
      .set("Authorization", `Bearer ${requesterToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("metrics");
    expect(res.body).toHaveProperty("recentTickets");

    const { metrics, recentTickets } = res.body;

    // Check metric shapes and values
    expect(typeof metrics.myOpenTickets).toBe("number");
    expect(metrics.myOpenTickets).toBeGreaterThanOrEqual(1);

    expect(typeof metrics.waitingForRequester).toBe("number");
    expect(metrics.waitingForRequester).toBeGreaterThanOrEqual(1);

    expect(typeof metrics.recentlyUpdated).toBe("number");
    expect(metrics.recentlyUpdated).toBeGreaterThanOrEqual(3);

    expect(typeof metrics.recentlyResolved).toBe("number");
    expect(metrics.recentlyResolved).toBeGreaterThanOrEqual(1);

    // Verify recentTickets list
    expect(Array.isArray(recentTickets)).toBe(true);
    expect(recentTickets.length).toBeGreaterThanOrEqual(3);

    const foundT1 = recentTickets.find((t: any) => t.id === t1.id);
    expect(foundT1).toBeDefined();
    expect(foundT1.summary).toBe("Dashboard Test Open Ticket");
    expect(foundT1.status).toBe("IN_PROGRESS");
    expect(typeof foundT1.category).toBe("string");
  });

  it("API-07b: strictly enforces tenant/identity isolation between requesters", async () => {
    // Create a ticket for requester2
    const now = new Date();
    const tReq2 = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-REQ2-ISO-${Date.now()}`,
        requesterId: requester2Id,
        categoryId,
        relatedSystemId,
        summary: "Requester 2 Confidential Request",
        description: "Must never appear in Requester 1 dashboard",
        requestedPriority: RequestedPriority.URGENT,
        itPriority: ITPriority.URGENT,
        status: TicketStatus.OPEN,
        createdAt: now,
        updatedAt: now,
      },
    });
    testTicketIds.push(tReq2.id);

    // Fetch requester 1 dashboard
    const res1 = await request(app)
      .get("/api/dashboard/requester")
      .set("Authorization", `Bearer ${requesterToken}`);

    expect(res1.status).toBe(200);
    const hasReq2Ticket = res1.body.recentTickets.some((t: any) => t.id === tReq2.id);
    expect(hasReq2Ticket).toBe(false);

    // Fetch requester 2 dashboard
    const res2 = await request(app)
      .get("/api/dashboard/requester")
      .set("Authorization", `Bearer ${requester2Token}`);

    expect(res2.status).toBe(200);
    const hasReq2TicketInOwn = res2.body.recentTickets.some((t: any) => t.id === tReq2.id);
    expect(hasReq2TicketInOwn).toBe(true);
  });

  it("API-07c: guarantees zero values and empty array for requester with 0 tickets", async () => {
    const emptyRequester = await prisma.user.findFirstOrThrow({
      where: { email: "david.lee@example.com" },
    });

    try {
      await prisma.user.update({
        where: { id: emptyRequester.id },
        data: { mustChangePassword: false, isActive: true },
      });

      const emptyToken = jwt.sign(
        { userId: emptyRequester.id, email: emptyRequester.email, role: emptyRequester.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/api/dashboard/requester")
        .set("Authorization", `Bearer ${emptyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.metrics).toEqual({
        myOpenTickets: 0,
        waitingForRequester: 0,
        recentlyUpdated: 0,
        recentlyResolved: 0,
      });
      expect(res.body.recentTickets).toEqual([]);
    } finally {
      await prisma.user.update({
        where: { id: emptyRequester.id },
        data: { mustChangePassword: true },
      });
    }
  });

  it("API-07d: excludes tickets resolved > 30 days ago from recentlyResolved metric", async () => {
    const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    const oldResolvedTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-OLDRES-${Date.now()}`,
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "Old Resolved Ticket",
        description: "Resolved 40 days ago",
        requestedPriority: RequestedPriority.LOW,
        itPriority: ITPriority.LOW,
        status: TicketStatus.RESOLVED,
        createdAt: fortyDaysAgo,
        updatedAt: fortyDaysAgo,
      },
    });
    testTicketIds.push(oldResolvedTicket.id);

    const res = await request(app)
      .get("/api/dashboard/requester")
      .set("Authorization", `Bearer ${requesterToken}`);

    expect(res.status).toBe(200);
    // Even though oldResolvedTicket is RESOLVED, it is > 30 days old so it must not inflate recentlyResolved
    const countRecentlyResolved = await prisma.ticket.count({
      where: {
        requesterId,
        status: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
        updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });
    expect(res.body.metrics.recentlyResolved).toBe(countRecentlyResolved);
  });

  it("API-07e: rejects unauthenticated requests with 401 Unauthorized", async () => {
    const res = await request(app).get("/api/dashboard/requester");
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unauthorized|authentication/i);
  });

  it("API-07f: rejects IT Staff and Administrator access with 403 Forbidden", async () => {
    const resStaff = await request(app)
      .get("/api/dashboard/requester")
      .set("Authorization", `Bearer ${staffToken}`);
    expect(resStaff.status).toBe(403);

    const resAdmin = await request(app)
      .get("/api/dashboard/requester")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(resAdmin.status).toBe(403);
  });

  it("API-07g: rejects requester who mustChangePassword with 403 Forbidden", async () => {
    await prisma.user.update({
      where: { id: requesterId },
      data: { mustChangePassword: true },
    });

    const res = await request(app)
      .get("/api/dashboard/requester")
      .set("Authorization", `Bearer ${requesterToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/password change required/i);

    // Reset back
    await prisma.user.update({
      where: { id: requesterId },
      data: { mustChangePassword: false },
    });
  });
});
