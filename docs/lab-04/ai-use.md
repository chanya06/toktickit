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

---

## 3. Reflection on AI Pairing in Software Engineering

### Specification-Agent Synergy
Using the AI as a specification agent before writing implementation code forces rigor in defining boundaries, data structures, and edge cases. In Sprint 4, the introduction of a parent-child relationship (`Ticket -> ActionTaken`) could easily lead to concurrency bugs (e.g. overwriting an action outcome while another staff member transitions status) or authorization leaks (e.g. allowing requesters to edit actions). Defining explicit business rules (`BR-01` through `BR-10`) and HTTP status contracts upfront establishes an unambiguous contract that guides both development and peer review.

### Coding-Agent Guardrails
Maintaining strict boundaries where the AI acts strictly as a pair programming author while peer reviewer `@lmaybelgracel` exercises merge authority ensures genuine software engineering discipline. Every pull request remains accountable to human review, validating that the delivered software reflects authentic craftsmanship and verified evidence.
