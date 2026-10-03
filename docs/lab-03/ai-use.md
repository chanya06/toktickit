# Lab 3 AI Assistance & Reflection Log

## 1. LLM / AI Tool Details
- **Primary AI Assistant**: Gemini 3.6 Flash / Claude 3.5 Sonnet (Antigravity AI Coding Assistant)
- **Model Version**: Gemini 3.6 Flash
- **Usage Period**: Sprint 3 / Lab 3 Development Cycle

---

## 2. Selected Key Prompts

### Prompt 1: Engineering Contract Initialization (Spec DD)
- **Context / Goal**: Understand Lab 3 requirements and draft complete specification documents under `docs/lab-03/` before writing code.
- **User Input**: "แกลองอ่าน lab 3 ไปก่อนนะ... พาชั้นทำได้เลย"
- **AI Action / Outcome**: Analyzed Lab 3 PDF requirements, created `lab3-staging` branch, and authored complete `specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, and `ai-use.md`.

### Prompt 2: Peer Review Feedback Incorporation (PR #44)
- **Context / Goal**: Update specification, API contract, test traceability matrix, and reviewer log based on peer review feedback from `@lmaybelgracel`.
- **User Input**: "Peer Review: Sprint 3 Engineering Contract & Specifications (PR #44)"
- **AI Action / Outcome**: Updated `specification.md` (data type alignment for `ticketId`, data migration plan, status matrix role restrictions), `api-spec.md` (added `POST /api/tickets/:id/resolve-indication`), `tests.md` (7-column table layout), and `reviewer.md`.

### Prompt 3: Authentication & First-Login Password Change (TDD)
- **Context / Goal**: Implement secure email/password authentication, JWT issuance/verification, and mandatory password rotation.
- **User Input**: "ทำ issue 19 ต่อได้เลย: Authentication API และ Mandatory Password Change"
- **AI Action / Outcome**: Implemented backend middleware, password complexity validation, `/api/auth/change-password`, and comprehensive Vitest integration tests covering AC-01 and AC-02.

### Prompt 4: IT Staff Ticket Queue & Responsive Filtering (UI/UX)
- **Context / Goal**: Build searchable, filterable operational ticket queue with dual desktop table and mobile card representation.
- **User Input**: "สร้าง IT Staff Ticket Queue UI ให้รองรับ responsive และค้นหาตามสเปก"
- **AI Action / Outcome**: Created `StaffTicketQueue.tsx` with Zen Green styling, multi-criteria filters (category, status, priority, owner), debounce search, and responsive mobile cards without layout distortion.

### Prompt 5: IT Staff Operations Panel & Status Transition Matrix
- **Context / Goal**: Enforce permitted status transitions, ticket ownership claiming, IT priority adjustments, and Public/Internal communication threads.
- **User Input**: "ทำระบบจัดการตั๋วของ IT Staff: Quick Claim, Assign, Status Matrix และ Internal Notes"
- **AI Action / Outcome**: Built `TicketDetailView.tsx` operations panel enforcing the 8-status state machine, preventing illegal transitions, and rendering confidential Internal Notes (Amber `#FEF3C7`) distinct from Public Comments.

### Prompt 6: Administrator User Management & Safety Protections
- **Context / Goal**: Implement user provisioning, role assignments, password resets, and safety rules (BR-07, BR-08, BR-09).
- **User Input**: "ทำ Administrator User Management ทั้งหน้าจอและ API พร้อมกฎป้องกัน Admin ปิดบัญชีตัวเอง"
- **AI Action / Outcome**: Implemented `UserManagementView.tsx` with Create/Edit/Reset modals, self-deactivation prevention, and last-active-admin guard (`422 Unprocessable Entity`).

### Prompt 7: Playwright E2E Automation & Multi-Viewport Screenshot Capture
- **Context / Goal**: Write automated end-to-end user journey tests and capture responsive evidence across Desktop (1280x800), Tablet (768x1024), and Mobile (375x667).
- **User Input**: "เขียน E2E test ด้วย Playwright สำหรับทดสอบทั้ง 3 roles และแคปเจอร์ภาพหน้าจอหลักฐาน"
- **AI Action / Outcome**: Created `authentication.spec.ts`, `staff-ticket-flow.spec.ts`, `user-administration.spec.ts`, and `capture-screenshots.spec.ts` capturing 21 full-page screenshots.

### Prompt 8: Data Hygiene, Teardowns, Re-seed & Mobile Overflow Fix (PR #70 Review)
- **Context / Goal**: Resolve review feedback regarding leftover test data in screenshots, IT Staff identity in queue captures, and mobile layout blowout.
- **User Input**: "ทำความสะอาดฐานข้อมูล (Re-seed) ก่อนรันแคปเจอร์ Screenshots... ปรับสคริปต์ Screen 3/4 ใช้ IT Staff... แก้ไข Layout ล้นบน Mobile"
- **AI Action / Outcome**: Added automated purge of non-seed records in `seed.ts`, updated `capture-screenshots.spec.ts` to log in as Lisa Martinez (`lisa.martinez@toktickit.com`), added `flex-wrap: wrap` and `overflow-x: hidden` in `Header.tsx` and `index.css`, restoring exact 375px mobile width.

---

## 3. Reflection on AI Usage

### 3.1 Specification & Architecture Phase
Using AI during the specification phase accelerated the creation of consistent, well-structured engineering contracts. It ensured that all mandatory business rules (such as Administrator safety checks, status transition matrices with permitted roles, and role visibility for Internal Notes) were explicitly documented and mapped directly to Acceptance Criteria and planned test suites. The AI agent helped identify edge cases early—such as foreign key type compatibility with Lab 2 data and preventing unintended information leaks through unauthorized endpoints.

### 3.2 Technical Implementation, Data Hygiene & Debugging Phase
Pair programming with the AI coding assistant during implementation proved invaluable for rapid test-driven development (TDD) across 277 automated tests. However, the most critical learning emerged during integration testing and review resolution:
1. **Data Hygiene & Test Isolation**: Automated E2E tests created dynamic test users (`QA Auto Staff <timestamp>`) and modified seed records. When capturing visual evidence, these leftovers polluted directories and queue counts. Working with the AI to implement automated purge routines in `seed.ts` and explicit `test.afterAll` restoration hooks demonstrated that production-grade test suites require proactive data cleanup.
2. **Mobile Responsive Debugging**: The AI quickly identified that the un-wrapped `<header>` flex container caused the page `scrollWidth` to blow out to 727px on a 375px viewport. Applying responsive flex utilities and global overflow guards resolved the issue across all viewports.
3. **Role Separation Integrity**: The AI ensured that screenshot captures strictly adhered to operational roles—using real IT Staff accounts for ticket queue operations and Administrator accounts solely for directory management.

### 3.3 My Reflection (Synthesis on Agentic Pair Programming)
- **Specification-Agent**: Essential for establishing clear boundaries, preventing scope creep, and maintaining traceability between requirements and test assertions. Having an approved contract upfront saved countless hours of rework.
- **Coding-Agent**: Highly effective as a junior pair programmer capable of generating boilerplate, drafting comprehensive unit tests, and automating multi-viewport visual testing. Human oversight remained crucial for verifying business logic nuances, evaluating visual aesthetics, and ensuring adherence to academic guidelines.

