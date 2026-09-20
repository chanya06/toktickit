# Lab 3 Test Engineering & Traceability Matrix

## 1. Test DD & Traceability Table

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API-01** | API | AC-01 / FR-01 | Valid user login | Authenticated response; safe user data | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-02** | API | AC-01 / FR-02 | Inactive user login attempt | 401 Unauthorized; safe error feedback | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-03** | API | AC-02 / FR-03 | Forced initial password change API | Blocks normal routes until password updated | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-04** | API | AC-03 / FR-07 | Session-based Requester data isolation | 403 Forbidden on cross-requester access | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| **API-05** | API | AC-04 / FR-14 | Requester requests Internal Notes endpoint | Forbidden (403); no note content returned | `server/tests/lab-03/comments-notes.api.test.ts` | Pass |
| **API-06** | API | AC-05 / FR-10 | IT Staff Ticket Queue search, filter, pagination | Correct filtered list and pagination JSON | `server/tests/lab-03/staff-queue.api.test.ts` | Pass |
| **API-07** | API | AC-06 / FR-11 | Ticket ownership claim and reassignment | Owner updated to claimed/assigned user | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| **API-08** | API | AC-07 / FR-13 | Permitted status transition matrix enforcement | Invalid status change rejected with 422 | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| **API-09** | API | AC-08 / FR-14 | Creating & fetching Internal Notes by IT Staff | 201 Created; notes returned for IT Staff/Admin | `server/tests/lab-03/comments-notes.api.test.ts` | Pass |
| **API-10** | API | AC-09 / FR-15 | Admin User list retrieval with search & role filter | Paginated user list returned | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-11** | API | AC-10 / FR-16 | Admin User creation with initial password | User created with `mustChangePassword: true` | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-12** | API | AC-11 / FR-19 | Admin self-deactivation attempt | Rejection (422 Unprocessable Entity) | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-13** | API | AC-12 / FR-20 | Last active Admin removal attempt | Rejection (422 Unprocessable Entity) | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-14** | API | FR-09 / BR-19 | Requester "Problem Appears Resolved" endpoint | Sets `isResolutionIndicated: true` & posts comment | `server/tests/lab-03/requester-resolution.api.test.ts`<br>`client/tests/lab-03/RequesterResolution.test.tsx` | Pass |
| **UI-01** | UI | AC-01 / FR-01 | Login Form rendering and validation | Busy state, inline validation errors | `client/tests/lab-03/Login.test.tsx` | Pass |
| **UI-02** | UI | AC-02 / FR-03 | Change Password screen requirements checklist | Checks uppercase, number, special char | `client/tests/lab-03/ChangePassword.test.tsx` | Pass |
| **UI-03** | UI | AC-05 / FR-10 | IT Staff Ticket Queue controls & badges | Filters, sorting, role/status badges | `client/tests/lab-03/StaffTicketQueue.test.tsx` | Pass |
| **UI-04** | UI | AC-06..08 / FR-11..14 | IT Staff Operations & Detail controls | Quick claim, owner/priority/status controls, distinct comments vs internal notes | `client/tests/lab-03/StaffTicketDetail.test.tsx`<br>`client/tests/lab-03/CommentsNotes.test.tsx` | Pass |
| **UI-05** | UI | AC-09 / FR-15 | Admin User Management table & Create User modal | User list, modal validations | `client/tests/lab-03/UserManagement.test.tsx` | Pass |
| **E2E-01** | E2E | AC-01 / AC-02 | Login to Mandatory Password Change E2E flow | Normal app opens only after password change | `e2e/lab-03/authentication.spec.ts` | Pass |
| **E2E-02** | E2E | AC-05 / AC-06 | IT Staff Ticket Queue & Ownership Claim E2E | IT Staff logs in, claims ticket, updates status | `e2e/lab-03/staff-ticket-flow.spec.ts` | Pass |
| **E2E-03** | E2E | AC-09..AC-12 | Admin User Management creation & safety E2E | Admin creates user, edits info, resets password | `e2e/lab-03/user-administration.spec.ts` | Pass |

---

## 2. Test Suite File Map

### Backend Integration & Security Tests (`server/tests/lab-03/`)
- `auth.api.test.ts`: Login, logout, session retrieval, password change validation.
- `authorization.api.test.ts`: Role-based route protection, session isolation.
- `requester-resolution.api.test.ts`: Requester resolution indication endpoint, PublicComment logging, status validation, atomic transaction.
- `staff-queue.api.test.ts`: Filtering by category/status/IT priority, search, sorting, pagination.
- `staff-ticket-detail.api.test.ts`: Claiming, assigning, IT priority change, status transition matrix validation.
- `comments-notes.api.test.ts`: Public Comments vs Internal Notes security visibility checks.
- `users-admin.api.test.ts`: Admin CRUD operations (API-10..13), fullName/name sync, department support, password reset, and safety validation (self-deactivation & last admin check).

### Frontend UI Component Tests (`client/tests/lab-03/`)
- `Login.test.tsx`: Login form validation, error state rendering, busy state.
- `ChangePassword.test.tsx`: Password criteria validation, submit handlers.
- `RequesterResolution.test.tsx`: Resolution indication action button, confirmation modal with notes, status banner and badge.
- `StaffTicketQueue.test.tsx`: Search input, filter drawer, column sorting, pagination interaction.
- `StaffTicketDetail.test.tsx`: Ticket claim, owner reassignment, IT Priority update, BR-14 status matrix enforcement, Public Comments vs Internal Notes.
- `CommentsNotes.test.tsx`: Public Comments tab rendering, comment posting, Internal Notes amber callout, requester security isolation.
- `UserManagement.test.tsx`: Administrator user directory table, debounced search, role filtering, pagination, Create User modal with password checklist, Edit User modal with self-deactivation & last admin safety protection (BR-07, BR-08), and Reset Initial Password modal (FR-18).

### End-to-End Tests (`e2e/lab-03/`)
- `authentication.spec.ts`: Full E2E flow from login to mandatory password change.
- `staff-ticket-flow.spec.ts`: E2E IT Staff queue navigation, claiming ticket, updating status, adding note.
- `user-administration.spec.ts`: E2E Admin user creation, search, edit role, and reset password.
- `capture-screenshots.spec.ts`: Responsive screenshot captures across Desktop (1280x800), Tablet (768x1024), and Mobile (375x667) viewports for Screens 1–5, including modals and tab states.

---

## 3. Test Execution Summary & Verification Metrics

| Test Suite | Framework | Files / Specs | Total Tests | Status | Execution Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Integration & Security** | Vitest + Supertest | 15 test files | 149 passed | **100% Pass** | ~11.5s |
| **Frontend UI Components** | Vitest + React Testing Library | 15 test files | 116 passed | **100% Pass** | ~14.8s |
| **End-to-End & Acceptance** | Playwright (Chromium) | 4 spec files | 12 passed | **100% Pass** | ~25.9s |
| **Responsive Artifacts** | Playwright Screenshot Suite | Screens 1–5 | 21 screenshots | **Completed** | Full coverage |
| **Build & Type Check** | TypeScript `tsc` + Vite | Client & Server | Clean build | **Passed** | 0 errors |

