import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

describe("GET /api/categories", () => {
  it("returns the four seeded categories in id order", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(4);
    const categoryNames = res.body.map((c: { name: string }) => c.name);
    expect(categoryNames).toEqual([
      "Account and Access",
      "Hardware",
      "Software",
      "Network",
    ]);
  });

  it("returns 500 with safe error message when database query fails", async () => {
    const prisma = prismaModule.getPrisma();
    const findManySpy = vi
      .spyOn(prisma.category, "findMany")
      .mockRejectedValueOnce(new Error("Database connection failed"));

    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch categories" });

    findManySpy.mockRestore();
  });
});
