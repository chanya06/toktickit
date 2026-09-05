import { getPrisma } from "../src/prisma.js";

async function main() {
  const prisma = getPrisma();

  // 1. Seed Categories (4 required)
  const categories = [
    "Account and Access",
    "Hardware",
    "Software",
    "Network",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
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

  for (const name of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }

  // 3. Seed Development Requesters (4 active, 1 inactive)
  const requesters = [
    {
      name: "Jennifer Anderson",
      email: "jennifer.anderson@example.com",
      department: "Engineering",
      isActive: true,
    },
    {
      name: "Michael Brown",
      email: "michael.brown@example.com",
      department: "IT Support",
      isActive: true,
    },
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      department: "Marketing",
      isActive: true,
    },
    {
      name: "David Lee",
      email: "david.lee@example.com",
      department: "Operations",
      isActive: true,
    },
    {
      name: "Alex Taylor",
      email: "alex.taylor@example.com",
      department: "Finance",
      isActive: false,
    },
  ];

  for (const req of requesters) {
    await prisma.developmentRequester.upsert({
      where: { email: req.email },
      update: {
        name: req.name,
        department: req.department,
        isActive: req.isActive,
      },
      create: req,
    });
  }

  const categoryCount = await prisma.category.count();
  const systemCount = await prisma.relatedSystem.count();
  const requesterCount = await prisma.developmentRequester.count();
  const activeRequesterCount = await prisma.developmentRequester.count({
    where: { isActive: true },
  });

  console.log(`Database seeded successfully (Idempotent):`);
  console.log(`- Categories: ${categoryCount}`);
  console.log(`- Related Systems: ${systemCount}`);
  console.log(`- Development Requesters: ${requesterCount} (${activeRequesterCount} active)`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
