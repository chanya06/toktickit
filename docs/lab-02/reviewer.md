# Lab 2 Peer Review Record

## Reviewer Information
- **Author Identity**: `chanya06`
- **Reviewer Identity**: Peer Reviewer (`lmaybelgracel`)
- **Review Date**: September 1, 2026 – September 6, 2026
- **Target Branch**: `lab2-staging` -> `main`

---

## Pull Request Log

| PR # | Feature Branch | Description / Scope | Peer Reviewer Comment / Feedback | Status | Reviewer Approval |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [#23](https://github.com/chanya06/toktickit/pull/23) | `feature/5-spec-and-tests` | Add Lab 2 engineering specifications (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`) | "Approved. Required Section 7 Known Limitations in tests.md, removalReason validation, Ticket Date display, and consistent 403 Forbidden code." | Merged | Approved |
| [#25](https://github.com/chanya06/toktickit/pull/25) | `feature/6-db-schema-seed` | Database Prisma Schema modeling & idempotent seed data | "Approved. Required Prisma upsert in seed script for idempotent repeated execution." | Merged | Approved |
| [#27](https://github.com/chanya06/toktickit/pull/27) | `feature/7-requester-context` | Development Requester selector UI component & persistent state context | "Approved. Required useEffect state reset logic on Requester context switch." | Merged | Approved |
| [#29](https://github.com/chanya06/toktickit/pull/29) | `feature/8-create-ticket-api` | Ticket creation REST API endpoint & sequential ticket number generator | "Approved. Verified sequential ticket number format TKT-YYYY-XXXXXX and transaction safety." | Merged | Approved |
| [#30](https://github.com/chanya06/toktickit/pull/30) | `feature/9-create-ticket-ui` | Create Ticket screen & Zen Green accessible form components | "Approved. Verified red asterisks, inline field validation error placement, and busy state." | Merged | Approved |
| [#31](https://github.com/chanya06/toktickit/pull/31) | `feature/10-my-tickets-api` | Paginated My Tickets API endpoint with search, filter, and sorting | "Approved. Verified search, multi-select filters, sort order, and pagination metadata." | Merged | Approved |
| [#32](https://github.com/chanya06/toktickit/pull/32) | `feature/11-my-tickets-ui` | My Tickets screen, search/filter controls, and mobile card view | "Approved. Verified desktop table view, mobile card view, clear filters, and empty state." | Merged | Approved |
| [#33](https://github.com/chanya06/toktickit/pull/33) | `feature/12-ticket-detail` | Ticket Detail view, read-only layout, and ownership guard | "Approved. Required explicit requesterId sync between query/headers and 403 Forbidden ownership check." | Merged | Approved |
| [#34](https://github.com/chanya06/toktickit/pull/34) | `feature/13-attachment-lifecycle` | Attachment upload stream, magic bytes validation, soft removal & metadata list | "Approved. Required magic bytes validation for JPEG/PNG/WEBP/PDF and row-level lock SELECT FOR UPDATE." | Merged | Approved |
| [#35](https://github.com/chanya06/toktickit/pull/35) | `feature/14-qa-release` | QA, Initial Attachments, HTML5 Drag & Drop, State Screenshots, Section 14 Deliverable PDF Report | "Approved. Required Section 14 Answer Part 1..9 headings, 15 state screenshots, RequesterTicketDetail.test.tsx rename, screenshot subdirectories, and single PDF report." | Merged | Approved |
| [#37](https://github.com/chanya06/toktickit/pull/37) | `feature/15-ui-refinement` | Refine Web UI layout alignment with instructor mockups (Figure 1, Section 8.1, Section 8.4) and remove emojis | "Approved. Required web UI alignment with instructor mockups (Figure 1, Section 8.1, Section 8.4) and removal of all raw emojis." | Merged | Approved |
| [#39](https://github.com/chanya06/toktickit/pull/39) | `feature/16-reviewer-docs-sync` | Refine reviewer log with feedback column, add PR links, sync test metrics, re-compile PDF report | "Approved. Verified feedback column, clickable PR links, test metric sync, and updated PDF report." | Merged | Approved |

---

## Review Comments and Resolution

### Review Item 1: Test Plan Appendix B Structure Compliance (PR [#23](https://github.com/chanya06/toktickit/pull/23))
- **Comment Given**: "In `docs/lab-02/tests.md`, add section `## 7. Known Limitations or Deferred Tests` at the end to strictly conform 100% to the Appendix B Handout Template structure."
- **Response & Action Taken**: "Added Section 7 `Known Limitations or Deferred Tests` listing explicitly excluded Lab 2 scope items (Authentication, IT Staff Workflow, Comments, Status Transitions, Administration) matching Section 4.2 of the handout."
- **Resolution Status**: Approved & Merged.

### Review Item 2: Attachment Removal Reason Validation (PR [#23](https://github.com/chanya06/toktickit/pull/23))
- **Comment Given**: "Ensure that soft-removal of an attachment requires a non-empty removal reason string and that the frontend modal prevents submitting without a reason."
- **Response & Action Taken**: "Added `removalReason` validation (min 3 chars) in both `DELETE /api/attachments/:id` API contract and `AttachmentSection.tsx` client specification."
- **Resolution Status**: Approved & Merged.

### Review Item 3: Requester Data Isolation Status Code Consistency (PR [#23](https://github.com/chanya06/toktickit/pull/23))
- **Comment Given**: "Specify a single, consistent ownership-failure status code across specification.md and api-spec.md for unauthorized cross-requester access."
- **Response & Action Taken**: "Updated `FR-15`, `AC-04`, and `api-spec.md` to consistently enforce `403 Forbidden` on all cross-requester access attempts."
- **Resolution Status**: Approved & Merged.

### Review Item 4: Displaying Ticket Date (PR [#23](https://github.com/chanya06/toktickit/pull/23))
- **Comment Given**: "Ticket Date / createdAt timestamp must be clearly displayed in Create Ticket preview, My Tickets list, and Ticket Detail header."
- **Response & Action Taken**: "Added Ticket Date requirement across `specification.md`, `ui-spec.md`, `api-spec.md`, and `tests.md`."
- **Resolution Status**: Approved & Merged.

### Review Item 5: Idempotent Seed Script Strategy (PR [#25](https://github.com/chanya06/toktickit/pull/25))
- **Comment Given**: "Ensure seed script runs cleanly without primary key or unique constraint violations when executed multiple times consecutively."
- **Response & Action Taken**: "Implemented Prisma `upsert` queries for seed categories and requesters in `server/prisma/seed.ts`."
- **Resolution Status**: Approved & Merged.

### Review Item 6: Development Requester Switching & State Reset (PR [#27](https://github.com/chanya06/toktickit/pull/27))
- **Comment Given**: "When switching active Requester in Development Requester Selector modal, any displayed ticket detail or creation form must immediately clear stale data."
- **Response & Action Taken**: "Added React `useEffect` state reset logic dependent on `activeRequesterId` in `TicketDetailView` and `CreateTicketView`."
- **Resolution Status**: Approved & Merged.

### Review Item 7: Ticket Detail Requester Identification Sync (PR [#33](https://github.com/chanya06/toktickit/pull/33))
- **Comment Given**: "Ensure explicit `requesterId` parameter synchronization between query parameters and HTTP header `X-Requester-Id` to prevent ambiguity."
- **Response & Action Taken**: "Refactored `TicketDetailView` to pass explicit `requesterId` query parameter matching active Requester context and added conflict validation in backend middleware."
- **Resolution Status**: Approved & Merged.

### Review Item 8: File Magic Bytes & Concurrency Protection (PR [#34](https://github.com/chanya06/toktickit/pull/34))
- **Comment Given**: "Inspect binary file magic bytes signatures to prevent uploading disguised malicious files, and implement atomic count checks with row-level locking for active attachments."
- **Response & Action Taken**: "Implemented `validateFileBufferSignature` for JPEG, PNG, WEBP, and PDF files, and wrapped active attachment count verification in PostgreSQL `SELECT ... FOR UPDATE` transactions."
- **Resolution Status**: Approved & Merged.

### Review Item 9: Handout Section 14 Deliverable Structure, State Screenshots & Handout Section 12 Repository Structure (PR [#35](https://github.com/chanya06/toktickit/pull/35))
- **Comment Given**: "Structure `docs/lab-02/final-deliverable.md` into exact Answer Part 1 to Answer Part 9 headings from Section 14 of the handout. Add working state screenshots (validation error, busy state, success ticket number from DB, backend failure retained data, soft remove modal prompt, soft-removed status badge). Rename `TicketDetail.test.tsx` to `RequesterTicketDetail.test.tsx` and organize screenshot subdirectories under `artifacts/lab-02/screenshots/` (`create-ticket/`, `my-tickets/`, `ticket-detail/`). Generate single deliverable PDF report."
- **Response & Action Taken**: "Renamed client test file to `RequesterTicketDetail.test.tsx`, reorganized screenshot subdirectories into `create-ticket/`, `my-tickets/`, and `ticket-detail/`, captured all 15 working state & responsive layout screenshots, restructured `docs/lab-02/final-deliverable.md` into exact Answer Part 1..9 headings, and re-compiled `docs/lab-02/final-deliverable.pdf` via `scripts/generate-pdf.js`."
- **Resolution Status**: Approved & Merged.

### Review Item 10: Instructor Mockup Visual Alignment & Emoji Removal (PR [#37](https://github.com/chanya06/toktickit/pull/37))
- **Comment Given**: "Align web UI components strictly with instructor mockups (Figure 1, Section 8.1, Section 8.4) and remove all raw emoji characters from source code, replacing them with clean SVG vector icons."
- **Response & Action Taken**: "Refactored `Header.tsx`, `RequesterSelectorModal.tsx`, `CreateTicketForm.tsx`, `MyTicketsView.tsx`, `TicketDetailView.tsx`, and `AttachmentSection.tsx` to use SVG vector icons, updated unit test assertions, re-captured Playwright screenshots, and compiled `final-deliverable.pdf`."
- **Resolution Status**: Approved & Merged.

### Review Item 11: Reviewer Log Feedback Column, PR Links & Test Metric Synchronization (PR [#39](https://github.com/chanya06/toktickit/pull/39))
- **Comment Given**: "Add a Peer Reviewer Comment / Feedback column to the PR Log table, include clickable GitHub PR links for all PRs, sync automated test metrics in tests.md, and re-compile final-deliverable.pdf."
- **Response & Action Taken**: "Updated reviewer.md table with reviewer comments and clickable PR links, synced test metrics in tests.md, and re-compiled final-deliverable.pdf."
- **Resolution Status**: Approved & Merged.
