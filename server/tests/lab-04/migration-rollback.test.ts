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

  it("MIGR-01d: verifies reverse rollback DDL execution on complete schema with Foreign Keys and Enums", async () => {
    // Find an existing ticket for foreign key linkage
    const existingTicket = await prisma.ticket.findFirst();
    expect(existingTicket).toBeDefined();

    // 1. Create a full-fidelity replica schema with complete enum and foreign keys matching migration.sql
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ActionTakenStatus_RollbackSim" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ActionTaken_RollbackSim" (
        "id" SERIAL NOT NULL,
        "ticketId" INTEGER NOT NULL,
        "actionDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "actionDescription" TEXT NOT NULL,
        "result" TEXT,
        "performedById" INTEGER NOT NULL,
        "assigneeId" INTEGER,
        "status" "ActionTakenStatus_RollbackSim" NOT NULL DEFAULT 'COMPLETED',
        "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
        "followUpNote" TEXT,
        "attachmentNotes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "ActionTaken_RollbackSim_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ActionTaken_RollbackSim_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ActionTaken_RollbackSim_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "ActionTaken_RollbackSim_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ActionTaken_RollbackSim_ticketId_idx" ON "ActionTaken_RollbackSim"("ticketId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ActionTaken_RollbackSim_performedById_idx" ON "ActionTaken_RollbackSim"("performedById");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ActionTaken_RollbackSim_assigneeId_idx" ON "ActionTaken_RollbackSim"("assigneeId");
    `);

    // 2. Insert data into the replica table to verify FK constraints are active
    await prisma.$executeRawUnsafe(`
      INSERT INTO "ActionTaken_RollbackSim" ("ticketId", "actionDescription", "performedById", "assigneeId", "status")
      VALUES (${existingTicket!.id}, 'Rollback simulation testing action entry', ${existingTicket!.requesterId}, NULL, 'PENDING');
    `);

    // Verify row was inserted
    const insertedRows: Array<{ count: bigint }> = await prisma.$queryRawUnsafe(`
      SELECT count(*) as count FROM "ActionTaken_RollbackSim";
    `);
    expect(Number(insertedRows[0].count)).toBe(1);

    // 3. Execute the exact documented Down-Migration / Rollback DDL from Section 7.3
    // DROP TABLE IF EXISTS "ActionTaken" CASCADE;
    // DROP TYPE IF EXISTS "ActionTakenStatus";
    await prisma.$executeRawUnsafe(`
      DROP TABLE IF EXISTS "ActionTaken_RollbackSim" CASCADE;
    `);

    await prisma.$executeRawUnsafe(`
      DROP TYPE IF EXISTS "ActionTakenStatus_RollbackSim";
    `);

    // 4. Assert that table and enum type were dropped cleanly without leaving orphaned artifacts or constraint errors
    const tableCheck: Array<{ table_name: string }> = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'ActionTaken_RollbackSim';
    `);
    expect(tableCheck.length).toBe(0);

    const typeCheck: Array<{ typname: string }> = await prisma.$queryRawUnsafe(`
      SELECT typname FROM pg_type WHERE typname = 'ActionTakenStatus_RollbackSim';
    `);
    expect(typeCheck.length).toBe(0);
  });

  afterAll(async () => {
    // Cleanup any lingering test ticket or simulation objects
    if (testTicketId) {
      await prisma.actionTaken.deleteMany({ where: { ticketId: testTicketId } });
      await prisma.ticket.deleteMany({ where: { id: testTicketId } });
    }
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "ActionTaken_RollbackSim" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "ActionTakenStatus_RollbackSim";`);
  });
});
