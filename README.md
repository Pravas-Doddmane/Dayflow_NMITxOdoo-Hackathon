# DayFlow HRMS — Human Resource Management System

A production-grade, enterprise Human Resource Management System (HRMS) built for the **TechTitans** team. DayFlow combines a high-performance **Spring Boot 4 / Java 21** RESTful API backend with a modern, responsive **React 19 / Vite / Tailwind CSS v4** Single Page Application (SPA) frontend.

DayFlow offers enterprise-grade employee management, multi-company profile support, automated email workflows, token-based self-onboarding, real-time attendance tracking, leave lifecycle processing, payroll management, secure document vaults, interactive calendars, and full dark/light theme support.

---

## 🏗️ Repository Architecture

```
Dayflow_NMITxOdoo-Hackathon/
├── README.md                           # Main repository documentation
├── docker-compose.yml                  # Root multi-container configuration
├── .env                                # Root environment settings
│
├── DayFlow/                            # Spring Boot Backend Project
│   ├── src/                            # Java source code & Flyway migrations
│   ├── pom.xml                         # Maven dependencies & build configuration
│   ├── Dockerfile                      # Backend container configuration
│   ├── DayFlow_HRMS.postman_collection.json # API testing suite
│   ├── mvnw & mvnw.cmd                 # Maven wrapper scripts
│   └── uploads/                        # Document vault storage directory
│
└── DayFlowFrontend/                    # React 19 Frontend SPA Project
    ├── src/                            # Components, pages, contexts, & API clients
    ├── public/                         # Static web assets & icons
    ├── package.json                    # Node dependencies & npm scripts
    └── vite.config.js                  # Vite configuration & HMR setup
```

---

## 📋 Technology Stack Overview

### Backend (`DayFlow`)

| Layer / Concern | Technology | Description |
|---|---|---|
| **Language** | Java 21 | Modern LTS Java runtime |
| **Framework** | Spring Boot 4.1.1 | Enterprise backend application framework |
| **Security** | Spring Security 7 + OAuth2 Resource Server | Stateless authentication & role-based access control |
| **JWT Engine** | Nimbus JOSE + JWT | Cryptographically signed HMAC-SHA256 tokens |
| **Database** | PostgreSQL 14+ / 16 | Relational data store |
| **ORM / Data Access** | Spring Data JPA / Hibernate | Object-relational mapping & repository layer |
| **Database Migrations** | Flyway Core + PostgreSQL | Version-controlled, deterministic database schema |
| **Email Service** | Spring Boot Starter Mail | Transactional email notifications via SMTP (Gmail) |
| **API Documentation** | SpringDoc OpenAPI 2.8.9 (Swagger UI) | Interactive REST API explorer & schema docs |
| **Testing** | JUnit 5 + Mockito + H2 In-Memory DB | Unit & integration test suite |

### Frontend (`DayFlowFrontend`)

| Layer / Tool | Technology | Description |
|---|---|---|
| **Framework** | [React 19](https://react.dev/) | Component-based UI library with modern hooks |
| **Build Tool** | [Vite 8](https://vite.dev/) | Ultra-fast HMR and optimized production bundling |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first CSS engine with dark mode |
| **Routing** | [React Router v7](https://reactrouter.com/) | Client-side routing with role-based route protection |
| **HTTP Client** | [Axios](https://axios-http.com/) | Promise-based HTTP client with auth interceptors |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent SVG icon set |
| **Linter** | [Oxlint](https://oxc.rs/) | High-performance JavaScript/React linter |

---

## 🐳 Quick Start with Docker Compose (Recommended)

You can launch PostgreSQL, the Spring Boot backend, and the React frontend with a single command:

```bash
# 1. Build and start containers in detached mode
docker compose up -d --build

# 2. Inspect application logs
docker compose logs -f

# 3. Stop containers and networks
docker compose down
```

### Access Endpoints
- **Frontend SPA**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:8081`
- **Interactive Swagger UI**: `http://localhost:8081/swagger-ui.html`
- **PostgreSQL Database**: `localhost:5433` (User: `postgres` / Password: `1234` / DB: `dayflow`)

---

## ✨ Features & User Portals

### 🔐 1. Authentication & Onboarding
- **Admin & Company Registration**: Self-service onboarding for new companies and company admins.
- **Email Verification**: Token-based email validation for administrative registration.
- **Employee Invitation & Password Setup**: Secure token-based password setup for invited staff.
- **Role-Based Security**: JWT-authenticated routing for `ADMIN` vs `EMPLOYEE` accounts.
- **Forgot & Reset Password**: Secure tokenized password recovery flows via email.

### 🛠️ 2. Administrator Portal (`/admin/*`)
- **Executive Dashboard**: Real-time KPI statistics (total employees, active today, on leave, pending requests).
- **Employee Directory**: Filterable, searchable, and paginated master list with multi-tab detailed view (personal, job, contact, attendance, leaves, salary, documents).
- **Attendance Management**: Master attendance ledger with date-range filters and status tags (`PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`).
- **Leave Approvals**: Review employee leave applications and approve/reject with administrative remarks.
- **Payroll Configuration**: Define and update salary structures (Basic, HRA, Allowances, Deductions).
- **Company & Admin Profile**: Edit business details, work policy, and organizational profile.

### 👤 3. Employee Self-Service Portal (`/employee/*`)
- **Interactive Attendance Widget**: One-click **Clock In** / **Clock Out** with live working hours timer.
- **Personal Profile**: View official job details and update contact details, address, and profile photo.
- **Attendance History**: Monthly logs with check-in/out timestamps and total hours calculated.
- **Leave Management**: Apply for leaves (`PAID`, `SICK`, `UNPAID`) and track approval statuses.
- **My Salary**: View gross breakdown, allowances, deductions, and net compensation.
- **Document Vault**: Upload and download personal documents (ID proofs, offer letters, contracts).
- **Interactive Calendar**: Month view combining attendance records, approved leaves, and public holidays.

---

## 🗄️ Database & Schema Migrations

Database schema versioning is managed automatically via **Flyway** in `DayFlow/src/main/resources/db/migration/`:

| Version | Migration Script | Description |
|---|---|---|
| `V1` | `V1__create_roles.sql` | Lookup table for system roles (`ADMIN`, `EMPLOYEE`). |
| `V2` | `V2__create_users.sql` | Core credentials and account status table. |
| `V3` | `V3__create_employees.sql` | Master employee profile table. |
| `V4` | `V4__create_auth_tokens.sql` | Token store for invitations, password resets, and verification. |
| `V5` | `V5__create_attendance.sql` | Daily check-in/check-out ledger table. |
| `V6` | `V6__create_leave_requests.sql` | Leave request applications and review statuses. |
| `V7` | `V7__create_salary_structures.sql` | Compensation and salary breakdown structures. |
| `V8` | `V8__create_documents.sql` | Metadata registry for uploaded employee files. |
| `V9` | `V9__seed_roles.sql` | Seeds initial `ADMIN` and `EMPLOYEE` role records. |
| `V10` | `V10__create_companies.sql` | Multi-tenant company profile table. |
| `V11` | `V11__allow_same_email_multiple_companies.sql` | Scopes user accounts per company. |
| `V12` | `V12__drop_old_unique_email_constraints.sql` | Replaces global unique email constraint with per-company composite index. |

---

## 🔐 Onboarding & Security Workflows

### 1. Company Admin Registration Flow
```
POST /api/auth/register-admin (Company info + Admin credentials)
    ↓
Company & Admin User record created (status: PENDING)
    ↓
Verification email sent with token (valid 24h)
    ↓
POST /api/auth/verify-email?token=... → Account status becomes ACTIVE
```

### 2. Employee Invitation Flow
```
ADMIN LOGIN (JWT Bearer Token)
    ↓
POST /api/admin/employees (Admin sets name, email, department, designation)
    ↓
User account created (status: INVITED) + Employee record initialized
    ↓
Invitation email sent with setup token (valid 48h)
    ↓
Employee opens /setup-password?token=... and sets password
    ↓
Account transitions to ACTIVE → User logs in at /api/auth/login
```

---

## ⚙️ Environment Configuration

### Backend (`DayFlow/.env`)
Copy `DayFlow/.env.example` to `DayFlow/.env`:

```env
DB_URL=jdbc:postgresql://localhost:5432/dayflow
DB_USERNAME=postgres
DB_PASSWORD=1234
JWT_SECRET=/cfnKLQlry52dsdUbQKThBWjkLhx1Jxun8DxV+bFrZM=
JWT_EXPIRATION_MS=86400000
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
APP_BASE_URL=http://localhost:5173
ADMIN_EMAIL=admin@dayflow.local
ADMIN_PASSWORD=AdminPass@2024
UPLOAD_DIR=./uploads
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (`DayFlowFrontend/.env`)
Copy `DayFlowFrontend/.env.example` to `DayFlowFrontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8081
```

---

## 🚀 Running Locally (Without Docker)

### 1. Backend Setup (`DayFlow`)
- **Prerequisites**: JDK 21, PostgreSQL 14+, Maven 3.9+

```powershell
# Create database
createdb -U postgres dayflow

# Navigate to backend folder
cd DayFlow

# Run Spring Boot server
.\mvnw.cmd spring-boot:run
```

- Server runs at: `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`

### 2. Frontend Setup (`DayFlowFrontend`)
- **Prerequisites**: Node.js v18+ (Recommended v20+), npm v9+

```bash
# Navigate to frontend folder
cd DayFlowFrontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

- Application runs at: `http://localhost:5173`

---

## 📡 REST API Reference Summary

### Authentication (`/api/auth/*`)
- `POST /api/auth/register-admin` — Register new company & admin user.
- `POST /api/auth/verify-email` — Verify admin email using token.
- `POST /api/auth/login` — Authenticate user and receive JWT.
- `POST /api/auth/setup-password` — Set password using employee invitation token.
- `POST /api/auth/forgot-password` — Request password reset email.
- `POST /api/auth/reset-password` — Reset password using reset token.

### Employee Self-Service (`/api/*`)
- `GET /api/employees/me` | `PUT /api/employees/me` — Own profile management.
- `POST /api/attendance/check-in` | `POST /api/attendance/check-out` — Clock in/out.
- `GET /api/attendance/me` — Retrieve own attendance logs.
- `POST /api/leaves` | `GET /api/leaves/me` — Submit & track leave requests.
- `GET /api/salary/me` — View own salary breakdown.
- `GET /api/documents/me` | `GET /api/documents/{id}/download` — Document vault access.

### Admin Management (`/api/admin/*`)
- `POST /api/admin/employees` — Invite new employee.
- `GET /api/admin/employees` | `GET /api/admin/employees/{id}` — Employee directory.
- `PUT /api/admin/employees/{id}` | `PATCH /api/admin/employees/{id}/status` — Edit employee & toggle status.
- `GET /api/admin/attendance` — Organization-wide attendance ledger.
- `GET /api/admin/leaves` | `PUT /api/admin/leaves/{id}/approve` | `PUT /api/admin/leaves/{id}/reject` — Leave reviews.
- `GET /api/admin/salary/employee/{id}` | `POST /api/admin/salary/employee/{id}` — Manage salaries.
- `POST /api/admin/documents/employee/{id}` | `DELETE /api/admin/documents/{id}` — Document management.

---

## 🧪 Testing & Postman Collection

### Backend Automated Tests
```powershell
cd DayFlow
.\mvnw.cmd clean test
```

### Postman Collection
The project includes a pre-configured Postman test collection:
- Location: [`DayFlow/DayFlow_HRMS.postman_collection.json`](DayFlow/DayFlow_HRMS.postman_collection.json)
- Includes automated environment variable capture for JWT auth tokens, user IDs, and dynamic request parameters.

---

## 👥 Authors & License

Developed for the **TechTitans** team as part of the **NMIT x Odoo Hackathon**.
