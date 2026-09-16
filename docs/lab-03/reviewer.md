# Lab 3 Code & Documentation Review Log

This document records peer review activities, comments, responses, and approvals for Lab 3 Pull Requests.

## Review Summary

| Issue / Feature | PR # | Title | Author | Reviewer | Status | Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Issue 17** | [#44](https://github.com/chanya06/toktickit/pull/44) | docs(lab-03): Sprint 3 engineering contract and specs | chanya06 | @lmaybelgracel | Changes Approved | 2026-09-16 |

---

## Review Details

### Issue 17 / PR #44: Sprint 3 Engineering Contract & Specification
- **Issue**: [#45](https://github.com/chanya06/toktickit/issues/45) (`Issue 17: Sprint 3 Engineering Contract & Specification`)
- **PR**: [#44](https://github.com/chanya06/toktickit/pull/44)
- **Target Branch**: `lab3-staging`
- **Feature Branch**: `feature/17-spec-and-tests`
- **Reviewer**: `@lmaybelgracel`
- **Status**: Changes Addressed & Approved

### Peer Review Comments & Addressed Action Items

1. **Prisma Schema Data Types & Data Migration Plan (specification.md Section 7)**:
   - *Comment*: `PublicComment` and `InternalNote` `ticketId` should be `Int` to match Lab 2 `Ticket.id` (`Int`). Also clarify `User.id` migration from `DevelopmentRequester.id`.
   - *Action Taken*: Aligned `PublicComment.ticketId` and `InternalNote.ticketId` to `Int`. Defined `User.id` as `Int` @id @default(autoincrement()) evolving from `DevelopmentRequester.id` so all existing Lab 2 ticket/attachment foreign keys (`requesterId`, `ownerId`, `removedByRequesterId`) remain intact without data loss.

2. **Requester "Problem Appears Resolved" Endpoint (api-spec.md & specification.md)**:
   - *Comment*: Requester needs an explicit endpoint to indicate a problem appears resolved without formally closing the ticket.
   - *Action Taken*: Added `POST /api/tickets/:id/resolve-indication` in `api-spec.md` and documented FR-09 / BR-19 setting `isResolutionIndicated: true` and logging a system Public Comment.

3. **Permitted Roles in Status Transition Matrix (specification.md BR-14)**:
   - *Comment*: Specify permitted roles for each transition in the matrix to prevent authorization bugs.
   - *Action Taken*: Updated BR-14 with explicit permitted roles for all 16 status transition paths (e.g. `NEW` -> `CANCELLED` permitted for Requester owner, IT Staff, Admin; `OPEN` -> `RESOLVED` permitted for IT Staff, Admin).

4. **Table Format in tests.md (tests.md Section 1)**:
   - *Comment*: Reformat Planned Tests table to match Handout Section 10 7-column schema (`Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final`).
   - *Action Taken*: Reformatted `tests.md` Section 1 to match the exact 7-column schema and assigned Test IDs (`API-01`..`API-14`, `UI-01`..`UI-05`, `E2E-01`..`E2E-03`).

5. **AI Use Log Cleanup & Reviewer Identity (ai-use.md & reviewer.md)**:
   - *Comment*: Fix garbled text in `ai-use.md` and set Reviewer name to `@lmaybelgracel`.
   - *Action Taken*: Updated `ai-use.md` with clean text and updated `reviewer.md` with `@lmaybelgracel`.
