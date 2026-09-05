import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

describe("GET /api/requesters", () => {
  it("returns all active development requesters in id order, excluding inactive ones", async () => {
    const res = await request(app).get("/api/requesters");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(4);

    const names = res.body.map((r: { name: string }) => r.name);
    expect(names).toEqual([
      "Jennifer Anderson",
      "Michael Brown",
      "Sarah Johnson",
      "David Lee",
    ]);

    // Verify inactive requester "Alex Taylor" is not present
    expect(names).not.toContain("Alex Taylor");

    // Verify object structure
    res.body.forEach((r: { id: number; name: string; email: string; department: string; isActive: boolean }) => {
      expect(typeof r.id).toBe("number");
      expect(typeof r.name).toBe("string");
      expect(typeof r.email).toBe("string");
      expect(r.isActive).toBe(true);
    });
  });

  it("returns 500 with safe error message when database query fails", async () => {
    const prisma = prismaModule.getPrisma();
    const findManySpy = vi
      .spyOn(prisma.developmentRequester, "findMany")
      .mockRejectedValueOnce(new Error("Database connection failed"));

    const res = await request(app).get("/api/requesters");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch active development requesters" });

    findManySpy.mockRestore();
  });
});
