# Lab 4 AI Pair Programming & Interaction Log

## 1. LLM Model & Development Environment
- **Primary AI Assistant**: Antigravity AI (Google Gemini 2.5 Pro)
- **Role & Workflow**: Pair programming partner assisting with Spec-Driven Development (Spec DD), Test-Driven Development (TDD), schema migration, API implementation, responsive component authoring, and automated test design.
- **Strict Human / Peer Oversight**: All code and architectural decisions are reviewed, approved, and integrated via GitHub Pull Requests by peer reviewer `@lmaybelgracel`. The AI never merges pull requests autonomously.

---

## 2. Key Prompt Trajectory (Sprint 4)

### Prompt 1: Sprint 4 Engineering Contract & Specification-Driven Development
- **User Intent**: Analyze the Lab 4 handout (Actions Taken, Dashboards, Resolution Gate, Final Regression) and draft the comprehensive engineering contract (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`) before any implementation code is written.
- **AI Response Summary**:
  - Structured the 11 mandatory sections in `specification.md` including `FR-01..FR-16`, `BR-01..BR-10`, `AC-01..AC-12`, and Definition of Done.
  - Justified 3 key database decisions: Integer foreign key alignment with Lab 2 `Ticket.id`, dedicated `ActionTaken` child entity, and non-destructive legacy ticket compatibility.
  - Specified the Zen Green UI tokens, responsive layouts, metric card drill-downs, and Actions Taken modal/table views in `ui-spec.md`.
  - Formulated strict REST API contracts with optimistic concurrency conflict detection (`409 Conflict`) in `api-spec.md`.
  - Defined the multi-tier test pyramid and traceability matrix in `tests.md`.

### Prompt 2: PR #72 Review Feedback Resolution & Contract Hardening
- **User Intent**: Address 4 specific feedback items requested by peer reviewer `@lmaybelgracel` for PR #72: add `assigneeId` field to Actions Taken model and APIs, add Migration Rollback and Disaster Recovery procedure to specification.md, add missing test categories (Style/Responsive, Accessibility, Performance-Smoke, Migration) to tests.md, and specify Empty Behavior for dashboard cards and completed-action requirements for the Resolution Gate.
- **AI Response Summary**:
  - Added `assigneeId: String?` referencing `User` alongside `performedById: String` in Prisma schema, APIs, and UI modal.
  - Added Section 7.3 to `specification.md` detailing reverse down-migration SQL, `prisma migrate resolve --rolled-back`, and `pg_dump`/`pg_restore` recovery.
  - Added `STYLE-01`, `A11Y-01`, `PERF-01`, and `MIGR-01` rows to `tests.md`.
  - Specified empty metric card behaviors (value 0 styling & drill-down) and enforced `BR-08` precondition that resolving a ticket requires all child actions to be completed or cancelled.
  - Recorded review comments and response in `docs/lab-04/reviewer.md`.

---

### Prompt 3: Issue 30 Database Foundation, Migration & Idempotent Seeding
- **User Intent**: Proceed with Issue 30 to implement the Prisma schema changes for Actions Taken (ActionTakenStatus enum and ActionTaken model), create and execute the database migration, implement idempotent seed data with realistic tickets spanning zero, one, and multiple actions across all statuses, and verify with automated migration tests.
- **AI Response Summary**:
  - Implemented `ActionTakenStatus` enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) and `ActionTaken` model in `server/prisma/schema.prisma` with integer foreign key alignment to `Ticket(id)` and `User(id)`.
  - Created migration `20261030000000_lab4_actions_taken` and deployed cleanly to PostgreSQL database.
  - Updated `server/prisma/seed.ts` with 6 realistic tickets covering all required variations: 0 actions (unassigned queue), 1 action (pending RF survey / waiting for requester), and multiple actions (in-progress battery swap / resolved LDAP VPN certificate).
  - Authored automated integration test suite `server/tests/lab-04/migration-rollback.test.ts` (`MIGR-01`) verifying foreign keys, cascading deletions, legacy ticket compatibility, and rollback DDL safety (100% passing).
  - Maintained full regression safety across all 153 backend tests and 116 frontend tests.

---

### Prompt 4: PR #81 Peer Review Defect Resolution & Schema Hardening
- **User Intent**: Address 4 specific review feedback points from peer reviewer `@lmaybelgracel` on PR #81: improve `MIGR-01d` to test rollback DDL on full schema with Enums and Foreign Keys, add `REOPENED` and `CANCELLED` tickets to seed data, record review comments and author responses in `reviewer.md`, and justify application-layer follow-up invariant enforcement over DB check constraints in `specification.md`.
- **AI Response Summary**:
  - Re-architected `MIGR-01d` in `server/tests/lab-04/migration-rollback.test.ts` to build a complete replica schema with `ActionTakenStatus` enum, foreign keys to Ticket and User, test data insertion, and executed the exact `DROP TABLE CASCADE` and `DROP TYPE` rollback DDL, asserting zero residual tables or types.
  - Added `TKT-2026-000007` (`REOPENED`) and `TKT-2026-000008` (`CANCELLED`) with associated Actions Taken in `server/prisma/seed.ts`, achieving 100% coverage of all 8 major ticket statuses with idempotent re-execution.
  - Documented Review Round 2 verbatim reviewer comments and author action plan in `docs/lab-04/reviewer.md`.
  - Added architectural justification Decision 4 to Section 7.2 in `docs/lab-04/specification.md` explaining why conditional follow-up note validation belongs in the application/API layer for actionable HTTP 400 responses and schema portability.
  - Verified full test regression suite: 153 backend tests passing.

---

## 3. Reflection on AI Pairing in Software Engineering

### Specification-Agent Synergy
Using the AI as a specification agent before writing implementation code forces rigor in defining boundaries, data structures, and edge cases. In Sprint 4, the introduction of a parent-child relationship (`Ticket -> ActionTaken`) could easily lead to concurrency bugs (e.g. overwriting an action outcome while another staff member transitions status) or authorization leaks (e.g. allowing requesters to edit actions). Defining explicit business rules (`BR-01` through `BR-10`) and HTTP status contracts upfront establishes an unambiguous contract that guides both development and peer review.

### Coding-Agent Guardrails
Maintaining strict boundaries where the AI acts strictly as a pair programming author while peer reviewer `@lmaybelgracel` exercises merge authority ensures genuine software engineering discipline. Every pull request remains accountable to human review, validating that the delivered software reflects authentic craftsmanship and verified evidence.
