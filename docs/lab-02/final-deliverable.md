# TokTickIT Lab 2 — Final Engineering Deliverable & Quality Assurance Report

**Project**: TokTickIT — Spec-Driven IT Support Ticket Management System (Lab 2)  
**Author / Team**: `chanya06`  
**Reviewer**: Peer Reviewer (`lmaybelgracel`)  
**Target Branch**: `feature/14-qa-release` -> `lab2-staging` -> `main`  
**Date**: September 6, 2026  

---

## Answer Part 1: Git Use with Engineering Workflow

### 1.1 Git Branching Strategy & Staging Workflow
TokTickIT Lab 2 followed a disciplined Git feature-branch workflow. Every sprint issue was developed on an isolated `feature/*` branch and merged into `lab2-staging` via peer-reviewed Pull Requests. Final release integration moves cleanly from `lab2-staging` into `main`.

### 1.2 Pull Request & Kanban Board Audit Log
- **Sprint Project Board**: TokTickIT Individual Sprints (Kanban statuses: `Backlog`, `Specified`, `Started`, `PR Review`, `Fixing`, `Done`).
- **Peer Review Record**: All feature PRs (#23, #25, #27, #29, #30, #31, #32, #33, #34, #35, #37, #39) were reviewed, audited, and approved by peer reviewer `lmaybelgracel`. Complete review comments and resolution logs are documented in [`docs/lab-02/reviewer.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-02/reviewer.md).

### 1.3 Repository Setup & Exclusions
- **Repository README**: Contains full setup instructions, seed commands, database configuration, and test execution guides.
- **Git Ignore (`.gitignore`)**: Properly ignores `node_modules/`, `dist/`, `.env`, temporary file uploads in `uploads/`, and build artifacts.

### 1.4 Directory Structure (Section 12 Compliance)
```
toktickit/
├── docs/lab-02/
│   ├── specification.md
│   ├── tests.md
│   ├── ui-spec.md
│   ├── api-spec.md
│   ├── reviewer.md
│   ├── ai-use.md
│   ├── final-deliverable.md
│   └── final-deliverable.pdf
├── server/
│   ├── src/
│   │   ├── app.ts
│   │   ├── prisma.ts
│   │   └── seed.ts
│   └── tests/lab-02/
│       ├── unit/ticket-number.test.ts
│       ├── create-ticket.api.test.ts
│       ├── my-tickets.api.test.ts
│       ├── ticket-detail.api.test.ts
│       ├── attachments.api.test.ts
│       └── requesters.api.test.ts
├── client/
│   ├── src/
│   └── tests/lab-02/
│       ├── CreateTicket.test.tsx
│       ├── MyTickets.test.tsx
│       ├── RequesterTicketDetail.test.tsx
│       ├── AttachmentSection.test.tsx
│       └── RequesterSelect.test.tsx
├── e2e/lab-02/
│   ├── requester-ticket-flow.spec.ts
│   └── capture-screenshots.spec.ts
└── artifacts/lab-02/screenshots/
    ├── create-ticket/
    ├── my-tickets/
    └── ticket-detail/
```

---

## Answer Part 2: Spec DD

### 2.1 Engineering Specification Link
The complete engineering specification is documented under [`docs/lab-02/specification.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-02/specification.md).

### 2.2 Specification Structure & Business Rules
- **Functional Requirements (`FR-01..FR-15`)**: Detailed specifications for ticket creation, listing, detail retrieval, initial file uploads, soft removals, search/filter, and ownership boundaries.
- **Mandatory Business Rules (`BR-01..BR-16`)**:
  - `BR-01`: Backend auto-generates unique `TKT-YYYY-XXXXXX` sequence.
  - `BR-02`: New ticket initial status is `NEW`.
  - `BR-03`: Development Requester selector is for testing context switching only.
  - `BR-07`: Summary (5-120 chars) and Description (10-2000 chars) length constraints.
  - `BR-10`: Attachment limits: allowed `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`, max size <= 5 MB per file.
  - `BR-11`: Maximum active attachments limit: 5 files per ticket.
  - `BR-12`: Soft removal retains metadata, sets `isRemoved: true`, and blocks future binary downloads (`403 Forbidden`).
  - `BR-13`: Soft removal requires a non-empty removal reason (min 3 chars).
  - `BR-15`: Initial attachments creation and DB persistence are wrapped in `Prisma.$transaction` with automatic disk compensation (`cleanupFiles`) on validation or DB errors.

### 2.3 Acceptance Criteria (`AC-01..AC-10`) & Definition of Done
100% of Acceptance Criteria (`AC-01..AC-10`) are mapped directly to automated test cases across 5 test levels in [`docs/lab-02/tests.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-02/tests.md).

---

## Answer Part 3: Test DD and Traceability

### 3.1 Test Plan Document Link
The test plan and traceability matrix are documented under [`docs/lab-02/tests.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-02/tests.md).

### 3.2 Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Description | Validating Test Files | Result |
| :--- | :--- | :--- | :--- |
| **AC-01** | Create Ticket with Ticket Number & Ticket Date | `create-ticket.api.test.ts`, `CreateTicket.test.tsx`, `requester-ticket-flow.spec.ts` | Pass |
| **AC-02** | Requester Selector required when unselected | `RequesterSelect.test.tsx`, `requester-ticket-flow.spec.ts` | Pass |
| **AC-03** | My Tickets owned tickets filtering | `my-tickets.api.test.ts`, `MyTickets.test.tsx`, `requester-ticket-flow.spec.ts` | Pass |
| **AC-04** | Cross-Requester Ticket Access Blocked (403 Forbidden) | `ticket-detail.api.test.ts`, `attachments.api.test.ts`, `requester-ticket-flow.spec.ts` | Pass |
| **AC-05** | Soft removal with reason & blocked download | `attachments.api.test.ts`, `AttachmentSection.test.tsx`, `requester-ticket-flow.spec.ts` | Pass |
| **AC-06** | Max 5 active attachments limit | `create-ticket.api.test.ts`, `attachments.api.test.ts` | Pass |
| **AC-07** | File size & type restriction validation | `create-ticket.api.test.ts`, `CreateTicket.test.tsx`, `AttachmentSection.test.tsx` | Pass |
| **AC-08** | Search term in My Tickets | `my-tickets.api.test.ts`, `MyTickets.test.tsx`, `requester-ticket-flow.spec.ts` | Pass |
| **AC-09** | Ticket Date displayed on screens | `create-ticket.api.test.ts`, `CreateTicket.test.tsx`, `RequesterTicketDetail.test.tsx` | Pass |
| **AC-10** | Form values preserved on submission failure | `CreateTicket.test.tsx` | Pass |

### 3.3 Execution Results Summary
- **Server Unit & API Tests**: 54 / 54 passed (`npm run test --prefix server`)
- **Client Component & Style Tests**: 42 / 42 passed (`npm run test --prefix client`)
- **Playwright E2E Tests**: 4 / 4 passed (`npx playwright test`)
- **Total Coverage**: 100% Green across all automated test suites.

---

## Answer Part 4: AI Use with Reflection

### 4.1 LLM Model & Pairing Setup
Engineering work was conducted in pair programming with **Antigravity AI (Gemini 2.5 Pro)**. Full prompt logs are documented in [`docs/lab-02/ai-use.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-02/ai-use.md).

### 4.2 Key Prompts Summary (Prompts P-01 to P-12)
- **P-01 to P-04**: Architecting specification contracts, API OpenAPI schemas, and Zen Green design tokens.
- **P-05 to P-08**: Implementing ticket sequence generator (`TKT-YYYY-XXXXXX`), atomic Prisma transactions, and magic bytes file buffer security validation.
- **P-09 to P-12**: Building initial attachments dropzone with HTML5 drag-and-drop, Playwright E2E automation, and disk rollback compensation logic.

### 4.3 My Reflection
Pairing with an AI agent under Spec DD methodology enforced rigorous upfront planning. The AI excelled at detecting edge-case race conditions in concurrent upload transactions and generating thorough unit/integration tests for magic bytes validation.

---

## Answer Part 5: Development Requester Select Screen

### 5.1 Simulated Login Context Selector
Because full authentication is deferred to Lab 3, a **Development Requester Selector** modal (`RequesterSelectorModal.tsx`) simulates user login. The selected requester context is stored in `localStorage` and passed via `X-Requester-Id` HTTP headers and `requesterId` query parameters.

### 5.2 Requester Selector Screenshot
`![Development Requester Selector](../../artifacts/lab-02/screenshots/create-ticket/requester-selector.png)`

---

## Answer Part 6: Working Ticket Screen: Create Mode

### 6.1 Create Ticket Layout & Workflow
The Create Ticket screen enables users to submit IT support tickets with optional initial file attachments (up to 5 files, <=5MB each, allowed formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`).

### 6.2 Working State Screenshots

#### Initial Layout View
`![Create Ticket Initial](../../artifacts/lab-02/screenshots/create-ticket/desktop.png)`

#### Inline Field Validation Error State
Displays inline red error messages directly below invalid fields when inputs fail validation constraints (e.g. summary < 5 chars):
`![Validation Error State](../../artifacts/lab-02/screenshots/create-ticket/validation-error.png)`

#### Submitting Busy Loading State
Submit button is disabled and displays a loading spinner with "Submitting Ticket…" during active network requests:
`![Submitting Busy State](../../artifacts/lab-02/screenshots/create-ticket/submitting-busy.png)`

#### Success Confirmation Screen (Ticket Number from Database)
Displays green confirmation card with official `TKT-YYYY-XXXXXX` generated by backend Prisma transaction:
`![Success Confirmation State](../../artifacts/lab-02/screenshots/create-ticket/success-confirmation.png)`

#### Backend Server Failure State (Form Values Preserved)
Displays safe red alert box on server error while preserving all entered form values:
`![Backend Failure Preserved State](../../artifacts/lab-02/screenshots/create-ticket/api-failure-retained.png)`

---

## Answer Part 7: Working My Tickets Screen

### 7.1 My Tickets Capabilities & Ownership Isolation
- **Owned Tickets List**: Displays tickets owned by active requester with ticket number, summary, category, priority, status, and attachment count.
- **Search & Multi-Select Filters**: Filter by category, system, priority, status, and debounced search query across ticket number and summary.
- **Cross-Requester Data Isolation**: Switching context from Requester A (Jennifer Anderson) to Requester B (Michael Brown) instantly hides Requester A's tickets.

### 7.2 Working Screenshots

#### My Tickets List (Requester A — Jennifer Anderson)
`![My Tickets Desktop](../../artifacts/lab-02/screenshots/my-tickets/desktop.png)`

#### Search & Category Filter State
`![My Tickets Search Filter](../../artifacts/lab-02/screenshots/my-tickets/search-filter.png)`

#### Cross-Requester Isolation State (Requester B — Michael Brown)
`![Cross Requester Isolation](../../artifacts/lab-02/screenshots/my-tickets/cross-requester-isolation.png)`

---

## Answer Part 8: Working Ticket Screen: View Mode and Attachments

### 8.1 Ticket Detail & Attachment Lifecycle
- **Read-Only Inspection**: Displays Ticket Number, Ticket Date, Requester, Category, System, Priority, Status, Summary, Description, and Attachment list.
- **Soft Removal with Reason (`BR-12`, `BR-13`)**: Soft-removes attachment record (`isRemoved: true`, requires min 3-char reason).
- **Blocked Download Stream**: Soft-removed attachments disable download buttons in UI and return `403 Forbidden` on direct API GET requests.

### 8.2 Working Screenshots

#### Ticket Detail View Mode
`![Ticket Detail Desktop](../../artifacts/lab-02/screenshots/ticket-detail/desktop.png)`

#### Soft Removal Reason Modal Prompt
Pop-up modal prompting for soft-removal reason with disabled confirm button when reason < 3 chars:
`![Soft Remove Modal Prompt](../../artifacts/lab-02/screenshots/ticket-detail/soft-remove-modal.png)`

#### Retained Metadata & Soft-Removed Status
Displays "Soft-Removed" badge and recorded removal reason while blocking download stream:
`![Soft Removed Status](../../artifacts/lab-02/screenshots/ticket-detail/soft-removed-status.png)`

---

## Answer Part 9: Zen Green UI and Responsive Evidence

### 9.1 Visual Specification Link
The UI specification and color token definitions are documented under [`docs/lab-02/ui-spec.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-02/ui-spec.md).

### 9.2 Responsive Viewport Screenshots

#### Create Ticket Screen Viewports
- **Desktop (1280px)**: `![Create Ticket Desktop](../../artifacts/lab-02/screenshots/create-ticket/desktop.png)`
- **Tablet (768px)**: `![Create Ticket Tablet](../../artifacts/lab-02/screenshots/create-ticket/tablet.png)`
- **Mobile (375px)**: `![Create Ticket Mobile](../../artifacts/lab-02/screenshots/create-ticket/mobile.png)`

#### My Tickets Screen Viewports
- **Desktop (1280px)**: `![My Tickets Desktop](../../artifacts/lab-02/screenshots/my-tickets/desktop.png)`
- **Tablet (768px)**: `![My Tickets Tablet](../../artifacts/lab-02/screenshots/my-tickets/tablet.png)`
- **Mobile (375px)**: `![My Tickets Mobile](../../artifacts/lab-02/screenshots/my-tickets/mobile.png)`

#### Ticket Detail Screen Viewports
- **Desktop (1280px)**: `![Ticket Detail Desktop](../../artifacts/lab-02/screenshots/ticket-detail/desktop.png)`
- **Tablet (768px)**: `![Ticket Detail Tablet](../../artifacts/lab-02/screenshots/ticket-detail/tablet.png)`
- **Mobile (375px)**: `![Ticket Detail Mobile](../../artifacts/lab-02/screenshots/ticket-detail/mobile.png)`

### 9.3 Visual Inspection Checklist
- [x] **Zen Green Palette**: Header & Primary (`#006B3C`), Active (`#0B7A46`), Pale BG (`#EAF6EF`), Page BG (`#F5F7F6`).
- [x] **Form Controls**: Red asterisks on required fields, inline error text placement below fields.
- [x] **Read-Only / Editable Contrast**: Distinct light gray-green read-only inputs for ticket number and date.
- [x] **No Clipping / Overlap**: Zero clipped text, no overlapping elements or unwanted horizontal scrolling at 375px mobile view.
