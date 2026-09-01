# Lab 2 AI Use Documentation and Reflection

## 1. LLM / AI Coding Assistant Details
- **AI Coding Assistant**: Gemini 3.6 Flash (High) / Antigravity AI Pair Programmer
- **Primary Tasks Assisted**:
  - Drafting Spec-Driven Development contracts (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`).
  - Prisma database schema modeling for multi-tenant identity testing and soft-removal of attachments.
  - Generating backend REST endpoints with strict ownership checks.
  - Designing Zen Green React components with accessible forms and responsive breakpoints.
  - Writing automated unit, API, UI, and Playwright E2E tests.

---

## 2. Selected Key Prompt Log

| Prompt # | Prompt Name | Key Prompt Summary | Outcome / Result |
| :--- | :--- | :--- | :--- |
| **P-01** | Draft Spec DD | "Read docs/lab-02 requirements and draft specification.md, api-spec.md, ui-spec.md, and tests.md covering all BRs, ACs, and Zen Green tokens before writing code." | Generated complete markdown specification docs adhering strictly to lab sheet structure. |
| **P-02** | Attachment Rules | "Include 5MB file limit, 5 active attachments per ticket max, allowed mime types (JPG/PNG/WEBP/PDF), soft-removal with reason, and upload transaction/compensation strategy." | Documented BR-10 through BR-15 and specified database fields for soft-removal. |
| **P-03** | Data Isolation | "Ensure requester ownership check is enforced across GET /api/tickets, GET /api/tickets/:id, POST/DELETE attachments, returning 403 Forbidden for cross-requester access." | Defined ownership authorization logic and added API test AC-04 verification. |
| **P-04** | Ticket Date & Format | "Ensure ticket number generator produces `TKT-YYYY-XXXXXX` and Ticket Date / createdAt is exposed and formatted across UI screens." | Specified FR-04, FR-05, and UI layout rules for Ticket Date display. |
| **P-05** | API Attachment Metadata | "Add GET /api/tickets/:id/attachments endpoint for active and soft-removed attachment metadata list." | Added section 3.1 to api-spec.md and corresponding controller specification. |
| **P-06** | Test Plan & Matrix | "Create planned-test table in tests.md mapping every AC to automated test file paths across unit, API, UI, style, and E2E levels." | Generated complete traceability matrix with 18 planned tests covering all ACs. |

---

## 3. My Reflection on AI Use Experience

Using the AI coding assistant following the Spec-Driven Development (Spec DD) methodology yielded significant improvements in software quality and development velocity:

1. **Clarity Before Coding**: Drafting `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` prior to code implementation eliminated ambiguity around edge cases—such as attachment soft removal, max attachment limits, and transaction compensation behavior.
2. **Strict Test Traceability**: Mapping every Acceptance Criterion (AC-01 through AC-10) directly to automated test cases ensured that no requirement was left untested or unverified.
3. **Productive Human-AI Pair Programming**: The AI handled repetitive boilerplate (Prisma schema setup, React Testing Library tests, Playwright scripts) while I retained full responsibility for architectural decisions, security boundaries, business rule enforcement, and final code review.
