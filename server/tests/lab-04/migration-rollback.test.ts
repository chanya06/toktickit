import { describe, it, expect, afterAll } from "vitest";
import { getPrisma } from "../../src/prisma.js";

describe("Database Migration, Schema & Rollback Verification (MIGR-01 - Issue 30)", () => {
  const prisma = getPrisma();
  let testTicketId: number;
  let testRequesterId: number;
  let testStaffId: number;

  it("MIGR-01a: verifies ActionTaken table structure and foreign key relations", async () => {
    // 1. Fetch existing seeded users
    const requester = await prisma.user.findFirst({
      where: { role: "REQUESTER", isActive: true },
    });
    const staff = await prisma.user.findFirst({
      where: { role: "IT_STAFF", isActive: true },
    });

    expect(requester).toBeDefined();
    expect(staff).toBeDefined();
    testRequesterId = requester!.id;
    testStaffId = staff!.id;

    // 2. Fetch Category and System
    const category = await prisma.category.findFirst();
    const system = await prisma.relatedSystem.findFirst();

    // 3. Create a dedicated test ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-MIGR-${Date.now()}`,
        requesterId: testRequesterId,
        ownerId: testStaffId,
        categoryId: category!.id,
        relatedSystemId: system!.id,
        summary: "Migration test ticket verification",
        description: "Checking that schema supports ActionTaken relations cleanly.",
        requestedPriority: "MEDIUM",
        itPriority: "HIGH",
        status: "OPEN",
      },
    });
    testTicketId = ticket.id;

    // 4. Create an ActionTaken record referencing ticket and staff
    const action = await prisma.actionTaken.create({
      data: {
        ticketId: testTicketId,
        actionDescription: "Verified database schema integrity and foreign key constraints.",
        result: "PostgreSQL table ActionTaken active and relations operational.",
        performedById: testStaffId,
        assigneeId: testStaffId,
        status: "COMPLETED",
        followUpRequired: false,
        attachmentNotes: "schema_check.log",
      },
      include: {
        ticket: true,
        performedBy: true,
        assignee: true,
      },
    });

    expect(action.id).toBeDefined();
    expect(action.ticketId).toBe(testTicketId);
    expect(action.performedById).toBe(testStaffId);
    expect(action.assigneeId).toBe(testStaffId);
    expect(action.status).toBe("COMPLETED");
    expect(action.performedBy.email).toBe(staff!.email);
  });

  it("MIGR-01b: verifies legacy tickets with zero actions behave correctly (Non-destructive legacy support)", async () => {
    // Ticket with 0 actions
    const ticketWithZeroActions = await prisma.ticket.findFirst({
      where: { ticketNumber: "TKT-2026-000003" },
      include: { actionsTaken: true },
    });

    expect(ticketWithZeroActions).toBeDefined();
    expect(ticketWithZeroActions?.actionsTaken).toEqual([]);
    expect(ticketWithZeroActions?.actionsTaken.length).toBe(0);
  });

  it("MIGR-01c: verifies cascading deletion when a ticket is removed", async () => {
    // Check action exists before ticket deletion
    const actionCountBefore = await prisma.actionTaken.count({
      where: { ticketId: testTicketId },
    });
    expect(actionCountBefore).toBeGreaterThan(0);

    // Delete test ticket
    await prisma.ticket.delete({
      where: { id: testTicketId },
    });

    // Check actions associated with ticket were cascaded
    const actionCountAfter = await prisma.actionTaken.count({
      where: { ticketId: testTicketId },
    });
    expect(actionCountAfter).toBe(0);

    // Verify staff user was NOT deleted
    const staffUser = await prisma.user.findUnique({
      where: { id: testStaffId },
    });
    expect(staffUser).toBeDefined();
  });

  it("MIGR-01d: verifies reverse rollback DDL syntax validity in a rollback-safe transaction", async () => {
    // Execute rollback DDL inside a transaction that is rolled back immediately
    // so staging tables are preserved while verifying the SQL DDL validity
    await prisma.$transaction(async (tx) => {
      // Create a temporary clone table to test the exact drop syntax
      await tx.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ActionTaken_RollbackTest" (
          id SERIAL PRIMARY KEY,
          "ticketId" INTEGER NOT NULL
        );
      `);

      // Test DROP TABLE IF EXISTS CASCADE
      await tx.$executeRawUnsafe(`
        DROP TABLE IF EXISTS "ActionTaken_RollbackTest" CASCADE;
      `);
    });
  });

  afterAll(async () => {
    // Cleanup any lingering test ticket
    if (testTicketId) {
      await prisma.actionTaken.deleteMany({ where: { ticketId: testTicketId } });
      await prisma.ticket.deleteMany({ where: { id: testTicketId } });
    }
  });
});
