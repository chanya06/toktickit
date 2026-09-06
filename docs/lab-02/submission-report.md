# TokTickIT Lab 2 Submission Report
**Student Name:** Chanya Poolketkij  
**Student ID:** 67070501058  
**Section:** CPE334  
**GitHub Repository:** https://github.com/chanya06/toktickit  

---

## Answer Part 1: Git Use with Engineering Workflow *(10 คะแนน)*

### 1.1 URL List
| รายการ | ลิงก์ |
|---|---|
| GitHub Repository | https://github.com/chanya06/toktickit |
| GitHub Project (Kanban) | https://github.com/users/chanya06/projects/1 |
| Issue #5 - Engineering Specification & Test Plan | https://github.com/chanya06/toktickit/issues/5 |
| Issue #6 - Database Model & Seed Data | https://github.com/chanya06/toktickit/issues/6 |
| Issue #7 - Development Requester Selector UI Context | https://github.com/chanya06/toktickit/issues/7 |
| Issue #8 - Create Ticket API Endpoint & Sequence Generator | https://github.com/chanya06/toktickit/issues/8 |
| Issue #9 - Create Ticket UI Screen & Form Validation | https://github.com/chanya06/toktickit/issues/9 |
| Issue #10 - My Tickets Paginated API | https://github.com/chanya06/toktickit/issues/10 |
| Issue #11 - My Tickets UI Screen, Search & Filter Controls | https://github.com/chanya06/toktickit/issues/11 |
| Issue #12 - Ticket Detail UI & Ownership Guard | https://github.com/chanya06/toktickit/issues/12 |
| Issue #13 - Attachment Lifecycle API & Soft Removal | https://github.com/chanya06/toktickit/issues/13 |
| Issue #14 - QA Release & Deliverable Report | https://github.com/chanya06/toktickit/issues/14 |
| Issue #15 - Refine Web UI Alignment & Emoji Removal | https://github.com/chanya06/toktickit/issues/15 |
| Issue #16 - Refine Reviewer Documentation & Sync Test Metrics | https://github.com/chanya06/toktickit/issues/16 |
| PR #23: feature/5-spec-and-tests → lab2-staging | https://github.com/chanya06/toktickit/pull/23 |
| PR #25: feature/6-db-schema-seed → lab2-staging | https://github.com/chanya06/toktickit/pull/25 |
| PR #27: feature/7-requester-context → lab2-staging | https://github.com/chanya06/toktickit/pull/27 |
| PR #29: feature/8-create-ticket-api → lab2-staging | https://github.com/chanya06/toktickit/pull/29 |
| PR #30: feature/9-create-ticket-ui → lab2-staging | https://github.com/chanya06/toktickit/pull/30 |
| PR #31: feature/10-my-tickets-api → lab2-staging | https://github.com/chanya06/toktickit/pull/31 |
| PR #32: feature/11-my-tickets-ui → lab2-staging | https://github.com/chanya06/toktickit/pull/32 |
| PR #33: feature/12-ticket-detail → lab2-staging | https://github.com/chanya06/toktickit/pull/33 |
| PR #34: feature/13-attachment-lifecycle → lab2-staging | https://github.com/chanya06/toktickit/pull/34 |
| PR #35: feature/14-qa-release → lab2-staging | https://github.com/chanya06/toktickit/pull/35 |
| PR #37: feature/15-ui-refinement → lab2-staging | https://github.com/chanya06/toktickit/pull/37 |
| PR #39: feature/16-reviewer-docs-sync → lab2-staging | https://github.com/chanya06/toktickit/pull/39 |
| Release PR #41: lab2-staging → main | https://github.com/chanya06/toktickit/pull/41 |

### 1.2 Kanban Board Evidence
![GitHub Project Kanban Board showing all Issues in Done column](../../artifacts/lab-02/screenshots/kanban-board.png)

- **Project Board URL**: https://github.com/users/chanya06/projects/1
- **Board Status**: All 16 Issues (Issue #1 to Issue #16) are completed and placed in the **Done** column.

### 1.3 Git Commit History

`ash
$ git log --all --graph --oneline
* 4235179 docs(lab-02): complete final submission report, deliverables, and screenshot evidence
*   8da45f0 Merge pull request #43 from chanya06/lab2-staging
|\\  
| *   409ed19 Merge pull request #42 from chanya06/docs/lab2-reviewer-update
| |\\  
| | * d727ce5 docs(lab-02): update peer review record with verbatim GitHub review data
| |/  
|/|   
* | 359129a Merge pull request #41 from chanya06/lab2-staging
|\\| 
| * e054e0e docs: update PR #39 status to Merged in reviewer log
| *   47da49d Merge pull request #39 from chanya06/feature/16-reviewer-docs-sync
| |\\  
| | * 313911b docs: add PR #39 entry and Review Item 11 to reviewer.md
| | * 544b49d docs: sync test metric numbers in tests.md and re-generate final deliverable PDF
| | * 0280e91 docs: add peer reviewer feedback column to PR Log table in reviewer.md
| | * 4f44f44 docs: add GitHub PR links and resolution status to reviewer.md
| |/  
| *   2c063e6 Merge pull request #37 from chanya06/feature/15-ui-refinement
| |\\  
| | * 647eabb docs: update reviewer log and deliverable PDF for Issue #36 UI refinement
| |/  
| *   f323c03 Merge branch 'lab2-staging' of https://github.com/chanya06/toktickit into lab2-staging
| |\\  
| | *   e674162 Merge pull request #35 from chanya06/feature/14-qa-release
| | |\\  
* | | \\   1b09d75 merge: integrate UI mockup alignment into lab2-staging
| |\\ \\ \\  
| | |/ /  
| |/| |   
| | * | 96a9375 style: align web UI with instructor mockups and remove emojis
| | * | ef8e139 feat(ui): update web UI components to strictly match Lab 2 Handout mockups, including Ticket Details grid, breadcrumb navigation, and requester selector modal
| | |/  
| | * 00db82f feat(qa): align deliverable markdown with handout section 14, capture working state screenshots, organize screenshot subdirectories, and regenerate deliverable PDF
| | * bea6eaf feat(qa): resolve peer review feedback, add deliverable PDF, update test plan, drag-and-drop dropzone, and atomic rollback tests
| | * 208f7fb feat(qa): implement initial attachments, rollback compensation, expanded e2e test, and final deliverable report
| | * 22b196b feat(qa): add Playwright E2E test suite, responsive screenshot suite, updated peer review audit log and AI use documentation
| |/  
| *   99c0f08 Merge pull request #34 from chanya06/feature/13-attachment-lifecycle
| |\\  
| | * 7b89dfc refactor(attachments): strictly enforce row lock without swallowing errors and test transaction failure rollback
| | * ecaedad refactor(attachments): inspect binary file magic bytes, add row level locking for active limit transaction, and reset busy states on requester change
| | * ad9a2dd refactor(attachments): add server MIME validation, atomic count transaction, and client stale request protection
| | * 6c9d1e3 feat(attachments): implement attachment lifecycle API endpoints, ownership authorization, soft removal and AttachmentSection UI
| |/  
| *   57a3ce5 Merge pull request #33 from chanya06/feature/12-ticket-detail
| |\\  
| | * f271edb fix(ticket-detail): clear ticket state immediately on requester change and test in-flight request cancellation
| | * f9ca27e refactor(ticket-detail): align requesterId identity strictly with query parameter contract and add requester switch unit tests
| | * 12055f3 feat(ticket-detail): implement GET /api/tickets/:id endpoint with ownership guard and TicketDetailView UI
| |/  
| *   a3422f6 Merge pull request #32 from chanya06/feature/11-my-tickets-ui
| |\\  
| | * 1857ae9 fix(ui): implement true multi-select checkbox UI, restore pagination & empty state tests, verify category retry & responsive classes
| | * c49c314 fix(ui): add search debounce, stale response protection, multi-select filters, and category error handling
| | * 876e6e4 feat(ui): implement My Tickets screen with search, filters, pagination, and responsive components
| |/  
`

![Git Commit Graph History Part 1](../../artifacts/lab-02/screenshots/git-history-1.png)
![Git Commit Graph History Part 2](../../artifacts/lab-02/screenshots/git-history-2.png)
![Git Commit Graph History Part 3](../../artifacts/lab-02/screenshots/git-history-3.png)

- **Workflow Verification**: The Git graph demonstrates feature branches created for each issue (`feature/*`), merged into `lab2-staging` via Pull Requests with peer review approvals, and final integration merged into `main`.

### 1.4 Repository Directory Structure
![IDE File Tree Repository Directory Structure](../../artifacts/lab-02/screenshots/directory-structure.png)

- **Directory Organization**: The repository structure shows all required Lab 2 files, including docs/lab-02/*.md specifications and reports, client/ frontend codebase, server/ backend API codebase, e2e/ Playwright test suite, and rtifacts/ screenshot assets.

### 1.5 README.md and .gitignore

#### Content of `README.md`:
```markdown
# TokTickIT - IT Service Desk Application

TokTickIT is an IT service desk web application built with React, TypeScript, Vite, Bootstrap, Node.js, Express, Prisma ORM, and PostgreSQL.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Bootstrap 5
- **Backend**: Node.js + Express + TypeScript
- **Database & ORM**: PostgreSQL 16 + Prisma ORM
- **Testing**: Vitest + Supertest + React Testing Library

---

## Prerequisites
- Node.js (v18+)
- npm
- Docker & Docker Compose (or local PostgreSQL)

---

## Setup Instructions

### 1. Database Setup
Start PostgreSQL using Docker Compose:
```bash
docker compose up -d db
```

### 2. Backend Setup (`server/`)
Navigate to the `server/` directory:
```bash
cd server
npm install
```

Copy environment file and configure `DATABASE_URL` and `PORT`:
```bash
cp .env.example .env
```

Run Prisma migrations:
```bash
npm run prisma:migrate
```

Seed the database:
```bash
npm run prisma:seed
```

Start the backend development server:
```bash
npm run dev
```

Run backend tests (Vitest + Supertest):
```bash
npm test
```

### 3. Frontend Setup (`client/`)
Navigate to the `client/` directory:
```bash
cd client
npm install
```

Copy environment file:
```bash
cp .env.example .env
```

Start the frontend development server:
```bash
npm run dev
```

Run frontend tests (Vitest + React Testing Library):
```bash
npm test
```
```

#### Content of .gitignore:
![Content of .gitignore](../../artifacts/lab-02/screenshots/gitignore.png)

### 1.6 Peer Review Evidence *(5 คะแนน)*

**Peer Review Summary Record:**
- **Author:** Chanya Poolketkij (@chanya06)
- **Peer Reviewer:** @lmaybelgracel
- **Full Verbatim Review File:** [docs/lab-02/reviewer.md](https://github.com/chanya06/toktickit/blob/main/docs/lab-02/reviewer.md)

| PR # | Branch | Author | Reviewer | Verdict | Summary of Feedback & Action Taken |
|---|---|---|---|---|---|
| [PR #23](https://github.com/chanya06/toktickit/pull/23) | eature/5-spec-and-tests | @chanya06 | @lmaybelgracel | Approved with comments | Suggested adding Section 7 (Known Limitations) to 	ests.md. Added accordingly. |
| [PR #25](https://github.com/chanya06/toktickit/pull/25) | eature/6-db-schema-seed | @chanya06 | @lmaybelgracel | Approved with comments | Verified Prisma FK index & seed idempotent script. Added foreign key index for Attachment.removedByRequesterId. |
| [PR #27](https://github.com/chanya06/toktickit/pull/27) | eature/7-requester-context | @chanya06 | @lmaybelgracel | Approved with comments | Checked Dev Requester Selector UI & localStorage key 	oktickit_dev_requester_id. Verified. |
| [PR #29](https://github.com/chanya06/toktickit/pull/29) | eature/8-create-ticket-api | @chanya06 | @lmaybelgracel | Approved with comments | Recommended explicit race condition transaction test for ticket sequence generator. Implemented transaction retry. |
| [PR #30](https://github.com/chanya06/toktickit/pull/30) | eature/9-create-ticket-ui | @chanya06 | @lmaybelgracel | Approved with comments | Requested local timezone preview for Ticket Date. Formatted createdAt preview. |
| [PR #31](https://github.com/chanya06/toktickit/pull/31) | eature/10-my-tickets-api | @chanya06 | @lmaybelgracel | Approved with comments | Verified multi-select filtering and pagination metadata contract. |
| [PR #32](https://github.com/chanya06/toktickit/pull/32) | eature/11-my-tickets-ui | @chanya06 | @lmaybelgracel | Approved with comments | Suggested multi-select checkbox UI for categories & priorities. Implemented. |
| [PR #33](https://github.com/chanya06/toktickit/pull/33) | eature/12-ticket-detail | @chanya06 | @lmaybelgracel | Approved with comments | Verified 403 Forbidden ownership guard for requester data isolation. |
| [PR #34](https://github.com/chanya06/toktickit/pull/34) | eature/13-attachment-lifecycle | @chanya06 | @lmaybelgracel | Approved with comments | Verified file MIME magic byte validation & soft removal audit fields. |
| [PR #35](https://github.com/chanya06/toktickit/pull/35) | eature/14-qa-release | @chanya06 | @lmaybelgracel | Approved with comments | Verified 107/107 automated test suite pass & E2E responsive screenshots. |
| [PR #37](https://github.com/chanya06/toktickit/pull/37) | eature/15-ui-refinement | @chanya06 | @lmaybelgracel | Approved | Verified UI alignment with instructor mockups and emoji removal. |
| [PR #39](https://github.com/chanya06/toktickit/pull/39) | eature/16-reviewer-docs-sync | @chanya06 | @lmaybelgracel | Approved with comments | Verified final document synchronization and test metrics. |
| [PR #41](https://github.com/chanya06/toktickit/pull/41) | lab2-staging → main | @chanya06 | @lmaybelgracel | Approved with comments | Final release integration into main branch approved after peer review audit. |

## Answer Part 2: Spec DD *(5 คะแนน)*

**ลิงก์:** https://github.com/chanya06/toktickit/blob/main/docs/lab-02/specification.md

```markdown
# Lab 2 Sprint Engineering Specification

## 1. Sprint Goal
Deliver a responsive Requester-facing IT support ticketing MVP for TokTickIT using a temporary Development Requester identity selector. The increment enables Requesters to create tickets with attachments, receive a system-generated Ticket Number, view and search their own ticket history in My Tickets, inspect Ticket Details (including Ticket Date / creation timestamp), management of attachment lifecycle (upload, metadata inspection, download, soft removal with mandatory reason), and strict data isolation between requesters.

---

## 2. Stakeholder Request Interpretation
The IT department needs an end-user ticketing interface allowing Requesters to report issues, select categories and affected systems, set requested priority, attach evidence files, and track ticket progress. Because full authentication is deferred to Lab 3, a temporary Development Requester selector acts as the logged-in context for testing multi-user ticket ownership and access control. The UI must follow a consistent Zen Green design system with reusable components, loading, empty, and safe error states.

---

## 3. Scope

### Included
- **Development Requester Selector**: Temporary testing identity switcher to select among seeded active Requesters, storing context in local storage.
- **Create Ticket Flow**: Form capturing Ticket Date / creation timestamp, Requester identity (read-only from context), Category, Related System, Requested Priority, Ticket Summary, Description, and file attachments. Generates official format `TKT-YYYY-XXXXXX`.
- **My Tickets Flow**: Paginated list of tickets owned by the current requester supporting text search, multi-select dropdown filters (Category, Priority, Status), sorting, clear filters, empty state, and no-results state.
- **Ticket Detail & Attachment Flow**: Read-only display of owned ticket fields (including Ticket Date / creation timestamp), attachment metadata list (`GET /api/tickets/:id/attachments`), adding allowed attachments, downloading active attachments, and soft-removing attachments with required removal reasons.
- **Requester Data Isolation**: Backend authorization enforcement preventing any Requester from viewing or modifying tickets or attachments owned by another Requester.
- **Zen Green Design & Responsiveness**: Consistent visual tokens across Desktop (>=992px), Tablet (768-991px), and Mobile (<768px).

### Excluded
- Real user authentication (login/logout, passwords, sessions, JWT tokens).
- IT Staff workflow (queues, claiming, changing IT Priority, resolving/closing tickets).
- Collaboration features (Public Comments, Internal Notes, Actions Taken).
- Status changes beyond initial `NEW`.
- Administrator functions (managing categories, systems, or user accounts).

---

## 4. Functional Requirements
- **FR-01**: The system shall provide a Development Requester Selection interface allowing the user to select an active testing Requester identity.
- **FR-02**: The selected Requester identity shall persist in the frontend application shell until explicitly changed.
- **FR-03**: The Create Ticket form shall require Category, Related System, Requested Priority, Ticket Summary, and Description.
- **FR-04**: The system shall auto-generate a unique Ticket Number in the format `TKT-YYYY-XXXXXX` upon ticket creation.
- **FR-05**: The system shall record and display the Ticket Date / creation timestamp (`createdAt`) on ticket creation, ticket listing, and ticket detail views.
- **FR-06**: A newly created ticket shall start with Current Status `NEW` and default IT Priority `MEDIUM`.
- **FR-07**: The system shall allow attaching files during ticket creation or via Ticket Detail screen.
- **FR-08**: The system shall restrict attachments to allowed MIME types (JPG/JPEG, PNG, WEBP, PDF) and max size of 5 MB per file.
- **FR-09**: The system shall restrict each ticket to a maximum of 5 active (non-removed) attachments.
- **FR-10**: The system shall allow the owning Requester to soft-remove an active attachment by providing a mandatory removal reason.
- **FR-11**: Soft-removed attachments shall remain visible as metadata in the attachment list marked as removed, but file payload shall be blocked from preview or download.
- **FR-12**: My Tickets screen shall display a paginated list of tickets belonging strictly to the currently selected Requester.
- **FR-13**: My Tickets screen shall support text search across Ticket Number and Summary.
- **FR-14**: My Tickets screen shall support filtering by Category, Requested Priority, and Status, as well as sorting by Ticket Date / createdAt and Ticket Number.
- **FR-15**: Unauthorized/cross-requester ticket access must not return the requested ticket data, using the documented ownership-failure status (`403 Forbidden`).

---

## 5. Business Rules
- **BR-01**: Official Ticket Number is generated by backend database sequence/generator and must be globally unique (`TKT-YYYY-XXXXXX`).
- **BR-02**: Initial Current Status is hardcoded to `NEW`.
- **BR-03**: Initial IT Priority defaults to `MEDIUM` unless updated by IT Staff in later sprints.
- **BR-04**: Requester identity selected in Development Requester selector is for testing only and does NOT constitute secure authentication.
- **BR-05**: Inactive Requesters (`isActive: false`) must NOT be listed in the Development Requester selector.
- **BR-06**: Switching the active Requester reloads all application data and clears cached requester-specific tickets.
- **BR-07**: Ticket Summary is required, trimmed of leading/trailing whitespace, minimum 5 characters, maximum 120 characters.
- **BR-08**: Ticket Description is required, trimmed, minimum 10 characters, maximum 2000 characters.
- **BR-09**: Ticket Date (`createdAt`) is immutable system timestamp set upon initial database insert and formatted in local locale string.
- **BR-10**: Allowed file attachment extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`. File size max: `5,242,880 bytes` (5 MB).
- **BR-11**: Maximum active attachments per ticket is 5. Attempts to upload a 6th active attachment must fail with validation error `422 Unprocessable Entity`.
- **BR-12**: Attachment removal MUST be implemented as a soft removal (`isRemoved: true`, `removedAt`, `removalReason`, `removedByRequesterId`). Hard deletion of file payload or database record is forbidden.
- **BR-13**: Removal reason is mandatory, trimmed, minimum 3 characters, maximum 250 characters.
- **BR-14**: Direct file download `GET /api/attachments/:id/download` for a soft-removed attachment MUST return `403 Forbidden` or `404 Not Found`.
- **BR-15**: Attachment Upload Transaction & Compensation Strategy:
  - When creating a ticket with initial attachments: Ticket creation and database records execute inside a database transaction. If file storage writes fail during ticket creation, the database transaction is rolled back completely.
  - When uploading attachments to an existing ticket: File storage write executes first with a temporary filename; database record creation follows. If database insertion fails, the temporary file is deleted (compensated).
- **BR-16**: Form inputs preserve entered data when validation errors occur on submission failure.
- **BR-17**: Requester ticket isolation is enforced on every single API endpoint by validating `requesterId` parameter against ticket owner.
- **BR-18**: Empty state appears when a Requester has 0 total tickets. No-results state appears when filters/search yield 0 matching tickets.
- **BR-19**: Default page size for My Tickets list is 10 items per page with page numbers starting at 1. Default sorting is `createdAt DESC`.
- **BR-20**: Transition to Lab 3 auth will replace the Development Requester Selector with secure session/JWT headers while maintaining the same database schema (`requesterId`).

---

## 6. UI Specification Summary
- **Color Palette (Zen Green)**:
  - Header & Primary Actions: `#006B3C`
  - Secondary / Focus / Links: `#0B7A46`
  - Pale Accent / Selected / Soft BG: `#EAF6EF`
  - Page Background: `#F5F7F6`
  - Surfaces / Cards: `#FFFFFF` with `#E5E7EB` border and subtle shadow
  - Text: Dark Charcoal (`#1F2937`)
  - Error: Dark Red (`#DC2626`)
- **Key Components**:
  - `Header`: TokTickIT brand, My Tickets link, Create Ticket button, Requester avatar/badge, Switch Requester dropdown.
  - `RequesterSelectorModal`: Modal prompting selection of active testing user context.
  - `CreateTicketForm`: Category dropdown, Related System dropdown, Requested Priority radio/select, Summary input, Description textarea, File Upload Dropzone, Ticket Date read-only preview, Submit button with busy spinner.
  - `MyTicketsTable / Cards`: Responsive table on desktop, cards on mobile. Includes search input, Category/Priority/Status filter dropdowns, Clear Filters button, pagination controls.
  - `TicketDetailView`: Read-only layout displaying Ticket Number, Ticket Date (`createdAt`), Status badge, Requested Priority badge, Requester info, Category, Related System, Summary, Description, and Attachment Section.
  - `AttachmentSection`: Active files list with download button and soft-remove button; soft-removed files list showing reason metadata; Add Attachment upload dropzone; Soft Remove confirmation modal with reason textarea.
- **Responsive Rules**:
  - Desktop (`>=992px`): 2-column ticket detail grid, multi-column search & filter bar, desktop data table.
  - Tablet (`768px - 991px`): 2-column form layout, stacked search/filters, flexible table.
  - Mobile (`<768px`): 1-column vertically stacked layout, card list view for My Tickets, touch-friendly 44px minimum target sizes.

---

---

## 7. Data Changes (Prisma Schema)

### Enum Definitions
```prisma
enum RequestedPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ITPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketStatus {
  NEW
  OPEN
  IN_PROGRESS
  PENDING
  RESOLVED
  CLOSED
}
```

### Models
1. **`DevelopmentRequester`**: `id` (Int @id @default(autoincrement())), `name` (String), `email` (String @unique), `department` (String?), `isActive` (Boolean @default(true)), `createdAt` (DateTime @default(now())), `updatedAt` (DateTime @updatedAt)
2. **`Category`**: `id` (Int @id @default(autoincrement())), `name` (String @unique), `isActive` (Boolean @default(true)), `createdAt` (DateTime @default(now()))
3. **`RelatedSystem`**: `id` (Int @id @default(autoincrement())), `name` (String @unique), `isActive` (Boolean @default(true)), `createdAt` (DateTime @default(now()))
4. **`Ticket`**: `id` (Int @id), `ticketNumber` (String @unique), `requesterId` (FK -> DevelopmentRequester), `categoryId` (FK -> Category), `relatedSystemId` (FK -> RelatedSystem), `summary` (String), `description` (String), `requestedPriority` (RequestedPriority), `itPriority` (ITPriority @default(MEDIUM)), `status` (TicketStatus @default(NEW)), `createdAt` (DateTime @default(now()))
5. **`Attachment`**: `id` (Int @id), `ticketId` (FK -> Ticket), `filename` (String), `originalName` (String), `mimeType` (String), `sizeBytes` (Int), `filepath` (String), `isRemoved` (Boolean @default(false)), `removalReason` (String?), `removedAt` (DateTime?), `removedByRequesterId` (FK -> DevelopmentRequester), `createdAt` (DateTime @default(now()))

---

## 8. API Contract Summary
- `GET /api/requesters`: Returns list of active Development Requesters.
- `GET /api/categories`: Returns list of active Categories.
- `GET /api/related-systems`: Returns list of active Related Systems.
- `POST /api/tickets`: Creates a Ticket for selected Requester (`requesterId` in body). Returns 201 Created with full Ticket payload + ticketNumber.
- `GET /api/tickets`: Query tickets owned by selected Requester (`requesterId` query param mandatory). Supports `search`, `category`, `priority`, `status`, `sortBy`, `sortOrder`, `page`, `pageSize`. Returns paginated JSON.
- `GET /api/tickets/:id`: Get single owned ticket details. Enforces requester ownership check. Returns 200 OK or 403/404.
- `GET /api/tickets/:id/attachments`: Get attachment metadata list for specified ticket. Enforces ownership check. Returns active & soft-removed attachment metadata list.
- `POST /api/tickets/:id/attachments`: Upload attachment file (multipart/form-data) to owned ticket. Validates file type, size (5MB), and max active count (5). Returns 201 Created.
- `GET /api/attachments/:id/download`: Download file payload for an active attachment. Rejects request with 403/404 if soft-removed or owned by another requester.
- `DELETE /api/attachments/:id`: Soft-remove attachment with `removalReason` and `requesterId` in body/headers. Sets `isRemoved: true`.

---

## 9. Acceptance Criteria
- **AC-01**: Given a valid Ticket payload and selected Requester A, when submitted via `POST /api/tickets`, then 1 Ticket record is created with auto-generated Ticket Number (`TKT-YYYY-XXXXXX`), Ticket Date (`createdAt`), status `NEW`, and assigned `requesterId = A`.
- **AC-02**: Given no Development Requester is selected, when opening any application screen, then the Requester Selector modal is presented.
- **AC-03**: Given Requester A is selected, when requesting `GET /api/tickets?requesterId=A`, then only tickets owned by Requester A are returned.
- **AC-04**: Given Requester B is selected, when attempting `GET /api/tickets/:id` for a ticket owned by Requester A, then unauthorized cross-requester access must not return the requested ticket data, returning the documented `403 Forbidden` status.
- **AC-05**: Given an active attachment on Ticket T owned by Requester A, when Requester A submits a soft-removal request with a valid reason, then `isRemoved` is set to `true`, `removalReason` is saved, and subsequent file download requests fail with 403/404.
- **AC-06**: Given a ticket already containing 5 active attachments, when attempting to upload a 6th attachment, then submission is rejected with validation error "Maximum active attachments limit (5) reached".
- **AC-07**: Given a file exceeding 5 MB or with an unsupported extension (e.g. `.exe`), when uploading, then submission fails with an explicit file validation error message.
- **AC-08**: Given search term `laptop` and Requester A selected, when entering search in My Tickets, then only Requester A's tickets containing `laptop` in Ticket Number or Summary are displayed.
- **AC-09**: Given Ticket Date / creation timestamp `createdAt`, when viewing Create Ticket, My Tickets, or Ticket Detail, then the Ticket Date is displayed clearly in readable format.
- **AC-10**: Given server connection failure during form submission, then form field values are preserved and a safe user-friendly error banner is shown.

---

## 10. Definition of Done

### Part 1: Product Completion
- [x] All functional requirements (FR-01..FR-15) and business rules (BR-01..BR-20) implemented.
- [x] All acceptance criteria (AC-01..AC-10) verified by passing automated tests.
- [x] Database schema migrated and seeded idempotently (`npm run seed`).
- [x] API endpoints created with proper HTTP status codes and ownership checks.
- [x] Zen Green design system implemented with responsive layout (Desktop, Tablet, Mobile).
- [x] Unit, API, UI Component, UI Style & Responsive, and Playwright E2E test suites green.
- [x] Visual screenshots captured for Desktop, Tablet, and Mobile views in `artifacts/lab-02/screenshots/`.

### Part 2: Course Delivery Requirements
- [x] Feature branches developed from `lab2-staging` and merged via PRs into `lab2-staging`.
- [x] Final release PR opened from `lab2-staging` to `main`.
- [x] All 6 required docs in `docs/lab-02/` completed (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`).
- [x] Single PDF submission compiled with exact section headers "Answer Part 1" through "Answer Part 9".
### 2.1 Specification Pre-existence Proof
![PR #23 Specification & Test Plan File Additions](../../artifacts/lab-02/screenshots/spec-preexistence-pr23-files.png)
![PR #23 specification.md Creation Diff](../../artifacts/lab-02/screenshots/spec-preexistence-pr23-diff.png)
![PR #25 Database Schema Implementation updating specification.md](../../artifacts/lab-02/screenshots/spec-preexistence-pr25-timeline.png)

- **Pre-existence Proof**: PR #23 (Feature/5 Sprint Specifications & Test Plan) was created and merged into lab2-staging before any implementation PRs (PR #25 DB Schema, PR #27 Requester Context, PR #29 Create Ticket API, etc.) were developed and merged, proving Spec-Driven Development workflow compliance.
---

## Answer Part 3: Test DD and Traceability *(10 คะแนน)*

**ลิงก์:** https://github.com/chanya06/toktickit/blob/main/docs/lab-02/tests.md

```markdown
# Lab 2 Test Plan and Traceability Matrix

## 1. Test Strategy
The testing strategy validates the entire full-stack application across five distinct levels:
1. Unit Tests (`server/tests/lab-02/unit/`)
2. API Integration Tests (`server/tests/lab-02/`)
3. UI Component Tests (`client/tests/lab-02/`)
4. UI Style & Responsive Tests (`client/tests/lab-02/`)
5. Playwright E2E Tests (`e2e/lab-02/`)

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

| Acceptance Criterion | Primary Validating Test(s) | Pass Status |
| :--- | :--- | :--- |
| **AC-01** (Create Ticket with Ticket Number & Date) | `UNIT-01`, `API-01`, `UI-02`, `E2E-01` | Pass |
| **AC-02** (Requester Selector required when unselected) | `UI-01`, `E2E-01` | Pass |
| **AC-03** (My Tickets owned tickets filtering) | `API-03`, `UI-04`, `E2E-01` | Pass |
| **AC-04** (Cross-Requester Ticket Access Blocked) | `API-05`, `E2E-01` | Pass |
| **AC-05** (Soft removal with reason & blocked download) | `API-08`, `UI-06`, `E2E-01` | Pass |
| **AC-06** (Max 5 active attachments limit) | `UNIT-02`, `API-07` | Pass |
| **AC-07** (File size & type restriction validation) | `UNIT-02`, `UI-03` | Pass |
| **AC-08** (Search term in My Tickets) | `API-04`, `UI-04`, `E2E-01` | Pass |
| **AC-09** (Ticket Date displayed on screens) | `API-01`, `UI-02`, `UI-05` | Pass |
| **AC-10** (Form values preserved on submission failure) | `UI-03` | Pass |
```

*(เรนเดอร์ Console Output ผลการรันเทส 107/107 passed ด้านบนเรียบร้อยแล้ว)*

---

### 3.3 Real Terminal Test Execution Output

```text
=== SERVER VITEST TEST SUITE (54/54 Passed) ===
 RUN  v2.1.9 C:/Users/chany/Documents/GitHub/toktickit/server

 ✓ tests/lab-02/unit/ticket-number.test.ts (5 tests)
 ✓ tests/lab-01/health.test.ts (1 test)
 ✓ tests/lab-01/categories.test.ts (2 tests)
 ✓ tests/lab-02/requesters.api.test.ts (2 tests)
 ✓ tests/lab-02/ticket-detail.api.test.ts (5 tests)
 ✓ tests/lab-02/create-ticket.api.test.ts (10 tests)
 ✓ tests/lab-02/my-tickets.api.test.ts (9 tests)
 ✓ tests/lab-02/attachments.api.test.ts (20 tests)

 Test Files  8 passed (8)
      Tests  54 passed (54)

=== CLIENT VITEST TEST SUITE (42/42 Passed) ===
 RUN  v2.1.9 C:/Users/chany/Documents/GitHub/toktickit/client

 ✓ tests/lab-02/RequesterTicketDetail.test.tsx (7 tests)
 ✓ tests/lab-02/AttachmentSection.test.tsx (7 tests)
 ✓ tests/lab-01/App.test.tsx (4 tests)
 ✓ tests/lab-02/RequesterSelect.test.tsx (4 tests)
 ✓ tests/lab-02/CreateTicket.test.tsx (8 tests)
 ✓ tests/lab-02/MyTickets.test.tsx (12 tests)

 Test Files  6 passed (6)
      Tests  42 passed (42)

=== PLAYWRIGHT E2E & VISUAL TEST SUITE (11/11 Passed) ===
  ok  1 [msedge] › e2e/lab-02/capture-screenshots.spec.ts (desktop 1280x800)
  ok  2 [msedge] › e2e/lab-02/capture-screenshots.spec.ts (tablet 768x1024)
  ok  3 [msedge] › e2e/lab-02/capture-screenshots.spec.ts (mobile 375x667)
  ok  4 [msedge] › e2e/lab-02/capture-screenshots.spec.ts (requester selector modal)
  ok  5 [msedge] › e2e/lab-02/capture-screenshots.spec.ts (validation error state)
  ok  6 [msedge] › e2e/lab-02/capture-screenshots.spec.ts (submitting busy state)
  ok  7 [msedge] › e2e/lab-02/capture-screenshots.spec.ts (success confirmation card)
  ok  8 [msedge] › e2e/lab-02/capture-screenshots.spec.ts (backend failure state)
  ok  9 [msedge] › e2e/lab-02/capture-screenshots.spec.ts (search filter & isolation)
  ok 10 [msedge] › e2e/lab-02/capture-screenshots.spec.ts (soft remove modal & status)
  ok 11 [msedge] › e2e/lab-02/requester-ticket-flow.spec.ts (full requester lifecycle)

  11 passed (21.5s)
  TOTAL SPRINT TEST METRIC: 107 / 107 Passed (100%)
```

---

## Answer Part 4: AI Use with Reflection *(5 คะแนน)*

```markdown
# Lab 2 AI Use Documentation and Reflection

## 1. LLM / AI Coding Assistant Details
- **AI Coding Assistant**: Gemini 2.5 Pro / Antigravity AI Pair Programmer
- **Primary Tasks Assisted**:
  - Drafting Spec-Driven Development contracts (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`).
  - Prisma database schema modeling for multi-tenant identity testing and soft-removal of attachments.
  - Generating backend REST endpoints with strict ownership checks.
  - Designing Zen Green React components with accessible forms and responsive breakpoints.
  - Implementing binary magic bytes inspection for upload security.
  - Constructing PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) in Prisma transactions for active limit concurrency protection.
  - Writing automated unit, API, UI component, style, and Playwright E2E tests.

---

## 2. Selected Key Prompt Log

| Prompt # | Prompt Name | Actual Prompt Text | My Reflection |
| :--- | :--- | :--- | :--- |
| **P-01** | Review Contract | "Read docs/lab-02 requirements and draft specification.md, api-spec.md, ui-spec.md, and tests.md covering all BRs, ACs, and Zen Green tokens before writing code." | Generated complete markdown specification docs adhering strictly to lab sheet structure. |
| **P-02** | Attachment Rules | "Include 5MB file limit, 5 active attachments per ticket max, allowed mime types (JPG/PNG/WEBP/PDF), soft-removal with reason, and upload transaction/compensation strategy." | Documented BR-10 through BR-15 and specified database fields for soft-removal. |
| **P-03** | Data Isolation | "Ensure requester ownership check is enforced across GET /api/tickets, GET /api/tickets/:id, POST/DELETE attachments, returning 403 Forbidden for cross-requester access." | Defined ownership authorization logic and added API test AC-04 verification. |
| **P-04** | Ticket Date & Format | "Ensure ticket number generator produces TKT-YYYY-XXXXXX and Ticket Date / createdAt is exposed and formatted across UI screens." | Specified FR-04, FR-05, and UI layout rules for Ticket Date display. |
| **P-05** | API Attachment Metadata | "Add GET /api/tickets/:id/attachments endpoint for active and soft-removed attachment metadata list." | Added section 3.1 to api-spec.md and corresponding controller specification. |
| **P-06** | Create Failing API Tests | "Implement the planned API tests for the current Issue first. Confirm they fail for the expected reason before implementing ticket creation." | Enforced TDD methodology by writing failing API integration tests first. |
| **P-07** | Idempotent Seed Script | "Create Prisma schema and seed script using upsert to avoid primary key or unique constraint duplication when re-executed." | Implemented Prisma models and seed script with upsert logic for categories and test requesters. |
| **P-08** | Requester Selector UI | "Build Development Requester Selector modal with persistent localStorage context and sync HTTP header X-Requester-Id." | Implemented React context provider, dropdown modal dialog, and axios request interceptor. |
| **P-09** | Ticket API & Sequence | "Implement POST /api/tickets and GET /api/tickets with pagination, category filtering, search term query, and TKT sequential number generation." | Created Express route handlers, query builder, and Prisma atomic transaction sequence logic. |
| **P-10** | Detail & Ownership Guard | "Build TicketDetailView and backend routes enforcing strict 403 Forbidden response on unauthorized cross-requester access attempts." | Implemented read-only detail view, attachment section, and ownership verification middleware. |

---

## 3. My Reflection on AI Use Experience
Using the AI coding assistant following the Spec-Driven Development (Spec DD) methodology yielded significant improvements in software quality and development velocity:
1. **Clarity Before Coding**: Drafting specifications prior to code implementation eliminated ambiguity around edge cases.
2. **Strict Test Traceability**: Mapping every Acceptance Criterion directly to automated test cases ensured 100% test coverage.
3. **Productive Human-AI Pair Programming**: The AI handled boilerplate code while I maintained control over system architecture and code reviews.
```

---

## Answer Part 5: Development Requester Selection Screen
*(รวมคะแนนกับ Part 6)*

![Development Requester Selector Modal](../../artifacts/lab-02/screenshots/create-ticket/requester-selector.png)

### 5.2 Loading State
![Requester Selector Loading State](../../artifacts/lab-02/screenshots/requester-selector-loading.png)

### 5.3 API Failure State (Connection Error & Retry Button)
![Requester Selector API Failure State](../../artifacts/lab-02/screenshots/requester-selector-api-failure.png)

### 5.4 Empty State (No Active Requesters & Disabled Continue Button)
![Requester Selector Empty State](../../artifacts/lab-02/screenshots/requester-selector-empty.png)

---

## Answer Part 6: Working Ticket Screen: Create Mode *(10 คะแนน)*

1. **Requester field populated correctly**
![Create Ticket Selected Requester](../../artifacts/lab-02/screenshots/create-ticket/desktop.png)
![Ticket Confirmation Number](../../artifacts/lab-02/screenshots/create-ticket/success-confirmation.png)

2. **Reference data loaded (desktop viewport)**
![Dropdown Reference Data](../../artifacts/lab-02/screenshots/create-ticket/desktop.png)

3. **Invalid submission**
![Field Validation Errors](../../artifacts/lab-02/screenshots/create-ticket/validation-error.png)

4. **Attachment validation**
![Initial File Attachment](../../artifacts/lab-02/screenshots/create-ticket/desktop.png)

5. **Backend/API failure**
![API Failure Retained Form](../../artifacts/lab-02/screenshots/create-ticket/api-failure-retained.png)

---

## Answer Part 7: Working My Tickets Screen *(10 คะแนน)*

![My Tickets Requester A](../../artifacts/lab-02/screenshots/my-tickets/desktop.png)
![Cross Requester Isolation](../../artifacts/lab-02/screenshots/my-tickets/cross-requester-isolation.png)
![Search Feature](../../artifacts/lab-02/screenshots/my-tickets/search-filter.png)
![Filter Dropdowns](../../artifacts/lab-02/screenshots/my-tickets/search-filter.png)
![Sort Feature](../../artifacts/lab-02/screenshots/my-tickets/search-filter.png)
![Pagination Controls](../../artifacts/lab-02/screenshots/my-tickets/desktop.png)
![Empty State](../../artifacts/lab-02/screenshots/my-tickets/cross-requester-isolation.png)
![No Results State](../../artifacts/lab-02/screenshots/my-tickets/search-filter.png)
![Cross Requester Blocked](../../artifacts/lab-02/screenshots/my-tickets/cross-requester-isolation.png)

---

## Answer Part 8: Ticket Screen View Mode & Attachments *(5 คะแนน)*

![Ticket Detail Read Only](../../artifacts/lab-02/screenshots/ticket-detail/desktop.png)
![Add Attachment](../../artifacts/lab-02/screenshots/ticket-detail/desktop.png)
![Download Attachment](../../artifacts/lab-02/screenshots/ticket-detail/desktop.png)
![Soft Remove Modal Prompt](../../artifacts/lab-02/screenshots/ticket-detail/soft-remove-modal.png)
![Soft Removed Status](../../artifacts/lab-02/screenshots/ticket-detail/soft-removed-status.png)
![Unauthorized Access Blocked (403 Forbidden Response)](../../artifacts/lab-02/screenshots/ticket-detail/forbidden-access.png)

---


### 8.1 Cross-Requester Ownership Authorization Evidence (403 Forbidden)

```typescript
// Extract from server/tests/lab-02/ticket-detail.api.test.ts (AC-04 Verification)
it("returns 403 Forbidden when requesting a ticket owned by another requester", async () => {
  const res = await request(app)
    .get("/api/tickets/1")
    .set("X-Requester-Id", "2"); // Requester 2 attempting to view Requester 1's ticket

  expect(res.status).toBe(403);
  expect(res.body).toEqual({
    error: "Forbidden: You do not have permission to view or modify this ticket."
  });
});
```

```typescript
// Extract from server/tests/lab-02/attachments.api.test.ts (AC-05 / BR-14 Verification)
it("returns 403 Forbidden when downloading soft-removed attachment or cross-requester file", async () => {
  const res = await request(app)
    .get("/api/attachments/99/download")
    .set("X-Requester-Id", "2");

  expect(res.status).toBe(403);
  expect(res.body.error).toMatch(/Forbidden/);
});
```

---

## Answer Part 9: Zen Green UI and Responsive Evidence *(5 คะแนน)*

**ลิงก์:** https://github.com/chanya06/toktickit/blob/main/docs/lab-02/ui-spec.md

```markdown
# Lab 2 Zen Green UI Specification

## 1. Design System Tokens & Color Palette

| Token / Element | Color Code | Usage / Context |
| :--- | :--- | :--- |
| **Primary Green** | `#006B3C` | Main navbar, primary action buttons, strong brand header emphasis. |
| **Secondary Green** | `#0B7A46` | Active tab highlights, focus ring accents, interactive links, hover states. |
| **Pale Green** | `#EAF6EF` | Selected card rows, success message banners, subtle section callouts. |
| **Page Background** | `#F5F7F6` | Quiet near-white background color for page container. |
| **Surface / Card BG**| `#FFFFFF` | Card backgrounds, modal containers, data table background. |
| **Border Color** | `#E5E7EB` | Subtle light gray card borders and table row dividers. |
| **Text Dark** | `#1F2937` | Dark charcoal-green text for high-contrast, comfortable reading. |
| **Text Muted** | `#6B7280` | Subtitle text, table header labels, secondary hints. |
| **Editable Field BG**| `#FFFFFF` | Form inputs, select dropdowns, textareas. |
| **Read-Only Field BG**| `#F3F4F6` | Soft gray-green shading for system-generated fields (Ticket No, Ticket Date). |
| **Error Text / Border**| `#DC2626` | Field validation error text and input highlight border. |
| **Warning Callout**| `#D97706` | Amber callouts or warning badges. |
| **Success Banner** | `#16A34A` | Green confirmation banners with checkmark icons. |
```

![Desktop Viewport](../../artifacts/lab-02/screenshots/create-ticket/desktop.png)

![My Tickets Desktop](../../artifacts/lab-02/screenshots/my-tickets/desktop.png)

![Ticket Detail Desktop](../../artifacts/lab-02/screenshots/ticket-detail/desktop.png)
![Tablet Viewport](../../artifacts/lab-02/screenshots/create-ticket/tablet.png)

![My Tickets Tablet](../../artifacts/lab-02/screenshots/my-tickets/tablet.png)

![Ticket Detail Tablet](../../artifacts/lab-02/screenshots/ticket-detail/tablet.png)
![Mobile Viewport](../../artifacts/lab-02/screenshots/create-ticket/mobile.png)

![My Tickets Mobile](../../artifacts/lab-02/screenshots/my-tickets/mobile.png)

![Ticket Detail Mobile](../../artifacts/lab-02/screenshots/ticket-detail/mobile.png)
