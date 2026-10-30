# Lab 4 Engineering Specification: Actions Taken, Dashboards, and Final Regression

## 1. Sprint Goal
Deliver an enterprise-ready service-desk increment for TokTickIT that introduces a structured parent-child **Actions Taken** work-tracking subsystem under each Ticket, role-appropriate **Dashboards** for Requesters, IT Staff, and Administrators, formal enforcement of the **Ticket Resolution Gate** and status lifecycle, and complete product hardening ensuring 100% regression stability across all Lab 1–3 increments under the Zen Green design system.

---

## 2. Stakeholder Request Interpretation
The IT department requires TokTickIT to evolve from a ticketing and communication platform into a comprehensive operational work-management system:
1. **Actual Work Tracking (Actions Taken)**: Communication alone is insufficient. IT Staff and Administrators require a reliable way to plan, assign, execute, and audit concrete actions taken under each ticket (recording action timestamp, description, outcome/result, automated performer attribution, follow-up flags and notes, and attachment references).
2. **Coordinated Ticket Ownership**: While individual Actions Taken may be executed by various IT Staff members, the primary Ticket Owner retains global responsibility for coordinating and verifying ticket progress.
3. **Formal Resolution Gate**: Requesters may signal that an issue appears resolved (`isResolutionIndicated: true`), but this indicator is strictly advisory. Formal transition to `RESOLVED` requires IT Staff/Admin review of completed Actions Taken.
4. **Role-Appropriate Dashboards**: Requesters and IT Staff need concise operational dashboards providing at-a-glance metrics, recent activity, and quick actions with direct drill-down into detailed lists, without duplicating existing operational screens.
5. **Product Hardening & Zero Regression**: Polish the entire system to ensure all features from Labs 1–3 (authentication, password rotation, RBAC, attachments, staff queue, public comments, amber internal notes, administrator user management) function seamlessly without errors, clipping, or accessibility regressions.

---

## 3. Scope

### 3.1 Included in Lab 4 Scope
1. **Actions Taken Subsystem**:
   - PostgreSQL / Prisma schema migration adding `ActionTaken` model with full relationships to `Ticket` and `User`.
   - Comprehensive REST APIs for listing, creating, updating, assigning, and transitioning status of Actions Taken (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
   - Interactive Actions Taken UI panel on Ticket Detail view supporting list/table view, create modal, edit modal, status transitions, and responsive mobile cards.
   - Strict role permissions: Requesters have read-only access to Actions Taken on their owned tickets; IT Staff and Administrators have full operational control.
   - Validation rules: Mandatory follow-up note when follow-up is required; inactive user assignment rejection.
2. **Role-Appropriate Dashboards**:
   - **Requester Dashboard**: Open tickets, waiting for requester, recently updated, recently resolved, recent ticket list, and quick actions with drill-down to `MyTicketsView`.
   - **IT Staff Dashboard**: Unassigned tickets, user-assigned tickets, tickets by status, tickets by IT priority, recently updated tickets, urgent tickets, and quick actions with drill-down to `StaffTicketQueue`.
   - **Administrator Dashboard**: Inherits IT Staff dashboard and adds concise system user statistics.
3. **Ticket Lifecycle & Resolution Gate Hardening**:
   - Complete 8+1 status state machine enforcement (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `PENDING`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`).
   - Advisory resolution gate: Requester resolution indication records timestamp/comment but does not prematurely close the ticket.
   - Optimistic concurrency and stale-update detection via record update timestamps to prevent silent overwrite of concurrent workflow changes.
4. **Full Regression & Hardening**:
   - Verification that legacy tickets (with zero Actions Taken) render and function flawlessly.
   - Idempotent database seeding covering diverse tickets with 0, 1, and multiple Actions Taken.
   - Comprehensive test pyramid: Unit, Supertest API, React Testing Library UI, and Playwright E2E suites passing 100%.

### 3.2 Explicitly Excluded from Lab 4 Scope
- Automated SLA breach countdown clocks, escalation engines, and on-call paging rotations.
- External notifications (SMS, Email, LINE Notify, Push Notifications).
- Hardware spare-parts inventory, asset stock deductions, and billing/timesheet payroll calculations.
- Multi-level corporate sign-off workflows and cryptographic digital signatures.
- Complex business intelligence report designers or external data warehouse ETL pipelines.
- Multi-tenant enterprise organizations and production cloud infrastructure deployments.

---

## 4. Functional Requirements

### 4.1 Actions Taken Requirements
- **FR-01 (Actions Taken Model)**: The system shall record child `ActionTaken` items under a parent `Ticket`, capturing `actionDateTime`, `actionDescription`, `result`, `performedById` (auto-bound to creator), `assigneeId` (optional assigned IT Staff or Administrator), `status`, `followUpRequired`, `followUpNote`, and `attachmentNotes`.
- **FR-02 (Action Performer Attribution)**: The system shall automatically bind the authenticated IT Staff or Administrator user ID to `performedById` upon creation and update.
- **FR-03 (Action Status Lifecycle)**: The system shall support lifecycle states for Actions Taken (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) with validated status transitions.
- **FR-04 (Follow-Up Validation)**: The system shall enforce that `followUpNote` is non-empty whenever `followUpRequired` is set to `true`.
- **FR-05 (Inactive Assignee Guard)**: The system shall permit assigning or reassigning an Action Taken to any active IT Staff or Administrator account (`assigneeId`), and shall reject assignment or reassignment to any user marked `isActive: false` or holding role `REQUESTER` with HTTP 422 Unprocessable Entity.
- **FR-06 (Requester Action Visibility)**: The system shall permit authenticated Requesters to view all Actions Taken items associated with their owned tickets in read-only mode, while prohibiting creation, modification, or status alteration.

### 4.2 Dashboard Requirements
- **FR-07 (Requester Dashboard Metrics)**: The system shall calculate authoritative Requester metrics: Total Open Tickets, Tickets Waiting for Requester, Recently Updated Tickets (within last 7 days), and Recently Resolved Tickets.
- **FR-08 (Requester Dashboard UI)**: The system shall render a dedicated Requester Dashboard featuring high-level metric cards, interactive drill-down buttons into `MyTicketsView`, a Recent Tickets table, and Quick Action buttons.
- **FR-09 (IT Staff Dashboard Metrics)**: The system shall calculate authoritative IT Staff metrics: Unassigned Tickets, Tickets Owned by Current User, Tickets by Status breakdown, Tickets by IT Priority breakdown, and Recently Updated Tickets.
- **FR-10 (IT Staff Dashboard UI)**: The system shall render a dedicated IT Staff Dashboard featuring clickable metric cards that filter `StaffTicketQueue`, an Urgent/Recent Tickets table, and operational Quick Actions.
- **FR-11 (Administrator Dashboard Metrics)**: The system shall calculate system user statistics (Total Users, Active IT Staff, Active Requesters, Inactive Accounts) alongside full IT Staff metrics for Administrator view.

### 4.3 Ticket Workflow & Resolution Gate Requirements
- **FR-12 (Advisory Resolution Indication)**: When a Requester submits `POST /api/tickets/:id/resolve-indication`, the system shall set `isResolutionIndicated: true` and post an automated public comment without altering the Ticket's `status` to `RESOLVED`.
- **FR-13 (Formal Resolution Authority)**: Only authenticated IT Staff or Administrators shall be authorized to transition a ticket to `RESOLVED` or `CLOSED` after reviewing recorded Actions Taken.
- **FR-14 (Stale Update Detection)**: The system shall detect concurrent updates on tickets and actions taken using record timestamps/versions, returning HTTP 409 Conflict if a client submits an update based on stale data.

### 4.4 Final Regression & System Hardening Requirements
- **FR-15 (Regression Continuity)**: All capabilities from Labs 1–3 (authentication, JWT rotation, mandatory password change, requester ticket creation, attachment upload/download, staff ticket queue, public comments, amber internal notes, administrator user management) shall function without regression.
- **FR-16 (Responsive & Accessible Design)**: All new and existing views shall adhere to the Zen Green design language, maintain visible keyboard focus, support semantic ARIA attributes, and ensure zero horizontal scrolling on mobile viewports (375px).

---

## 5. Business Rules

### 5.1 Actions Taken Business Rules
- **BR-01 (Single Parent Ownership)**: Each Action Taken record must belong to exactly one parent Ticket (`ticketId` is required and immutable).
- **BR-02 (Separation of Ticket Ownership & Action Execution)**: The Ticket Owner coordinates the ticket as a whole, but individual Actions Taken may be authored by `performedById` and assigned to different active IT Staff members via `assigneeId`.
- **BR-03 (Action Taken Status Machine)**: Permitted status transitions for an Action Taken:
  - `PENDING` -> `IN_PROGRESS`, `CANCELLED`
  - `IN_PROGRESS` -> `COMPLETED`, `CANCELLED`, `PENDING`
  - `COMPLETED` -> Final state (read-only audit trail; cannot be reopened)
  - `CANCELLED` -> Final state
- **BR-04 (Follow-up Completeness)**: If `followUpRequired` is `true`, `followUpNote` must contain at least 5 non-whitespace characters. If `followUpRequired` is `false`, `followUpNote` is optional or nullified.
- **BR-05 (Active Assignee & Performer Integrity)**: Actions Taken can only be created by active IT Staff/Admin, and `assigneeId` can only be set to active accounts (`isActive: true`) holding either `IT_STAFF` or `ADMINISTRATOR` role. Assigning or reassigning to an inactive user or a user with `REQUESTER` role is rejected with HTTP 422 Unprocessable Entity.
- **BR-06 (Requester Action Guard)**: Requesters attempting to create, update, or delete Actions Taken shall be rejected with HTTP 403 Forbidden.

### 5.2 Ticket Workflow & Resolution Gate Rules
- **BR-07 (8+1 Status Transition Matrix)**:
  - `NEW` -> `OPEN`, `CANCELLED` (IT Staff / Admin)
  - `OPEN` -> `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `PENDING`, `CANCELLED` (IT Staff / Admin)
  - `IN_PROGRESS` -> `WAITING_FOR_REQUESTER`, `PENDING`, `RESOLVED`, `CANCELLED` (IT Staff / Admin)
  - `WAITING_FOR_REQUESTER` -> `IN_PROGRESS`, `RESOLVED`, `CANCELLED` (IT Staff / Admin)
  - `PENDING` -> `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` (IT Staff / Admin)
  - `RESOLVED` -> `CLOSED` (IT Staff / Admin), `REOPENED` (Requester / IT Staff / Admin)
  - `REOPENED` -> `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` (IT Staff / Admin)
  - `CLOSED` -> Terminal state (no further transitions permitted)
  - `CANCELLED` -> Terminal state
- **BR-08 (Resolution Gate & Completed Work Verification)**:
  1. Requester problem resolution indication (`isResolutionIndicated: true`) is strictly advisory and logs an audit comment without closing or resolving the ticket.
  2. A Ticket cannot reach `RESOLVED` status without formal review and status change (`PATCH /api/tickets/:id/status`) executed by an IT Staff or Administrator.
  3. **Action Completion Precondition**: The backend strictly prohibits transitioning a ticket to `RESOLVED` if any child `ActionTaken` records under that ticket remain in `PENDING` or `IN_PROGRESS` status. All recorded actions must be finalized in either `COMPLETED` or `CANCELLED` state. Attempting to resolve a ticket with unfinished actions is rejected with HTTP 422 Unprocessable Entity (*"Cannot resolve ticket with pending or in-progress actions"*).

### 5.3 Dashboard Calculation Business Rules & Empty Behavior
- **BR-09 (Requester Dashboard Metric Boundaries & Empty States)**:
  - *My Open Tickets*: Count of tickets where `requesterId === authUserId` and `status IN ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'PENDING')`.
  - *Waiting for Requester*: Count of tickets where `requesterId === authUserId` and `status === 'WAITING_FOR_REQUESTER'`.
  - *Recently Updated*: Count of tickets where `requesterId === authUserId` updated within the last 7 calendar days.
  - *Recently Resolved*: Count of tickets where `requesterId === authUserId` and `status IN ('RESOLVED', 'CLOSED')` within the last 30 calendar days.
  - *Zero / Empty Metric Card Behavior*: When any metric count equals 0, the card displays a prominent "0" with a muted neutral border (`#E2E8F0`). Clicking the card navigates to `MyTicketsView` pre-filtered by that criterion, displaying a clear Zen Green empty state.
  - *Empty Recent Tickets Table Behavior*: When the requester has no tickets, the table renders a Zen Green empty container: *"No support requests found. Click '+ Submit New Request' to get IT support."*
- **BR-10 (IT Staff Dashboard Metric Boundaries & Empty States)**:
  - *Unassigned Tickets*: Count of active tickets where `ownerId IS NULL` and `status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')`.
  - *My Assigned Tickets*: Count of active tickets where `ownerId === authUserId` and `status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')`.
  - *Status Counts*: Precise counts for `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `PENDING`.
  - *Priority Counts*: Precise counts for active tickets grouped by `itPriority` (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).
  - *Zero / Empty Metric Card Behavior*: When a count is 0 (e.g. 0 unassigned tickets), the card displays "0" in neutral styling. Clicking the card drills down into `StaffTicketQueue` with matching query filters, showing the empty queue state (*"No tickets match the selected filters"*).
  - *Empty Urgent / Recent Tickets Table Behavior*: When no urgent tickets exist, the dashboard displays: *"Queue is clear. No urgent tickets require immediate attention."*

---

## 6. UI Specification Summary

### 6.1 Screen Architecture & Modes
- **Requester Dashboard (`/dashboard/requester`)**:
  - Welcome banner with user greeting and role badge.
  - 4 high-contrast Metric Cards with numeric value, trend/context subtitle, and "View all" drill-down link.
  - "My Recent Tickets" list showing Ticket No, Summary, Status Badge, Updated Date, and View action.
  - "Quick Actions" side widget: "+ Create Ticket" and "View My Tickets".
- **IT Staff Dashboard (`/dashboard/staff`)**:
  - Operational banner with active triage summary.
  - Primary Metric Cards: Unassigned, My Assigned, New, In Progress, Waiting for Requester.
  - Secondary Metrics Widget: IT Priority Distribution (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).
  - "Urgent & Recent Tickets" triage table with direct links to Ticket Detail.
  - "Quick Actions" side widget: "Search Tickets", "My Assigned Queue", "Unassigned Queue".
- **Actions Taken Panel on Ticket Detail (`/tickets/:id`)**:
  - Positioned prominently below ticket operations panel, above communication tabs.
  - Table view on desktop, card view on mobile.
  - Columns: Date/Time, Description, Result, Performed By (Creator), Assigned To (Assignee Staff/Admin), Status Badge, Follow-up indicator, Actions ("Edit", "Update Status").
  - "+ Add Action Taken" button (hidden from Requesters).
  - Create / Edit Modal with form validation, assignee selector (active IT Staff / Admin), follow-up toggle, follow-up note input, and attachment references.
- **Ticket Workflow & Resolution Indicator**:
  - Prominent Green Banner when `isResolutionIndicated === true` alerting IT Staff that requester reported resolution.
  - Status transition select strictly restricted to permitted transitions per BR-07.
  - Inline error banner when attempting to transition to `RESOLVED` while actions remain in `PENDING` or `IN_PROGRESS`: *"Cannot resolve ticket: all child actions taken must be completed or cancelled first."*

### 6.2 Responsive & Accessibility Rules
- **Desktop (>= 992px)**: Multi-column grid for dashboard metric cards (4 cards per row), comprehensive data tables.
- **Tablet (768px - 991px)**: 2x2 grid for metric cards, scrollable or condensed table columns.
- **Mobile (< 768px)**: 1-column stacked metric cards, stacked card items for Recent Tickets and Actions Taken, sticky touch-friendly buttons (minimum 44px x 44px), zero horizontal page overflow at 375px width.

---

## 7. Data Changes & Schema Decisions

### 7.1 Prisma Schema Evolution
The Prisma schema is extended with the `ActionTaken` model and `ActionTakenStatus` enum while preserving all existing tables and relations:

```prisma
enum ActionTakenStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model ActionTaken {
  id                Int               @id @default(autoincrement())
  ticketId          Int
  actionDateTime    DateTime          @default(now())
  actionDescription String            @db.Text
  result            String?           @db.Text
  performedById     Int
  assigneeId        Int?
  status            ActionTakenStatus @default(COMPLETED)
  followUpRequired  Boolean           @default(false)
  followUpNote      String?           @db.Text
  attachmentNotes   String?           @db.Text
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  ticket            Ticket            @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  performedBy       User              @relation("ActionPerformer", fields: [performedById], references: [id])
  assignee          User?             @relation("ActionAssignee", fields: [assigneeId], references: [id])

  @@index([ticketId])
  @@index([performedById])
  @@index([assigneeId])
  @@index([actionDateTime])
}

// User model relations extended:
// actionsPerformed ActionTaken[] @relation("ActionPerformer")
// actionsAssigned  ActionTaken[] @relation("ActionAssignee")
```

### 7.2 Database Design Decisions Justification (Handout Section 5.1 Requirement)
1. **Decision 1: Foreign Key Integer Alignment with Lab 2 Ticket ID (`ticketId: Int`)**:
   - *Rationale*: In Lab 2, `Ticket.id` was established as an autoincrement integer. By defining `ActionTaken.ticketId` as `Int` with `@relation(fields: [ticketId], references: [id])`, we maintain full referential integrity and foreign key constraints without requiring costly schema alterations, type casts, or risky migrations on legacy ticket data.
2. **Decision 2: Separation of `ActionTaken` from `InternalNote` and `PublicComment`**:
   - *Rationale*: Actions Taken represent formal units of IT engineering work with structured fields (timestamps, results, follow-up flags, completion status, attachment notes), whereas Comments and Notes represent unstructured communication threads. Creating an explicit `ActionTaken` entity enables granular operational metrics (such as actions per ticket or staff workload) and prevents polluting public conversation history.
3. **Decision 3: Non-Destructive Nullable Legacy Support**:
   - *Rationale*: All newly introduced dashboard queries and ticket detail views use outer joins (`include: { actionsTaken: true }`), ensuring legacy tickets created during Labs 1–3 without Actions Taken continue to render and compute with zero errors or schema backfill corruption.

### 7.3 Migration Strategy, Rollback Procedure & Disaster Recovery Plan (Handout Section 5.2 Requirement)
- **Forward Migration Execution**:
  ```bash
  npx prisma migrate dev --name lab4_actions_taken
  npx prisma migrate deploy
  ```
- **Rollback Procedure**:
  In the event of a migration anomaly or deployment rollback, execute the reverse SQL down-migration script:
  ```sql
  -- Rollback DDL: Drop ActionTaken table and enum type safely
  DROP TABLE IF EXISTS "ActionTaken" CASCADE;
  DROP TYPE IF EXISTS "ActionTakenStatus";
  ```
  After executing the SQL rollback, resolve the migration record in Prisma:
  ```bash
  npx prisma migrate resolve --rolled-back 20261030000000_lab4_actions_taken
  ```
  Revert `schema.prisma` to the Lab 3 commit and regenerate the client (`npx prisma generate`).
- **Disaster Recovery & Non-Destructive Data Preservation**:
  - Before applying any DDL changes in production or staging, create an automated logical database backup:
    ```bash
    pg_dump -U postgres -d toktickit -Fc -f backup_pre_lab4.dump
    ```
  - Point-in-Time Recovery (PITR): If database inconsistency occurs, restore from `backup_pre_lab4.dump` using `pg_restore -c -d toktickit backup_pre_lab4.dump`.
  - Legacy Ticket Behavior: Existing tickets from Labs 1–3 contain zero actions (`actionsTaken: []`). All queries use nullable foreign keys and outer joins so legacy tickets continue to function without data loss or backfill corruption.

---

## 8. REST API Contract Summary

| Method | Endpoint | Authorized Roles | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets/:id/actions` | All (Requester owned only; IT Staff / Admin all) | List all Actions Taken for ticket | 200, 401, 403, 404 |
| `POST` | `/api/tickets/:id/actions` | IT Staff, Administrator | Create Action Taken (binds creator, validates assignee & follow-up) | 201, 400, 401, 403, 404, 422 |
| `PUT` | `/api/tickets/:id/actions/:actionId` | IT Staff, Administrator | Update Action Taken (description, result, assignee, follow-up) | 200, 400, 401, 403, 404, 409, 422 |
| `PATCH` | `/api/tickets/:id/actions/:actionId/status` | IT Staff, Administrator | Transition status of Action Taken | 200, 400, 401, 403, 404, 422 |
| `GET` | `/api/dashboard/requester` | Requester | Authoritative Requester metrics & recent tickets | 200, 401, 403 |
| `GET` | `/api/dashboard/staff` | IT Staff, Administrator | Authoritative IT Staff operational metrics & urgent tickets | 200, 401, 403 |
| `GET` | `/api/dashboard/admin` | Administrator | System-wide metrics, user statistics, and queue triage | 200, 401, 403 |

Full request/response schemas, validation payloads, and conflict rules are documented in [`docs/lab-04/api-spec.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-04/api-spec.md).

---

## 9. Acceptance Criteria

- **AC-01 (Create Action Taken)**: Given an authenticated IT Staff or Admin user and valid action payload, when `POST /api/tickets/:id/actions` is called, then a new `ActionTaken` record is created, automatically binding `performedById` to the authenticated user, saving `assigneeId` if provided, and returning HTTP 201.
- **AC-02 (Follow-up Validation Guard)**: Given an IT Staff user submitting an Action Taken with `followUpRequired: true`, when `followUpNote` is empty or missing, then the request is rejected with HTTP 400 and inline validation feedback.
- **AC-03 (Requester Action Isolation)**: Given an authenticated Requester, when attempting to create, edit, or delete an Action Taken via API or UI, then the request is rejected with HTTP 403 Forbidden.
- **AC-04 (Action Status Transitions)**: Given an IT Staff user, when transitioning an Action Taken status from `PENDING` to `IN_PROGRESS` or `COMPLETED`, then the status updates cleanly and reflects immediately in the UI.
- **AC-05 (Inactive Assignee Rejection)**: Given an attempt to assign or reassign an Action Taken to a deactivated user (`isActive: false`) or a user with `REQUESTER` role, then the system rejects the operation with HTTP 422 Unprocessable Entity.
- **AC-06 (Requester Dashboard Metrics)**: Given an authenticated Requester with tickets in various states, when visiting `/dashboard/requester`, then the dashboard displays accurate counts for Open, Waiting, Recently Updated, and Recently Resolved tickets matching database records, with clean "0" display when counts are zero.
- **AC-07 (Requester Dashboard Drill-down)**: Given a Requester viewing their dashboard, when clicking on any metric card (even with count 0), then the user is navigated to `MyTicketsView` with appropriate status filters applied.
- **AC-08 (IT Staff Dashboard Metrics)**: Given an authenticated IT Staff member, when visiting `/dashboard/staff`, then the dashboard renders correct counts for Unassigned, My Assigned, Status breakdown, and IT Priority distribution, displaying neutral empty styling when counts are zero.
- **AC-09 (IT Staff Dashboard Drill-down)**: Given an IT Staff member clicking on the "Unassigned Tickets" metric card, then the user is navigated to `StaffTicketQueue` with the owner filter set to `Unassigned`.
- **AC-10 (Resolution Gate & Completed Action Enforcement)**: Given a ticket where the Requester indicated problem resolution (`isResolutionIndicated: true`), when viewing the ticket detail, then an advisory alert banner is shown. When an IT Staff member attempts to transition the ticket to `RESOLVED`, the system permits the transition ONLY IF all child Actions Taken are in `COMPLETED` or `CANCELLED` status; if any action remains `PENDING` or `IN_PROGRESS`, the transition is blocked with HTTP 422 Unprocessable Entity.
- **AC-11 (Stale Update Detection)**: Given two concurrent users updating the same Action Taken or Ticket, when the second user submits changes based on an outdated timestamp, then the system detects the conflict and returns HTTP 409.
- **AC-12 (Full Product Regression)**: Given the existing automated test suite from Labs 1–3, when running the full test command, all 277 regression tests plus new Lab 4 tests pass with 100% green verification.

---

## 10. Product Definition of Done (DoD)
A feature or pull request in Lab 4 is considered **Done** only when:
1. **Specification Adherence**: Matches all requirements in `specification.md`, `ui-spec.md`, and `api-spec.md`.
2. **Automated Test Coverage**: Accompanied by passing unit, API integration, and RTL UI component tests with zero test skips.
3. **TypeScript & Build Verification**: Passes `tsc --noEmit` and `npm run build` with zero compiler errors.
4. **Code Quality & Aesthetics**: Adheres strictly to the Zen Green design tokens; zero horizontal scrolling on mobile (375px); visible keyboard focus rings.
5. **Git Workflow Compliance**: Authored on a dedicated feature branch, proposed via PR into `lab4-staging`, formally reviewed and merged by peer reviewer `@lmaybelgracel`.

---

## 11. Assumptions and Architectural Decisions
1. **Advisory Indication Persistence**: The `isResolutionIndicated` flag introduced in Lab 3 remains permanent on the ticket record until explicitly cleared or until the ticket is transitioned to `RESOLVED` / `CLOSED`.
2. **Dashboard Query Performance**: Dashboard counts utilize indexed Prisma `count()` aggregations to maintain sub-50ms query response times even with large ticket datasets.
3. **Action Performer Immutability**: The `performedById` reflects the original creator of the action, while reassignments to other IT Staff members for follow-up work are tracked via explicit assignment fields and update history.
