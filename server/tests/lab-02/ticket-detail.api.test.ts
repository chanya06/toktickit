import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("GET /api/tickets/:id (Issue 12)", () => {
  let createdTicketId: number;

  beforeAll(async () => {
    // Create a ticket owned strictly by Requester 1
    const res = await request(app).post("/api/tickets").send({
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: "HIGH",
      summary: "Ticket Detail Access Guard Summary",
      description: "Testing ticket detail endpoint with requester ownership authorization guard.",
    });

    expect(res.status).toBe(201);
    createdTicketId = res.body.id;
  });

  it("returns 400 Bad Request when ticket id or requesterId query param is missing or invalid format", async () => {
    // Invalid ticket ID format
    const resInvalidId = await request(app).get("/api/tickets/abc?requesterId=1");
    expect(resInvalidId.status).toBe(400);
    expect(resInvalidId.body).toHaveProperty("error", "Ticket id must be a valid positive integer");

    // Missing requesterId query param
    const resMissingRequester = await request(app).get(`/api/tickets/${createdTicketId}`);
    expect(resMissingRequester.status).toBe(400);
    expect(resMissingRequester.body).toHaveProperty("error", "requesterId query parameter is required");

    // Non-numeric requesterId query param
    const resNonNumericRequester = await request(app).get(`/api/tickets/${createdTicketId}?requesterId=invalid`);
    expect(resNonNumericRequester.status).toBe(400);
    expect(resNonNumericRequester.body).toHaveProperty("error", "requesterId must be a valid positive integer");
  });

  it("returns 400 Bad Request when requesterId query parameter and x-requester-id header conflict", async () => {
    const res = await request(app)
      .get(`/api/tickets/${createdTicketId}?requesterId=1`)
      .set("x-requester-id", "2");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Conflicting requester identity between query parameter and header");
  });

  it("returns 404 Not Found when accessing a non-existent ticket ID", async () => {
    const res = await request(app).get("/api/tickets/999999?requesterId=1");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Ticket not found");
  });

  it("API-05 / AC-04: returns 403 Forbidden when a non-owner requester attempts cross-requester access", async () => {
    // Requester 2 attempting to view ticket owned by Requester 1
    const res = await request(app).get(`/api/tickets/${createdTicketId}?requesterId=2`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", "Forbidden: You do not have access to this ticket");
  });

  it("API-05 / AC-04: returns 200 OK with full ticket detail payload when ticket owner accesses their own ticket", async () => {
    // Requester 1 accessing their owned ticket
    const res = await request(app).get(`/api/tickets/${createdTicketId}?requesterId=1`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdTicketId);
    expect(res.body).toHaveProperty("ticketNumber");
    expect(res.body.requesterId).toBe(1);
    expect(res.body.summary).toBe("Ticket Detail Access Guard Summary");
    expect(res.body).toHaveProperty("category");
    expect(res.body).toHaveProperty("relatedSystem");
    expect(res.body).toHaveProperty("requester");
    expect(res.body.requester.id).toBe(1);
  });
});
