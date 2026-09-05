import { describe, it, expect } from "vitest";
import request from "supertest";
import fs from "fs";
import path from "path";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

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

  it("returns 400 Bad Request when requesterId, categoryId, or relatedSystemId have invalid non-integer formats", async () => {
    const invalidPayloads = [
      {
        requesterId: "abc", // Non-numeric string
        categoryId: 2,
        relatedSystemId: 7,
        requestedPriority: "MEDIUM",
        summary: "Valid summary text",
        description: "Valid description text for support ticket.",
      },
      {
        requesterId: 1,
        categoryId: -5, // Negative integer
        relatedSystemId: 7,
        requestedPriority: "MEDIUM",
        summary: "Valid summary text",
        description: "Valid description text for support ticket.",
      },
      {
        requesterId: 1,
        categoryId: 2,
        relatedSystemId: 3.14, // Floating point number
        requestedPriority: "MEDIUM",
        summary: "Valid summary text",
        description: "Valid description text for support ticket.",
      },
    ];

    for (const payload of invalidPayloads) {
      const res = await request(app).post("/api/tickets").send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "requesterId, categoryId, and relatedSystemId must be valid positive integers");
    }
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

  it("handles concurrent ticket creation requests safely generating unique ticket numbers", async () => {
    const payload = {
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      requestedPriority: "HIGH",
      summary: "Concurrent ticket test issue",
      description: "Testing concurrent submission of tickets to verify unique ticket numbers.",
    };

    const responses = await Promise.all([
      request(app).post("/api/tickets").send(payload),
      request(app).post("/api/tickets").send(payload),
    ]);

    expect(responses[0].status).toBe(201);
    expect(responses[1].status).toBe(201);

    const num1 = responses[0].body.ticketNumber;
    const num2 = responses[1].body.ticketNumber;

    expect(num1).not.toEqual(num2);
    expect(num1).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(num2).toMatch(/^TKT-\d{4}-\d{6}$/);
  });

  it("creates a ticket with initial attachments and saves attachments atomically (FR-07, BR-15)", async () => {
    const pdfBuffer = Buffer.from("%PDF-1.4 initial test file content");

    const res = await request(app)
      .post("/api/tickets")
      .field("requesterId", 1)
      .field("categoryId", 2)
      .field("relatedSystemId", 7)
      .field("requestedPriority", "HIGH")
      .field("summary", "Ticket with Initial Attachment")
      .field("description", "Testing initial attachment upload during ticket creation.")
      .attach("files", pdfBuffer, { filename: "initial-doc.pdf", contentType: "application/pdf" });

    expect(res.status).toBe(201);
    expect(res.body.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);

    // Verify attachment record was created
    const attachRes = await request(app).get(`/api/tickets/${res.body.id}/attachments?requesterId=1`);
    expect(attachRes.status).toBe(200);
    expect(attachRes.body.length).toBe(1);
    expect(attachRes.body[0].originalName).toBe("initial-doc.pdf");
  });

  it("cleans up temporary files from disk and rolls back DB transaction when creation fails due to validation error (BR-15 Compensation)", async () => {
    const prisma = getPrisma();
    const testSummary = `Invalid Attachment Ticket - ${Date.now()}`;
    const testFilename = `fake-${Date.now()}.pdf`;

    const uploadsDir = path.resolve("uploads");
    const filesBefore = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];

    const fakeBuffer = Buffer.from("NOT_A_REAL_PDF_HEADER");

    const res = await request(app)
      .post("/api/tickets")
      .field("requesterId", 1)
      .field("categoryId", 2)
      .field("relatedSystemId", 7)
      .field("requestedPriority", "HIGH")
      .field("summary", testSummary)
      .field("description", "Testing file cleanup on validation failure.")
      .attach("files", fakeBuffer, { filename: testFilename, contentType: "application/pdf" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Binary content signature does not match extension");

    // 1. Verify no ticket record created in database for this summary
    const createdTicket = await prisma.ticket.findFirst({
      where: { summary: testSummary },
    });
    expect(createdTicket).toBeNull();

    // 2. Verify no attachment record created in database for this original file name
    const createdAttachment = await prisma.attachment.findFirst({
      where: { originalName: testFilename },
    });
    expect(createdAttachment).toBeNull();

    // 3. Verify no leaked temporary files left on disk in uploads directory
    const filesAfter = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    expect(filesAfter.length).toBe(filesBefore.length);
  });
});
