import { getPrisma } from "../src/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const prisma = getPrisma();

  // 1. Seed Categories (4 required)
  const categories = [
    "Account and Access",
    "Hardware",
    "Software",
    "Network",
  ];

  const categoryMap = new Map<string, number>();
  for (const name of categories) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
    categoryMap.set(name, cat.id);
  }

  // 2. Seed Related Systems (7 required)
  const relatedSystems = [
    "Email",
    "Campus Wi-Fi",
    "VPN",
    "LEB2 App",
    "Grade Submission App",
    "Printer",
    "Corporate Laptop",
  ];

  const systemMap = new Map<string, number>();
  for (const name of relatedSystems) {
    const sys = await prisma.relatedSystem.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
    systemMap.set(name, sys.id);
  }

  // 3. Hash default password for seeded users
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("InitialPass123!", salt);

  // 4. Seed Users:
  // - 4 active Requesters, 1 inactive Requester
  // - 3 active IT Staff, 1 inactive IT Staff
  // - 1 active Administrator
  const usersToSeed = [
    // Requesters (Active)
    {
      fullName: "Jennifer Anderson",
      name: "Jennifer Anderson",
      email: "jennifer.anderson@example.com",
      role: "REQUESTER" as const,
      department: "Engineering",
      isActive: true,
      mustChangePassword: true,
    },
    {
      fullName: "Michael Brown",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      role: "REQUESTER" as const,
      department: "IT Support",
      isActive: true,
      mustChangePassword: true,
    },
    {
      fullName: "Sarah Johnson",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "REQUESTER" as const,
      department: "Marketing",
      isActive: true,
      mustChangePassword: true,
    },
    {
      fullName: "David Lee",
      name: "David Lee",
      email: "david.lee@example.com",
      role: "REQUESTER" as const,
      department: "Operations",
      isActive: true,
      mustChangePassword: true,
    },
    // Requester (Inactive)
    {
      fullName: "Alex Taylor",
      name: "Alex Taylor",
      email: "alex.taylor@example.com",
      role: "REQUESTER" as const,
      department: "Finance",
      isActive: false,
      mustChangePassword: true,
    },
    // IT Staff (Active)
    {
      fullName: "Kevin Patel",
      name: "Kevin Patel",
      email: "kevin.patel@toktickit.com",
      role: "IT_STAFF" as const,
      department: "IT Services",
      isActive: true,
      mustChangePassword: true,
    },
    {
      fullName: "Emily Davis",
      name: "Emily Davis",
      email: "emily.davis@toktickit.com",
      role: "IT_STAFF" as const,
      department: "Network Operations",
      isActive: true,
      mustChangePassword: true,
    },
    {
      fullName: "Lisa Martinez",
      name: "Lisa Martinez",
      email: "lisa.martinez@toktickit.com",
      role: "IT_STAFF" as const,
      department: "Desktop Support",
      isActive: true,
      mustChangePassword: true,
    },
    // IT Staff (Inactive)
    {
      fullName: "Robert Wilson",
      name: "Robert Wilson",
      email: "robert.wilson@toktickit.com",
      role: "IT_STAFF" as const,
      department: "IT Support",
      isActive: false,
      mustChangePassword: true,
    },
    // Administrator (Active)
    {
      fullName: "John Smith",
      name: "John Smith",
      email: "admin@toktickit.com",
      role: "ADMINISTRATOR" as const,
      department: "IT Administration",
      isActive: true,
      mustChangePassword: false, // Pre-configured Admin ready for immediate testing
    },
  ];

  const userMap = new Map<string, number>();
  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        name: u.name,
        role: u.role,
        department: u.department,
        isActive: u.isActive,
      },
      create: {
        fullName: u.fullName,
        name: u.name,
        email: u.email,
        passwordHash: defaultPasswordHash,
        role: u.role,
        department: u.department,
        isActive: u.isActive,
        mustChangePassword: u.mustChangePassword,
      },
    });
    userMap.set(u.email, user.id);
  }

  // 5. Seed Sample Tickets with distributed status, priority, and assigned/unassigned owner
  const jenniferId = userMap.get("jennifer.anderson@example.com")!;
  const michaelId = userMap.get("michael.brown@example.com")!;
  const sarahId = userMap.get("sarah.johnson@example.com")!;
  const kevinStaffId = userMap.get("kevin.patel@toktickit.com")!;
  const emilyStaffId = userMap.get("emily.davis@toktickit.com")!;

  const hardwareCatId = categoryMap.get("Hardware")!;
  const networkCatId = categoryMap.get("Network")!;
  const softwareCatId = categoryMap.get("Software")!;
  const laptopSysId = systemMap.get("Corporate Laptop")!;
  const wifiSysId = systemMap.get("Campus Wi-Fi")!;
  const emailSysId = systemMap.get("Email")!;

  const sampleTickets = [
    {
      ticketNumber: "TKT-2026-000001",
      requesterId: jenniferId,
      ownerId: kevinStaffId,
      categoryId: hardwareCatId,
      relatedSystemId: laptopSysId,
      summary: "Laptop battery drains quickly",
      description: "My corporate laptop battery drains from 100% to 10% in under an hour even without running heavy apps.",
      requestedPriority: "MEDIUM" as const,
      itPriority: "HIGH" as const,
      status: "IN_PROGRESS" as const,
    },
    {
      ticketNumber: "TKT-2026-000002",
      requesterId: michaelId,
      ownerId: emilyStaffId,
      categoryId: networkCatId,
      relatedSystemId: wifiSysId,
      summary: "Cannot connect to Campus Wi-Fi in Engineering Building 3",
      description: "Getting authentication timeout error when attempting to connect to Campus Wi-Fi on floor 4.",
      requestedPriority: "HIGH" as const,
      itPriority: "HIGH" as const,
      status: "OPEN" as const,
    },
    {
      ticketNumber: "TKT-2026-000003",
      requesterId: sarahId,
      ownerId: null, // Unassigned
      categoryId: softwareCatId,
      relatedSystemId: emailSysId,
      summary: "Email sync issue on mobile client",
      description: "Outlook mobile client stopped receiving new emails since morning.",
      requestedPriority: "LOW" as const,
      itPriority: "LOW" as const,
      status: "NEW" as const,
    },
  ];

  for (const t of sampleTickets) {
    const existing = await prisma.ticket.findUnique({
      where: { ticketNumber: t.ticketNumber },
    });

    let ticketId: number;
    if (!existing) {
      const created = await prisma.ticket.create({
        data: t,
      });
      ticketId = created.id;
    } else {
      ticketId = existing.id;
    }

    // Seed sample Public Comment and Internal Note on first ticket
    if (t.ticketNumber === "TKT-2026-000001") {
      const commentCount = await prisma.publicComment.count({
        where: { ticketId },
      });
      if (commentCount === 0) {
        await prisma.publicComment.create({
          data: {
            ticketId,
            authorId: kevinStaffId,
            content: "We are investigating the battery diagnostic logs.",
          },
        });
        await prisma.publicComment.create({
          data: {
            ticketId,
            authorId: jenniferId,
            content: "Thank you, please let me know if you need physical inspection.",
          },
        });
      }

      const noteCount = await prisma.internalNote.count({
        where: { ticketId },
      });
      if (noteCount === 0) {
        await prisma.internalNote.create({
          data: {
            ticketId,
            authorId: kevinStaffId,
            content: "Internal Note: Battery replacement cycle scheduled for Friday.",
          },
        });
      }
    }
  }

  const categoryCount = await prisma.category.count();
  const systemCount = await prisma.relatedSystem.count();
  const userCount = await prisma.user.count();
  const requesterCount = await prisma.user.count({ where: { role: "REQUESTER" } });
  const itStaffCount = await prisma.user.count({ where: { role: "IT_STAFF" } });
  const adminCount = await prisma.user.count({ where: { role: "ADMINISTRATOR" } });
  const ticketCount = await prisma.ticket.count();
  const commentCount = await prisma.publicComment.count();
  const noteCount = await prisma.internalNote.count();

  console.log(`Database seeded successfully (Idempotent):`);
  console.log(`- Categories: ${categoryCount}`);
  console.log(`- Related Systems: ${systemCount}`);
  console.log(`- Total Users: ${userCount} (Requesters: ${requesterCount}, IT Staff: ${itStaffCount}, Admin: ${adminCount})`);
  console.log(`- Tickets: ${ticketCount}`);
  console.log(`- Public Comments: ${commentCount}`);
  console.log(`- Internal Notes: ${noteCount}`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
