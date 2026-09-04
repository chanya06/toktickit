import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("GET /api/tickets (Issue 10)", () => {
  it("returns 400 Bad Request when requesterId query parameter is missing", async () => {
    const res = await request(app).get("/api/tickets");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "requesterId parameter is required");
  });

  it("returns 400 Bad Request when requesterId query parameter is non-numeric or non-positive integer", async () => {
    const invalidIds = ["abc", "-5", "3.14", "0"];

    for (const id of invalidIds) {
      const res = await request(app).get(`/api/tickets?requesterId=${id}`);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "requesterId must be a valid positive integer");
    }
  });

  it("API-03: returns 200 OK with tickets owned strictly by the specified requester and valid pagination structure", async () => {
    // Create a ticket for Requester 1
    await request(app).post("/api/tickets").send({
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: "MEDIUM",
      summary: "My Tickets Isolation Test Summary",
      description: "Testing strict requester data isolation for my tickets endpoint.",
    });

    const res = await request(app).get("/api/tickets?requesterId=1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
    expect(Array.isArray(res.body.data)).toBe(true);

    // Verify all returned tickets belong to Requester 1
    for (const ticket of res.body.data) {
      expect(ticket.requesterId).toBe(1);
      expect(ticket).toHaveProperty("id");
      expect(ticket).toHaveProperty("ticketNumber");
      expect(ticket).toHaveProperty("summary");
      expect(ticket).toHaveProperty("status");
      expect(ticket).toHaveProperty("category");
      expect(ticket).toHaveProperty("relatedSystem");
      expect(ticket).toHaveProperty("attachmentCount");
    }

    const { pagination } = res.body;
    expect(pagination).toHaveProperty("totalItems");
    expect(pagination).toHaveProperty("totalPages");
    expect(pagination).toHaveProperty("currentPage", 1);
    expect(pagination).toHaveProperty("pageSize", 10);
  });

  it("enforces strict requester data isolation (Requester 2 does not see Requester 1 tickets)", async () => {
    // Check tickets for Requester 2
    const res = await request(app).get("/api/tickets?requesterId=2");

    expect(res.status).toBe(200);
    for (const ticket of res.body.data) {
      expect(ticket.requesterId).toBe(2);
    }
  });

  it("API-04: filters tickets matching search query term across summary, description, and ticketNumber", async () => {
    // Create a unique ticket to search for
    const uniqueTerm = `SearchTerm_${Date.now()}`;
    const createRes = await request(app).post("/api/tickets").send({
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 1,
      requestedPriority: "HIGH",
      summary: `Unique issue with ${uniqueTerm} prefix`,
      description: `Detailed description for issue with term ${uniqueTerm}`,
    });

    expect(createRes.status).toBe(201);
    const createdTicketNumber = createRes.body.ticketNumber;

    // Search by text term
    const searchRes = await request(app).get(`/api/tickets?requesterId=1&search=${uniqueTerm}`);
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.body.data[0].summary).toContain(uniqueTerm);

    // Search by exact ticket number
    const ticketNumberRes = await request(app).get(`/api/tickets?requesterId=1&search=${createdTicketNumber}`);
    expect(ticketNumberRes.status).toBe(200);
    expect(ticketNumberRes.body.data.length).toBe(1);
    expect(ticketNumberRes.body.data[0].ticketNumber).toBe(createdTicketNumber);
  });

  it("filters tickets by categoryId, requestedPriority, and status", async () => {
    const res = await request(app).get("/api/tickets?requesterId=1&categoryId=2&requestedPriority=HIGH&status=NEW");

    expect(res.status).toBe(200);
    for (const ticket of res.body.data) {
      expect(ticket.requesterId).toBe(1);
      expect(ticket.categoryId).toBe(2);
      expect(ticket.requestedPriority).toBe("HIGH");
      expect(ticket.status).toBe("NEW");
    }
  });

  it("handles pagination parameters correctly (page and pageSize / limit)", async () => {
    const res = await request(app).get("/api/tickets?requesterId=1&page=1&pageSize=2");

    expect(res.status).toBe(200);
    expect(res.body.pagination.currentPage).toBe(1);
    expect(res.body.pagination.pageSize).toBe(2);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });

  it("sorts tickets by allowed sort fields and sort order", async () => {
    const resAsc = await request(app).get("/api/tickets?requesterId=1&sortBy=createdAt&sortOrder=asc");
    expect(resAsc.status).toBe(200);

    if (resAsc.body.data.length >= 2) {
      const firstDate = new Date(resAsc.body.data[0].createdAt).getTime();
      const secondDate = new Date(resAsc.body.data[1].createdAt).getTime();
      expect(firstDate).toBeLessThanOrEqual(secondDate);
    }
  });
});
