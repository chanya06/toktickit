# Lab 2 Peer Review Record

## Reviewer Information
- **Reviewer Identity**: Peer Reviewer (Course Peer Reviewer)
- **Review Date**: 2026-09-01
- **Target Branch**: `lab2-staging` -> `main`

---

## Pull Request Log

| PR # | Feature Branch | Description / Scope | Status | Reviewer Approval |
| :--- | :--- | :--- | :--- | :--- |
| **PR-01** | `feature/lab2-spec-docs` | Add Lab 2 engineering specifications (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`) | Merged | Approved |
| **PR-02** | `feature/lab2-db-schema` | Prisma schema update for DevelopmentRequester, Ticket, Attachment models and seed script | Merged | Approved |
| **PR-03** | `feature/lab2-ticket-api` | Express REST API endpoints, ticket number generator, ownership checks, attachment handling | Merged | Approved |
| **PR-04** | `feature/lab2-ticket-ui` | Zen Green React UI components (Requester selector, Create Ticket, My Tickets, Ticket Detail) | Merged | Approved |
| **PR-05** | `feature/lab2-e2e-visual` | E2E Playwright test suite & visual evidence screenshots | Merged | Approved |
| **PR-06** | `release/lab-02` | Release Lab 2 MVP from `lab2-staging` into `main` | Merged | Approved |

---

## Review Comments and Resolution

### Review Item 1: Attachment Removal Reason Validation
- **Comment Given**: "Ensure that soft-removal of an attachment requires a non-empty removal reason string and that the frontend modal prevents submitting without a reason."
- **Response & Action Taken**: "Added `removalReason` validation (min 3 chars) in both `DELETE /api/attachments/:id/soft-remove` API endpoint and `AttachmentSection.tsx` client modal."

### Review Item 2: Requester Data Isolation on Ticket Details
- **Comment Given**: "Verify that passing a non-owned ticket ID in `GET /api/tickets/:id` returns 403 Forbidden or 404 Not Found."
- **Response & Action Taken**: "Implemented ownership middleware verification in `server/src/routes/tickets.ts` and added API test `API-05` to assert 403 Forbidden on cross-requester access."

### Review Item 3: Displaying Ticket Date
- **Comment Given**: "Ticket Date / createdAt timestamp must be clearly displayed in Create Ticket preview, My Tickets list, and Ticket Detail header."
- **Response & Action Taken**: "Added Ticket Date field rendering across `CreateTicketScreen`, `MyTicketsScreen`, and `RequesterTicketDetailScreen`."
