# Lab 2 REST API Specification

This document details the HTTP REST API endpoints, request/response formats, query parameters, validation rules, HTTP status codes, and security/ownership enforcement for **TokTickIT Lab 2**.

---

## Base URL
`/api`

---

## 1. Requester & Reference Endpoints

### 1.1 List Active Development Requesters
- **HTTP Method**: `GET`
- **Path**: `/api/requesters`
- **Description**: Returns all active Development Requesters (`isActive: true`). Inactive Requesters are excluded.
- **Headers**: None
- **Response `200 OK`**:
```json
[
  {
    "id": 1,
    "name": "Jennifer Anderson",
    "email": "jennifer.anderson@example.com",
    "department": "Engineering",
    "isActive": true
  },
  {
    "id": 2,
    "name": "Michael Brown",
    "email": "michael.brown@example.com",
    "department": "IT Support",
    "isActive": true
  }
]
```

### 1.2 List Active Categories
- **HTTP Method**: `GET`
- **Path**: `/api/categories`
- **Description**: Returns all active ticket categories.
- **Response `200 OK`**:
```json
[
  { "id": 1, "name": "Account and Access" },
  { "id": 2, "name": "Hardware" },
  { "id": 3, "name": "Software" },
  { "id": 4, "name": "Network" }
]
```

### 1.3 List Active Related Systems
- **HTTP Method**: `GET`
- **Path**: `/api/related-systems`
- **Description**: Returns all active affected systems/platforms.
- **Response `200 OK`**:
```json
[
  { "id": 1, "name": "Email" },
  { "id": 2, "name": "Campus Wi-Fi" },
  { "id": 3, "name": "VPN" },
  { "id": 4, "name": "LEB2 App" },
  { "id": 5, "name": "Grade Submission App" },
  { "id": 6, "name": "Printer" },
  { "id": 7, "name": "Corporate Laptop" }
]
```

---

## 2. Ticket Endpoints

### 2.1 Create Ticket
- **HTTP Method**: `POST`
- **Path**: `/api/tickets`
- **Description**: Creates a new ticket for the specified Requester. Generates unique Ticket Number (`TKT-YYYY-XXXXXX`), sets initial status `NEW` and default IT priority `MEDIUM`.
- **Request Body**:
```json
{
  "requesterId": 1,
  "categoryId": 2,
  "relatedSystemId": 7,
  "requestedPriority": "MEDIUM",
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual even when idling."
}
```
- **Validation Rules**:
  - `requesterId`: Required Integer (must match active DevelopmentRequester).
  - `categoryId`: Required Integer.
  - `relatedSystemId`: Required Integer.
  - `requestedPriority`: Required Enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - `summary`: Required String, min 5 chars, max 120 chars.
  - `description`: Required String, min 10 chars, max 2000 chars.
- **Response `201 Created`**:
```json
{
  "id": 12,
  "ticketNumber": "TKT-2026-000012",
  "requesterId": 1,
  "categoryId": 2,
  "relatedSystemId": 7,
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual even when idling.",
  "requestedPriority": "MEDIUM",
  "itPriority": "MEDIUM",
  "status": "NEW",
  "ticketOwner": null,
  "createdAt": "2026-09-01T09:15:00.000Z",
  "updatedAt": "2026-09-01T09:15:00.000Z",
  "requester": { "id": 1, "name": "Jennifer Anderson" },
  "category": { "id": 2, "name": "Hardware" },
  "relatedSystem": { "id": 7, "name": "Corporate Laptop" }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing fields or invalid enum values.
  - `422 Unprocessable Entity`: Validation failure on length or inactive requester/category.

---

### 2.2 List Owned Tickets (My Tickets)
- **HTTP Method**: `GET`
- **Path**: `/api/tickets`
- **Description**: Returns paginated tickets owned strictly by the specified Requester.
- **Query Parameters**:
  - `requesterId` (REQUIRED): Integer - ID of selected requester.
  - `search` (Optional): String - Term to search in `ticketNumber` and `summary`.
  - `categoryId` (Optional): Integer - Filter by Category.
  - `requestedPriority` (Optional): String - Filter by Requested Priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - `status` (Optional): String - Filter by Status (`NEW`, `OPEN`, `IN_PROGRESS`, `PENDING`, `RESOLVED`, `CLOSED`).
  - `sortBy` (Optional): String - Field to sort by (`createdAt`, `ticketNumber`, `summary`, `status`). Default: `createdAt`.
  - `sortOrder` (Optional): String - `asc` or `desc`. Default: `desc`.
  - `page` (Optional): Integer - Page number (1-indexed). Default: `1`.
  - `pageSize` (Optional): Integer - Number of items per page. Default: `10`.
- **Response `200 OK`**:
```json
{
  "data": [
    {
      "id": 12,
      "ticketNumber": "TKT-2026-000012",
      "summary": "Laptop battery drains quickly",
      "requestedPriority": "MEDIUM",
      "itPriority": "MEDIUM",
      "status": "NEW",
      "createdAt": "2026-09-01T09:15:00.000Z",
      "updatedAt": "2026-09-01T09:15:00.000Z",
      "category": { "id": 2, "name": "Hardware" },
      "relatedSystem": { "id": 7, "name": "Corporate Laptop" },
      "attachmentCount": 1
    }
  ],
  "pagination": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing `requesterId` query parameter.

---

### 2.3 Get Owned Ticket Detail
- **HTTP Method**: `GET`
- **Path**: `/api/tickets/:id`
- **Description**: Returns single ticket details. Requires `requesterId` in query param or header to enforce data isolation.
- **Headers / Query**: `requesterId` parameter mandatory.
- **Response `200 OK`**:
```json
{
  "id": 12,
  "ticketNumber": "TKT-2026-000012",
  "requesterId": 1,
  "categoryId": 2,
  "relatedSystemId": 7,
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual even when idling.",
  "requestedPriority": "MEDIUM",
  "itPriority": "MEDIUM",
  "status": "NEW",
  "ticketOwner": null,
  "createdAt": "2026-09-01T09:15:00.000Z",
  "updatedAt": "2026-09-01T09:15:00.000Z",
  "requester": { "id": 1, "name": "Jennifer Anderson", "email": "jennifer.anderson@example.com" },
  "category": { "id": 2, "name": "Hardware" },
  "relatedSystem": { "id": 7, "name": "Corporate Laptop" }
}
```
- **Error Responses**:
  - `403 Forbidden` / `404 Not Found`: Attempting to access a ticket belonging to another requester or non-existent ID.

---

## 3. Attachment Endpoints

### 3.1 List Ticket Attachment Metadata
- **HTTP Method**: `GET`
- **Path**: `/api/tickets/:id/attachments`
- **Description**: Retrieves metadata list of all active and soft-removed attachments for an owned ticket.
- **Headers / Query**: `requesterId` parameter mandatory for ownership check.
- **Response `200 OK`**:
```json
[
  {
    "id": 5,
    "ticketId": 12,
    "originalName": "battery_report.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 1048576,
    "isRemoved": false,
    "removalReason": null,
    "removedAt": null,
    "createdAt": "2026-09-01T09:16:00.000Z"
  },
  {
    "id": 4,
    "ticketId": 12,
    "originalName": "old_screenshot.png",
    "mimeType": "image/png",
    "sizeBytes": 512000,
    "isRemoved": true,
    "removalReason": "Uploaded incorrect file version",
    "removedAt": "2026-09-01T09:20:00.000Z",
    "createdAt": "2026-09-01T09:15:30.000Z"
  }
]
```

---

### 3.2 Upload Attachment
- **HTTP Method**: `POST`
- **Path**: `/api/tickets/:id/attachments`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: Binary file payload.
  - `requesterId`: Integer (ownership verification).
- **Validation Rules**:
  - File extension must be `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`.
  - Max file size: 5 MB (5,242,880 bytes).
  - Ticket active attachment count must be < 5.
- **Response `201 Created`**:
```json
{
  "id": 6,
  "ticketId": 12,
  "originalName": "screenshot.png",
  "mimeType": "image/png",
  "sizeBytes": 450000,
  "isRemoved": false,
  "createdAt": "2026-09-01T09:25:00.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: File missing or invalid extension.
  - `413 Payload Too Large`: Size > 5MB.
  - `422 Unprocessable Entity`: Maximum active attachments limit (5) reached.
  - `403 Forbidden`: Ticket owned by another requester.

---

### 3.3 Download Active Attachment
- **HTTP Method**: `GET`
- **Path**: `/api/attachments/:id/download`
- **Query / Headers**: `requesterId` mandatory for ownership check.
- **Description**: Streams the raw binary payload of an active file attachment.
- **Response `200 OK`**: File stream with `Content-Type` and `Content-Disposition: attachment; filename="..."`.
- **Error Responses**:
  - `403 Forbidden`: Attachment is soft-removed (`isRemoved: true`) or ticket owned by another requester.
  - `404 Not Found`: Non-existent attachment ID.

---

### 3.4 Soft-Remove Attachment
- **HTTP Method**: `DELETE` or `PATCH`
- **Path**: `/api/attachments/:id/soft-remove`
- **Request Body**:
```json
{
  "requesterId": 1,
  "removalReason": "Uploaded wrong file version"
}
```
- **Validation Rules**:
  - `requesterId`: Required Integer (must match ticket owner).
  - `removalReason`: Required String, min 3 chars, max 250 chars.
- **Response `200 OK`**:
```json
{
  "id": 4,
  "ticketId": 12,
  "originalName": "old_screenshot.png",
  "isRemoved": true,
  "removalReason": "Uploaded wrong file version",
  "removedAt": "2026-09-01T09:30:00.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing or invalid removal reason.
  - `403 Forbidden`: Attempting to remove attachment owned by another requester.
  - `409 Conflict`: Attachment is already soft-removed.
