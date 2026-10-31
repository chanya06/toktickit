import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";

describe("Dashboard Performance & Latency Benchmark (PERF-01 / FR-07..09)", () => {
  const prisma = getPrisma();

  let requesterToken: string;
  let staffToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const requester = await prisma.user.findFirstOrThrow({
      where: { email: "jennifer.anderson@example.com" },
    });
    const staff = await prisma.user.findFirstOrThrow({
      where: { email: "kevin.patel@toktickit.com" },
    });
    const admin = await prisma.user.findFirstOrThrow({
      where: { email: "admin@toktickit.com" },
    });

    await prisma.user.update({
      where: { id: requester.id },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: staff.id },
      data: { mustChangePassword: false, isActive: true },
    });
    await prisma.user.update({
      where: { id: admin.id },
      data: { mustChangePassword: false, isActive: true },
    });

    requesterToken = jwt.sign(
      { userId: requester.id, email: requester.email, role: requester.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    staffToken = jwt.sign(
      { userId: staff.id, email: staff.email, role: staff.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    adminToken = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  it("PERF-01a: responds within sub-100ms on GET /api/dashboard/requester", async () => {
    // Warm-up query
    await request(app)
      .get("/api/dashboard/requester")
      .set("Authorization", `Bearer ${requesterToken}`);

    // Benchmark
    const start = performance.now();
    const res = await request(app)
      .get("/api/dashboard/requester")
      .set("Authorization", `Bearer ${requesterToken}`);
    const duration = performance.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(100);
  });

  it("PERF-01b: responds within sub-100ms on GET /api/dashboard/staff", async () => {
    // Warm-up query
    await request(app)
      .get("/api/dashboard/staff")
      .set("Authorization", `Bearer ${staffToken}`);

    // Benchmark
    const start = performance.now();
    const res = await request(app)
      .get("/api/dashboard/staff")
      .set("Authorization", `Bearer ${staffToken}`);
    const duration = performance.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(100);
  });

  it("PERF-01c: responds within sub-100ms on GET /api/dashboard/admin", async () => {
    // Warm-up query
    await request(app)
      .get("/api/dashboard/admin")
      .set("Authorization", `Bearer ${adminToken}`);

    // Benchmark
    const start = performance.now();
    const res = await request(app)
      .get("/api/dashboard/admin")
      .set("Authorization", `Bearer ${adminToken}`);
    const duration = performance.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(100);
  });

  it("PERF-01d: handles concurrent dashboard requests without degradation", async () => {
    const start = performance.now();
    const results = await Promise.all([
      request(app).get("/api/dashboard/requester").set("Authorization", `Bearer ${requesterToken}`),
      request(app).get("/api/dashboard/staff").set("Authorization", `Bearer ${staffToken}`),
      request(app).get("/api/dashboard/admin").set("Authorization", `Bearer ${adminToken}`),
      request(app).get("/api/dashboard/requester").set("Authorization", `Bearer ${requesterToken}`),
      request(app).get("/api/dashboard/staff").set("Authorization", `Bearer ${staffToken}`),
    ]);
    const duration = performance.now() - start;

    results.forEach((r) => expect(r.status).toBe(200));
    // 5 concurrent queries should finish in reasonable time
    expect(duration).toBeLessThan(350);
  });
});
