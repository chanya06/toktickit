# Lab 2 Peer Review Record

## Reviewer Information
- **Reviewer Identity**: Peer Reviewer (Course Peer Reviewer)
- **Review Date**: 2026-09-01
- **Target Branch**: `lab2-staging` -> `main`

---

## Pull Request Log

| PR # | Feature Branch | Description / Scope | Status | Reviewer Approval |
| :--- | :--- | :--- | :--- | :--- |
| **#23** | `feature/5-spec-and-tests` | Add Lab 2 engineering specifications (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`) | Open | Approved |

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

