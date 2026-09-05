# Lab 2 Test Plan and Traceability Matrix

This document defines the test strategy, planned automated tests, acceptance criteria traceability matrix, responsive visual checklist, execution commands, and test verification results for **TokTickIT Lab 2**.

---

## 1. Test Strategy

The testing strategy validates the entire full-stack application across five distinct levels:
1. **Unit Tests (`server/tests/lab-02/unit/`)**: Verify ticket number generation formats in isolation.
2. **API Integration Tests (`server/tests/lab-02/`)**: Test REST API endpoints using Vitest & Supertest against PostgreSQL test database. Verifies validation rules, ownership enforcement (403/404), initial attachment upload with disk rollback compensation, download stream, and soft-removal metadata handling.
3. **UI Component Tests (`client/tests/lab-02/`)**: Test React components using React Testing Library & Vitest. Verifies component rendering, user interactions, form validation error messages, initial attachments dropzone with drag-and-drop, submitting busy states, and modal dialogs.
4. **UI Style & Responsive Tests (`client/tests/lab-02/`)**: Verify CSS Zen Green color token assertions, element accessibility, asterisk markers, and field error placement.
5. **Playwright E2E Tests (`e2e/lab-02/`)**: Full browser end-to-end user journey tests validating Requester selection, ticket creation, initial file upload, My Tickets pagination/filtering, ticket detail inspection, soft removal with min 3-char reason validation, and post-removal download stream blocking.

---

## 2. Planned Test Table

| Test ID | Level | Requirement / AC | What It Tests | Expected Result | Automated Test File Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-01** | Unit | BR-01, FR-04 | Ticket number format generator | Returns string matching `TKT-\d{4}-\d{6}` | `server/tests/lab-02/unit/ticket-number.test.ts` | Pass |
| **UNIT-02** | Unit | BR-10, BR-11 | Attachment file validation & rollback logic | Rejects files >5MB or non-image/pdf, cleans disk | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-01** | API | AC-01, FR-04 | Ticket creation endpoint `POST /api/tickets` | Returns 201 Created with valid Ticket payload & ticketNumber | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-02** | API | AC-01, BR-07 | Ticket creation missing summary | Returns 400 Bad Request with validation errors | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-03** | API | AC-03, FR-12 | Paginated My Tickets `GET /api/tickets?requesterId=1` | Returns 200 OK with tickets owned by Requester 1 | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-04** | API | AC-08, FR-13 | Search & filter My Tickets `GET /api/tickets` | Filters tickets matching search term & category | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-05** | API | AC-04, FR-15 | Owned ticket detail access `GET /api/tickets/:id` | Returns 200 for owner; returns 403/404 for non-owner | `server/tests/lab-02/ticket-detail.api.test.ts` | Pass |
| **API-06** | API | FR-07, BR-10 | Attachment upload `POST /api/tickets/:id/attachments` | Uploads file and returns attachment metadata | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-07** | API | AC-06, BR-11 | Exceeding 5 active attachments limit | Fails with 422 Unprocessable Entity error | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-08** | API | AC-05, BR-12 | Soft-remove attachment with reason | Sets `isRemoved: true` and blocks future download stream | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **UI-01** | UI | AC-02, FR-01 | Development Requester selector screen | Renders active requesters dropdown and persists selection | `client/tests/lab-02/RequesterSelect.test.tsx` | Pass |
| **UI-02** | UI | AC-01, FR-03 | Create Ticket form rendering & submission | Submits valid form, shows dropzone & busy state | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-03** | UI | AC-07, BR-16 | Form submission validation error feedback | Displays inline red error messages, preserves form input | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-04** | UI | AC-03, FR-14 | My Tickets table, search bar, & filter controls | Updates list upon typing search term or changing category | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| **UI-05** | UI | AC-09, FR-05 | Ticket Detail read-only layout & Ticket Date | Displays immutable ticket info, Ticket Date, & attachment list | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | Pass |
| **UI-06** | UI | AC-05, BR-13 | Soft removal modal prompt & reason validation | Requires reason text before soft-remove confirmation | `client/tests/lab-02/AttachmentSection.test.tsx` | Pass |
| **STYLE-01**| Style | Section 7 | Zen Green CSS class assertions & dark text | Verifies `#006B3C` primary classes & contrast | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| **E2E-01** | E2E | AC-01..10 | Full Requester journey Playwright test | Complete workflow: selector, creation, dropzone, soft removal, stream block | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |

---

## 3. Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Primary Validating Test(s) |
| :--- | :--- |
| **AC-01** (Create Ticket with Ticket Number & Date) | `UNIT-01`, `API-01`, `UI-02`, `E2E-01` |
| **AC-02** (Requester Selector required when unselected) | `UI-01`, `E2E-01` |
| **AC-03** (My Tickets owned tickets filtering) | `API-03`, `UI-04`, `E2E-01` |
| **AC-04** (Cross-Requester Ticket Access Blocked) | `API-05`, `E2E-01` |
| **AC-05** (Soft removal with reason & blocked download) | `API-08`, `UI-06`, `E2E-01` |
| **AC-06** (Max 5 active attachments limit) | `UNIT-02`, `API-07` |
| **AC-07** (File size & type restriction validation) | `UNIT-02`, `UI-03` |
| **AC-08** (Search term in My Tickets) | `API-04`, `UI-04`, `E2E-01` |
| **AC-09** (Ticket Date displayed on screens) | `API-01`, `UI-02`, `UI-05` |
| **AC-10** (Form values preserved on submission failure) | `UI-03` |

---

## 4. Responsive and Visual Inspection Checklist

- [x] **Desktop (1280px)**: 2-column grid layout, centered container, full data table in My Tickets. No horizontal scrolling.
- [x] **Tablet (768px)**: 2-column form fields, wrap-around filter dropdowns, responsive table layout.
- [x] **Mobile (375px)**: Single column stacked layout, ticket table transformed into mobile card view, full-width touch targets (>=44px).
- [x] **Zen Green Palette**: Header & Primary buttons (`#006B3C`), Active/Focus (`#0B7A46`), Pale BG (`#EAF6EF`), Page BG (`#F5F7F6`).
- [x] **Form States**: Required field red asterisks, inline error text below invalid fields, preserved inputs on error.

---

## 5. Test Commands

```bash
# 1. Run database migrations & seed
cd server && npx prisma migrate dev && npm run seed

# 2. Run backend API & Unit tests
cd server && npm run test

# 3. Run frontend Component & Style tests
cd client && npm run test

# 4. Run Playwright E2E tests
npx playwright test e2e/lab-02/
```

---

## 6. Final Execution Results

All automated tests passed successfully on `feature/14-qa-release` branch (targeting `lab2-staging`).
- Server Unit & API Integration Tests: **54 / 54 passed**
- Client Component & UI Style Tests: **42 / 42 passed**
- Playwright E2E Tests: **4 / 4 passed**
- Total Automated Test Coverage: **100% of Acceptance Criteria covered across 100 automated tests**.

---

## 7. Known Limitations or Deferred Tests

The following features and test scenarios are explicitly excluded from Lab 2 and deferred to Lab 3 or later sprints as per Section 4.2 of the Lab 2 Handout:
1. **Real Authentication & Security**: Login, logout, passwords, password hashing, sessions, JWT tokens, and real role-based authorization. Lab 2 uses a temporary Development Requester selector strictly for testing context switching.
2. **IT Staff Workflow**: IT Staff dashboard and queue, claiming or reassigning tickets, updating IT Priority, and resolving/closing tickets.
3. **Collaboration & Work Tracking**: Public Comments, Internal Notes, and Actions Taken on Ticket Details.
4. **Ticket Lifecycle Transitions**: Ticket status changes beyond the initial `NEW` status (e.g. `OPEN`, `IN_PROGRESS`, `PENDING`, `RESOLVED`, `CLOSED`).
5. **Administration Functions**: Administrator management of users, Requesters, roles, categories, and reference data.
