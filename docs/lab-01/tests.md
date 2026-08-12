# Lab 1 — Test Plan and Evidence  (fill this in)

All test files live under server/tests/lab-01/ and client/tests/lab-01/.

| # | Tool | Test | Result |
|---|------|------|--------|
| 1 | Supertest | GET /api/health returns 200, status=ok | PASS |
| 2 | Supertest | GET /api/categories returns 4 seeded categories in id order | PASS |
| 3 | Supertest | GET /api/categories returns 500 on database failure | PASS |
| 4 | Vitest | Heading renders | PASS |
| 5 | Vitest | Success state shows Online + category list | PASS |
| 6 | Vitest | Error state shows Offline + message | PASS |
| 7 | Vitest | Loading state disables button during API call | PASS |

### Passing Terminal Output

#### Server Tests (Supertest)
```
 RUN  v2.1.9 C:/Users/chany/Documents/GitHub/toktickit/server

 ✓ tests/lab-01/health.test.ts (1 test) 21ms
 ✓ tests/lab-01/categories.test.ts (2 tests) 133ms

 Test Files  2 passed (2)
      Tests  3 passed (3)
```

#### Client Tests (Vitest + React Testing Library)
```
 RUN  v2.1.9 C:/Users/chany/Documents/GitHub/toktickit/client

 ✓ tests/lab-01/App.test.tsx (4 tests) 74ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
```
