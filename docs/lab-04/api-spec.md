# Lab 4 REST API Specification: Actions Taken, Dashboards & Workflow

## 1. Authentication & Security Headers
All endpoints require a valid JWT Bearer token passed in the `Authorization` HTTP header:
```http
Authorization: Bearer <jwt-token>
```
Tokens encode user credentials: `id`, `email`, `role` (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`), and `mustChangePassword`. If `mustChangePassword === true`, access to operational endpoints is blocked with `403 Forbidden`.

---

## 2. Actions Taken Endpoints

### 2.1 List Actions Taken for Ticket
- **Endpoint**: `GET /api/tickets/:id/actions`
- **Authorized Roles**: `REQUESTER` (owned ticket only), `IT_STAFF`, `ADMINISTRATOR`
- **Response**: `200 OK`
```json
[
  {
    "id": "act-uuid-001",
    "ticketId": 101,
    "actionDateTime": "2026-10-29T10:30:00.000Z",
    "actionDescription": "Ran memory diagnostics and replaced faulty 8GB DDR4 RAM stick.",
    "result": "System successfully boots without memory parity errors.",
    "performedById": "u-staff-01",
    "performedBy": {
      "id": "u-staff-01",
      "fullName": "Somsak IT",
      "email": "somsak@toktickit.com",
      "role": "IT_STAFF"
    },
    "assigneeId": "u-staff-02",
    "assignee": {
      "id": "u-staff-02",
      "fullName": "Wichai IT",
      "email": "wichai@toktickit.com",
      "role": "IT_STAFF"
    },
    "status": "COMPLETED",
    "followUpRequired": true,
    "followUpNote": "Check stability after 24 hours of burn-in test.",
    "attachmentNotes": "memory_test_log.txt",
    "createdAt": "2026-10-29T10:35:00.000Z",
    "updatedAt": "2026-10-29T10:35:00.000Z"
  }
]
```
- **Error Responses**:
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: Requester attempting to access actions for a ticket they do not own.
  - `404 Not Found`: Ticket does not exist.

---

### 2.2 Create Action Taken
- **Endpoint**: `POST /api/tickets/:id/actions`
- **Authorized Roles**: `IT_STAFF`, `ADMINISTRATOR` (Requesters blocked with `403 Forbidden`)
- **Request Body**:
```json
{
  "actionDateTime": "2026-10-29T10:30:00.000Z",
  "actionDescription": "Replaced faulty network patch cable on switch port 14.",
  "result": "Link light active; 1Gbps full duplex negotiation established.",
  "assigneeId": "u-staff-02",
  "status": "COMPLETED",
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": "switch_port_status.png"
}
```
- **Validation Rules**:
  - `actionDescription`: Required, minimum 5 characters.
  - `performedById`: Automatically bound to authenticated user ID.
  - `assigneeId`: Optional. If provided, must reference an active `IT_STAFF` or `ADMINISTRATOR` user (`isActive: true`). Rejection with 422 if inactive or having role `REQUESTER`.
  - `followUpRequired`: Boolean. If `true`, `followUpNote` is mandatory (minimum 5 chars).
  - `status`: Must be one of `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` (default: `COMPLETED`).
- **Response**: `201 Created`
- **Error Responses**:
  - `400 Bad Request`: Validation failure (e.g. `followUpRequired: true` but `followUpNote` is empty).
  - `403 Forbidden`: Authenticated user is a Requester.
  - `404 Not Found`: Ticket not found.
  - `422 Unprocessable Entity`: Performer account is inactive, or `assigneeId` refers to an inactive account or non-staff user.

---

### 2.3 Update Action Taken
- **Endpoint**: `PUT /api/tickets/:id/actions/:actionId`
- **Authorized Roles**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**:
```json
{
  "actionDescription": "Replaced faulty network patch cable and re-crimped RJ45 termination.",
  "result": "Link active with 0% packet loss over 1000 packets.",
  "assigneeId": "u-staff-02",
  "status": "COMPLETED",
  "followUpRequired": true,
  "followUpNote": "Verify line stability during morning peak traffic tomorrow.",
  "attachmentNotes": "ping_test_summary.txt",
  "expectedUpdatedAt": "2026-10-29T10:35:00.000Z"
}
```
- **Concurrency & Conflict Handling**:
  - If `expectedUpdatedAt` is provided and does not match the database `updatedAt`, returns `409 Conflict` to prevent overwriting concurrent updates.
- **Validation**:
  - If `assigneeId` is provided, must be an active IT Staff or Administrator account (`isActive: true`). Rejection with 422 if inactive.
- **Response**: `200 OK`
- **Error Responses**:
  - `400 Bad Request`: Invalid payload.
  - `403 Forbidden`: Non-staff user.
  - `404 Not Found`: Ticket or Action Taken record not found.
  - `409 Conflict`: Stale update detected (`expectedUpdatedAt` mismatch).
  - `422 Unprocessable Entity`: Inactive assignee or illegal modification.

---

### 2.4 Transition Action Taken Status
- **Endpoint**: `PATCH /api/tickets/:id/actions/:actionId/status`
- **Authorized Roles**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**:
```json
{
  "status": "COMPLETED",
  "result": "Work verified and completed successfully."
}
```
- **Response**: `200 OK`
- **Error Responses**:
  - `422 Unprocessable Entity`: Illegal transition (e.g. attempting to change already `COMPLETED` action).

---

## 3. Dashboard Endpoints

### 3.1 Requester Dashboard
- **Endpoint**: `GET /api/dashboard/requester`
- **Authorized Roles**: `REQUESTER` (isolated to authenticated requester ID)
- **Response**: `200 OK`
```json
{
  "metrics": {
    "myOpenTickets": 3,
    "waitingForRequester": 1,
    "recentlyUpdated": 2,
    "recentlyResolved": 5
  },
  "recentTickets": [
    {
      "id": 105,
      "ticketNumber": "TKT-2026-000105",
      "summary": "Cannot access accounting network share",
      "category": "NETWORK",
      "status": "IN_PROGRESS",
      "isResolutionIndicated": false,
      "updatedAt": "2026-10-29T11:00:00.000Z"
    }
  ]
}
```
- **Error Responses**:
  - `401 Unauthorized`: Not authenticated.
  - `403 Forbidden`: Non-requester user accessing requester endpoint.

---

### 3.2 IT Staff Dashboard
- **Endpoint**: `GET /api/dashboard/staff`
- **Authorized Roles**: `IT_STAFF`, `ADMINISTRATOR`
- **Response**: `200 OK`
```json
{
  "metrics": {
    "unassignedTickets": 4,
    "myAssignedTickets": 6,
    "byStatus": {
      "NEW": 4,
      "OPEN": 3,
      "IN_PROGRESS": 5,
      "WAITING_FOR_REQUESTER": 2,
      "PENDING": 1,
      "RESOLVED": 8,
      "CLOSED": 14
    },
    "byPriority": {
      "URGENT": 2,
      "HIGH": 4,
      "MEDIUM": 5,
      "LOW": 4
    },
    "recentlyUpdatedCount": 9
  },
  "urgentTickets": [
    {
      "id": 112,
      "ticketNumber": "TKT-2026-000112",
      "summary": "Core router fiber link flapping",
      "category": "NETWORK",
      "status": "IN_PROGRESS",
      "itPriority": "URGENT",
      "owner": { "fullName": "Somsak IT" },
      "actionsCount": 2,
      "updatedAt": "2026-10-29T11:45:00.000Z"
    }
  ],
  "recentTickets": [ ... ]
}
```

---

### 3.3 Administrator Dashboard
- **Endpoint**: `GET /api/dashboard/admin`
- **Authorized Roles**: `ADMINISTRATOR`
- **Response**: `200 OK`
  - Returns complete IT Staff dashboard structure PLUS `systemUserStats`:
```json
{
  "systemUserStats": {
    "totalUsers": 18,
    "activeRequesters": 10,
    "activeStaff": 6,
    "administrators": 2,
    "inactiveUsers": 1
  },
  "operationalMetrics": { ... }
}
```

### 3.4 Empty Behavior & Zero Metric Guarantees
- **Zero Metrics**: When an aggregation has 0 matching tickets, endpoints return exact integer `0` for numeric metrics (e.g. `"unassignedTickets": 0`), never `null` or omitted keys.
- **Empty Collections**: When no recent or urgent tickets match, arrays are returned as empty lists `[]` rather than `null`.
- **Drill-Down Query Continuity**: The frontend utilizes metric keys to query filtered endpoints (e.g. `/api/staff/tickets?owner=unassigned`), which gracefully return empty paginated responses (`{ "tickets": [], "total": 0 }`).

---

## 4. Ticket Workflow & Resolution Gate Endpoints

### 4.1 Requester Advisory Resolution Indication
- **Endpoint**: `POST /api/tickets/:id/resolve-indication`
- **Authorized Roles**: `REQUESTER` (owned ticket only)
- **Behavior**: Sets `isResolutionIndicated: true` and logs an automated public comment. Does NOT change `status` to `RESOLVED`.
- **Response**: `200 OK` with updated ticket payload.

### 4.2 Formal Ticket Status Transition
- **Endpoint**: `PATCH /api/tickets/:id/status`
- **Authorized Roles**: `IT_STAFF`, `ADMINISTRATOR` (Requesters only permitted for `REOPENED` from `RESOLVED`)
- **Request Body**:
```json
{
  "status": "RESOLVED",
  "resolutionNote": "Replaced RAM module; burn-in verified clean."
}
```
- **Validation & Resolution Precondition**:
  - Enforces 8+1 transition matrix per BR-07. Rejection of illegal state jumps with `422 Unprocessable Entity`.
  - **Action Completion Check (BR-08)**: When attempting to transition status to `RESOLVED`, the server checks all child `ActionTaken` records under the ticket. If any action remains in `PENDING` or `IN_PROGRESS` status, the transition is rejected with `422 Unprocessable Entity` and the error payload:
    ```json
    {
      "error": "Cannot resolve ticket: all child actions taken must be completed or cancelled first",
      "pendingActionsCount": 1
    }
    ```
