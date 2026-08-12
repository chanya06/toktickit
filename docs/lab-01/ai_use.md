# Lab 1 — AI Use and Reflection

**LLM/agent used:** Antigravity (Gemini 3.5 Flash)

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | Plan Lab 1 implementation following the enclosed PDF requirements and Git Flow branching model. | Reviewed proposed implementation plan artifact and approved execution order. |
| 2 | Set up project foundation (Issue 1) with React, Express, Prisma, Docker Compose PostgreSQL, and update setup README. | Applied setup, verified Docker Compose, ran initial Prisma migration, and opened PR #7. |
| 3 | Implement GET /api/health endpoint and integrate status display in React App (Issue 2). | Verified status 200 response with Supertest and tested Online/Offline UI state changes. |
| 4 | Define Prisma Category model and implement idempotent category seeding (Issue 3). | Applied schema migration, verified idempotent upsert loop for the 4 categories, and created PR #9. |
| 5 | Clean up seed.ts and add category count verification check based on peer review feedback. | Refactored seed script, added total count verification log, and pushed updates to feature branch. |
| 6 | Implement GET /api/categories endpoint, client checkSystem integration, and Vitest UI test suite (Issue 4). | Ran full backend Supertest and frontend Vitest test suites, confirming 100% pass rate. |

## Reflection
Providing explicit acceptance criteria and clear Git branch instructions made the AI agent's responses significantly more accurate and structured. When setting up Prisma migrations non-interactively, I guided the agent to generate the migration SQL directly using `prisma migrate diff`, ensuring schema changes were tracked cleanly without command failures.
