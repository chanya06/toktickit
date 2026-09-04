import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("GET /api/tickets (Issue 10)", () => {
  beforeAll(async () => {
    // Seed initial test tickets for Requester 1 and Requester 2 to guarantee non-empty test datasets
    await request(app).post("/api/tickets").send({
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: "LOW",
      summary: "First seeded ticket for Requester 1",
      description: "Detailed description for first ticket.",
    });

    await request(app).post("/api/tickets").send({
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 2,
      requestedPriority: "HIGH",
      summary: "Second seeded ticket for Requester 1",
      description: "Detailed description for second ticket.",
    });

    await request(app).post("/api/tickets").send({
      requesterId: 1,
      categoryId: 3,
      relatedSystemId: 3,
      requestedPriority: "URGENT",
      summary: "Third seeded ticket for Requester 1",
      description: "Detailed description for third ticket.",
    });

    await request(app).post("/api/tickets").send({
      requesterId: 2,
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: "MEDIUM",
      summary: "First seeded ticket for Requester 2",
      description: "Requester 2 ticket description.",
    });
  });

  it("returns 400 Bad Request when requesterId query parameter is missing", async () => {
    const res = await request(app).get("/api/tickets");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "requesterId parameter is required");
  });

  it("returns 400 Bad Request when requesterId is non-numeric or non-positive integer", async () => {
    const invalidIds = ["abc", "-5", "3.14", "0"];

    for (const id of invalidIds) {
      const res = await request(app).get(`/api/tickets?requesterId=${id}`);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "requesterId must be a valid positive integer");
    }
  });

  it("returns 400 Bad Request when invalid pagination, sorting, or filter parameters are passed", async () => {
    const invalidCases = [
      { query: "requesterId=1&page=1abc", expectedError: "page must be a valid positive integer" },
      { query: "requesterId=1&page=-1", expectedError: "page must be a valid positive integer" },
      { query: "requesterId=1&pageSize=0", expectedError: "pageSize must be a valid positive integer" },
      { query: "requesterId=1&categoryId=-2", expectedError: "categoryId must be valid positive integer(s)" },
      { query: "requesterId=1&relatedSystemId=abc", expectedError: "relatedSystemId must be valid positive integer(s)" },
      { query: "requesterId=1&status=UNKNOWN_STATUS", expectedError: "Invalid status filter value" },
      { query: "requesterId=1&requestedPriority=SUPER_HIGH", expectedError: "Invalid priority filter value" },
      { query: "requesterId=1&sortBy=invalid_field", expectedError: "Invalid sortBy parameter" },
      { query: "requesterId=1&sortOrder=invalid_direction", expectedError: "Invalid sortOrder parameter" },
    ];

    for (const testCase of invalidCases) {
      const res = await request(app).get(`/api/tickets?${testCase.query}`);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", testCase.expectedError);
    }
  });

  it("API-03: returns 200 OK with non-empty tickets list owned strictly by Requester 1 and valid pagination metadata", async () => {
    const res = await request(app).get("/api/tickets?requesterId=1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
    expect(Array.isArray(res.body.data)).toBe(true);

    // Verify non-empty data
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);

    // Verify every item strictly belongs to Requester 1
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
    expect(pagination.totalItems).toBeGreaterThanOrEqual(3);
    expect(pagination.totalPages).toBeGreaterThanOrEqual(1);
    expect(pagination.currentPage).toBe(1);
    expect(pagination.pageSize).toBe(10);
  });

  it("enforces strict requester data isolation (Requester 2 does not see Requester 1 tickets and vice versa)", async () => {
    const resReq2 = await request(app).get("/api/tickets?requesterId=2");

    expect(resReq2.status).toBe(200);
    expect(resReq2.body.data.length).toBeGreaterThanOrEqual(1);

    for (const ticket of resReq2.body.data) {
      expect(ticket.requesterId).toBe(2);
    }
  });

  it("API-04: searches strictly across summary and ticketNumber ONLY (excluding description per contract)", async () => {
    const uniqueSummaryTerm = `UniqueSummary_${Date.now()}`;
    const uniqueDescriptionOnlyTerm = `UniqueDescOnly_${Date.now()}`;

    const createRes = await request(app).post("/api/tickets").send({
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: "HIGH",
      summary: `Ticket with ${uniqueSummaryTerm} in summary`,
      description: `Contains ${uniqueDescriptionOnlyTerm} inside description body`,
    });

    expect(createRes.status).toBe(201);
    const createdTicketNumber = createRes.body.ticketNumber;

    // 1. Search by summary term -> matches
    const summarySearch = await request(app).get(`/api/tickets?requesterId=1&search=${uniqueSummaryTerm}`);
    expect(summarySearch.status).toBe(200);
    expect(summarySearch.body.data.length).toBe(1);
    expect(summarySearch.body.data[0].ticketNumber).toBe(createdTicketNumber);

    // 2. Search by ticketNumber -> matches
    const numberSearch = await request(app).get(`/api/tickets?requesterId=1&search=${createdTicketNumber}`);
    expect(numberSearch.status).toBe(200);
    expect(numberSearch.body.data.length).toBe(1);
    expect(numberSearch.body.data[0].ticketNumber).toBe(createdTicketNumber);

    // 3. Search by description-only term -> must NOT match per spec
    const descSearch = await request(app).get(`/api/tickets?requesterId=1&search=${uniqueDescriptionOnlyTerm}`);
    expect(descSearch.status).toBe(200);
    expect(descSearch.body.data.length).toBe(0);
  });

  it("supports multi-select comma-separated and array filters for categoryId, requestedPriority, and status", async () => {
    // Test multi-category filter (categoryId=1,2)
    const multiCatRes = await request(app).get("/api/tickets?requesterId=1&categoryId=1,2");
    expect(multiCatRes.status).toBe(200);
    expect(multiCatRes.body.data.length).toBeGreaterThanOrEqual(2);
    for (const ticket of multiCatRes.body.data) {
      expect([1, 2]).toContain(ticket.categoryId);
    }

    // Test multi-priority filter (requestedPriority=HIGH,URGENT)
    const multiPriorityRes = await request(app).get("/api/tickets?requesterId=1&requestedPriority=HIGH,URGENT");
    expect(multiPriorityRes.status).toBe(200);
    expect(multiPriorityRes.body.data.length).toBeGreaterThanOrEqual(2);
    for (const ticket of multiPriorityRes.body.data) {
      expect(["HIGH", "URGENT"]).toContain(ticket.requestedPriority);
    }
  });

  it("handles pagination parameters correctly (page and pageSize / limit)", async () => {
    const resPage1 = await request(app).get("/api/tickets?requesterId=1&page=1&pageSize=2");

    expect(resPage1.status).toBe(200);
    expect(resPage1.body.pagination.currentPage).toBe(1);
    expect(resPage1.body.pagination.pageSize).toBe(2);
    expect(resPage1.body.data.length).toBe(2);
  });

  it("sorts tickets deterministically by primary sort field and secondary sort by id", async () => {
    const resAsc = await request(app).get("/api/tickets?requesterId=1&sortBy=createdAt&sortOrder=asc");
    expect(resAsc.status).toBe(200);
    expect(resAsc.body.data.length).toBeGreaterThanOrEqual(3);

    const dataAsc = resAsc.body.data;
    for (let i = 0; i < dataAsc.length - 1; i++) {
      const timeA = new Date(dataAsc[i].createdAt).getTime();
      const timeB = new Date(dataAsc[i + 1].createdAt).getTime();
      expect(timeA).toBeLessThanOrEqual(timeB);
      if (timeA === timeB) {
        expect(dataAsc[i].id).toBeLessThan(dataAsc[i + 1].id);
      }
    }

    const resDesc = await request(app).get("/api/tickets?requesterId=1&sortBy=createdAt&sortOrder=desc");
    expect(resDesc.status).toBe(200);
    expect(resDesc.body.data.length).toBeGreaterThanOrEqual(3);

    const dataDesc = resDesc.body.data;
    for (let i = 0; i < dataDesc.length - 1; i++) {
      const timeA = new Date(dataDesc[i].createdAt).getTime();
      const timeB = new Date(dataDesc[i + 1].createdAt).getTime();
      expect(timeA).toBeGreaterThanOrEqual(timeB);
      if (timeA === timeB) {
        expect(dataDesc[i].id).toBeGreaterThan(dataDesc[i + 1].id);
      }
    }
  });
});
