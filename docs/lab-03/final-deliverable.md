# TokTickIT Lab 3 — Final Engineering Deliverable

| Metric / Field | Deliverable Details |
| :--- | :--- |
| **Course & Sprint** | CPE 334 Software Engineering — Lab 3: TokTickIT Enterprise Roles, IT Staff Operations & Administration |
| **Student / Author** | `chanya06` (Chanya Poolketkij) |
| **Peer Reviewer** | Peer Reviewer (`lmaybelgracel`) |
| **Partner Reviewed by Author** | `titayaaa` |
| **Repository & Branch** | [`chanya06/toktickit`](https://github.com/chanya06/toktickit) — `main` branch |
| **Release PR** | [PR #71](https://github.com/chanya06/toktickit/pull/71) (`lab3-staging` -> `main` merged) |
| **Final Test Metric** | **277 / 277 Automated Tests Passed (100% Pass)** (Server: 149, Client: 116, Playwright E2E: 12) |
| **Build Status** | Clean Production Build (`tsc && vite build`) |
| **Deliverable Date** | October 3, 2026 |

---

## Answer Part 1: Git Use with Engineering Workflow

### 1.1 Git Branching Strategy & Staging Workflow
TokTickIT Lab 3 strictly adhered to a disciplined Git feature-branch engineering workflow:
- **Feature Isolation**: Every sprint issue was implemented on its own dedicated `feature/*` branch.
- **Staging Integration**: Feature branches were merged into `lab3-staging` only after formal peer review approval by `@lmaybelgracel`.
- **Release Integration**: Final sprint integration was performed via Release [PR #71](https://github.com/chanya06/toktickit/pull/71) from `lab3-staging` into `main`, which was reviewed, approved, and merged by the peer reviewer.

### 1.2 Pull Request Traceability Table
All 12 feature branches plus the final release integration PR were formally reviewed, tracked, and approved:

| PR # | Feature Branch | Scope / Description | Reviewer Verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
| [#44](https://github.com/chanya06/toktickit/pull/44) | `feature/17-spec-and-tests` | Sprint 3 Specifications (`specification.md`, `tests.md`, `ui-spec.md`, `api-spec.md`) | Approved | Merged |
| [#57](https://github.com/chanya06/toktickit/pull/57) | `feature/18-db-schema-and-seed` | Prisma Schema models & idempotent seed script | Approved | Merged |
| [#58](https://github.com/chanya06/toktickit/pull/58) | `feature/19-auth-api` | Authentication, Session, and Password Change REST APIs | Approved | Merged |
| [#59](https://github.com/chanya06/toktickit/pull/59) | `feature/20-auth-ui` | Login view, Change Password view, and Role-Aware Header | Approved | Merged |
| [#60](https://github.com/chanya06/toktickit/pull/60) | `feature/21-requester-session` | Requester Session Migration & Resolution Indication Action | Approved | Merged |
| [#61](https://github.com/chanya06/toktickit/pull/61) | `feature/22-staff-queue-api` | IT Staff Ticket Queue REST API (Search, Filter, Sort, Pagination) | Approved | Merged |
| [#62](https://github.com/chanya06/toktickit/pull/62) | `feature/23-staff-queue-ui` | IT Staff Ticket Queue UI & Responsive Mobile Cards | Approved | Merged |
| [#63](https://github.com/chanya06/toktickit/pull/63) | `feature/24-staff-operations` | IT Staff Operations Panel, Claim, IT Priority & Status Transition Matrix | Approved | Merged |
| [#64](https://github.com/chanya06/toktickit/pull/64) | `feature/25-comments-and-notes` | Public Comments & Private Internal Notes Communication Channels | Approved | Merged |
| [#65](https://github.com/chanya06/toktickit/pull/65) | `feature/26-admin-user-management` | Administrator User Management REST APIs & Safety Rules | Approved | Merged |
| [#66](https://github.com/chanya06/toktickit/pull/66) | `feature/27-admin-user-management-ui` | Administrator User Management Directory & Modals | Approved | Merged |
| [#70](https://github.com/chanya06/toktickit/pull/70) | `feature/28-qa-automated-tests-release-integration` | QA Automated E2E Tests, Screen Captures & Release Integration | Approved | Merged |
| [#71](https://github.com/chanya06/toktickit/pull/71) | `lab3-staging` | Release Integration PR into `main` | Approved | Merged |

### 1.3 Peer Review Record Link
Complete verbatim review comments, author responses, and approval logs for both incoming reviews (from `@lmaybelgracel`) and outgoing partner reviews (for `@titayaaa` PR #52 to #62) are fully documented in [`docs/lab-03/reviewer.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-03/reviewer.md).

### 1.4 Directory Structure (Section 12 Compliance)
```
toktickit/
├── docs/lab-03/
│   ├── specification.md
│   ├── tests.md
│   ├── ui-spec.md
│   ├── api-spec.md
│   ├── reviewer.md
│   ├── ai-use.md
│   ├── final-deliverable.md
│   └── final-deliverable.pdf
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── app.ts
│   │   ├── middleware/auth.ts
│   │   └── routes/ (auth, comments, staff, users)
│   └── tests/lab-03/ (auth, authorization, comments-notes, requester-resolution, staff-queue, staff-ticket-detail, users-admin)
├── client/
│   ├── src/
│   │   ├── context/AuthContext.tsx
│   │   ├── components/ (Header, LoginView, ChangePasswordView, StaffTicketQueue, TicketDetailView, UserManagementView, CommentsSection, InternalNotesSection)
│   │   └── utils/pagination.ts
│   └── tests/lab-03/ (AppRoleNav, ChangePassword, CommentsNotes, Login, Pagination, RequesterResolution, StaffTicketDetail, StaffTicketQueue, UserManagement)
├── e2e/lab-03/
│   ├── authentication.spec.ts
│   ├── staff-ticket-flow.spec.ts
│   ├── user-administration.spec.ts
│   └── capture-screenshots.spec.ts
└── artifacts/lab-03/screenshots/
    ├── screen-1-login/
    ├── screen-2-change-password/
    ├── screen-3-ticket-queue/
    ├── screen-4-ticket-detail/
    └── screen-5-user-management/
```

---

## Answer Part 2: Spec DD

### 2.1 Engineering Specification Link
The complete engineering specification is documented under [`docs/lab-03/specification.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-03/specification.md), [`docs/lab-03/ui-spec.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-03/ui-spec.md), and [`docs/lab-03/api-spec.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-03/api-spec.md).

### 2.2 Functional Requirements (`FR-01..FR-20`)
- **Authentication & Security (`FR-01..FR-04`)**: Email/password login, JWT tokens, mandatory password rotation on first login, role-aware application shell.
- **Requester Session Regression (`FR-05..FR-06`)**: Seamless authentication without temporary selector, problem resolution indication action.
- **IT Staff Ticket Queue (`FR-07..FR-09`)**: Filterable, searchable, sortable, paginated operations queue with dual desktop table and mobile cards.
- **IT Staff Operations (`FR-10..FR-12`)**: Ticket claim and reassignment, independent IT priority assignment, role-enforced 8-status transition matrix.
- **Communications Channel (`FR-13..FR-14`)**: Public comments visible to all authenticated roles; confidential Internal Notes visible strictly to IT Staff and Administrators.
- **Administrator Directory (`FR-15..FR-20`)**: User management table, user provisioning, account modification, password resets, self-deactivation guard, and last-active-admin guard.

### 2.3 Mandatory Business Rules (`BR-01..BR-18`)
- **`BR-01`**: Minimum password length of 8 characters requiring uppercase, lowercase, number, and special character.
- **`BR-02`**: Immediate redirection to password change if `mustChangePassword === true`.
- **`BR-03`**: Soft-deactivated accounts (`isActive: false`) are rejected at login with `401 Unauthorized`.
- **`BR-04`**: Requesters can only access tickets they own; cross-requester access returns `403 Forbidden`.
- **`BR-05`**: Ticket claiming is restricted to active IT Staff and Administrator accounts.
- **`BR-06`**: Permitted status transitions strictly enforced via state machine; illegal transitions return `400 Bad Request`.
- **`BR-07`**: Internal Notes are confidential; Requesters requesting internal notes return `403 Forbidden`.
- **`BR-08`**: Administrators cannot deactivate their own active account (`422 Unprocessable Entity`).
- **`BR-09`**: Deactivating the last active Administrator in the system is strictly prohibited (`422 Unprocessable Entity`).
- **`BR-10`**: Users cannot be deleted from the database to preserve historical ticket audit trails.

### 2.4 Acceptance Criteria (`AC-01..AC-12`) & Definition of Done
100% of Acceptance Criteria (`AC-01..AC-12`) and Definition of Done items are fulfilled and verified:
- [x] Database schema migrated and seeded with active/inactive users across 3 roles, tickets, comments, and notes.
- [x] Authentication API (`login`, `logout`, `me`, `change-password`) implemented and tested.
- [x] Requester regression verified: tickets and attachments protected by session-based authorization.
- [x] IT Staff Ticket Queue UI and API implemented with search, filtering, sorting, pagination.
- [x] IT Staff Ticket Detail UI implemented with claim/reassign, IT Priority, status transitions, Public Comments, and Internal Notes.
- [x] Administrator User Management UI and API implemented with search, filter, create user, edit user, set initial password, and safety rules.
- [x] All unit, integration, UI, authorization, and E2E tests passing (277/277).
- [x] Rendered documentation (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`) complete.

---

## Answer Part 3: Test DD and Traceability

### 3.1 Test Architecture & Multi-Level Coverage
TokTickIT Lab 3 implements a comprehensive 5-tier test pyramid:
1. **Server Unit & Utility Tests**: Password hashing, token signing, ticket number generation.
2. **Server API Integration Tests**: Supertest endpoints covering auth, RBAC authorization, queue filtering, ticket operations, comments/notes, and user administration.
3. **Client Component & Style Tests**: Vitest + React Testing Library verifying Login, ChangePassword, Header, StaffTicketQueue, TicketDetailView, and UserManagementView.
4. **Client Navigation & Session Tests**: Authentication context, role routing, pagination calculations.
5. **Playwright E2E User Journeys**: Automated multi-role user workflows across Authentication, Staff Ticket Flow, and Administrator User Management.

### 3.2 Acceptance-Criterion Traceability Matrix

| AC ID | Acceptance Criterion Summary | Validating Automated Test Files | Pass Status |
| :--- | :--- | :--- | :--- |
| **AC-01** | Active user credentials login & JWT session issuance | `auth.api.test.ts`, `Login.test.tsx`, `authentication.spec.ts` | Pass |
| **AC-02** | Mandatory password rotation guard blocks app screens | `auth.api.test.ts`, `ChangePassword.test.tsx`, `authentication.spec.ts` | Pass |
| **AC-03** | Requester ticket ownership session authorization | `requester-resolution.api.test.ts`, `authorization.api.test.ts`, `RequesterResolution.test.tsx` | Pass |
| **AC-04** | Requester blocked from Internal Notes (403 Forbidden) | `authorization.api.test.ts`, `comments-notes.api.test.ts` | Pass |
| **AC-05** | IT Staff Ticket Queue filter, search, sort, pagination | `staff-queue.api.test.ts`, `StaffTicketQueue.test.tsx`, `staff-ticket-flow.spec.ts` | Pass |
| **AC-06** | Ticket claim & assignment to active staff/admin | `staff-ticket-detail.api.test.ts`, `StaffTicketDetail.test.tsx`, `staff-ticket-flow.spec.ts` | Pass |
| **AC-07** | Status transition matrix & role enforcement | `staff-ticket-detail.api.test.ts`, `StaffTicketDetail.test.tsx`, `staff-ticket-flow.spec.ts` | Pass |
| **AC-08** | Internal Notes author metadata & role visibility | `comments-notes.api.test.ts`, `CommentsNotes.test.tsx`, `staff-ticket-flow.spec.ts` | Pass |
| **AC-09** | Administrator User Management directory & filters | `users-admin.api.test.ts`, `UserManagement.test.tsx`, `user-administration.spec.ts` | Pass |
| **AC-10** | Admin create user with mustChangePassword: true | `users-admin.api.test.ts`, `UserManagement.test.tsx`, `user-administration.spec.ts` | Pass |
| **AC-11** | Admin self-deactivation guard (422 Unprocessable) | `users-admin.api.test.ts`, `UserManagement.test.tsx`, `user-administration.spec.ts` | Pass |
| **AC-12** | Last active Administrator deactivation guard | `users-admin.api.test.ts`, `UserManagement.test.tsx` | Pass |

### 3.3 Execution Results Summary
- **Server Vitest & Supertest**: 149 / 149 passed (`npm run test:server`)
- **Client Vitest & Testing Library**: 116 / 116 passed (`npm run test:client`)
- **Playwright E2E User Journeys**: 12 / 12 passed (`npm run test:e2e`)
- **Total Test Suite**: **277 / 277 Passed (100% Green)**
- **Client Production Build**: Passed (`tsc && vite build`) without lint or type errors.

---

## Answer Part 4: AI Use with Reflection

### 4.1 LLM Model & Pairing Setup
Engineering development was conducted in pair programming with **Antigravity AI (Gemini 2.5 Pro)**. Complete prompt logs are documented in [`docs/lab-03/ai-use.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-03/ai-use.md).

### 4.2 Key Prompts Summary (Prompts 1 to 8)
- **Prompt 1 (Spec DD Foundation)**: Analyzed Lab 3 requirements and drafted full engineering contract (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`).
- **Prompt 2 (Reviewer Feedback Resolution)**: Aligned integer primary keys with Lab 2 data, added resolution indication action, and defined 7-column test matrix.
- **Prompt 3 (Auth & Mandatory Password Change TDD)**: Implemented bcrypt password hashing, JWT signing, password complexity checks, and `/api/auth/change-password`.
- **Prompt 4 (IT Staff Ticket Queue UI & Responsive Filters)**: Built `StaffTicketQueue.tsx` with Zen Green styling, multi-criteria filters, and responsive mobile cards.
- **Prompt 5 (Ticket Operations & Status Transition Matrix)**: Enforced 8-status state machine, Quick Claim, assign logic, and distinct Amber (`#FEF3C7`) Internal Notes.
- **Prompt 6 (Administrator User Management & Safety Guards)**: Created user directory, modal dialogues, and safety rules protecting active admin accounts.
- **Prompt 7 (Playwright E2E Automation & Screenshots)**: Built automated test suites covering 3 complete user journeys and capturing 21 responsive screenshots.
- **Prompt 8 (Data Hygiene, Teardowns & Mobile Overflow Fix)**: Resolved reviewer feedback by purging test artifacts in `seed.ts`, using IT Staff accounts for queue screenshots, and fixing mobile header flex blowout to strictly fit 375px.

### 4.3 My Reflection (Synthesis on Agentic Pair Programming)
- **Specification-Agent**: Essential for establishing rigid engineering contracts and role boundary definitions upfront, eliminating scope ambiguity before writing code.
- **Coding-Agent**: Highly effective for rapid boilerplate implementation, comprehensive test suite construction, and debugging responsive layouts.
- **Data Hygiene Learning**: Proactive test isolation through seed cleanup and teardown routines is essential when capturing visual evidence for production releases.

---

## Answer Part 5: Screen 1 — Login & Mandatory Password Change

### 5.1 Architecture & Workflow
Screen 1 provides secure email/password authentication using bcrypt password hashing and HTTP Bearer JWT tokens. When an account is provisioned with `mustChangePassword === true`, Screen 2 is immediately rendered, blocking access to all application screens until a compliant password is saved.

### 5.2 Responsive Screenshots — Screen 1: Login

#### Desktop Viewport (1280px)
![Screen 1 Login Desktop](../../artifacts/lab-03/screenshots/screen-1-login/desktop.png)

#### Tablet Viewport (768px)
![Screen 1 Login Tablet](../../artifacts/lab-03/screenshots/screen-1-login/tablet.png)

#### Mobile Viewport (375px)
![Screen 1 Login Mobile](../../artifacts/lab-03/screenshots/screen-1-login/mobile.png)

---

### 5.3 Responsive Screenshots — Screen 2: Mandatory Password Change

#### Desktop Viewport (1280px)
![Screen 2 Change Password Desktop](../../artifacts/lab-03/screenshots/screen-2-change-password/desktop.png)

#### Tablet Viewport (768px)
![Screen 2 Change Password Tablet](../../artifacts/lab-03/screenshots/screen-2-change-password/tablet.png)

#### Mobile Viewport (375px)
![Screen 2 Change Password Mobile](../../artifacts/lab-03/screenshots/screen-2-change-password/mobile.png)

---

## Answer Part 6: Screen 3 — IT Staff Ticket Queue

### 6.1 Operational Queue Capabilities
- **Multi-Filter & Debounced Search**: Filters by Category, Status, IT Priority, and Ticket Owner, with live debounced search across Ticket Number and Summary.
- **Dual Representation**: Renders a comprehensive data table on Desktop/Tablet viewports and switches to vertical card representations on Mobile viewports (< 768px).
- **Logged-in IT Staff Identity**: Logged in as Lisa Martinez (`lisa.martinez@toktickit.com`) displaying IT Staff role badge (`#EAF6EF` BG, `#006B3C` Text).

### 6.2 Responsive Screenshots — Screen 3: IT Staff Ticket Queue

#### Desktop Viewport (1280px)
![Screen 3 Ticket Queue Desktop](../../artifacts/lab-03/screenshots/screen-3-ticket-queue/desktop.png)

#### Tablet Viewport (768px)
![Screen 3 Ticket Queue Tablet](../../artifacts/lab-03/screenshots/screen-3-ticket-queue/tablet.png)

#### Mobile Viewport (375px)
![Screen 3 Ticket Queue Mobile](../../artifacts/lab-03/screenshots/screen-3-ticket-queue/mobile.png)

---

## Answer Part 7: Screen 4 — IT Staff Ticket Operations & Status Matrix

### 7.1 Operational Capabilities & Communication Channels
- **Ticket Ownership Management**: Quick Claim button automatically assigns ownership to the active IT Staff member; Owner dropdown allows reassignment among active IT Staff and Administrator accounts.
- **IT Priority Override**: IT Staff can adjust ticket operational priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) independently of Requester's requested priority.
- **Status Transition Matrix**: Enforces permitted status transitions (`NEW`, `OPEN`, `IN_PROGRESS`, `PENDING`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`).
- **Dual Communication Channels**:
  - **Public Comments**: Append-only communication thread visible to all authenticated roles.
  - **Internal Notes**: Confidential operational notes with author metadata and distinct Amber styling (`#FEF3C7` BG, `#D97706` Border), accessible strictly to IT Staff and Administrators.

### 7.2 Responsive Screenshots — Screen 4: IT Staff Ticket Detail

#### Desktop Viewport (1280px)
![Screen 4 Ticket Detail Desktop](../../artifacts/lab-03/screenshots/screen-4-ticket-detail/desktop.png)

#### Tablet Viewport (768px)
![Screen 4 Ticket Detail Tablet](../../artifacts/lab-03/screenshots/screen-4-ticket-detail/tablet.png)

#### Mobile Viewport (375px)
![Screen 4 Ticket Detail Mobile](../../artifacts/lab-03/screenshots/screen-4-ticket-detail/mobile.png)

---

### 7.3 State Tabs Screenshots — Screen 4

#### Public Comments Tab
![Screen 4 Comments Tab](../../artifacts/lab-03/screenshots/screen-4-ticket-detail/comments-tab.png)

#### Internal Notes Tab (Amber Confidential Styling)
![Screen 4 Internal Notes Tab](../../artifacts/lab-03/screenshots/screen-4-ticket-detail/internal-notes-tab.png)

#### Attachments Tab
![Screen 4 Attachments Tab](../../artifacts/lab-03/screenshots/screen-4-ticket-detail/attachments-tab.png)

---

## Answer Part 8: Screen 5 — Administrator User Management & Safety Guards

### 8.1 Administrator Capabilities & Safety Rules
- **User Directory**: Searchable by name/email with role filter (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`) and status indicators (Active / Deactivated).
- **Create User Modal**: Provisions new user accounts with single role assignment and initial password (`mustChangePassword: true`).
- **Edit User Modal**: Updates user name, department, role, and toggles active/deactivated status.
- **Reset Password Modal**: Sets a new temporary password forcing password rotation on next login.
- **Enforced Safety Guards**:
  - **Self-Deactivation Guard (`BR-08`)**: Active Administrator cannot deactivate their own account (`422 Unprocessable Entity`).
  - **Last Active Admin Guard (`BR-09`)**: Server prevents deactivation of the last remaining active Administrator (`422 Unprocessable Entity`).

### 8.2 Responsive Screenshots — Screen 5: User Management

#### Desktop Viewport (1280px)
![Screen 5 User Management Desktop](../../artifacts/lab-03/screenshots/screen-5-user-management/desktop.png)

#### Tablet Viewport (768px)
![Screen 5 User Management Tablet](../../artifacts/lab-03/screenshots/screen-5-user-management/tablet.png)

#### Mobile Viewport (375px)
![Screen 5 User Management Mobile](../../artifacts/lab-03/screenshots/screen-5-user-management/mobile.png)

---

### 8.3 Administrator Modals Screenshots — Screen 5

#### Create User Modal
![Screen 5 Create User Modal](../../artifacts/lab-03/screenshots/screen-5-user-management/create-user-modal.png)

#### Edit User Modal
![Screen 5 Edit User Modal](../../artifacts/lab-03/screenshots/screen-5-user-management/edit-user-modal.png)

#### Reset Password Modal
![Screen 5 Reset Password Modal](../../artifacts/lab-03/screenshots/screen-5-user-management/reset-password-modal.png)

---

## Answer Part 9: Zen Green UI, Accessibility & Responsive Evidence

### 9.1 Visual Specification Link
The complete UI design tokens and component styling guidelines are documented under [`docs/lab-03/ui-spec.md`](file:///c:/Users/chany/Documents/GitHub/toktickit/docs/lab-03/ui-spec.md).

### 9.2 Design Tokens & Badges Summary
- **Primary Color Palette**: Zen Green Primary (`#006B3C`), Secondary (`#0B7A46`), Pale BG (`#EAF6EF`), Neutral BG (`#F5F7F6`).
- **Role Badges**:
  - `REQUESTER`: Pale Blue (`#E0F2FE` BG, `#0369A1` Text)
  - `IT_STAFF`: Zen Green (`#EAF6EF` BG, `#006B3C` Text)
  - `ADMINISTRATOR`: Purple (`#F3E8FF` BG, `#7E22CE` Text)
- **Status Badges**:
  - `NEW`: Blue (`#DBEAFE` BG, `#1E40AF` Text)
  - `OPEN`: Green (`#DCFCE7` BG, `#15803D` Text)
  - `IN_PROGRESS`: Amber (`#FEF3C7` BG, `#B45309` Text)
  - `WAITING_FOR_REQUESTER`: Purple (`#F3E8FF` BG, `#6B21A8` Text)
  - `PENDING`: Slate Grey (`#E2E8F0` BG, `#475569` Text)
  - `RESOLVED`: Emerald (`#D1FAE5` BG, `#065F46` Text)
  - `CLOSED`: Dark Slate (`#E2E8F0` BG, `#334155` Text)
  - `REOPENED`: Orange (`#FFEDD5` BG, `#C2410C` Text)
  - `CANCELLED`: Red (`#FEE2E2` BG, `#B91C1C` Text)
- **Internal Notes Container**: Amber Card (`#FEF3C7` BG, `#D97706` Border, `#92400E` Header).

### 9.3 Zero Mobile Overflow Verification
Following review resolution in PR #70, `Header.tsx` and `index.css` were updated with responsive wrapping (`flex-wrap: wrap`) and overflow guards (`overflow-x: hidden`). All mobile captures strictly measure 375px in width without horizontal layout blowout.

### 9.4 Visual Inspection Checklist

| UI Check Item | Requirement / Standard | Implementation Evidence | Pass Status |
| :--- | :--- | :--- | :--- |
| **Zen Green Palette** | Primary (`#006B3C`), Secondary (`#0B7A46`), Pale (`#EAF6EF`), Page BG (`#F5F7F6`) | Header shell, buttons, active tabs, and navigation links conform 100% | Pass |
| **Role Separation & Badges** | Distinct visual badge tokens for REQUESTER, IT_STAFF, ADMINISTRATOR | Header and directory badges render distinct contrasting tokens | Pass |
| **Status Transition Controls** | Dropdown options restricted strictly to permitted transitions | Illegal transitions prevented; button disabled during API calls | Pass |
| **Internal Notes Secrecy** | Distinct Amber styling; completely omitted from Requester session | Amber `#FEF3C7` container; non-staff endpoint returns 403 | Pass |
| **Admin Safety Confirmations** | Guard self-deactivation and last-admin deactivation | Modals disable self-deactivation and backend rejects with 422 | Pass |
| **Mobile Responsiveness** | No clipping, overlapping, or horizontal scrolling at 375px | All 5 mobile screens render clean vertical stacking at 375px | Pass |
