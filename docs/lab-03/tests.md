# Lab 3 Test Engineering & Traceability Matrix

## 1. Test Traceability Matrix

| Requirement / AC | Description | Test Type | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- |
| **AC-01** | Valid user login establishes session | API / E2E | `server/tests/lab-03/auth.api.test.ts` | Planned |
| **AC-02** | Mandatory first-login password change enforcement | API / E2E | `e2e/lab-03/authentication.spec.ts` | Planned |
| **AC-03** | Requester ticket ownership & data isolation | API / Sec | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| **AC-04** | Internal Notes hidden from Requesters (403 Forbidden) | API / Sec | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| **AC-05** | IT Staff Ticket Queue query, search, filter, sort, pagination | API / UI | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| **AC-06** | Ticket ownership claim and assignment by IT Staff | API / UI | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| **AC-07** | Permitted status transition matrix enforcement | API / Unit | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| **AC-08** | Internal Notes creation and visibility restricting | API / UI | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| **AC-09** | Admin User Management list, search, role filtering | API / UI | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| **AC-10** | Admin User creation with initial password | API / UI | `client/tests/lab-03/UserManagement.test.tsx` | Planned |
| **AC-11** | Admin self-deactivation rejection | API / Unit | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| **AC-12** | Last active Admin removal protection | API / Unit | `server/tests/lab-03/users-admin.api.test.ts` | Planned |

---

## 2. Planned Test Suite Structure

### Backend Integration & Security Tests (`server/tests/lab-03/`)
- `auth.api.test.ts`: Login, logout, session retrieval, password change validation.
- `authorization.api.test.ts`: Role-based route protection, session isolation.
- `staff-queue.api.test.ts`: Filtering by category/status/IT priority, search, sorting, pagination.
- `staff-ticket-detail.api.test.ts`: Claiming, assigning, IT priority change, status transition matrix validation.
- `comments-notes.api.test.ts`: Public Comments vs Internal Notes security visibility checks.
- `users-admin.api.test.ts`: Admin CRUD, safety validation (self-deactivation & last admin check).

### Frontend UI Component Tests (`client/src/tests/lab-03/` or `client/tests/lab-03/`)
- `Login.test.tsx`: Login form validation, error state rendering, busy state.
- `ChangePassword.test.tsx`: Password criteria validation, submit handlers.
- `StaffTicketQueue.test.tsx`: Search input, filter drawer, column sorting, pagination interaction.
- `StaffTicketDetail.test.tsx`: Public Comments vs Internal Notes tab rendering and forms.
- `UserManagement.test.tsx`: User table, search, Create/Edit drawers, Reset Password modal.

### End-to-End Tests (`e2e/lab-03/`)
- `authentication.spec.ts`: Full E2E flow from login to mandatory password change.
- `staff-ticket-flow.spec.ts`: E2E IT Staff queue navigation, claiming ticket, updating status, adding note.
- `user-administration.spec.ts`: E2E Admin user creation, search, edit role, and reset password.
