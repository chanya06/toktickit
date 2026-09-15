# Lab 3 Sprint Engineering Specification

## 1. Sprint Goal
Deliver an enterprise-grade role-based IT support ticketing and administration increment for TokTickIT. This sprint replaces the temporary Development Requester identity selector with secure authentication, mandatory first-login password changes, and 3 distinct operational roles (`Requester`, `IT Staff`, `Administrator`). The increment introduces a shared IT Staff Ticket Queue with ownership claiming/reassigning, IT Priority management, status workflow enforcement, Public Comments, private Internal Notes, and a minimalist Administrator User Management interface.

---

## 2. Stakeholder Request Interpretation
The IT department requires TokTickIT to transition from a development testing mode to a production-ready authentication and role-based operational platform. 
1. **Authentication & Session**: Real email/password authentication replaces the temporary selector. Users marked with initial passwords must change their password before accessing the system.
2. **Requester Workflow**: Requesters continue managing their own tickets, can view/post Public Comments, and can indicate when a reported issue appears resolved (without formally closing the ticket).
3. **IT Staff Workflow**: IT Staff access a dedicated, searchable, filterable, sorted, and paginated Ticket Queue. They can view ticket details, claim or reassign ticket ownership, manage IT Priority, execute permitted status transitions, communicate publicly via Public Comments, and collaborate privately using Internal Notes.
4. **Administrator Workflow**: Administrators manage user accounts via a dedicated screen to list, search, filter by role, create users (assigning 1 role and an initial password), edit user details/activation states, and reset initial passwords. Safety constraints prevent self-deactivation and the deactivation/removal of the final active Administrator.
5. **Security & Authorization**: All APIs and screens must enforce role-based access control and ownership checks server-side. Hiding buttons on the client is insufficient.

---

## 3. Scope

### Included
- **Authentication & Security**: Email/password authentication, logout, authenticated session retrieval (`GET /api/auth/me`), and mandatory first-login password change (`POST /api/auth/change-password`).
- **Role-Based Navigation & Shell**: Header displaying authenticated user's full name, role badge, Logout button, and role-specific navigation links.
- **Requester Continuation & Resolution Indication**: Requester ticket ownership preservation, Public Comments thread on Requester Ticket Detail, and "Problem Appears Resolved" action.
- **IT Staff Ticket Queue**: Searchable, filterable (Category, Status, IT Priority, Owner), sortable, paginated queue for IT Staff and Administrator users.
- **IT Staff Ticket Operations**: Claim ownership, reassign ownership, update IT Priority, execute permitted status transitions (New -> Open -> In Progress -> Waiting for Requester / Resolved / Cancelled), post Public Comments, and create/view private Internal Notes.
- **Administrator User Management**: Paginated/searchable user list, role filter, Create User modal with 1 permitted role and initial password, Edit User modal (name, email, role, active status), Reset Initial Password modal, and enforcement of Admin safety rules.
- **Database & Data Model Migration**: Migration of Lab 2 Requesters to `User` records with hashed passwords, addition of `Role` enum, `PublicComment`, `InternalNote`, `ITPriority`, ticket owner relationship, and idempotent seed script.

### Excluded
- Self-registration / public sign-up.
- Multi-factor authentication (MFA), OAuth / Social Login, Single Sign-On (SSO).
- Automated email delivery of initial passwords or reset links.
- User account hard deletion, bulk user operations, import/export, or role audit history.
- Actions Taken entity and formal SLA calculations (deferred to Lab 4).
- Multiple roles per user.

---

## 4. Functional Requirements

### Authentication & Password Management
- **FR-01**: The system shall authenticate users using email address and password credentials.
- **FR-02**: The system shall reject authentication attempts for inactive user accounts (`isActive: false`).
- **FR-03**: The system shall require users logged in with an initial password (`mustChangePassword: true`) to set a new password before accessing any normal application screens.
- **FR-04**: The system shall provide a Logout action that destroys the authenticated session.

### Navigation & Shell
- **FR-05**: The application shell shall render the authenticated user's name and role badge on all screens.
- **FR-06**: The application shell shall present only the navigation destinations permitted for the authenticated user's role:
  - `Requester`: My Tickets, Create Ticket.
  - `IT Staff`: IT Ticket Queue, Create Ticket (if permitted).
  - `Administrator`: User Management, IT Ticket Queue.

### Requester Increment & Public Comments
- **FR-07**: Requesters shall view and manage only tickets they own, verified strictly via backend session context.
- **FR-08**: Requesters, IT Staff, and Administrators shall be able to post and view Public Comments on any ticket they are authorized to access.
- **FR-09**: Requesters shall be able to mark an Open/In Progress ticket as "Problem Appears Resolved", adding a system-logged Public Comment and updating the resolution indication state.

### IT Staff Ticket Queue & Operations
- **FR-10**: The system shall provide IT Staff with a Ticket Queue featuring text search (Ticket Number, Summary), multi-attribute filtering (Category, Status, IT Priority, Owner), column sorting, and pagination.
- **FR-11**: IT Staff shall be able to claim unassigned tickets or reassign ticket ownership to another active IT Staff or Administrator user.
- **FR-12**: IT Staff shall be able to update IT Priority independently of Requested Priority.
- **FR-13**: IT Staff shall be able to update ticket status according to the permitted status transition matrix.
- **FR-14**: IT Staff and Administrators shall be able to create and view Internal Notes on tickets. Internal Notes MUST be hidden from Requester users.

### Administrator User Management
- **FR-15**: Administrators shall be able to view a list of all user accounts with search by name/email and filtering by role.
- **FR-16**: Administrators shall be able to create new user accounts specifying full name, email, exactly one role (`Requester`, `IT_STAFF`, or `ADMINISTRATOR`), initial password, and activation status.
- **FR-17**: Administrators shall be able to update an existing user's full name, email, role, and activation status.
- **FR-18**: Administrators shall be able to set a new initial password for a user, automatically setting `mustChangePassword: true` for that user.
- **FR-19**: The system shall reject attempt by an Administrator to deactivate their own account.
- **FR-20**: The system shall reject attempt to deactivate or demote the sole remaining active Administrator account.

---

## 5. Business Rules

### Authentication & Authorization
- **BR-01**: Only active users (`isActive: true`) with valid password hashes can authenticate.
- **BR-02**: Users with `mustChangePassword: true` are blocked from all API endpoints except `/api/auth/change-password`, `/api/auth/logout`, and `/api/auth/me`.
- **BR-03**: Requester identity is determined exclusively by the authenticated session on the backend. Any `requesterId` supplied in client request bodies is ignored.
- **BR-04**: Passwords must be hashed using `bcrypt` (salt rounds >= 10) before database storage. Plaintext passwords must never be stored or logged.
- **BR-05**: User emails must be unique (case-insensitive).

### Administrator Safety & User Rules
- **BR-06**: Each user account is assigned exactly one role from: `REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`.
- **BR-07**: An Administrator cannot deactivate their own active session (`userId === session.userId`).
- **BR-08**: The system must enforce that at least one active user with `ADMINISTRATOR` role exists at all times.
- **BR-09**: User deletion is forbidden. Disabling accounts must be executed via soft deactivation (`isActive: false`).

### Ticket Ownership, Priority & Status
- **BR-10**: A Ticket has one primary Ticket Owner (`ownerId`), who must be an active user with `IT_STAFF` or `ADMINISTRATOR` role. Ownership may initially be `null` (unassigned).
- **BR-11**: Requested Priority is submitted by the Requester and is immutable after creation. IT Priority defaults to Requested Priority on creation, but can later be modified only by IT Staff or Administrators.
- **BR-12**: Permitted Ticket Status values: `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`.
- **BR-13**: Requesters cannot directly set status to `RESOLVED` or `CLOSED`. Only IT Staff or Administrators can execute formal resolution/closure.
- **BR-14**: Status Transition Matrix:
  - `NEW` -> `OPEN`, `CANCELLED`
  - `OPEN` -> `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`
  - `IN_PROGRESS` -> `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`
  - `WAITING_FOR_REQUESTER` -> `IN_PROGRESS`, `RESOLVED`, `CANCELLED`
  - `RESOLVED` -> `CLOSED`, `REOPENED`
  - `CLOSED` -> `REOPENED`
  - `CANCELLED` -> `OPEN`

### Comments & Notes
- **BR-15**: Public Comments are visible to all 3 roles (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`).
- **BR-16**: Internal Notes are visible ONLY to `IT_STAFF` and `ADMINISTRATOR` roles. Requesters fetching or posting Internal Notes receive `403 Forbidden` without revealing note existence.
- **BR-17**: Comments and Internal Notes are append-only. Editing and deleting entries are forbidden.
- **BR-18**: Comment and Note content must be non-empty, trimmed, min 2 chars, max 2000 chars. Author ID and timestamp (`createdAt`) are recorded from the backend session.

---

## 6. UI Specification Summary
See [ui-spec.md](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-03/ui-spec.md) for full layout, responsive breakpoints, design system tokens, badge specifications, and form state rules.

---

## 7. Data Changes (Prisma Schema)

### Prisma Models & Enums

```prisma
enum Role {
  REQUESTER
  IT_STAFF
  ADMINISTRATOR
}

enum ITPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model User {
  id                 String           @id @default(uuid())
  email              String           @unique
  passwordHash       String
  fullName           String
  role               Role             @default(REQUESTER)
  isActive           Boolean          @default(true)
  mustChangePassword Boolean          @default(true)
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  ownedTickets       Ticket[]         @relation("RequesterTickets")
  assignedTickets    Ticket[]         @relation("AssignedITStaffTickets")
  publicComments     PublicComment[]
  internalNotes      InternalNote[]
}

// Updated Ticket Model:
// - requesterId references User(id)
// - ownerId optional references User(id)
// - itPriority enum ITPriority

model PublicComment {
  id        String   @id @default(uuid())
  ticketId  String
  authorId  String
  content   String
  createdAt DateTime @default(now())

  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id])
}

model InternalNote {
  id        String   @id @default(uuid())
  ticketId  String
  authorId  String
  content   String
  createdAt DateTime @default(now())

  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id])
}
```

### Data Migration & Seed Strategy
- Migration evolves Lab 2 Requesters into `User` records with `role: REQUESTER`.
- Seed script populates:
  - 4 active Requesters, 1 inactive Requester.
  - 3 active IT Staff, 1 inactive IT Staff.
  - 1 active Administrator (`admin@toktickit.com` / `InitialPass123!`).
  - Sample tickets across statuses and priorities with public comments and internal notes.

---

## 8. API Contract Summary
See [api-spec.md](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-03/api-spec.md) for endpoint paths, methods, headers, query parameters, request/response schemas, and error responses.

---

## 9. Acceptance Criteria

- **AC-01**: Given an active user with valid credentials, when the user logs in, then the backend establishes an authenticated session and returns user profile and role.
- **AC-02**: Given a user marked with `mustChangePassword: true`, when login succeeds, then normal application screens remain unavailable until a new valid password is saved.
- **AC-03**: Given an authenticated Requester, when accessing tickets, then the backend strictly enforces ownership based on session identity regardless of client-supplied IDs.
- **AC-04**: Given a Requester account, when requesting an Internal Note endpoint, then the server returns `403 Forbidden` without exposing note content.
- **AC-05**: Given an IT Staff user, when viewing the Ticket Queue, then tickets can be filtered by Category, Status, IT Priority, Owner, searched by query text, sorted, and paginated.
- **AC-06**: Given an IT Staff user, when opening an unassigned ticket, then the user can claim ownership or assign ownership to an active IT Staff/Admin user.
- **AC-07**: Given an IT Staff user, when changing a ticket status, then the transition must adhere to the permitted status transition matrix.
- **AC-08**: Given an IT Staff user, when adding an Internal Note, then the note is saved with author metadata and rendered only for IT Staff and Administrator users.
- **AC-09**: Given an Administrator user, when viewing User Management, then all users are displayed with search and role filter capabilities.
- **AC-10**: Given an Administrator user, when creating a new user with initial password, then the user is created with `mustChangePassword: true`.
- **AC-11**: Given an Administrator user, when attempting to deactivate their own account, then the server rejects the request with `422 Unprocessable Entity`.
- **AC-12**: Given an Administrator user, when attempting to deactivate the last remaining active Administrator, then the server rejects the request.

---

## 10. Definition of Done
- [ ] Database schema migrated and seeded with active/inactive users across 3 roles, tickets, comments, and notes.
- [ ] Authentication API (`login`, `logout`, `me`, `change-password`) implemented and tested.
- [ ] Requester regression verified: tickets and attachments protected by session-based authorization.
- [ ] IT Staff Ticket Queue UI and API implemented with search, filtering, sorting, pagination.
- [ ] IT Staff Ticket Detail UI implemented with claim/reassign, IT Priority, status transitions, Public Comments, and Internal Notes.
- [ ] Administrator User Management UI and API implemented with search, filter, create user, edit user, set initial password, and safety rules.
- [ ] All unit, integration, UI, authorization, and E2E tests passing.
- [ ] Rendered documentation (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`) complete.

---

## 11. Assumptions and Decisions
- **Session Architecture**: Cookie-based HTTP-only session or Bearer Token stored securely in client state, verified per request via auth middleware.
- **Password Rules**: Minimum 8 characters, requiring at least one uppercase letter, one lowercase letter, one number, and one special character.
- **Soft Deactivation**: Accounts are never deleted from the database to preserve historical ticket audit trails.
