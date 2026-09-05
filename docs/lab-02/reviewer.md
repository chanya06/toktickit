# Lab 2 Peer Review Record

## Reviewer Information
- **Reviewer Identity**: Peer Reviewer (`lmaybelgracel`)
- **Review Date**: 2026-09-01 - 2026-09-05
- **Target Branch**: `lab2-staging` -> `main`

---

## Pull Request Log

| PR # | Feature Branch | Description / Scope | Status | Reviewer Approval |
| :--- | :--- | :--- | :--- | :--- |
| **#23** | `feature/5-spec-and-tests` | Add Lab 2 engineering specifications (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`) | Merged | Approved |
| **#25** | `feature/6-db-schema-seed` | Database Prisma Schema modeling & idempotent seed data | Merged | Approved |
| **#27** | `feature/7-requester-context` | Development Requester selector UI component & persistent state context | Merged | Approved |
| **#29** | `feature/8-create-ticket-api` | Ticket creation REST API endpoint & sequential ticket number generator | Merged | Approved |
| **#30** | `feature/9-create-ticket-ui` | Create Ticket screen & Zen Green accessible form components | Merged | Approved |
| **#31** | `feature/10-my-tickets-api` | Paginated My Tickets API endpoint with search, filter, and sorting | Merged | Approved |
| **#32** | `feature/11-my-tickets-ui` | My Tickets screen, search/filter controls, and mobile card view | Merged | Approved |
| **#33** | `feature/12-ticket-detail` | Ticket Detail view, read-only layout, and ownership guard | Merged | Approved |
| **#34** | `feature/13-attachment-lifecycle` | Attachment upload stream, magic bytes validation, soft removal & metadata list | Merged | Approved |

---

## Review Comments and Resolution

### Review Item 1: Test Plan Appendix B Structure Compliance
- **Comment Given**: "In `docs/lab-02/tests.md`, add section `## 7. Known Limitations or Deferred Tests` at the end to strictly conform 100% to the Appendix B Handout Template structure."
- **Response & Action Taken**: "Added Section 7 `Known Limitations or Deferred Tests` listing explicitly excluded Lab 2 scope items (Authentication, IT Staff Workflow, Comments, Status Transitions, Administration) matching Section 4.2 of the handout."

### Review Item 2: Attachment Removal Reason Validation
- **Comment Given**: "Ensure that soft-removal of an attachment requires a non-empty removal reason string and that the frontend modal prevents submitting without a reason."
- **Response & Action Taken**: "Added `removalReason` validation (min 3 chars) in both `DELETE /api/attachments/:id` API contract and `AttachmentSection.tsx` client specification."

### Review Item 3: Requester Data Isolation Status Code Consistency
- **Comment Given**: "Specify a single, consistent ownership-failure status code across specification.md and api-spec.md for unauthorized cross-requester access."
- **Response & Action Taken**: "Updated `FR-15`, `AC-04`, and `api-spec.md` to consistently enforce `403 Forbidden` on all cross-requester access attempts."

### Review Item 4: Displaying Ticket Date
- **Comment Given**: "Ticket Date / createdAt timestamp must be clearly displayed in Create Ticket preview, My Tickets list, and Ticket Detail header."
- **Response & Action Taken**: "Added Ticket Date requirement across `specification.md`, `ui-spec.md`, `api-spec.md`, and `tests.md`."

### Review Item 5: Idempotent Seed Script Strategy
- **Comment Given**: "Ensure seed script runs cleanly without primary key or unique constraint violations when executed multiple times consecutively."
- **Response & Action Taken**: "Implemented Prisma `upsert` queries for seed categories and requesters in `server/prisma/seed.ts`."

### Review Item 6: Development Requester Switching & State Reset
- **Comment Given**: "When switching active Requester in Development Requester Selector modal, any displayed ticket detail or creation form must immediately clear stale data."
- **Response & Action Taken**: "Added React `useEffect` state reset logic dependent on `activeRequesterId` in `TicketDetailView` and `CreateTicketView`."

### Review Item 7: Ticket Detail Requester Identification Sync
- **Comment Given**: "Ensure explicit `requesterId` parameter synchronization between query parameters and HTTP header `X-Requester-Id` to prevent ambiguity."
- **Response & Action Taken**: "Refactored `TicketDetailView` to pass explicit `requesterId` query parameter matching active Requester context and added conflict validation in backend middleware."

### Review Item 8: File Magic Bytes & Concurrency Protection
- **Comment Given**: "Inspect binary file magic bytes signatures to prevent uploading disguised malicious files, and implement atomic count checks with row-level locking for active attachments."
- **Response & Action Taken**: "Implemented `validateFileBufferSignature` for JPEG, PNG, WEBP, and PDF files, and wrapped active attachment count verification in PostgreSQL `SELECT ... FOR UPDATE` transactions."
