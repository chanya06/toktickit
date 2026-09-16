# Lab 3 REST API Specification

All protected endpoints require an active authenticated session header/cookie. Unauthorized requests return `401 Unauthorized` or `403 Forbidden`.

---

## 1. Authentication APIs (`/api/auth`)

### `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@toktickit.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@toktickit.com",
      "fullName": "Jane Doe",
      "role": "REQUESTER",
      "mustChangePassword": false
    }
  }
  ```
- **Errors**: `401 Unauthorized` (Invalid credentials or inactive account).

### `POST /api/auth/logout`
- **Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

### `GET /api/auth/me`
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@toktickit.com",
      "fullName": "Jane Doe",
      "role": "REQUESTER",
      "mustChangePassword": false
    }
  }
  ```

### `POST /api/auth/change-password`
- **Request Body**:
  ```json
  {
    "currentPassword": "InitialPass123!",
    "newPassword": "NewSecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Password changed successfully"
  }
  ```

---

## 2. IT Staff Queue & Operational APIs (`/api/staff/tickets`)

### `GET /api/staff/tickets`
- **Roles Allowed**: `IT_STAFF`, `ADMINISTRATOR`
- **Query Parameters**:
  - `search` (string): Text filter on ticket number or summary
  - `category` (number): Category ID filter
  - `status` (string): Status enum filter
  - `itPriority` (string): IT Priority enum filter
  - `ownerId` (string | number): Owner user ID (`unassigned`, `me`, or integer user ID)
  - `page` (number, default 1), `limit` (number, default 10)
  - `sortBy` (`createdAt`, `itPriority`, `status`), `sortDir` (`asc`, `desc`)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "ticketNumber": "TKT-2026-000001",
        "summary": "Laptop battery drains quickly",
        "category": { "id": 1, "name": "Hardware" },
        "requestedPriority": "MEDIUM",
        "itPriority": "MEDIUM",
        "currentStatus": "IN_PROGRESS",
        "isResolutionIndicated": false,
        "requester": { "id": 1, "fullName": "Alice Smith" },
        "owner": { "id": 2, "fullName": "Bob IT" },
        "createdAt": "2026-09-15T10:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
  }
  ```

### `PATCH /api/staff/tickets/:id/claim`
- **Roles Allowed**: `IT_STAFF`, `ADMINISTRATOR`
- **Response (200 OK)**: Sets `ownerId` to the current user's integer ID.

### `PATCH /api/staff/tickets/:id/assign`
- **Roles Allowed**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**: `{ "ownerId": 2 }`

### `PATCH /api/staff/tickets/:id/it-priority`
- **Roles Allowed**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**: `{ "itPriority": "HIGH" }`

### `PATCH /api/staff/tickets/:id/status`
- **Roles Allowed**: `IT_STAFF`, `ADMINISTRATOR` (and `REQUESTER` for permitted transitions per matrix)
- **Request Body**: `{ "status": "RESOLVED" }`

---

## 3. Requester Resolution Indication API

### `POST /api/tickets/:id/resolve-indication`
- **Roles Allowed**: `REQUESTER` (Must be owner of ticket with id `:id`)
- **Preconditions**: Ticket must be in `OPEN` or `IN_PROGRESS` status.
- **Request Body**:
  ```json
  {
    "comment": "The issue seems to be fixed after restarting."
  }
  ```
- **Behavior**: Sets `isResolutionIndicated: true` on the ticket and appends a system-logged Public Comment ("Requester indicated that the problem appears resolved: The issue seems to be fixed after restarting."). Does NOT directly mutate status to `RESOLVED` or `CLOSED`.
- **Response (200 OK)**:
  ```json
  {
    "message": "Resolution indication recorded successfully",
    "ticket": {
      "id": 1,
      "ticketNumber": "TKT-2026-000001",
      "status": "IN_PROGRESS",
      "isResolutionIndicated": true
    }
  }
  ```
- **Errors**: `403 Forbidden` (If requester does not own ticket), `422 Unprocessable Entity` (If ticket is already cancelled/closed).

---

## 4. Public Comments & Internal Notes APIs

### `GET /api/tickets/:id/comments`
- **Roles Allowed**: `REQUESTER` (if ticket owner), `IT_STAFF`, `ADMINISTRATOR`
- **Response (200 OK)**: List of public comments with author info.

### `POST /api/tickets/:id/comments`
- **Roles Allowed**: `REQUESTER` (if owner), `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**: `{ "content": "Thank you for the update." }`

### `GET /api/tickets/:id/notes`
- **Roles Allowed**: `IT_STAFF`, `ADMINISTRATOR` (Forbidden for `REQUESTER`)
- **Response (200 OK)**: List of internal notes. `403 Forbidden` if requested by a Requester.

### `POST /api/tickets/:id/notes`
- **Roles Allowed**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**: `{ "content": "Checked hardware diagnostics. Battery replacement required." }`

---

## 5. Administrator User Management APIs (`/api/admin/users`)

### `GET /api/admin/users`
- **Roles Allowed**: `ADMINISTRATOR`
- **Query Params**: `search`, `role`, `page`, `limit`
- **Response (200 OK)**: List of users with pagination metadata.

### `POST /api/admin/users`
- **Roles Allowed**: `ADMINISTRATOR`
- **Request Body**:
  ```json
  {
    "fullName": "Charlie Brown",
    "email": "charlie@toktickit.com",
    "role": "IT_STAFF",
    "initialPassword": "InitialPassword123!",
    "isActive": true
  }
  ```

### `PATCH /api/admin/users/:id`
- **Roles Allowed**: `ADMINISTRATOR`
- **Request Body**: `{ "fullName": "Charlie B.", "role": "IT_STAFF", "isActive": false }`
- **Errors**: `422 Unprocessable Entity` if Admin attempts self-deactivation or deactivating the last active Admin.

### `POST /api/admin/users/:id/reset-password`
- **Roles Allowed**: `ADMINISTRATOR`
- **Request Body**: `{ "initialPassword": "NewInitialPass123!" }`
