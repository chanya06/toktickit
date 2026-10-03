# TokTickIT - IT Service Desk Application

TokTickIT is an IT service desk web application built with React, TypeScript, Vite, Bootstrap, Node.js, Express, Prisma ORM, and PostgreSQL.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Bootstrap 5
- **Backend**: Node.js + Express + TypeScript
- **Database & ORM**: PostgreSQL 16 + Prisma ORM
- **Testing**: Vitest + Supertest + React Testing Library + Playwright

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

### 4. End-to-End Testing (Playwright)
From the root repository directory:
```bash
npm run test:e2e
```
> **Note**: Ensure both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) are running, and database is seeded before executing E2E tests.

---

## Seed Accounts for Testing

Default password for all seeded accounts is: `InitialPass123!`

| Role | Name | Email | Status | Initial Password Change |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | John Smith | `admin@toktickit.com` | Active | Not required (Direct Access) |
| **IT Staff** | Lisa Martinez | `lisa.martinez@toktickit.com` | Active | Required (`mustChangePassword`) |
| **IT Staff** | Kevin Patel | `kevin.patel@toktickit.com` | Active | Required (`mustChangePassword`) |
| **IT Staff** | Emily Davis | `emily.davis@toktickit.com` | Active | Required (`mustChangePassword`) |
| **IT Staff** | Robert Wilson | `robert.wilson@toktickit.com` | Inactive | Inactive account testing |
| **Requester** | Jennifer Anderson | `jennifer.anderson@example.com` | Active | Required (`mustChangePassword`) |
| **Requester** | Michael Brown | `michael.brown@example.com` | Active | Required (`mustChangePassword`) |
| **Requester** | Sarah Johnson | `sarah.johnson@example.com` | Active | Required (`mustChangePassword`) |
| **Requester** | David Lee | `david.lee@example.com` | Active | Required (`mustChangePassword`) |
| **Requester** | Alex Taylor | `alex.taylor@example.com` | Inactive | Inactive account testing |

