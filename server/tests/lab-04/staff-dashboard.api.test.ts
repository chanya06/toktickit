import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";
import { Role, TicketStatus, RequestedPriority, ITPriority } from "@prisma/client";

describe("IT Staff & Admin Dashboard Backend REST API (API-08 / FR-09 / FR-11 / AC-08)", () => {
  const prisma = getPrisma();

  let staffToken: string;
  let staff2Token: string;
  let adminToken: string;
  let requesterToken: string;

  let staffId: number;
  let staff2Id: number;
  let adminId: number;
  let requesterId: number;
  let categoryId: number;
  let relatedSystemId: number;

  const testTicketIds: number[] = [];

  beforeAll(async () => {
    const staff = await prisma.user.findFirstOrThrow({
      where: { email: "kevin.patel@toktickit.com" },
    });
    const staff2 = await prisma.user.findFirstOrThrow({
      where: { email: "emily.davis@toktickit.com" },
    });
    const admin = await prisma.user.findFirstOrThrow({
      where: { email: "admin@toktickit.com" },
    });
    const requester = await prisma.user.findFirstOrThrow({
      where: { email: "jennifer.anderson@example.com" },
    });

    const category = await prisma.category.findFirstOrThrow();
    const relatedSystem = await prisma.relatedSystem.findFirstOrThrow();

    staffId = staff.id;
    staff2Id = staff2.id;
    adminId = admin.id;
    requesterId = requester.id;
    categoryId = category.id;
    relatedSystemId = relatedSystem.id;

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

    staffToken = jwt.sign(
      { userId: staffId, email: staff.email, role: staff.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    staff2Token = jwt.sign(
      { userId: staff2Id, email: staff2.email, role: staff2.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    adminToken = jwt.sign(
      { userId: adminId, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    requesterToken = jwt.sign(
      { userId: requesterId, email: requester.email, role: requester.role },
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
  });

  // -------------------------------------------------------------------------
  // IT Staff Dashboard (GET /api/dashboard/staff)
  // -------------------------------------------------------------------------
  describe("GET /api/dashboard/staff", () => {
    it("API-08a: returns 200 OK with triage metrics, status/priority breakdown, urgent and recent lists", async () => {
      const now = new Date();
      // 1. Unassigned ticket
      const tUnassigned = await prisma.ticket.create({
        data: {
          ticketNumber: `TKT-TEST-STAFF-UNASS-${Date.now()}`,
          requesterId,
          ownerId: null,
          categoryId,
          relatedSystemId,
          summary: "Triage Unassigned Test Ticket",
          description: "Unassigned ticket for queue metrics",
          requestedPriority: RequestedPriority.HIGH,
          itPriority: ITPriority.HIGH,
          status: TicketStatus.NEW,
          createdAt: now,
          updatedAt: now,
        },
      });
      testTicketIds.push(tUnassigned.id);

      // 2. Assigned to Staff 1
      const tAssignedStaff1 = await prisma.ticket.create({
        data: {
          ticketNumber: `TKT-TEST-STAFF-ASS1-${Date.now()}`,
          requesterId,
          ownerId: staffId,
          categoryId,
          relatedSystemId,
          summary: "Triage Assigned Staff 1 Test Ticket",
          description: "Assigned to staff 1",
          requestedPriority: RequestedPriority.URGENT,
          itPriority: ITPriority.URGENT,
          status: TicketStatus.IN_PROGRESS,
          createdAt: now,
          updatedAt: now,
        },
      });
      testTicketIds.push(tAssignedStaff1.id);

      // Add an action taken to verify actionsCount
      await prisma.actionTaken.create({
        data: {
          ticketId: tAssignedStaff1.id,
          performedById: staffId,
          actionDescription: "Investigated urgent staff ticket",
          status: "IN_PROGRESS",
          followUpRequired: false,
        },
      });

      const res = await request(app)
        .get("/api/dashboard/staff")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("metrics");
      expect(res.body).toHaveProperty("urgentTickets");
      expect(res.body).toHaveProperty("recentTickets");

      const { metrics, urgentTickets, recentTickets } = res.body;

      // Metrics validation
      expect(typeof metrics.unassignedTickets).toBe("number");
      expect(metrics.unassignedTickets).toBeGreaterThanOrEqual(1);

      expect(typeof metrics.myAssignedTickets).toBe("number");
      expect(metrics.myAssignedTickets).toBeGreaterThanOrEqual(1);

      expect(typeof metrics.recentlyUpdatedCount).toBe("number");
      expect(metrics.recentlyUpdatedCount).toBeGreaterThanOrEqual(2);

      // Status breakdown
      expect(metrics.byStatus).toBeDefined();
      expect(metrics.byStatus).toHaveProperty("NEW");
      expect(metrics.byStatus).toHaveProperty("OPEN");
      expect(metrics.byStatus).toHaveProperty("IN_PROGRESS");
      expect(metrics.byStatus).toHaveProperty("WAITING_FOR_REQUESTER");
      expect(metrics.byStatus).toHaveProperty("RESOLVED");
      expect(metrics.byStatus).toHaveProperty("CLOSED");
      expect(metrics.byStatus).toHaveProperty("REOPENED");
      expect(metrics.byStatus).toHaveProperty("CANCELLED");
      expect(typeof metrics.byStatus.IN_PROGRESS).toBe("number");
      expect(metrics.byStatus.IN_PROGRESS).toBeGreaterThanOrEqual(1);

      // Priority breakdown
      expect(metrics.byPriority).toBeDefined();
      expect(metrics.byPriority).toHaveProperty("URGENT");
      expect(metrics.byPriority).toHaveProperty("HIGH");
      expect(metrics.byPriority).toHaveProperty("MEDIUM");
      expect(metrics.byPriority).toHaveProperty("LOW");
      expect(typeof metrics.byPriority.URGENT).toBe("number");
      expect(metrics.byPriority.URGENT).toBeGreaterThanOrEqual(1);

      // Urgent tickets
      expect(Array.isArray(urgentTickets)).toBe(true);
      const foundUrgent = urgentTickets.find((t: any) => t.id === tAssignedStaff1.id);
      expect(foundUrgent).toBeDefined();
      expect(foundUrgent.itPriority).toBe("URGENT");
      expect(foundUrgent.actionsCount).toBe(1);

      // Recent tickets
      expect(Array.isArray(recentTickets)).toBe(true);
      expect(recentTickets.length).toBeGreaterThanOrEqual(2);
    });

    it("API-08b: differentiates myAssignedTickets between different staff users", async () => {
      const res1 = await request(app)
        .get("/api/dashboard/staff")
        .set("Authorization", `Bearer ${staffToken}`);

      const res2 = await request(app)
        .get("/api/dashboard/staff")
        .set("Authorization", `Bearer ${staff2Token}`);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      // Unassigned count is system-wide, so it matches
      expect(res1.body.metrics.unassignedTickets).toBe(res2.body.metrics.unassignedTickets);

      // myAssignedTickets is scoped to each staff member (active tickets only per BR-10)
      const staff1AssignedCount = await prisma.ticket.count({
        where: {
          ownerId: staffId,
          status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      });
      const staff2AssignedCount = await prisma.ticket.count({
        where: {
          ownerId: staff2Id,
          status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      });

      expect(res1.body.metrics.myAssignedTickets).toBe(staff1AssignedCount);
      expect(res2.body.metrics.myAssignedTickets).toBe(staff2AssignedCount);
    });

    it("API-08c: allows Administrator access to GET /api/dashboard/staff", async () => {
      const res = await request(app)
        .get("/api/dashboard/staff")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("metrics");
    });

    it("API-08d: rejects Requesters with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/dashboard/staff")
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden|staff/i);
    });

    it("API-08e: rejects unauthenticated requests with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/dashboard/staff");
      expect(res.status).toBe(401);
    });

    it("API-08i: strictly excludes terminal tickets (RESOLVED, CLOSED, CANCELLED) from unassignedTickets, myAssignedTickets, and byPriority (BR-10)", async () => {
      // 1. Fetch baseline metrics for staffId
      const baseRes = await request(app)
        .get("/api/dashboard/staff")
        .set("Authorization", `Bearer ${staffToken}`);
      expect(baseRes.status).toBe(200);

      const baseUnassigned = baseRes.body.metrics.unassignedTickets;
      const baseMyAssigned = baseRes.body.metrics.myAssignedTickets;
      const baseUrgentPriority = baseRes.body.metrics.byPriority.URGENT || 0;
      const baseHighPriority = baseRes.body.metrics.byPriority.HIGH || 0;
      const baseLowPriority = baseRes.body.metrics.byPriority.LOW || 0;

      // 2. Create terminal tickets across different statuses and priorities:
      // a) Unassigned CANCELLED ticket (HIGH priority)
      const tCancelled = await prisma.ticket.create({
        data: {
          ticketNumber: `TKT-TEST-TERM-CANC-${Date.now()}`,
          requesterId,
          ownerId: null,
          categoryId,
          relatedSystemId,
          summary: "Terminal Cancelled Ticket",
          description: "Cancelled ticket must never increment unassigned or priority",
          requestedPriority: RequestedPriority.HIGH,
          itPriority: ITPriority.HIGH,
          status: TicketStatus.CANCELLED,
        },
      });
      testTicketIds.push(tCancelled.id);

      // b) Assigned RESOLVED ticket (URGENT priority)
      const tResolved = await prisma.ticket.create({
        data: {
          ticketNumber: `TKT-TEST-TERM-RES-${Date.now()}`,
          requesterId,
          ownerId: staffId,
          categoryId,
          relatedSystemId,
          summary: "Terminal Resolved Ticket",
          description: "Resolved ticket must never increment myAssigned or priority",
          requestedPriority: RequestedPriority.URGENT,
          itPriority: ITPriority.URGENT,
          status: TicketStatus.RESOLVED,
        },
      });
      testTicketIds.push(tResolved.id);

      // c) Assigned CLOSED ticket (LOW priority)
      const tClosed = await prisma.ticket.create({
        data: {
          ticketNumber: `TKT-TEST-TERM-CLS-${Date.now()}`,
          requesterId,
          ownerId: staffId,
          categoryId,
          relatedSystemId,
          summary: "Terminal Closed Ticket",
          description: "Closed ticket must never increment myAssigned or priority",
          requestedPriority: RequestedPriority.LOW,
          itPriority: ITPriority.LOW,
          status: TicketStatus.CLOSED,
        },
      });
      testTicketIds.push(tClosed.id);

      // 3. Request staff dashboard again
      const newRes = await request(app)
        .get("/api/dashboard/staff")
        .set("Authorization", `Bearer ${staffToken}`);
      expect(newRes.status).toBe(200);

      // Assert unassignedTickets did not increase despite unassigned cancelled ticket
      expect(newRes.body.metrics.unassignedTickets).toBe(baseUnassigned);

      // Assert myAssignedTickets did not increase despite assigned resolved and closed tickets
      expect(newRes.body.metrics.myAssignedTickets).toBe(baseMyAssigned);

      // Assert active priority workload counts did not increase
      expect(newRes.body.metrics.byPriority.URGENT).toBe(baseUrgentPriority);
      expect(newRes.body.metrics.byPriority.HIGH).toBe(baseHighPriority);
      expect(newRes.body.metrics.byPriority.LOW).toBe(baseLowPriority);

      // Assert byStatus continues to track overall queue lifecycle including terminal statuses
      expect(newRes.body.metrics.byStatus.CANCELLED).toBeGreaterThanOrEqual(1);
      expect(newRes.body.metrics.byStatus.RESOLVED).toBeGreaterThanOrEqual(1);
      expect(newRes.body.metrics.byStatus.CLOSED).toBeGreaterThanOrEqual(1);
    });
  });

  // -------------------------------------------------------------------------
  // Administrator Dashboard (GET /api/dashboard/admin)
  // -------------------------------------------------------------------------
  describe("GET /api/dashboard/admin", () => {
    it("API-08f: returns 200 OK with systemUserStats and operationalMetrics for Administrator", async () => {
      const res = await request(app)
        .get("/api/dashboard/admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("systemUserStats");
      expect(res.body).toHaveProperty("operationalMetrics");
      expect(res.body).toHaveProperty("urgentTickets");
      expect(res.body).toHaveProperty("recentTickets");

      const { systemUserStats, operationalMetrics } = res.body;

      // System user counts
      expect(typeof systemUserStats.totalUsers).toBe("number");
      expect(systemUserStats.totalUsers).toBeGreaterThanOrEqual(4);

      expect(typeof systemUserStats.activeRequesters).toBe("number");
      expect(systemUserStats.activeRequesters).toBeGreaterThanOrEqual(1);

      expect(typeof systemUserStats.activeStaff).toBe("number");
      expect(systemUserStats.activeStaff).toBeGreaterThanOrEqual(2);

      expect(typeof systemUserStats.administrators).toBe("number");
      expect(systemUserStats.administrators).toBeGreaterThanOrEqual(1);

      expect(typeof systemUserStats.inactiveUsers).toBe("number");

      // Operational metrics shape
      expect(operationalMetrics).toHaveProperty("unassignedTickets");
      expect(operationalMetrics).toHaveProperty("myAssignedTickets");
      expect(operationalMetrics).toHaveProperty("byStatus");
      expect(operationalMetrics).toHaveProperty("byPriority");
      expect(operationalMetrics).toHaveProperty("recentlyUpdatedCount");
    });

    it("API-08g: rejects non-admin users (IT Staff and Requester) with 403 Forbidden", async () => {
      const resStaff = await request(app)
        .get("/api/dashboard/admin")
        .set("Authorization", `Bearer ${staffToken}`);
      expect(resStaff.status).toBe(403);

      const resReq = await request(app)
        .get("/api/dashboard/admin")
        .set("Authorization", `Bearer ${requesterToken}`);
      expect(resReq.status).toBe(403);
    });

    it("API-08h: rejects unauthenticated requests with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/dashboard/admin");
      expect(res.status).toBe(401);
    });
  });
});
