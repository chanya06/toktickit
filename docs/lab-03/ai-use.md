# Lab 3 AI Assistance & Reflection Log

## 1. LLM / AI Tool Details
- **Primary AI Assistant**: Gemini 3.6 Flash (Antigravity AI Assistant)
- **Model Version**: Gemini 3.6 Flash
- **Usage Period**: Sprint 3 / Lab 3 Development Cycle

---

## 2. Selected Key Prompts

### Prompt 1: Engineering Contract Initialization
- **Context / Goal**: Understand Lab 3 requirements and draft complete specification documents under `docs/lab-03/`.
- **User Input**: "แกลองอ่าน lab 3 ไปก่อนนะ... พาชั้นทำได้เลย"
- **AI Action / Outcome**: Analyzed Lab 3 PDF requirements, created `lab3-staging` branch, and authored complete `specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, and `ai-use.md`.

### Prompt 2: Peer Review Feedback Incorporation
- **Context / Goal**: Update specification, API contract, test traceability matrix, and reviewer log based on peer review feedback from `@lmaybelgracel`.
- **User Input**: "Peer Review: Sprint 3 Engineering Contract & Specifications (PR #44)"
- **AI Action / Outcome**: Updated `specification.md` (Data type alignment for ticketId, data migration plan, status matrix role restrictions), `api-spec.md` (added `POST /api/tickets/:id/resolve-indication`), `tests.md` (7-column table layout), and `reviewer.md`.

---

## 3. Reflection on AI Usage

### Specification & Architecture Phase
Using AI during the specification phase accelerated the creation of consistent, well-structured engineering contracts. It ensured that all mandatory business rules (such as Administrator safety checks, status transition matrices with permitted roles, and role visibility for Internal Notes) were explicitly documented and mapped directly to Acceptance Criteria and planned test suites.

### Technical Implementation & TDD Phase
*(To be updated during code implementation)*
