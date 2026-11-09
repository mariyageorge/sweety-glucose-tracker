# Sweety – Glucose Tracker

A full-stack healthcare web application designed to help individuals monitor, manage, and analyze blood glucose levels across four daily meal-related time slots. Built with clean architecture, strict data isolation, zero-trust server validation, and responsive clinical visualization.

---

## 📌 Project Overview

**Sweety – Glucose Tracker** provides a structured and intuitive routine for blood glucose logging. Patients can record readings into four discrete daily measurement windows, track daily compliance, and generate analytical reports (Daily, Month-to-Date, and Previous Month) to monitor health trends over time.

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
| **Styling** | Tailwind CSS, Lucide Icons | Clean healthcare SaaS design system |
| **Backend** | Node.js, Express | Modular RESTful API |
| **Database** | PostgreSQL 18, Prisma ORM | Relational data persistence with migrations |
| **Authentication** | bcryptjs, jsonwebtoken, cookie-parser | Secure password hashing & HttpOnly JWT cookies |
| **Validation** | Zod | Runtime type safety and schema validation |
| **Testing** | Vitest, Supertest | Unit, schema, and integration test suites |

---

## 📁 Folder Structure

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
│   │   │   ├── reading.controller.ts # Reading CRUD operations
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
│   │   ├── auth.test.ts           # Authentication & security tests
│   │   ├── date.test.ts           # Date arithmetic & boundary unit tests
│   │   ├── db.test.ts             # PostgreSQL connection & constraint tests
│   │   ├── health.test.ts         # API health check test
│   │   ├── reading.test.ts        # Reading CRUD & business rules tests
│   │   └── report.test.ts         # Report engine calculation tests
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Layout, LoadingSpinner, ConfirmationModal, Toast
│   │   │   ├── readings/          # SlotCard, ReadingModal
│   │   │   └── reports/           # MetricCard, DailyReportView, MonthlyReportView
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # User session state via /api/auth/me
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx  # Daily 4-slot logger & summary metrics
│   │   │   ├── LoginPage.tsx      # Login screen with 1-click demo fill
│   │   │   ├── ReadingsPage.tsx   # Filterable reading table with CRUD actions
│   │   │   ├── ReportsPage.tsx    # Daily, MTD, and Previous Month tabs
│   │   │   └── SignupPage.tsx     # Registration screen
│   │   ├── services/
│   │   │   └── api.ts             # Axios client with withCredentials: true
│   │   ├── types/
│   │   │   └── index.ts           # Shared TypeScript interfaces
│   │   ├── App.tsx                # Route definitions & protected route guards
│   │   ├── main.tsx               # React application entry point
│   │   └── index.css              # Tailwind CSS directives
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts             # Vite config with /api proxy to backend:5000
├── .env.example                   # Root environment configuration reference
├── .gitignore                     # Git ignore rules
├── package.json                   # Root package runner scripts
└── README.md
```

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or higher (tested on `v26.5.0`)
- **npm**: `v10.x` or higher
- **PostgreSQL**: `v14.x` or higher (tested on PostgreSQL 18)

---

## ⚙️ Environment Setup

1. In the `backend/` directory, copy the example environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Update `backend/.env` with your PostgreSQL database credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweety_db?schema=public"
   JWT_SECRET="replace_with_a_secure_random_jwt_secret_at_least_32_characters"
   JWT_EXPIRES_IN="7d"
   CLIENT_URL="http://localhost:5173"
   APP_TIMEZONE="Asia/Kolkata"
   ```

---

## 🗄️ Database Setup & Migrations

1. Ensure your PostgreSQL server is running.
2. Create the application database in PostgreSQL (if not using an automated create script):
   ```sql
   CREATE DATABASE sweety_db;
   ```
3. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
4. Run the Prisma migrations to create tables and constraints:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database with demo patient accounts and 45 days of realistic glucose data:
   ```bash
   npx prisma db seed
   ```

---

## 🚀 Running the Application

### 1. Start the Backend API
From the `backend/` directory:
```bash
npm run dev
```
The backend API will start on **`http://localhost:5000`**.  
Health check endpoint: `http://localhost:5000/api/health`

### 2. Start the Frontend Application
From a new terminal window in the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
The web dashboard will start on **`http://localhost:5173`**.

### Or run both from the root workspace:
```bash
npm run dev:backend
npm run dev:frontend
```

---

## 🧪 Running Tests & Production Builds

### Backend Automated Test Suite
From the `backend/` directory:
```bash
npm test
```
Runs the full Vitest suite comprising **53 integration and unit tests**:
- Date arithmetic, boundary calculations, and leap year tests.
- Database connectivity and compound unique constraint validation.
- Health probe validation.
- Authentication, bcrypt password hashing, and cookie issuance.
- Glucose reading CRUD, future date rejection, and user data isolation.
- Daily, MTD, and Previous-Month report calculations.

### Frontend Production Build
From the `frontend/` directory:
```bash
npm run build
```
Executes TypeScript compilation and Vite production bundling to ensure zero build or type errors.

---

## 🔑 Demo Account Credentials

For convenience, the seed script (`backend/prisma/seed.ts`) populates two demo accounts:

| User Role | Email | Password | Dataset Description |
|---|---|---|---|
| **Primary Demo Patient** | `demo@sweety.app` | `Password123!` | Pre-populated with **45 consecutive days** (184 readings) across current month and previous month. Ready for immediate report evaluation. |
| **Secondary User** | `test@sweety.app` | `Password123!` | Contains isolated test readings to verify multi-tenant data protection and boundary enforcement. |

*Quick autofill buttons for these credentials are built directly into the login screen.*

---

## 📡 API Endpoints Reference

All endpoints (except health and public auth) require the secure `jwt` session cookie.

### Health
- `GET /` — Service identification and online status
- `GET /api/health` — Returns `{ status: "ok" }`

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Register a new patient account (`{ name, email, password }`)
- `POST /api/auth/login` — Authenticate and receive HttpOnly cookie (`{ email, password }`)
- `POST /api/auth/logout` — Invalidate session and clear cookie
- `GET /api/auth/me` — Retrieve authenticated user profile

### Blood Glucose Readings (`/api/readings`)
- `POST /api/readings` — Create reading (`{ value, slot, recordedDate, notes? }`)
- `GET /api/readings?date=YYYY-MM-DD` — List own readings (optional date filter)
- `GET /api/readings/:id` — Retrieve a single reading by ID
- `PATCH /api/readings/:id` — Update reading value, slot, date, or notes
- `DELETE /api/readings/:id` — Remove a reading

### Health Reports (`/api/reports`)
- `GET /api/reports/daily?date=YYYY-MM-DD` — Daily slot completion breakdown, min, max, and average
- `GET /api/reports/month-to-date?date=YYYY-MM-DD` — MTD summary (1st to selected date) with slot averages & compliance
- `GET /api/reports/previous-month?date=YYYY-MM-DD` — Complete previous calendar month summary & trends

---

## 🧠 Architectural Decisions & Assumptions

1. **HttpOnly Cookie Authentication**:
   - The JWT is stored inside an `HttpOnly`, `SameSite=Lax` cookie. Storing sensitive tokens in `localStorage` exposes them to Cross-Site Scripting (XSS). HttpOnly cookies cannot be read by client JavaScript, providing defense in depth.
2. **Database-Level Constraint as a Natural Gate**:
   - The assignment requires at most four readings per day and one reading per slot per day. By defining exactly four slots in an enum and placing a compound unique constraint on `[userId, recordedDate, slot]`, the database mathematically guarantees at most four readings per day without fragile application counters.
3. **Timezone Safety**:
   - Calendar dates are modeled with PostgreSQL's `@db.Date` type and validated as `YYYY-MM-DD` strings. Using UTC timestamps for dates can shift midnight readings into adjacent days depending on local timezone offsets.
4. **Data Enumeration Defense**:
   - Attempting to access, modify, or delete another patient's reading returns HTTP `404 Not Found` rather than `403 Forbidden`, preventing attackers from verifying whether specific IDs exist in the system.
5. **Clinical Neutrality**:
   - In accordance with medical software best practices, readings are presented with their units (`mg/dL`) without speculative diagnostic labeling (e.g. "diabetic" or "normal").

---

## 📄 License

This project is open-source and available under the [ISC License](LICENSE).

