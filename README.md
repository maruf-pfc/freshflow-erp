# FreshFlow ERP: Cold-Chain Inventory & B2B Perishable Supply Platform

Enterprise-grade B2B perishable supply platform engineered to eliminate food waste and logistics inefficiencies across cold-chain distribution networks.

---

## Core Capabilities

- **Algorithmic FEFO Stock Allocation:** First-Expired, First-Out batch picking with row-level database locking (`select_for_update()`) inside atomic transactions to prevent race conditions and over-allocation.
- **Cold-Chain Compliance & Telemetry:** Temperature tracking per storage bin with automated quarantine alerts upon thermal breach.
- **B2B Dynamic Tiered Pricing:** Dynamic customer tier discounts on profit margins (Bronze 0%, Silver 3%, Gold 7%, Platinum 10%) with baseline purchase cost protection.
- **Automated Wastage & Near-Expiry Markdown:** Near-expiry dynamic price degradation (30% markdown for items within 48h of expiration) and audited financial wastage scrap accounting.
- **Role-Based Access Control (RBAC):** Server-side zero-trust authorization enforcing four business personas with SimpleJWT single-use token rotation and blacklisting.
- **Interactive In-App API Test Bench (`/api-tester`):** Instant 1-click persona switching, live request dispatching, latency telemetry, and payload inspection.
- **Bengali Domain REST Test Bench (`freshflow_bengali_api_test.http`):** Comprehensive test bench populated with authentic Bengali items (Padma Hilsa, Bogura Curd, Savar Milk) and restaurants (Kasturi, Star Kabab).

---

## Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend Framework** | Django 5.1+ & Django REST Framework | 7 domain modules with transactional services |
| **Authentication** | Django SimpleJWT | Token rotation, blacklisting, and RBAC permissions |
| **Database** | SQLite (WAL Mode, 5000ms busy timeout) / Turso (libSQL) | Atomic transactions with `select_for_update()` row locks |
| **Frontend Framework** | Next.js 15 (App Router) | React 19, Server & Client Components |
| **Styling & Fonts** | Tailwind CSS 4, Plus Jakarta Sans, JetBrains Mono | Custom editorial aesthetic, dark mode support |
| **HTTP & State** | Axios singleton (with queued 401 refresh mechanism) | TanStack React Query 5 |
| **Testing & Quality** | Django Test Runner, Biome 2.4, TypeScript 5.8 | 29/29 automated backend tests passing |

---

## Project Structure

```text
freshflow-erp/
├── backend/
│   ├── apps/
│   │   ├── authentication/   # Custom User model, JWT serializers, RBAC permissions
│   │   ├── inventory/        # PerishableItem, StockBatch, shelf-life countdowns
│   │   ├── crm/              # Restaurant profiles, rolling spend, tier progression
│   │   ├── orders/           # Order, OrderItem, atomic FEFO allocation service
│   │   ├── wastage/          # WastageLog, scrap write-offs, markdown commands
│   │   ├── analytics/        # Spoilage metrics, sourcing matrix, KPI views
│   │   └── employees/        # EmployeeProfile, audit logs, reporting structure
│   ├── core/                 # settings.py, urls.py, wsgi.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router (overview, profile, api-tester, login)
│   │   ├── components/       # Profile tabs, overview widgets, navbar, sidebar
│   │   ├── context/          # auth-context.tsx
│   │   ├── lib/              # api.ts (Axios singleton with token refresh queue)
│   │   └── types/            # TypeScript contracts mirroring backend models
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── TECHNICAL_GUIDE.md           # Engineering architecture & database lock specs
│   ├── USER_MANUAL.md               # End-to-end operations & code walkthrough manual
│   ├── PRE_DEFENSE_PRESENTATION.md  # 15-slide university defense script with timings
│   ├── DEFENSE_QA_PREPARATION.md    # 10 tough defense board questions & CSE answers
│   └── AUTHENTICATION.md            # JWT & RBAC technical specification
├── freshflow_bengali_api_test.http  # VS Code / JetBrains REST Client test file
├── run.sh                           # 1-command startup script
└── README.md
```

---

## Role-Based Access Control (RBAC)

The system enforces four distinct personas aligned with cold-chain operations:

| Role | Target Persona | Credentials | Access Level |
|---|---|---|---|
| `ADMIN` | System Administrator | `admin_demo` / `Password123!` | Full system governance, employee directory, immutable audit logs |
| `WAREHOUSE_MANAGER` | Cold Storage Facility Manager | `warehouse_demo` / `Password123!` | Inventory intake, batch logging, temperature telemetry, wastage logging |
| `SALES_AGENT` | B2B Account Manager | `sales_demo` / `Password123!` | CRM client management, order placement across dining clients |
| `RESTAURANT_CLIENT` | B2B Dining Partner | `bistro_chef` / `StrongPassword123!` | Catalog ordering, FEFO allocation review, tier discounts |

---

## Getting Started

### 1-Command Startup
```bash
chmod +x run.sh
./run.sh
```
This automatically starts:
- **Backend API:** `http://localhost:8005/api/`
- **Frontend App:** `http://localhost:3000/`

---

### Manual Setup

#### Backend Setup
```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Apply database migrations
python backend/manage.py migrate

# 4. (Optional) Seed demo users & employees
python backend/manage.py seed_employees

# 5. Start Django development server
python backend/manage.py runserver 8005
```

#### Frontend Setup
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Next.js development server
npm run dev
```

---

## Testing & Quality Assurance

### 1. Run Complete Backend Test Suite (29/29 Tests Passing)
```bash
./venv/bin/python backend/manage.py test apps
```
Tests all 7 modules:
- `apps.authentication` (JWT token issuance, refresh rotation, blacklisting, RBAC)
- `apps.inventory` (Batch intake, shelf-life countdown, flash-sale markdown)
- `apps.crm` (Restaurant onboarding, tier progression, rolling spend)
- `apps.orders` (FEFO greedy multi-batch deduction, row-level concurrency locking)
- `apps.wastage` (Financial scrap loss write-offs, audit trails)
- `apps.analytics` (Executive KPIs, supplier quality matrix)
- `apps.employees` (Employee profiles, personal field self-updates, audit logging)

### 2. Run Frontend Typecheck & Linting
```bash
cd frontend
npm run typecheck
npm run lint
```

### 3. Run REST API Tests with Bengali Perishables
Open `freshflow_bengali_api_test.http` in VS Code (with REST Client extension) or IntelliJ HTTP Client:
- Authenticates all 4 roles.
- Intakes Bengali perishables: **পদ্মা নদীর তাজা ইলিশ**, **বগুড়ার মিষ্টি দই**, **চট্টগ্রামের গরুর মাংস**, **সাভারের তাজা দুধ**.
- Executes atomic FEFO order allocation and checks Gold tier discounts.

---

## University Pre-Defense Deliverables

Prepared for Department of Computer Science & Engineering, Green University of Bangladesh (Pre-Defence, Spring 2025):

- **Slide Deck & Spoken Script:** [PRE_DEFENSE_PRESENTATION.md](docs/PRE_DEFENSE_PRESENTATION.md) — 15 structured slides with exact spoken timing (1-minute problem statement, 90-second literature review, FEFO architecture, live demo).
- **Defense Board Q&A Guide:** [DEFENSE_QA_PREPARATION.md](docs/DEFENSE_QA_PREPARATION.md) — Top 10 tough defense board questions covering database concurrency, SQLite WAL under load, JWT token invalidation, and algorithm complexity.
- **Technical Guide:** [TECHNICAL_GUIDE.md](docs/TECHNICAL_GUIDE.md) — System architecture, database locking formulas, and API specification.
- **Operational User Manual:** [USER_MANUAL.md](docs/USER_MANUAL.md) — Step-by-step cold-chain execution lifecycle and code walkthroughs.
