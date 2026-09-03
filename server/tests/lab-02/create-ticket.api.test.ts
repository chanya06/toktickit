import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("POST /api/tickets (Issue 8)", () => {
  it("API-01: creates a valid ticket with format TKT-YYYY-XXXXXX, status NEW, and default itPriority MEDIUM", async () => {
    const ticketPayload = {
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      requestedPriority: "MEDIUM",
      summary: "Laptop battery drains quickly",
      description: "My laptop battery is draining much faster than usual even when the system is idle.",
    };

    const res = await request(app).post("/api/tickets").send(ticketPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(res.body.requesterId).toBe(1);
    expect(res.body.status).toBe("NEW");
    expect(res.body.itPriority).toBe("MEDIUM");
    expect(res.body.summary).toBe("Laptop battery drains quickly");
    expect(res.body).toHaveProperty("createdAt");
    expect(res.body.requester).toBeDefined();
    expect(res.body.category).toBeDefined();
    expect(res.body.relatedSystem).toBeDefined();
  });

  it("API-02: returns 400 Bad Request when summary or required fields are missing", async () => {
    const invalidPayload = {
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      requestedPriority: "HIGH",
      // summary is omitted
      description: "Describing problem without summary header.",
    };

    const res = await request(app).post("/api/tickets").send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Missing required ticket fields");
  });

  it("returns 400 Bad Request when requestedPriority is invalid enum", async () => {
    const invalidPayload = {
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      requestedPriority: "SUPER_URGENT", // Invalid enum
      summary: "Valid summary text",
      description: "Valid description text for support ticket.",
    };

    const res = await request(app).post("/api/tickets").send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid requestedPriority value");
  });

  it("returns 422 Unprocessable Entity when summary is shorter than 5 characters", async () => {
    const invalidPayload = {
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      requestedPriority: "LOW",
      summary: "Bad", // < 5 chars
      description: "Valid description text for support ticket.",
    };

    const res = await request(app).post("/api/tickets").send(invalidPayload);

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error", "Ticket Summary must be between 5 and 120 characters");
  });

  it("returns 422 Unprocessable Entity when description is shorter than 10 characters", async () => {
    const invalidPayload = {
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      requestedPriority: "LOW",
      summary: "Valid summary text",
      description: "Short", // < 10 chars
    };

    const res = await request(app).post("/api/tickets").send(invalidPayload);

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error", "Ticket Description must be between 10 and 2000 characters");
  });

  it("returns 422 Unprocessable Entity when requesterId refers to an inactive or non-existent requester", async () => {
    const invalidPayload = {
      requesterId: 9999, // Non-existent ID
      categoryId: 2,
      relatedSystemId: 7,
      requestedPriority: "MEDIUM",
      summary: "Valid summary text",
      description: "Valid description text for support ticket.",
    };

    const res = await request(app).post("/api/tickets").send(invalidPayload);

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error", "Active Development Requester not found");
  });
});
