# Lab 4 Test Engineering & Traceability Matrix

## 1. Test DD & Acceptance-Criterion Traceability Table

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API-01** | API | AC-01 / FR-01 | Create Action Taken under Ticket by IT Staff | 201 Created; record persisted with performedBy | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-02** | API | AC-02 / FR-04 | Follow-up required validation guard | 400 Bad Request if followUpNote is empty | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-03** | API | AC-03 / FR-06 | Requester attempts Action Taken creation | 403 Forbidden; no action record created | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-04** | API | AC-04 / FR-03 | Action Taken status lifecycle transitions | 200 OK; status transitions PENDING -> COMPLETED | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-05** | API | AC-05 / BR-05 | Inactive assignee assignment rejection | 422 Unprocessable Entity | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-06** | API | AC-11 / FR-14 | Stale update optimistic concurrency detection | 409 Conflict if expectedUpdatedAt is stale | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-07** | API | AC-06 / FR-07 | Requester dashboard metrics calculation | 200 OK; accurate counts isolated to auth user | `server/tests/lab-04/requester-dashboard.api.test.ts` | Planned |
| **API-08** | API | AC-08 / FR-09 | IT Staff dashboard metrics calculation | 200 OK; unassigned, my assigned, status/priority | `server/tests/lab-04/staff-dashboard.api.test.ts` | Planned |
| **API-09** | API | AC-10 / FR-12 | Requester resolution indication advisory gate | 200 OK; sets isResolutionIndicated: true; NOT resolved | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **API-10** | API | AC-10 / FR-13 | Formal ticket status transition to RESOLVED | 200 OK for IT Staff; requires action verification | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **UI-01** | UI | AC-01 / FR-01 | Actions Taken table & list rendering on Ticket Detail | Renders date, description, performer, status | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned |
| **UI-02** | UI | AC-02 / FR-04 | Create Action Taken modal & follow-up toggle validation | Dynamically requires follow-up note input | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned |
| **UI-03** | UI | AC-03 / FR-06 | Requester view hides "+ Add Action" and edit buttons | Read-only presentation for Requesters | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned |
| **UI-04** | UI | AC-06 / FR-08 | Requester Dashboard metric cards & drill-down links | Metric values render; clicking card navigates to queue | `client/tests/lab-04/RequesterDashboard.test.tsx` | Planned |
| **UI-05** | UI | AC-08 / FR-10 | IT Staff Dashboard cards, urgent list, and quick actions | Unassigned, My Assigned, priority breakdown render | `client/tests/lab-04/StaffDashboard.test.tsx` | Planned |
| **UI-06** | UI | AC-10 / FR-12 | Ticket Resolution Gate advisory banner & controls | Banner shows requester report; status dropdown restricted | `client/tests/lab-04/TicketWorkflow.test.tsx` | Planned |
| **E2E-01** | E2E | AC-01 / AC-04 | Complete Actions Taken workflow (Create -> Edit -> Complete) | IT Staff records action and marks completed | `e2e/lab-04/actions-taken-flow.spec.ts` | Planned |
| **E2E-02** | E2E | AC-10 / FR-12 | Advisory Resolution Gate & Formal Resolution flow | Requester indicates resolved; IT Staff verifies & closes | `e2e/lab-04/ticket-resolution.spec.ts` | Planned |
| **E2E-03** | E2E | AC-06 / AC-08 | Multi-role Dashboard verification and drill-down navigation | Requester & Staff dashboards reflect real queue data | `e2e/lab-04/dashboards.spec.ts` | Planned |
| **REG-01** | Reg | FR-15 | Full Lab 1–3 Regression Suite (277 automated tests) | 100% pass across Auth, Queue, Comments, Admin | `server/tests/`, `client/tests/`, `e2e/` | Planned |

---

## 2. Test Suite File Map

### Backend Integration & Security Tests (`server/tests/lab-04/`)
- `actions-taken.api.test.ts`: CRUD operations, performer binding, follow-up validation, inactive user rejection, optimistic locking.
- `ticket-workflow.api.test.ts`: Permitted status transition matrix, advisory resolution gate, role restrictions.
- `requester-dashboard.api.test.ts`: Requester metric queries, date boundaries, tenant session isolation.
- `staff-dashboard.api.test.ts`: Operational queue metrics, unassigned/assigned logic, priority breakdowns.

### Frontend UI Component Tests (`client/tests/lab-04/`)
- `ActionsTaken.test.tsx`: Actions list rendering, Create/Edit modal forms, follow-up conditional validation, requester read-only mode.
- `RequesterDashboard.test.tsx`: Metric cards, recent tickets list, quick action buttons, drill-down router triggers.
- `StaffDashboard.test.tsx`: Operational metric cards, urgent ticket triage table, queue filter shortcuts.
- `TicketWorkflow.test.tsx`: Advisory resolution banner, status transition select restrictions, state machine feedback.

### End-to-End Tests (`e2e/lab-04/`)
- `actions-taken-flow.spec.ts`: E2E IT Staff logs in, opens ticket, adds Action Taken, updates outcome, transitions action to COMPLETED.
- `ticket-resolution.spec.ts`: E2E Requester reports issue resolved; IT Staff inspects actions taken, executes formal resolution, closes ticket.
- `dashboards.spec.ts`: E2E role-based landing, metric verification, and drill-down navigation into detailed filtered lists.

---

## 3. Test Execution Summary & Verification Metrics

| Test Suite | Target Framework | Expected Tests | Expected Status |
| :--- | :--- | :--- | :--- |
| **Lab 4 Backend Integration** | Vitest + Supertest | ~35 tests | Pending Implementation |
| **Lab 4 Frontend UI Components** | Vitest + React Testing Library | ~30 tests | Pending Implementation |
| **Lab 4 Playwright E2E** | Playwright (Chromium) | ~10 tests | Pending Implementation |
| **Labs 1–3 Regression Suites** | Vitest + Supertest + RTL + E2E | 277 tests | Must Remain 100% Green |
| **Total Automated Coverage** | Full Test Pyramid | > 350 tests | Target: 100% Passing |
