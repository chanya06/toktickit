# Lab 4 AI Pair Programming & Interaction Log

## 1. LLM Model & Development Environment
- **Primary AI Assistant**: Antigravity AI (Google Gemini 2.5 Pro)
- **Role & Workflow**: Pair programming partner assisting with Spec-Driven Development (Spec DD), Test-Driven Development (TDD), schema migration, API implementation, responsive component authoring, and automated test design.
- **Strict Human / Peer Oversight**: All code and architectural decisions are reviewed, approved, and integrated via GitHub Pull Requests by peer reviewer `@lmaybelgracel`. The AI never merges pull requests autonomously.

---

## 2. Key Prompt Trajectory (Sprint 4)

### Prompt 1: Sprint 4 Engineering Contract & Specification-Driven Development
- **User Intent**: Analyze the Lab 4 handout (Actions Taken, Dashboards, Resolution Gate, Final Regression) and draft the comprehensive engineering contract (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`) before any implementation code is written.
- **AI Response Summary**:
  - Structured the 11 mandatory sections in `specification.md` including `FR-01..FR-16`, `BR-01..BR-10`, `AC-01..AC-12`, and Definition of Done.
  - Justified 3 key database decisions: Integer foreign key alignment with Lab 2 `Ticket.id`, dedicated `ActionTaken` child entity, and non-destructive legacy ticket compatibility.
  - Specified the Zen Green UI tokens, responsive layouts, metric card drill-downs, and Actions Taken modal/table views in `ui-spec.md`.
  - Formulated strict REST API contracts with optimistic concurrency conflict detection (`409 Conflict`) in `api-spec.md`.
  - Defined the multi-tier test pyramid and traceability matrix in `tests.md`.

### Prompt 2: PR #72 Review Feedback Resolution & Contract Hardening
- **User Intent**: Address 4 specific feedback items requested by peer reviewer `@lmaybelgracel` for PR #72: add `assigneeId` field to Actions Taken model and APIs, add Migration Rollback and Disaster Recovery procedure to specification.md, add missing test categories (Style/Responsive, Accessibility, Performance-Smoke, Migration) to tests.md, and specify Empty Behavior for dashboard cards and completed-action requirements for the Resolution Gate.
- **AI Response Summary**:
  - Added `assigneeId: String?` referencing `User` alongside `performedById: String` in Prisma schema, APIs, and UI modal.
  - Added Section 7.3 to `specification.md` detailing reverse down-migration SQL, `prisma migrate resolve --rolled-back`, and `pg_dump`/`pg_restore` recovery.
  - Added `STYLE-01`, `A11Y-01`, `PERF-01`, and `MIGR-01` rows to `tests.md`.
  - Specified empty metric card behaviors (value 0 styling & drill-down) and enforced `BR-08` precondition that resolving a ticket requires all child actions to be completed or cancelled.
  - Recorded review comments and response in `docs/lab-04/reviewer.md`.

---

### Prompt 3: Issue 30 Database Foundation, Migration & Idempotent Seeding
- **User Intent**: Proceed with Issue 30 to implement the Prisma schema changes for Actions Taken (ActionTakenStatus enum and ActionTaken model), create and execute the database migration, implement idempotent seed data with realistic tickets spanning zero, one, and multiple actions across all statuses, and verify with automated migration tests.
- **AI Response Summary**:
  - Implemented `ActionTakenStatus` enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) and `ActionTaken` model in `server/prisma/schema.prisma` with integer foreign key alignment to `Ticket(id)` and `User(id)`.
  - Created migration `20261030000000_lab4_actions_taken` and deployed cleanly to PostgreSQL database.
  - Updated `server/prisma/seed.ts` with 6 realistic tickets covering all required variations: 0 actions (unassigned queue), 1 action (pending RF survey / waiting for requester), and multiple actions (in-progress battery swap / resolved LDAP VPN certificate).
  - Authored automated integration test suite `server/tests/lab-04/migration-rollback.test.ts` (`MIGR-01`) verifying foreign keys, cascading deletions, legacy ticket compatibility, and rollback DDL safety (100% passing).
  - Maintained full regression safety across all 153 backend tests and 116 frontend tests.

---

### Prompt 4: PR #81 Peer Review Defect Resolution & Schema Hardening
- **User Intent**: Address 4 specific review feedback points from peer reviewer `@lmaybelgracel` on PR #81: improve `MIGR-01d` to test rollback DDL on full schema with Enums and Foreign Keys, add `REOPENED` and `CANCELLED` tickets to seed data, record review comments and author responses in `reviewer.md`, and justify application-layer follow-up invariant enforcement over DB check constraints in `specification.md`.
- **AI Response Summary**:
  - Re-architected `MIGR-01d` in `server/tests/lab-04/migration-rollback.test.ts` to build a complete replica schema with `ActionTakenStatus` enum, foreign keys to Ticket and User, test data insertion, and executed the exact `DROP TABLE CASCADE` and `DROP TYPE` rollback DDL, asserting zero residual tables or types.
  - Added `TKT-2026-000007` (`REOPENED`) and `TKT-2026-000008` (`CANCELLED`) with associated Actions Taken in `server/prisma/seed.ts`, achieving 100% coverage of all 8 major ticket statuses with idempotent re-execution.
  - Documented Review Round 2 verbatim reviewer comments and author action plan in `docs/lab-04/reviewer.md`.
  - Added architectural justification Decision 4 to Section 7.2 in `docs/lab-04/specification.md` explaining why conditional follow-up note validation belongs in the application/API layer for actionable HTTP 400 responses and schema portability.
  - Verified full test regression suite: 153 backend tests passing.

---

### Prompt 5: Issue 31 Actions Taken Backend REST APIs, Authorization & Concurrency
- **User Intent**: Implement the Actions Taken backend REST APIs under Issue 31 with strict role authorization, optimistic concurrency control (`409 Conflict`), follow-up validation guards, inactive assignee rejection (`422 Unprocessable Entity`), and terminal state lifecycle protection, verified by comprehensive automated tests (`API-01..06`).
- **AI Response Summary**:
  - Implemented `server/src/routes/actions.ts` mounted under `/api/tickets` in `server/src/app.ts`:
    - `GET /api/tickets/:id/actions`: Role-scoped action retrieval (requesters restricted to owned tickets; IT staff/admin across all).
    - `POST /api/tickets/:id/actions`: Authenticated creator binding (`performedById`), `actionDescription` validation (min 5 chars), conditional `followUpNote` enforcement, and active staff/admin `assigneeId` verification.
    - `PUT /api/tickets/:id/actions/:actionId`: Optimistic concurrency check comparing `expectedUpdatedAt` against database timestamp returning `409 Conflict` on race conditions, with assignee and note validation.
    - `PATCH /api/tickets/:id/actions/:actionId/status`: Status lifecycle transition enforcing terminal state protection (`COMPLETED` / `CANCELLED` cannot be reopened, returning `422`).
  - Authored automated test suite `server/tests/lab-04/actions-taken.api.test.ts` covering 23 comprehensive tests (`API-01` through `API-06` + edge cases), with 100% pass rate.
  - Verified full regression test suite: 176 backend tests passing across all 17 test files.

---

### Prompt 6: PR #82 Peer Review Defect Resolution & Terminal State Hardening
- **User Intent**: Address 4 specific review feedback points from peer reviewer `@lmaybelgracel` on PR #82: enforce terminal state read-only protection in PUT (`COMPLETED`/`CANCELLED` cannot be modified -> 422), enforce complete BR-03 transition matrix in PATCH (block direct `PENDING` -> `COMPLETED` skipping -> 422), document Review Round 3 in `reviewer.md`, and author automated test cases verifying terminal state rejection on PUT and direct skip rejection on PATCH.
- **AI Response Summary**:
  - Added pre-update terminal state check in `actionsRouter.put` (`server/src/routes/actions.ts`), rejecting modifications on `COMPLETED` or `CANCELLED` actions with `422 Unprocessable Entity`.
  - Added transition matrix enforcement in `actionsRouter.patch`, rejecting direct `PENDING` to `COMPLETED` skips with `422 Unprocessable Entity` according to rule `BR-03`.
  - Added automated tests in `server/tests/lab-04/actions-taken.api.test.ts` verifying PUT on `COMPLETED` action returns 422, PUT on `CANCELLED` action returns 422, and PATCH from `PENDING` to `COMPLETED` returns 422 (26/26 tests passing).
  - Documented Review Round 3 verbatim reviewer comments and author action plan in `docs/lab-04/reviewer.md`.
  - Verified full test regression suite: 179 backend tests passing across all 17 test files.

---

### Prompt 7: Issue 32 Actions Taken UI on Ticket Detail Screen & Responsive Cards
- **User Intent**: Build the Actions Taken user interface panel on the Ticket Detail screen conforming to Zen Green design standards, supporting list/table view, create modal with dynamic validation, edit modal, status transition controls, read-only presentation for Requesters, and responsive mobile card transformation.
- **AI Response Summary**:
  - Extended `client/src/api.ts` with `ActionTaken` interfaces, `CreateActionTakenPayload`, `UpdateActionTakenPayload`, and API consumer functions (`fetchTicketActions`, `createTicketAction`, `updateTicketAction`, `transitionActionStatus`).
  - Implemented `client/src/components/ActionsTakenSection.tsx` with Zen Green theme styling (`#006B3C`), status badges (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), role badges, follow-up indicators, and touch targets (minimum 44x44px for mobile).
  - Integrated dynamic validation into Create/Edit modal: required description (min 5 chars), conditional follow-up note (min 5 chars when toggle is enabled), and outcome requirement on `COMPLETED` status.
  - Implemented terminal state protection (`COMPLETED` and `CANCELLED` actions are locked from further editing or status transitions).
  - Embedded `ActionsTakenSection` into `client/src/components/TicketDetailView.tsx` located directly below Ticket Operations and above the communication tabs.
  - Authored comprehensive React Testing Library suite `client/tests/lab-04/ActionsTaken.test.tsx` covering `UI-01`, `UI-02`, `UI-03`, optimistic locking conflict alerts, terminal state locking, and helper functions (15/15 tests passing).
  - Maintained 100% pass across all 131 client tests (16 files) and 179 backend tests (17 files).

---

### Prompt 8: PR #83 Peer Review Defect Resolution & UI Error Highlighting Hardening
- **User Intent**: Address 4 specific review feedback points from peer reviewer `@lmaybelgracel` on PR #83: allow selecting inactive assignees in dropdown to demonstrate HTTP 422 safe failure on UI, implement field-level inline error highlighting (`is-invalid` and inline feedback), document Review Round 4 in `reviewer.md`, and author an automated frontend test verifying inactive assignee rejection and error feedback.
- **AI Response Summary**:
  - Removed `disabled` attribute from inactive options in `#action-assignee` select inside `client/src/components/ActionsTakenSection.tsx` while keeping clear label indicators (e.g. `(Staff - Inactive)`), enabling full demonstration of `Answer Part 6` safe failures.
  - Implemented field-level error state tracking (`modalErrorField`) bound to Bootstrap's `is-invalid` class and `<div className="invalid-feedback d-block">` on each modal form control (`actionDescription`, `followUpNote`, `result`, `assigneeId`, `actionDateTime`).
  - Added automated test `"handles inactive assignee rejection with HTTP 422 and field-level error highlighting"` in `client/tests/lab-04/ActionsTaken.test.tsx` (16/16 tests passing).
  - Documented Review Round 4 verbatim comments and author action plan in `docs/lab-04/reviewer.md`.
  - Verified full test regression suite: 132 client tests (16 files) and 179 backend tests (17 files) passing 100%.

---

### Prompt 9: Issue 33 Role Dashboards REST APIs & Latency Benchmarks
- **User Intent**: Implement the role-based dashboard backend REST APIs under Issue 33 (`GET /api/dashboard/requester`, `GET /api/dashboard/staff`, `GET /api/dashboard/admin`) with role-based access control, strict session/identity isolation, zero-count guarantees, parallel aggregation queries via `Promise.all`, and sub-100ms latency benchmarks (`API-07`, `API-08`, `PERF-01`).
- **AI Response Summary**:
  - Implemented `server/src/routes/dashboard.ts` mounted under `/api/dashboard` in `server/src/app.ts`:
    - `GET /api/dashboard/requester`: Role restricted to `REQUESTER`. Strictly isolated to `req.user.id`. Parallel aggregation via `Promise.all` for `myOpenTickets` (NEW, OPEN, IN_PROGRESS, PENDING, REOPENED), `waitingForRequester` (WAITING_FOR_REQUESTER), `recentlyUpdated` (past 7 days), `recentlyResolved` (past 30 days), and up to 10 `recentTickets` formatted with `actionsCount`. Guarantees exact integer 0 values and empty `[]` when tickets are 0.
    - `GET /api/dashboard/staff`: Role restricted to `IT_STAFF` and `ADMINISTRATOR`. Returns `unassignedTickets` (`ownerId: null`), `myAssignedTickets` (`ownerId: req.user.id`), `byStatus` mapping (guaranteed 0 for all 9 enum values), `byPriority` mapping (guaranteed 0 for all 4 enum values), `recentlyUpdatedCount` (past 24h), `urgentTickets` (URGENT priority active tickets), and `recentTickets`.
    - `GET /api/dashboard/admin`: Role restricted to `ADMINISTRATOR`. Returns IT Staff operational metrics plus `systemUserStats` (`totalUsers`, `activeRequesters`, `activeStaff`, `administrators`, `inactiveUsers`).
  - Authored automated test suites:
    - `server/tests/lab-04/requester-dashboard.api.test.ts` (7 tests covering `API-07`: metrics calculation, tenant isolation, zero metrics with David Lee, date range boundary for > 30d resolved, 401 unauthenticated, 403 staff/admin, 403 mustChangePassword).
    - `server/tests/lab-04/staff-dashboard.api.test.ts` (8 tests covering `API-08`: triage metrics, status/priority breakdown, urgent/recent lists, myAssignedTickets scoping between staff, admin access to staff dashboard, 403 for requesters, 401 unauthenticated, admin dashboard `systemUserStats`, 403 non-admin on admin dashboard).
    - `server/tests/lab-04/dashboard-perf.api.test.ts` (4 tests covering `PERF-01`: sub-100ms latency on requester, staff, and admin dashboard endpoints, plus concurrent query resilience).
  - Maintained 100% pass across all 198 backend tests (20 files) and 132 frontend tests (16 files).

---

### Prompt 10: PR #84 Peer Review Defect Resolution & Dashboard Metric Boundary Hardening
- **User Intent**: Address 4 specific review feedback points from peer reviewer `@lmaybelgracel` on PR #84: filter out terminal states (`RESOLVED`, `CLOSED`, `CANCELLED`) from `unassignedTickets` and `myAssignedTickets` per BR-10, restrict priority distribution (`byPriority`) to active operational workload, record Review Round 5 in `reviewer.md`, and author an automated test case in `staff-dashboard.api.test.ts` verifying terminal state exclusion from operational metrics.
- **AI Response Summary**:
  - Updated `computeStaffOperationalMetrics` in `server/src/routes/dashboard.ts`:
    - Added `status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] }` to both `unassignedTickets` and `myAssignedTickets` count queries.
    - Added `where: { status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] } }` to the `byPriority` `groupBy` query, keeping priority metrics strictly focused on active backlog.
  - Added automated test case `API-08i` in `server/tests/lab-04/staff-dashboard.api.test.ts` asserting that creating tickets in `CANCELLED`, `RESOLVED`, or `CLOSED` statuses does not inflate `unassignedTickets`, `myAssignedTickets`, or `byPriority` active counts, while `byStatus` accurately reflects overall queue lifecycle.
  - Documented Review Round 5 verbatim review comments and author response plan in `docs/lab-04/reviewer.md`.
  - Maintained 100% pass across all 199 backend tests (20 files) and 132 frontend tests (16 files).

---

### Prompt 11: Issue 34 Role Dashboards UI: Metric Cards, Recent Activity & Drill-Down
- **User Intent**: Build the role-based dashboards user interface for Requesters, IT Staff, and Administrators conforming to Zen Green styling (#006B3C), responsive 2-column desktop layouts, interactive metric summary cards, recent activity lists, quick actions, role-aware landing, and drill-down navigation linking cards directly into filtered queues.
- **AI Response Summary**:
  - Extended `client/src/api.ts` with dashboard data models (`DashboardTicket`, `RequesterDashboardMetrics`, `RequesterDashboardResponse`, `StaffOperationalMetrics`, `StaffDashboardResponse`, `SystemUserStats`, `AdminDashboardResponse`) and API fetchers (`fetchRequesterDashboard`, `fetchStaffDashboard`, `fetchAdminDashboard`).
  - Implemented `client/src/components/RequesterDashboard.tsx` (`UI-04`):
    - Welcome banner with Requester Name, role badge (`REQUESTER`), and refresh button with spin animation.
    - 4 Zen Green metric cards: `My Open Tickets`, `Waiting for Input` (highlighted amber when > 0), `Recently Updated`, and `Recently Resolved`. Zero-count values cleanly styled in neutral slate (#64748B).
    - Drill-down navigation: clicking any metric card transitions to My Tickets with appropriate status filter pre-selected.
    - 2-Column desktop layout (70/30): Left column displays recent requests table with ticket number, title, status badges, actions taken count, and resolution indicated advisory tag (`isResolutionIndicated`), plus BR-07 compliant empty state (*"No support requests found. Click '+ Submit New Request' to get IT support."*). Right column provides quick action buttons (*+ Submit New Request*, *View All My Tickets*) and IT Helpdesk contact assistance.
  - Implemented `client/src/components/StaffDashboard.tsx` (`UI-05`):
    - Welcome banner with Staff Name, role badge (`IT Staff` or `Administrator`), and refresh button.
    - System User Administration row (Administrator only) displaying 5 summary stat cards (`totalUsers`, `activeRequesters`, `activeStaff`, `administrators`, `inactiveUsers`) and shortcut to User Management.
    - 5 Operational metric cards: `Unassigned`, `My Assigned`, `In Progress`, `Waiting Input`, and `Urgent` (highlighted red when > 0).
    - Drill-down navigation: clicking any card transitions directly to Staff Ticket Queue with target status, owner (unassigned / me), or priority pre-filtered.
    - 2-Column desktop layout (70/30): Left column features tabbed triage view between Urgent Queue and Recent Activity with BR-10 empty urgent queue feedback (*"Queue is clear. No urgent tickets require immediate attention."*). Right column provides queue shortcuts and active priority/status workload distribution charts.
  - Integrated routing and navigation:
    - Updated `client/src/components/Header.tsx` with Dashboard nav tab and brand logo navigation.
    - Extended `client/src/components/MyTicketsView.tsx` and `client/src/components/StaffTicketQueue.tsx` to accept initial filter props for drill-down navigation.
    - Updated `client/src/App.tsx` to land logged-in users on Dashboard while maintaining test backwards-compatibility with Lab 3 tab navigation.
  - Authored automated RTL test suites:
    - `client/tests/lab-04/RequesterDashboard.test.tsx` (8 tests covering UI-04: welcome banner, 4 cards, empty state, resolution indicated tag, drill-down callbacks, ticket detail navigation, quick actions, refresh, error retry).
    - `client/tests/lab-04/StaffDashboard.test.tsx` (9 tests covering UI-05: operational metric cards, admin user stats, empty urgent queue message, tab toggling, drill-down callbacks, ticket detail navigation, queue shortcuts, refresh, error retry).
  - Maintained 100% pass across all 149 client tests (18 files) and 199 backend tests (20 files).

## 3. Reflection on AI Pairing in Software Engineering

---

### Specification-Agent Synergy
Using the AI as a specification agent before writing implementation code forces rigor in defining boundaries, data structures, and edge cases. In Sprint 4, the introduction of a parent-child relationship (`Ticket -> ActionTaken`) could easily lead to concurrency bugs (e.g. overwriting an action outcome while another staff member transitions status) or authorization leaks (e.g. allowing requesters to edit actions). Defining explicit business rules (`BR-01` through `BR-10`) and HTTP status contracts upfront establishes an unambiguous contract that guides both development and peer review.

### Coding-Agent Guardrails
Maintaining strict boundaries where the AI acts strictly as a pair programming author while peer reviewer `@lmaybelgracel` exercises merge authority ensures genuine software engineering discipline. Every pull request remains accountable to human review, validating that the delivered software reflects authentic craftsmanship and verified evidence.
