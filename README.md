# Sweety – Glucose Tracker

A full-stack healthcare web application designed to help individuals monitor, manage, and analyze blood glucose levels across four daily meal-related time slots. Built with clean architecture, strict data isolation, zero-trust server validation, and responsive clinical visualization.

---

## 📌 Project Overview

**Sweety – Glucose Tracker** provides a structured and intuitive routine for blood glucose logging. Patients can record readings into four discrete daily measurement windows, track daily compliance, and generate analytical reports (Daily, Month-to-Date, and Previous Month) to monitor health trends over time.

---

## 📸 Application Screenshots

### 1. Daily Tracking Dashboard
The main dashboard provides daily 4-slot routine cards (Morning Fasting, After Breakfast, After Lunch, After Dinner), daily completion progress (e.g. 4/4 slots logged), daily mean glucose level, and lowest/highest readings.

![Daily Tracking Dashboard](screenshots/Screenshot%202026-11-09%20231003.png)

---

### 2. Glucose Reading Entry & Validation Modal
An intuitive modal dialog for logging or updating blood glucose measurements. Includes slot selection, whole-integer range validation (40–600 mg/dL), date picker with future-date rejection, and optional personal notes.

![Glucose Reading Modal](screenshots/Screenshot%202026-11-09%20223918.png)

---

### 3. Readings Management Journal
A comprehensive clinical journal displaying historical readings with date filtering, measurement slot badges, glucose values in mg/dL, personal notes, and direct Edit/Delete actions with confirmation modals.

![Readings Management Journal](screenshots/Screenshot%202026-11-09%20223836.png)

---

### 4. Clinical Reports – Month-to-Date (MTD) Analytics
The Month-to-Date report computes period averages, compliance against daily targets, lowest/highest recorded readings, and renders an interactive timeline chart showing daily mean glucose progression from the 1st through the selected date.

![Month-to-Date Report and Glucose Rhythm Chart](screenshots/Screenshot%202026-11-09%20223819.png)

---

### 5. Historical Reports – Previous Month & Slot Breakdown
A complete 31-day retrospective view featuring the full daily mean timeline chart and an independent mean glucose breakdown for each discrete slot (Morning Fasting, After Breakfast, After Lunch, After Dinner).

![Previous Month Report and Slot Breakdown](screenshots/Screenshot%202026-11-09%20231016.png)

---

### 6. Secure Authentication & 1-Click Demo Login
Authentication screen featuring bcrypt password hashing, HttpOnly JWT cookie issuance, and 1-click autofill buttons for instant testing with pre-seeded demo accounts.

![Welcome and Authentication Screen](screenshots/Screenshot%202026-11-09%20230938.png)

---

## ✨ Features

- **Secure Authentication**: User registration and login utilizing bcrypt password hashing and JWT authentication delivered via secure `HttpOnly`, `SameSite=Lax` cookies (preventing client-side script token theft).
- **Multi-Tenant Data Isolation**: Every reading and report operation is scoped strictly to the authenticated user ID (`where: { userId }`), preventing cross-user data leakage and enumeration attacks.
- **Four Discrete Measurement Slots**:
  1. `Morning (fasting)` — Fasting check upon waking.
  2. `After breakfast` — 1–2 hours postprandial morning check.
  3. `After lunch` — 1–2 hours postprandial midday check.
  4. `After dinner` — 1–2 hours postprandial evening check.
- **Strict Business Rule Enforcement**:
  - Exactly **one reading per slot per day**.
  - **Maximum of four readings per day** (guaranteed via PostgreSQL compound unique index `[userId, recordedDate, slot]`).
  - Whole integer glucose values strictly between **40 and 600 mg/dL**.
  - **Future calendar dates are prohibited**.
- **Timezone-Safe Calendar Arithmetic**: Readings are stored using PostgreSQL's `@db.Date` without UTC offset drift.
- **Comprehensive Reports Engine**:
  - **Daily Report**: View completed vs. missing slots, daily average, lowest, and highest readings.
  - **Month-to-Date (MTD) Report**: Analyzes the calendar range from the 1st of the month through the selected date, calculating period average, slot averages, and compliance rate against the 4 daily slots target.
  - **Previous-Month Report**: Complete analysis of the preceding calendar month, with full support for year rollbacks (e.g., January to December) and leap years (February 29).
  - **Monthly Glucose Trend Chart**: Interactive, responsive timeline chart illustrating daily average glucose progression across the selected monthly period. Missing days remain unplotted gaps (no data interpolation or fabrication).
  - **Graceful Empty States**: Clean, reassuring empty-state responses when no readings have been recorded for a period.
- **Reading Table Pagination**: Server-side pagination with page and limit query validation, metadata calculations, and responsive Previous/Next pagination controls.
- **Neutral Clinical Presentation**: Clear presentation of values in `mg/dL` without speculative medical diagnoses.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | Fast, responsive single-page application |
| **Styling** | Tailwind CSS, Lucide Icons | Clean healthcare design system |
| **Backend** | Node.js (v20+), Express | Modular RESTful API |
| **Database** | PostgreSQL 16+, Prisma ORM | Relational data persistence with declarative migrations |
| **Authentication** | bcryptjs, jsonwebtoken, cookie-parser | Secure password hashing & HttpOnly JWT cookies |
| **Validation** | Zod | Runtime type safety and schema validation |
| **Frontend Testing** | Vitest, React Testing Library, jsdom | Component rendering and modal input validation tests |
| **Backend Testing** | Vitest, Supertest | Unit, schema, boundary, and API integration test suites |
| **Containerization** | Docker, Docker Compose, Nginx Alpine | Multi-service local and production deployment |

---

## 📁 Repository Structure

```
sweety/
├── backend/
│   ├── prisma/
│   │   ├── migrations/            # Version-controlled database migrations
│   │   ├── schema.prisma          # PostgreSQL models, enums, compound indexes
│   │   └── seed.ts                # 45-day realistic seed dataset & demo users
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts             # Zod environment variable validation
│   │   │   └── prisma.ts          # Singleton Prisma client instance
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts # Signup, login, logout, getMe
│   │   │   ├── reading.controller.ts # Reading CRUD operations & pagination
│   │   │   └── report.controller.ts  # Daily, MTD, and Previous-Month reports
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts # HttpOnly JWT verification
│   │   │   ├── error.middleware.ts# Centralized error handler (P2002 -> 409)
│   │   │   └── validate.middleware.ts # Zod request validation
│   │   ├── routes/
│   │   │   ├── auth.routes.ts     # /api/auth routes
│   │   │   ├── reading.routes.ts  # /api/readings routes
│   │   │   └── report.routes.ts   # /api/reports routes
│   │   ├── schemas/
│   │   │   ├── auth.schema.ts     # Zod auth schemas
│   │   │   ├── reading.schema.ts  # Zod reading schemas
│   │   │   └── report.schema.ts   # Zod report schemas
│   │   ├── utils/
│   │   │   ├── date.ts            # Timezone-safe calendar and boundary utilities
│   │   │   └── token.ts           # JWT generation and cookie helpers
│   │   ├── app.ts                 # Express app configuration & middleware
│   │   └── server.ts              # Server startup & graceful shutdown
│   ├── tests/
│   │   ├── auth.test.ts           # Authentication & security tests (10 tests)
│   │   ├── date.test.ts           # Date arithmetic & boundary unit tests (6 tests)
│   │   ├── db.test.ts             # PostgreSQL connection & constraint tests (4 tests)
│   │   ├── health.test.ts         # API health check test (1 test)
│   │   ├── reading.test.ts        # Reading CRUD & business rules tests (28 tests)
│   │   └── report.test.ts         # Report engine calculation tests (10 tests)
│   ├── .dockerignore              # Backend Docker ignore rules
│   ├── .env.example               # Backend environment variables template
│   ├── Dockerfile                 # Multi-stage Node.js build & runner
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Layout, LoadingSpinner, ConfirmationModal, Toast
│   │   │   ├── readings/          # SlotCard, ReadingModal, ReadingModal.test.tsx
│   │   │   └── reports/           # MetricCard, DailyReportView, MonthlyReportView, MonthlyGlucoseChart
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # User session state via /api/auth/me
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx  # Daily 4-slot logger & summary metrics
│   │   │   ├── LoginPage.tsx      # Login screen with 1-click demo fill
│   │   │   ├── ReadingsPage.tsx   # Filterable reading table with CRUD actions & pagination
│   │   │   ├── ReportsPage.tsx    # Daily, MTD, and Previous Month tabs
│   │   │   └── SignupPage.tsx     # Registration screen
│   │   ├── services/
│   │   │   └── api.ts             # Axios client with withCredentials: true
│   │   ├── test/
│   │   │   └── setup.ts           # Test setup for Testing Library & jest-dom
│   │   ├── types/
│   │   │   └── index.ts           # Shared TypeScript interfaces
│   │   ├── App.tsx                # Route definitions & protected route guards
│   │   ├── main.tsx               # React application entry point
│   │   └── index.css              # Tailwind CSS directives
│   ├── .dockerignore              # Frontend Docker ignore rules
│   ├── Dockerfile                 # Multi-stage Vite build + Nginx Alpine runner
│   ├── index.html
│   ├── nginx.conf                 # Nginx SPA fallback & API proxy configuration
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts             # Vite config with /api proxy to backend:5000
│   └── vitest.config.ts           # Vitest configuration for React component tests
├── screenshots/                   # Application screenshots embedded in README
│   ├── Screenshot 2026-11-09 223819.png # Reports - Month-to-Date view
│   ├── Screenshot 2026-11-09 223836.png # Readings - Glucose Journal table
│   ├── Screenshot 2026-11-09 223918.png # Dashboard - Reading entry modal
│   ├── Screenshot 2026-11-09 230938.png # Auth - Login & demo autofill
│   ├── Screenshot 2026-11-09 231003.png # Dashboard - Daily 4-slot rhythm
│   └── Screenshot 2026-11-09 231016.png # Reports - Previous month 31-day breakdown
├── .env.example                   # Root environment configuration reference
├── .gitignore                     # Git ignore rules
├── docker-compose.yml             # Multi-service container orchestration
├── package.json                   # Root workspace runner scripts
└── README.md
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or higher (tested on `v22.x` and `v26.5.0`)
- **npm**: `v10.x` or higher
- **PostgreSQL**: `v14.x` or higher (tested on PostgreSQL 16 and 18)
- *(Optional)* **Docker & Docker Compose**: For containerized deployment

---

## 📦 Installation Instructions

Clone the repository and install dependencies for both backend and frontend workspaces:

```bash
# 1. Clone the repository
git clone https://github.com/mariyageorge/sweety-glucose-tracker.git
cd sweety

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. (Optional) Return to root for workspace script usage
cd ..
```

---

## ⚙️ Environment Variable Configuration

The backend utilizes Zod (`src/config/env.ts`) for runtime environment validation. All required variables must be defined before the server starts.

### 1. Create the Environment File
Copy the example environment configuration into `backend/.env`:

**macOS / Linux:**
```bash
cp backend/.env.example backend/.env
```

**Windows PowerShell:**
```powershell
Copy-Item backend/.env.example backend/.env
```

### 2. Configure Environment Variables

Edit `backend/.env` with your settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL with Prisma)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweety_db?schema=public"

# Authentication Secrets (At least 16 characters; recommend 32+ random characters)
JWT_SECRET="replace_with_a_secure_random_jwt_secret_at_least_32_characters"
JWT_EXPIRES_IN="7d"

# Frontend Client URL (used for CORS and HttpOnly cookies)
CLIENT_URL="http://localhost:5173"

# Application Calendar Timezone
APP_TIMEZONE="Asia/Kolkata"
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port on which the Express REST API listens. |
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`). |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string including user, password, host, port, db name, and schema. |
| `JWT_SECRET` | **Yes** | — | Signing key for JWT session tokens (minimum 16 characters enforced by Zod). |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration duration (e.g., `7d`, `24h`). |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin and client redirect base. |
| `APP_TIMEZONE` | No | `Asia/Kolkata` | Application calendar timezone used for day boundaries. |

---

## 🗄️ Database Setup & Migrations

1. Ensure your PostgreSQL service is running locally on port `5432`.
2. Create the application database in PostgreSQL:
   ```sql
   CREATE DATABASE sweety_db;
   ```
3. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
4. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```
   *(or `npm run prisma:generate`)*
5. Run the Prisma database migrations to apply schemas, enums, and compound unique indexes:
   ```bash
   npx prisma migrate dev
   ```
   *(or `npm run prisma:migrate`)*
6. Populate the database with realistic demo patients and 45 days of reading history:
   ```bash
   npx prisma db seed
   ```
   *(or `npm run prisma:seed`, or `npm run seed` from the project root)*

---

## 🚀 Running the Application Locally

You can run the backend API and frontend dashboard either from their respective directories or directly from the project root.

### Option A: From Respective Directories

#### 1. Start Backend API
```bash
cd backend
npm run dev
```
- REST API runs at: **`http://localhost:5000`**
- Health check probe: **`http://localhost:5000/api/health`**

#### 2. Start Frontend Dashboard
Open a new terminal window:
```bash
cd frontend
npm run dev
```
- Web dashboard runs at: **`http://localhost:5173`**
- API requests are proxied automatically to `http://localhost:5000/api` via Vite.

---

### Option B: From the Project Root Workspace

Run the workspace scripts defined in root `package.json`:

```bash
# Start backend in development mode (tsx watch)
npm run dev:backend

# In a second terminal, start frontend in development mode (vite)
npm run dev:frontend
```

---

### Production Build & Preview Locally

To verify production builds without Docker:

```bash
# Build both backend (tsc) and frontend (vite build) from root
npm run build

# Or build individually:
cd backend && npm run build && npm start
cd frontend && npm run build && npm run preview
```

---

## 🐳 Docker Deployment

The repository includes a complete multi-container setup orchestrated via `docker-compose.yml`:
- **`sweety-postgres`**: PostgreSQL 16 Alpine with persistent data volume (`postgres_data`) and health check probe.
- **`sweety-backend`**: Node.js 22 Alpine executing automated `prisma migrate deploy` before launching the production API server.
- **`sweety-frontend`**: Production Vite build served through Nginx Alpine with built-in SPA routing fallback and API reverse proxy to the backend container.

### 1. Build and Start All Containers

```bash
docker compose up --build
```

To run in background (detached mode):
```bash
docker compose up -d --build
```

### 2. Services Exposed

| Service | Accessible URL / Port | Container Name |
|---|---|---|
| **Frontend Web App** | [`http://localhost:5173`](http://localhost:5173) | `sweety-frontend` |
| **Backend REST API** | [`http://localhost:5000`](http://localhost:5000) | `sweety-backend` |
| **PostgreSQL Database** | `localhost:5432` | `sweety-postgres` |

### 3. Seed Database in Docker
To populate demo users and 45 days of sample data inside the running Docker backend container:
```bash
docker compose exec backend npx prisma db seed
```

### 4. Viewing Logs
```bash
# Stream logs for all services
docker compose logs -f

# Stream backend logs only
docker compose logs -f backend
```

### 5. Stopping and Resetting Containers
```bash
# Stop containers while preserving database volume
docker compose down

# Stop containers and wipe the database volume (clean reset)
docker compose down -v
```

---

## 🧪 Running Tests

Both frontend and backend include comprehensive automated test suites executed via **Vitest**.

### Backend Automated Test Suite
The backend contains **59 automated tests** covering security, database constraints, business rules, and report arithmetic.

Run from the `backend/` directory:
```bash
cd backend
npm test
```

Or run in watch mode:
```bash
npm run test:watch
```

Or run from the project root:
```bash
npm test
```

#### Test Suite Breakdown:
- **`tests/auth.test.ts` (10 tests)**: User registration, duplicate email rejection, bcrypt password hashing, login credential validation, HttpOnly JWT issuance, `/api/auth/me` profile recovery, and logout cookie clearance.
- **`tests/date.test.ts` (6 tests)**: Timezone-safe calendar boundaries, string parsing, month-to-date day ranges, leap year calculations (Feb 29), and calendar year rollback (January to December).
- **`tests/db.test.ts` (4 tests)**: PostgreSQL connectivity, user creation, cascading reading deletions, and compound unique constraint enforcement (`[userId, recordedDate, slot]`).
- **`tests/health.test.ts` (1 test)**: Health probe endpoint validation (`/api/health`).
- **`tests/reading.test.ts` (28 tests)**: Blood glucose reading CRUD, slot duplicate rejection (HTTP 409), strict range validation (40–600 mg/dL), future date rejection, deterministic chronological slot sorting, server-side pagination, and multi-tenant data isolation.
- **`tests/report.test.ts` (10 tests)**: Daily report completion, missing slot calculations, min/max/average arithmetic, Month-to-Date compliance %, previous calendar month calculations, and graceful empty states.

---

### Frontend Automated Test Suite
The frontend contains **5 component tests** built with **Vitest**, **React Testing Library**, and **@testing-library/jest-dom**.

Run from the `frontend/` directory:
```bash
cd frontend
npm test
```

Or run from the project root:
```bash
npm --prefix frontend test
```

#### Test Suite Breakdown:
- **`src/components/readings/ReadingModal.test.tsx` (5 tests)**:
  - Modal rendering and visibility control (`isOpen=false` renders null).
  - Modal form elements and labels verification (`Log Glucose Reading`, `Measurement Slot`, `Glucose Level`, `Save Reading`).
  - Validation error when glucose level is below 40 mg/dL.
  - Validation error when glucose level is above 600 mg/dL.
  - Decimal value rejection (enforces whole numbers only).

---

## 🔑 Demo Account Credentials & Seed Data

The database seed script (`backend/prisma/seed.ts`) generates two demo accounts:

| User Account | Email | Password | Dataset Details |
|---|---|---|---|
| **Primary Demo Patient** | `demo@sweety.app` | `Password123!` | Populated with **45 consecutive days** (182 readings) spanning the previous calendar month and the current month-to-date. Ideal for reviewing compliance graphs, slot averages, and monthly trend charts immediately. |
| **Secondary User** | `test@sweety.app` | `Password123!` | Populated with 2 isolated readings on today's date. Used to verify cross-user isolation and ensure user data boundaries cannot be bypassed. |

*Total Seeded Readings: **184 readings**.*

> 💡 **Quick Login**: The frontend login page (`/login`) includes 1-click **Autofill Demo Account** and **Autofill Test Account** buttons to immediately test the application without manual typing.

---

## 📡 API Endpoints Reference

All endpoints (except health probes and public authentication routes) require the secure `jwt` HttpOnly session cookie.

### Health Probes
- `GET /` — API service identification and online status
- `GET /api/health` — Returns `{ status: "ok" }`

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Register a new patient account (`{ name, email, password }`)
- `POST /api/auth/login` — Authenticate credentials and receive HttpOnly cookie (`{ email, password }`)
- `POST /api/auth/logout` — Invalidate session and clear auth cookie
- `GET /api/auth/me` — Retrieve authenticated user profile (`id`, `name`, `email`)

### Blood Glucose Readings (`/api/readings`)
- `POST /api/readings` — Create reading (`{ value, slot, recordedDate, notes? }`)
- `GET /api/readings?date=YYYY-MM-DD&page=1&limit=10` — List user's readings with optional date filter and pagination
- `GET /api/readings/:id` — Retrieve a single reading by ID
- `PATCH /api/readings/:id` — Update reading value, slot, date, or notes
- `DELETE /api/readings/:id` — Delete a reading

### Health Reports (`/api/reports`)
- `GET /api/reports/daily?date=YYYY-MM-DD` — Daily slot completion breakdown, min, max, and daily average
- `GET /api/reports/month-to-date?date=YYYY-MM-DD` — MTD summary (1st through selected date) with slot averages & compliance %
- `GET /api/reports/previous-month?date=YYYY-MM-DD` — Complete previous calendar month summary & trends

---

## 📝 Notes

### Assumptions & Design Decisions
- **Standardized Units**: Glucose readings are recorded in `mg/dL`.
- **Discrete Daily Measurement Windows**: Each user can record at most four readings per day: Morning Fasting, After Breakfast, After Lunch, and After Dinner.
- **Slot Uniqueness**: A user can create only one reading per slot per day.
- **Future Date Prohibition**: Future-dated readings are not permitted.
- **Secure Session Management**: Authentication uses secure password hashing (bcryptjs) and `HttpOnly`, `SameSite=Lax` JWT cookies to safeguard against client-side script token theft.
- **Strict Data Isolation**: Users can access only their own readings; queries are strictly bounded to the authenticated `userId`.
- **Robust Integrity Controls**: Database constraints (PostgreSQL `@db.Date`, compound unique index on `[userId, recordedDate, slot]`) and backend validation (Zod schemas) enforce data integrity at both runtime and persistence layers.
- **Neutral Clinical Presentation**: The application presents glucose information neutrally and is intended for tracking, not medical diagnosis.

### Future Improvements
- **Continuous Glucose Monitor (CGM) Integration**: Direct synchronization with continuous glucose monitors (e.g., Dexcom, Abbott FreeStyle Libre) via Bluetooth or vendor cloud APIs.
- **PDF/CSV Report Export**: Formatted clinical report downloads for healthcare providers and raw CSV exports for personal analysis.
- **Configurable Glucose Alerts and Thresholds**: Personalized hypoglycemia and hyperglycemia alert boundaries configured in consultation with medical practitioners.
- **Medication and Carbohydrate Tracking**: Contextual logging of insulin dosage, oral medications, and meal carbohydrate counts alongside glucose readings.
- **Caregiver Access**: Delegated, role-based access for designated caregivers and clinicians with appropriate authorization.
- **Offline Support and Synchronization**: Progressive Web App (PWA) offline data logging with automatic synchronization upon internet reconnection.

---

## 📄 License

This project is open-source and available under the [ISC License](LICENSE).
