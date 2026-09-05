# TokTickIT Lab 2 — Final Engineering Deliverable & Quality Assurance Report

**Project**: TokTickIT — Spec-Driven IT Support Ticket Management System (Lab 2)  
**Author / Team**: `chanya06`  
**Reviewer**: Peer Reviewer (`lmaybelgracel`)  
**Target Branch**: `lab2-staging` -> `main`  
**Date**: September 5, 2026  

---

## Answer Part 1: Project Architecture & Spec-Driven Development (Spec DD) Overview

### 1.1 Methodology
TokTickIT Lab 2 was engineered using **Spec-Driven Development (Spec DD)**. Before any source code implementation was initiated, four foundational specification contracts were written and committed under `docs/lab-02/`:
1. `specification.md`: High-level system requirements, Business Rules (`BR-01..BR-16`), Functional Requirements (`FR-01..FR-15`), and Acceptance Criteria (`AC-01..AC-10`).
2. `api-spec.md`: OpenAPI/REST contract endpoints, request/response schemas, validation rules, HTTP status codes (`200`, `201`, `400`, `403`, `404`, `413`, `422`, `500`), and header isolation (`X-Requester-Id`).
3. `ui-spec.md`: User interface layouts, Zen Green design system color palette tokens (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`), responsive grid breakpoints (Desktop 1280px, Tablet 768px, Mobile 375px), and error messaging placement.
4. `tests.md`: Test strategy, planned automated test cases across 5 levels, traceability matrix, visual inspection checklist, and known limitations.

### 1.2 Full-Stack Architecture Stack
- **Frontend (Client)**: React 18, TypeScript, Vite, Bootstrap 5 (Custom Zen Green styling), Context API for Development Requester context state management.
- **Backend (Server)**: Node.js, Express, TypeScript, Prisma ORM, Multer for multipart file uploads.
- **Database**: PostgreSQL with Prisma Schema models.
- **Testing Engine**: Vitest & Supertest (Server API & Unit), Vitest & React Testing Library (Client Components & Style), Playwright (End-to-End Browser Journeys & Responsive Screenshot Captures).

---

## Answer Part 2: Database Prisma Schema & Migration Strategy

### 2.1 Database Schema Models
The relational database models defined in `server/prisma/schema.prisma` support multi-tenant identity testing, ticket creation, and attachment lifecycles:

```prisma
model DevelopmentRequester {
  id         Int      @id @default(autoincrement())
  name       String
  email      String   @unique
  department String?
  isActive   Boolean  @default(true)
  tickets    Ticket[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  isActive  Boolean  @default(true)
  tickets   Ticket[]
  createdAt DateTime @default(now())
}

model RelatedSystem {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  tickets     Ticket[]
  createdAt   DateTime @default(now())
}

enum RequestedPriority {
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

model Ticket {
  id                Int                  @id @default(autoincrement())
  ticketNumber      String               @unique
  requesterId       Int
  categoryId        Int
  relatedSystemId   Int
  summary           String
  description       String
  requestedPriority RequestedPriority    @default(MEDIUM)
  itPriority        RequestedPriority    @default(MEDIUM)
  status            TicketStatus         @default(NEW)
  ticketOwner       String?
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt
  requester         DevelopmentRequester @relation(fields: [requesterId], references: [id])
  category          Category             @relation(fields: [categoryId], references: [id])
  relatedSystem     RelatedSystem        @relation(fields: [relatedSystemId], references: [id])
  attachments       Attachment[]
}

model Attachment {
  id            Int       @id @default(autoincrement())
  ticketId      Int
  filename      String
  originalName  String
  mimeType      String
  sizeBytes     Int
  filepath      String
  isRemoved     Boolean   @default(false)
  removalReason String?
  removedAt     DateTime?
  createdAt     DateTime  @default(now())
  ticket        Ticket    @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}
```

### 2.2 Idempotent Seeding Strategy
`server/prisma/seed.ts` uses Prisma `upsert` operations for categories, related systems, and development requesters. Executing `npx prisma db seed` repeatedly runs cleanly without key duplication or constraint violations.

---

## Answer Part 3: Identity & Requester Isolation Security Model

### 3.1 Context & Isolation
In Lab 2, real user authentication is out of scope (`Known Limitations`). To simulate multi-tenant data isolation, a **Development Requester Selector** component (`RequesterSelectorModal.tsx`) allows switching the active requester context (e.g. Jennifer Anderson vs Michael Brown).

### 3.2 Authorization & Conflict Middleware
- **Header Synchronization**: The client passes the active requester ID in HTTP header `X-Requester-Id` and URL query parameter `requesterId`.
- **Query / Header Conflict Verification**: The server verifies that if both `X-Requester-Id` header and `requesterId` query parameter are present, their values must match exactly; otherwise, the server rejects the request with `400 Bad Request`.
- **Cross-Requester Ownership Guard (`403 Forbidden`)**: Every API endpoint (`GET /api/tickets`, `GET /api/tickets/:id`, `GET /api/tickets/:id/attachments`, `POST /api/tickets/:id/attachments`, `GET /api/attachments/:id/download`, `DELETE /api/attachments/:id/soft-remove`) verifies that the requested ticket or attachment belongs to the active `requesterId`. Cross-requester access attempts return `403 Forbidden`.

---

## Answer Part 4: Ticket Creation & Sequential Numbering Engine

### 4.1 Ticket Number Format & Generation
Tickets are assigned a unique, immutable ticket number formatted as `TKT-YYYY-XXXXXX` (e.g. `TKT-2026-000001`). Sequence numbers reset yearly.

### 4.2 Initial File Attachments & Transaction Compensation (`BR-15`)
- `POST /api/tickets` handles multipart/form-data with up to 5 initial file attachments.
- **Transaction Compensation Strategy**:
  - File binary signature (magic bytes), extension, size (<= 5MB), and MIME types are validated before database persistence.
  - Ticket record creation and initial attachment records creation are wrapped in a Prisma `$transaction`.
  - If any validation error, DB constraint error, or server exception occurs, all uploaded files are unlinked/deleted from disk immediately (`fs.unlinkSync`), guaranteeing zero orphan files on server storage.

---

## Answer Part 5: My Tickets Search, Multi-Select Filter & Pagination Engine

### 5.1 Endpoint Capabilities (`GET /api/tickets`)
- **Debounced Search**: Searches across `ticketNumber` and `summary` with 300ms debounce.
- **Multi-Select Filtering**: Category (`categoryId`), Requested Priority (`requestedPriority`), and Status (`status`) accept comma-separated strings or arrays.
- **Sorting**: Supports `createdAt` and `ticketNumber` sorting (`asc` / `desc`).
- **Pagination**: Returns paginated payload containing `data` list with `attachmentCount` metadata and `pagination` details (`totalItems`, `totalPages`, `currentPage`, `pageSize`).

---

## Answer Part 6: Ticket Detail & Ownership Authorization Guard

### 6.1 Ticket Detail Display (`GET /api/tickets/:id`)
- Displays read-only ticket information: Ticket Number, Created Date / Ticket Date, Category, Related System, Priority, Status, Summary, Description, and Attachment Section.
- Enforces ownership check (`403 Forbidden` if requester ID does not match ticket owner).

---

## Answer Part 7: Attachment Lifecycle, Magic Bytes Security & Row-Level Lock Protection

### 7.1 Attachment Rules & Security
- **Allowed Formats**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` with size limit <= 5 MB per file.
- **Magic Bytes Validation (`validateFileBufferSignature`)**: Inspects first 12 bytes of uploaded file buffer (e.g. `%PDF-` for PDF, `0xFF 0xD8 0xFF` for JPEG, `0x89 0x50 0x4E 0x47` for PNG, `RIFF...WEBP` for WEBP) to prevent disguised malicious file uploads.
- **Active Limit Concurrency Guard**: Post-creation uploads (`POST /api/tickets/:id/attachments`) execute inside a Prisma transaction with row-level locking (`SELECT id FROM "Ticket" WHERE id = ${ticketId} FOR UPDATE`) to enforce max 5 active attachments under concurrent upload requests.
- **Soft-Removal with Reason (`DELETE /api/attachments/:id/soft-remove`)**: Soft-removes attachment record (`isRemoved: true`, records `removalReason` min 3 chars, and `removedAt` timestamp).
- **Stream Blocking**: `GET /api/attachments/:id/download` checks `isRemoved` flag; soft-removed attachments return `403 Forbidden` and block binary file streaming.

### 7.2 Responsive Visual Screenshots Documentation
All 9 required screenshots were captured using automated Playwright layout tests across Desktop (1280px), Tablet (768px), and Mobile (375px) viewports:

#### Create Ticket Form Viewport Layouts
- **Desktop (1280px)**: `![Create Ticket Desktop](../../artifacts/lab-02/screenshots/create-ticket-desktop.png)`
- **Tablet (768px)**: `![Create Ticket Tablet](../../artifacts/lab-02/screenshots/create-ticket-tablet.png)`
- **Mobile (375px)**: `![Create Ticket Mobile](../../artifacts/lab-02/screenshots/create-ticket-mobile.png)`

#### My Tickets Viewport Layouts
- **Desktop (1280px)**: `![My Tickets Desktop](../../artifacts/lab-02/screenshots/my-tickets-desktop.png)`
- **Tablet (768px)**: `![My Tickets Tablet](../../artifacts/lab-02/screenshots/my-tickets-tablet.png)`
- **Mobile (375px)**: `![My Tickets Mobile](../../artifacts/lab-02/screenshots/my-tickets-mobile.png)`

#### Ticket Detail Viewport Layouts
- **Desktop (1280px)**: `![Ticket Detail Desktop](../../artifacts/lab-02/screenshots/ticket-detail-desktop.png)`
- **Tablet (768px)**: `![Ticket Detail Tablet](../../artifacts/lab-02/screenshots/ticket-detail-tablet.png)`
- **Mobile (375px)**: `![Ticket Detail Mobile](../../artifacts/lab-02/screenshots/ticket-detail-mobile.png)`

---

## Answer Part 8: Complete Automated Test Execution & Traceability Matrix

### 8.1 Acceptance-Criterion Traceability Matrix

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
| **AC-09** | Ticket Date displayed on screens | `create-ticket.api.test.ts`, `CreateTicket.test.tsx`, `TicketDetail.test.tsx` | Pass |
| **AC-10** | Form values preserved on submission failure | `CreateTicket.test.tsx` | Pass |

### 8.2 Summary of Test Execution
- **Server Unit & Integration Tests**: 54 / 54 passed (`npm run test --prefix server`)
- **Client Unit & Component Tests**: 41 / 41 passed (`npm run test --prefix client`)
- **Playwright E2E Tests**: 4 / 4 passed (`npx playwright test`)
- **Total Test Suites**: 100% Green across all 6 testing levels.

---

## Answer Part 9: Peer Review Resolution Log & AI Pair Programming Reflection

### 9.1 Peer Review Resolution Log

| PR # | Branch | Description | Reviewer (`lmaybelgracel`) Comment & Resolution | Status |
| :--- | :--- | :--- | :--- | :--- |
| **#23** | `feature/5-spec-and-tests` | Sprint Specifications & Test Plan | Added Appendix B Section 7 Known Limitations and Status Code 403 Forbidden consistency. | Merged |
| **#25** | `feature/6-db-schema-seed` | Database Schema & Seed Data | Implemented Prisma upsert queries for idempotent seed execution. | Merged |
| **#27** | `feature/7-requester-context` | Requester Context Selector | Added persistent localStorage context and header synchronization. | Merged |
| **#29** | `feature/8-create-ticket-api` | Create Ticket API Endpoint | Implemented atomic sequence generator for `TKT-YYYY-XXXXXX` format. | Merged |
| **#30** | `feature/9-create-ticket-ui` | Create Ticket UI Form | Designed Zen Green form components with asterisks and field validation text. | Merged |
| **#31** | `feature/10-my-tickets-api` | My Tickets API Endpoint | Added multi-select filters, search query, sorting, and pagination. | Merged |
| **#32** | `feature/11-my-tickets-ui` | My Tickets UI View | Implemented debounced search, responsive layout, and mobile cards view. | Merged |
| **#33** | `feature/12-ticket-detail` | Ticket Detail & Ownership Guard | Enforced `requesterId` query/header sync and ownership check (`403 Forbidden`). | Merged |
| **#34** | `feature/13-attachment-lifecycle` | Attachment Stream & Removal | Added magic bytes buffer check, row-level locking transaction, and soft removal. | Merged |
| **#35** | `feature/14-qa-release` | QA, Initial Attachments & Final Release | Added initial attachments on POST /api/tickets with transaction rollback compensation, expanded Playwright E2E test, regenerated 9 responsive screenshots, and compiled final deliverable report. | Open |

### 9.2 AI Pair Programming Reflection
Working with the AI pair programmer under Spec DD method:
1. **Spec DD Precision**: Writing clear specification markdown files prior to coding ensured zero architectural misalignment on data isolation boundaries, attachment soft-removal rules, and magic bytes validation.
2. **Transaction & Compensation Design**: The AI assisted in constructing robust compensation logic for initial attachment file uploads, ensuring zero disk leak when ticket creation transactions fail.
3. **Comprehensive Test Coverage**: The combination of unit, integration, component, and Playwright E2E tests verified that all 10 Acceptance Criteria were 100% covered and resilient against regression.
