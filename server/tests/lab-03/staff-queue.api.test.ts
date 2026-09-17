import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";
import { Role } from "@prisma/client";

describe("IT Staff Ticket Queue Retrieval & Query Engine (API-06 / AC-05 / FR-10)", () => {
  let staffToken: string;
  let adminToken: string;
  let requesterToken: string;
  let mustChangeStaffToken: string;

  let staffUserId: number;
  let adminUserId: number;
  let requesterUserId: number;
  let mustChangeStaffId: number;

  const createdTicketIds: number[] = [];
  const prisma = getPrisma();

  beforeAll(async () => {
    // 1. Fetch or configure users
    const staffUser = await prisma.user.findFirstOrThrow({
      where: { email: "kevin.patel@toktickit.com" },
    });
    const adminUser = await prisma.user.findFirstOrThrow({
      where: { email: "admin@toktickit.com" },
    });
    const requesterUser = await prisma.user.findFirstOrThrow({
      where: { email: "jennifer.anderson@example.com" },
    });
    const mustChangeStaff = await prisma.user.findFirstOrThrow({
      where: { email: "emily.davis@toktickit.com" },
    });

    staffUserId = staffUser.id;
    adminUserId = adminUser.id;
    requesterUserId = requesterUser.id;
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
      where: { id: requesterUserId },
      data: { mustChangePassword: false, isActive: true },
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

    // 2. Fetch active categories and systems
    const catHardware = await prisma.category.findFirstOrThrow({ where: { name: "Hardware" } });
    const catNetwork = await prisma.category.findFirstOrThrow({ where: { name: "Network" } });
    const catSoftware = await prisma.category.findFirstOrThrow({ where: { name: "Software" } });

    const sysLaptop = await prisma.relatedSystem.findFirstOrThrow({ where: { name: "Corporate Laptop" } });
    const sysWifi = await prisma.relatedSystem.findFirstOrThrow({ where: { name: "Campus Wi-Fi" } });

    // 3. Create distinctive test tickets for queue verification
    const testTicketsData = [
      {
        ticketNumber: "TKT-QUEUE-999001",
        requesterId: requesterUserId,
        ownerId: staffUserId, // Owned by staffUser ("me")
        categoryId: catHardware.id,
        relatedSystemId: sysLaptop.id,
        summary: "QueueTest Alpha: Thermal throttling on engineering workstation",
        description: "CPU runs at 95 degrees constantly under load.",
        requestedPriority: "MEDIUM" as const,
        itPriority: "URGENT" as const,
        status: "IN_PROGRESS" as const,
      },
      {
        ticketNumber: "TKT-QUEUE-999002",
        requesterId: requesterUserId,
        ownerId: adminUserId, // Owned by admin
        categoryId: catNetwork.id,
        relatedSystemId: sysWifi.id,
        summary: "QueueTest Beta: Wi-Fi access point reboot loop in building B",
        description: "AP loses connection every 15 minutes.",
        requestedPriority: "HIGH" as const,
        itPriority: "HIGH" as const,
        status: "OPEN" as const,
      },
      {
        ticketNumber: "TKT-QUEUE-999003",
        requesterId: requesterUserId,
        ownerId: null, // Unassigned
        categoryId: catSoftware.id,
        relatedSystemId: sysLaptop.id,
        summary: "QueueTest Gamma: License activation failed for CAD software",
        description: "Error 403 contacting licensing server.",
        requestedPriority: "LOW" as const,
        itPriority: "LOW" as const,
        status: "NEW" as const,
      },
      {
        ticketNumber: "TKT-QUEUE-999004",
        requesterId: requesterUserId,
        ownerId: null, // Unassigned
        categoryId: catHardware.id,
        relatedSystemId: sysLaptop.id,
        summary: "QueueTest Delta: Faulty power adapter replacement requested",
        description: "Adapter cord has frayed insulation.",
        requestedPriority: "MEDIUM" as const,
        itPriority: "MEDIUM" as const,
        status: "RESOLVED" as const,
      },
    ];

    for (const t of testTicketsData) {
      const created = await prisma.ticket.create({
        data: t,
        select: { id: true },
      });
      createdTicketIds.push(created.id);
    }
  });

  afterAll(async () => {
    if (createdTicketIds.length > 0) {
      await prisma.publicComment.deleteMany({
        where: { ticketId: { in: createdTicketIds } },
      });
      await prisma.ticket.deleteMany({
        where: { id: { in: createdTicketIds } },
      });
    }
  });

  describe("1. Access Control & Role Enforcement (BR-01, BR-02, AC-05)", () => {
    it("rejects unauthenticated request with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/staff/tickets");
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/unauthorized/i);
    });

    it("rejects REQUESTER role with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden/i);
    });

    it("rejects user with mustChangePassword: true with 403 MUST_CHANGE_PASSWORD", async () => {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${mustChangeStaffToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("MUST_CHANGE_PASSWORD");
    });

    it("allows IT_STAFF role to access the queue with 200 OK", async () => {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("allows ADMINISTRATOR role to access the queue with 200 OK", async () => {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("2. Search Engine (FR-10)", () => {
    it("filters tickets by search matching ticketNumber substring", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?search=QUEUE-999001")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].ticketNumber).toBe("TKT-QUEUE-999001");
      expect(res.body.data[0].summary).toContain("Thermal throttling");
    });

    it("filters tickets by search matching summary text (case-insensitive)", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?search=reboot loop")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].ticketNumber).toBe("TKT-QUEUE-999002");
    });

    it("returns empty data array when search query matches nothing", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?search=NonExistentGibberishPhrase998877")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  describe("3. Multi-Attribute Filtering (FR-10, AC-05)", () => {
    it("filters by status (single enum)", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?search=QueueTest&status=IN_PROGRESS")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].ticketNumber).toBe("TKT-QUEUE-999001");
      expect(res.body.data[0].status).toBe("IN_PROGRESS");
    });

    it("filters by status (multiple comma-separated enums)", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?search=QueueTest&status=OPEN,IN_PROGRESS")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      const ticketNumbers = res.body.data.map((t: any) => t.ticketNumber);
      expect(ticketNumbers).toContain("TKT-QUEUE-999001");
      expect(ticketNumbers).toContain("TKT-QUEUE-999002");
    });

    it("filters by itPriority", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?search=QueueTest&itPriority=URGENT")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].ticketNumber).toBe("TKT-QUEUE-999001");
      expect(res.body.data[0].itPriority).toBe("URGENT");
    });

    it("filters by category ID", async () => {
      const catHardware = await prisma.category.findFirstOrThrow({ where: { name: "Hardware" } });

      const res = await request(app)
        .get(`/api/staff/tickets?search=QueueTest&categoryId=${catHardware.id}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2); // 999001 and 999004
      for (const t of res.body.data) {
        expect(t.category.id).toBe(catHardware.id);
      }
    });

    it("filters by ownerId='unassigned' returning only unassigned tickets", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?search=QueueTest&ownerId=unassigned")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2); // 999003 and 999004
      for (const t of res.body.data) {
        expect(t.ownerId).toBeNull();
        expect(t.owner).toBeNull();
        expect(t.ticketOwner).toBe("Unassigned");
      }
    });

    it("filters by ownerId='me' returning only tickets assigned to the caller", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?search=QueueTest&ownerId=me")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].ticketNumber).toBe("TKT-QUEUE-999001");
      expect(res.body.data[0].ownerId).toBe(staffUserId);
      expect(res.body.data[0].owner.id).toBe(staffUserId);
    });

    it("filters by specific numeric ownerId", async () => {
      const res = await request(app)
        .get(`/api/staff/tickets?search=QueueTest&ownerId=${adminUserId}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].ticketNumber).toBe("TKT-QUEUE-999002");
      expect(res.body.data[0].ownerId).toBe(adminUserId);
    });
  });

  describe("4. Sorting and Pagination (FR-10, AC-05)", () => {
    it("paginates tickets with limit and page offsets", async () => {
      const resPage1 = await request(app)
        .get("/api/staff/tickets?search=QueueTest&page=1&limit=2&sortBy=ticketNumber&sortDir=asc")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(resPage1.status).toBe(200);
      expect(resPage1.body.data.length).toBe(2);
      expect(resPage1.body.pagination.page).toBe(1);
      expect(resPage1.body.pagination.limit).toBe(2);
      expect(resPage1.body.pagination.total).toBe(4);
      expect(resPage1.body.pagination.totalPages).toBe(2);
      expect(resPage1.body.data[0].ticketNumber).toBe("TKT-QUEUE-999001");
      expect(resPage1.body.data[1].ticketNumber).toBe("TKT-QUEUE-999002");

      const resPage2 = await request(app)
        .get("/api/staff/tickets?search=QueueTest&page=2&limit=2&sortBy=ticketNumber&sortDir=asc")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(resPage2.status).toBe(200);
      expect(resPage2.body.data.length).toBe(2);
      expect(resPage2.body.pagination.page).toBe(2);
      expect(resPage2.body.data[0].ticketNumber).toBe("TKT-QUEUE-999003");
      expect(resPage2.body.data[1].ticketNumber).toBe("TKT-QUEUE-999004");
    });

    it("supports sorting by ticketNumber descending", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?search=QueueTest&sortBy=ticketNumber&sortDir=desc")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].ticketNumber).toBe("TKT-QUEUE-999004");
      expect(res.body.data[1].ticketNumber).toBe("TKT-QUEUE-999003");
      expect(res.body.data[2].ticketNumber).toBe("TKT-QUEUE-999002");
      expect(res.body.data[3].ticketNumber).toBe("TKT-QUEUE-999001");
    });
  });
});
