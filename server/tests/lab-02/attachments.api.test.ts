import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import path from "path";
import fs from "fs";
import { app } from "../../src/app.js";

describe("Attachment Lifecycle API Endpoints (Issue 13)", () => {
  let createdTicketId: number;
  let activeAttachmentId: number;

  beforeAll(async () => {
    // Create a ticket owned by Requester 1
    const res = await request(app).post("/api/tickets").send({
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: "HIGH",
      summary: "Attachment Lifecycle Test Ticket Summary",
      description: "Testing attachment list, upload, download stream, and soft removal lifecycle.",
    });

    expect(res.status).toBe(201);
    createdTicketId = res.body.id;
  });

  describe("GET /api/tickets/:id/attachments", () => {
    it("returns 400 Bad Request when requesterId query parameter is missing", async () => {
      const res = await request(app).get(`/api/tickets/${createdTicketId}/attachments`);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "requesterId query parameter is required");
    });

    it("returns 404 Not Found when requesting attachments for non-existent ticket", async () => {
      const res = await request(app).get("/api/tickets/999999/attachments?requesterId=1");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Ticket not found");
    });

    it("returns 403 Forbidden when a non-owner requester attempts cross-requester access", async () => {
      const res = await request(app).get(`/api/tickets/${createdTicketId}/attachments?requesterId=2`);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "Forbidden: You do not have access to this ticket's attachments");
    });

    it("returns 200 OK with empty array initially for ticket owner", async () => {
      const res = await request(app).get(`/api/tickets/${createdTicketId}/attachments?requesterId=1`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe("POST /api/tickets/:id/attachments", () => {
    it("returns 403 Forbidden when non-owner attempts to upload attachment", async () => {
      const res = await request(app)
        .post(`/api/tickets/${createdTicketId}/attachments`)
        .field("requesterId", 2)
        .attach("file", Buffer.from("dummy pdf content"), "test.pdf");

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "Forbidden: You do not have access to upload attachments to this ticket");
    });

    it("returns 400 Bad Request when file has unsupported extension (e.g. .exe)", async () => {
      const res = await request(app)
        .post(`/api/tickets/${createdTicketId}/attachments`)
        .field("requesterId", 1)
        .attach("file", Buffer.from("executable payload"), "malicious.exe");

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("File type not supported");
    });

    it("returns 413 Payload Too Large when file size exceeds 5MB", async () => {
      // 5.5MB dummy buffer
      const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024);
      const res = await request(app)
        .post(`/api/tickets/${createdTicketId}/attachments`)
        .field("requesterId", 1)
        .attach("file", largeBuffer, "too_large.pdf");

      expect(res.status === 413 || res.status === 400).toBe(true);
      expect(res.body.error).toContain("exceeds");
    });

    it("returns 201 Created and uploads valid .pdf file successfully", async () => {
      const pdfBuffer = Buffer.from("%PDF-1.4 Dummy PDF Content for Testing");
      const res = await request(app)
        .post(`/api/tickets/${createdTicketId}/attachments`)
        .field("requesterId", 1)
        .attach("file", pdfBuffer, "sample_document.pdf");

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.originalName).toBe("sample_document.pdf");
      expect(res.body.isRemoved).toBe(false);

      activeAttachmentId = res.body.id;
    });

    it("enforces max active attachments limit (5) returning 422 Unprocessable Entity on 6th file", async () => {
      const pdfBuffer = Buffer.from("%PDF-1.4 Content");

      // Upload 4 more files to reach limit of 5 active attachments
      for (let i = 2; i <= 5; i++) {
        const res = await request(app)
          .post(`/api/tickets/${createdTicketId}/attachments`)
          .field("requesterId", 1)
          .attach("file", pdfBuffer, `document_${i}.png`);
        expect(res.status).toBe(201);
      }

      // Attempt 6th active upload
      const resExceed = await request(app)
        .post(`/api/tickets/${createdTicketId}/attachments`)
        .field("requesterId", 1)
        .attach("file", pdfBuffer, "document_6.png");

      expect(resExceed.status).toBe(422);
      expect(resExceed.body).toHaveProperty("error", "Maximum active attachments limit (5) reached");
    });
  });

  describe("GET /api/attachments/:id/download", () => {
    it("returns 403 Forbidden when a non-owner attempts to download attachment", async () => {
      const res = await request(app).get(`/api/attachments/${activeAttachmentId}/download?requesterId=2`);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "Forbidden: You do not have access to download this attachment");
    });

    it("returns 200 OK with binary stream for active attachment owner", async () => {
      const res = await request(app).get(`/api/attachments/${activeAttachmentId}/download?requesterId=1`);
      expect(res.status).toBe(200);
      expect(res.headers["content-disposition"]).toContain("sample_document.pdf");
    });
  });

  describe("DELETE /api/attachments/:id/soft-remove", () => {
    it("returns 400 Bad Request when removal reason is missing or less than 3 characters", async () => {
      const res = await request(app)
        .delete(`/api/attachments/${activeAttachmentId}/soft-remove`)
        .send({ requesterId: 1, removalReason: "a" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Soft-removal reason must be between 3 and 250 characters");
    });

    it("returns 403 Forbidden when a non-owner attempts to soft-remove attachment", async () => {
      const res = await request(app)
        .delete(`/api/attachments/${activeAttachmentId}/soft-remove`)
        .send({ requesterId: 2, removalReason: "Uploaded wrong file" });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "Forbidden: You do not have access to remove this attachment");
    });

    it("returns 200 OK and soft-removes attachment with valid reason", async () => {
      const res = await request(app)
        .delete(`/api/attachments/${activeAttachmentId}/soft-remove`)
        .send({ requesterId: 1, removalReason: "Uploaded wrong file version for test" });

      expect(res.status).toBe(200);
      expect(res.body.isRemoved).toBe(true);
      expect(res.body.removalReason).toBe("Uploaded wrong file version for test");
      expect(res.body).toHaveProperty("removedAt");
    });

    it("returns 409 Conflict when attempting to soft-remove an already soft-removed attachment", async () => {
      const res = await request(app)
        .delete(`/api/attachments/${activeAttachmentId}/soft-remove`)
        .send({ requesterId: 1, removalReason: "Attempt duplicate soft remove" });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("error", "Attachment is already soft-removed");
    });

    it("returns 403 Forbidden when attempting to download soft-removed attachment", async () => {
      const res = await request(app).get(`/api/attachments/${activeAttachmentId}/download?requesterId=1`);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "Attachment has been soft-removed and cannot be downloaded");
    });
  });
});
