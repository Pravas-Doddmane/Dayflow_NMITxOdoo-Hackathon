# 🌊 DayFlow HRMS

> **Human Resource Management System** — built by **TechTitans** for the NMITxOdoo Hackathon.

A full-stack HRMS with a Spring Boot REST API backend, a React + Vite frontend, and a PostgreSQL database — all orchestrated with Docker Compose so you can go from zero to running with **one command**.

---

## ✨ Features

| Module | Capabilities |
|--------|-------------|
| **Authentication** | JWT login, invitation flow, email verification, password reset |
| **Employee Management** | Create, list, view, update employees; account status control |
| **Attendance** | Check-in / check-out, daily history, admin overview |
| **Leave Management** | Apply, approve, reject leaves with business rules |
| **Salary** | Salary structures per employee, history, BigDecimal precision |
| **Documents** | Upload, view, delete employee documents |
| **Email Notifications** | Gmail SMTP — invitation, verification, and reset emails |

---

## 🏗️ Project Structure

```
Dayflow_NMITxOdoo-Hackathon/
│
├── docker-compose.yml          ← 🚀 Single-command launcher (root)
├── .env.example                ← Unified environment template
├── .gitignore
│
├── DayFlow/                    ← Spring Boot 4 Backend (Java 21)
│   ├── Dockerfile              ← Multi-stage Maven → JRE build
│   ├── docker-compose.yml      ← Backend-only compose (standalone use)
│   ├── .env.example
│   ├── pom.xml
│   ├── src/
│   │   └── main/java/com/techtitans/dayflow/
│   │       ├── auth/           ← Authentication module
│   │       ├── user/           ← User & role entities
│   │       ├── employee/       ← Employee management
│   │       ├── attendance/     ← Check-in / check-out
│   │       ├── leave/          ← Leave requests
│   │       ├── salary/         ← Salary structures
│   │       ├── document/       ← Document management
│   │       ├── notification/   ← Email service
│   │       ├── security/       ← JWT + Spring Security
│   │       └── config/         ← Security, OpenAPI, DataSeeder
│   └── DayFlow_HRMS.postman_collection.json
│
└── DayFlowFrontend/            ← React 19 + Vite + Tailwind CSS Frontend
    ├── Dockerfile              ← Multi-stage Node → Nginx build
    ├── nginx.conf              ← SPA routing + /api proxy
    ├── src/
    │   ├── pages/              ← Route-level page components
    │   ├── components/         ← Shared UI components
    │   ├── api/                ← Axios API layer
    │   ├── context/            ← React context / state
    │   └── utils/              ← Helpers & utilities
    └── vite.config.js
```

---

## 🚀 Quick Start — Single Command (Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose v2)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Pravas-Doddmane/Dayflow_NMITxOdoo-Hackathon.git
cd Dayflow_NMITxOdoo-Hackathon
```

### 2. Configure environment
```bash
# Copy the unified template
cp .env.example .env
```

Open `.env` and fill in **at minimum**:
| Variable | What to set |
|----------|-------------|
| `DB_PASSWORD` | Any strong password for PostgreSQL |
| `JWT_SECRET` | Run `openssl rand -base64 64` and paste the output |
| `MAIL_USERNAME` | Your Gmail address |
| `MAIL_PASSWORD` | A Gmail **App Password** (not your login password) |
| `ADMIN_EMAIL` | Login email for the first admin user |
| `ADMIN_PASSWORD` | Login password for the first admin user |

> **Get a Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords
> https://myaccount.google.com/apppasswords

### 3. Launch everything
```bash
docker compose up -d --build
```

That's it! 🎉 All three services start in the correct order.

### 4. Open the app

| Service | URL |
|---------|-----|
| **Frontend (App)** | http://localhost:5174 |
| **Backend API** | http://localhost:8081 |
| **Swagger UI / API Docs** | http://localhost:8081/swagger-ui.html |
| **PostgreSQL** (external) | `localhost:5433` |

---

## 🔧 Common Docker Commands

```bash
# Start all services (detached)
docker compose up -d --build

# View logs from all services
docker compose logs -f

# View logs from a specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Stop all services (containers removed, volumes preserved)
docker compose down

# Stop and DELETE all data (full reset)
docker compose down -v

# Restart a single service
docker compose restart backend

# Rebuild only the frontend after code changes
docker compose up -d --build frontend
```

---

## 🛠️ Tech Stack

### Backend (`DayFlow/`)
| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 4.1.1 |
| Security | Spring Security 7 + JWT (Nimbus JOSE) |
| Database | PostgreSQL 16 |
| ORM | Spring Data JPA / Hibernate |
| Migrations | Flyway |
| Build | Maven 3.9 |
| Email | Spring Boot Mail (Gmail SMTP) |
| API Docs | SpringDoc OpenAPI 2.x (Swagger UI) |
| Tests | JUnit 5 + Mockito (30 tests) |

### Frontend (`DayFlowFrontend/`)
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Server | Nginx 1.27 (production) |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Containerisation | Docker + Docker Compose v2 |
| Database | PostgreSQL 16 Alpine |
| Frontend Server | Nginx (Alpine) |

---

## 🔐 Authentication Flow

```
ADMIN LOGIN
    ↓
POST /api/auth/login  →  returns JWT
    ↓
POST /api/admin/employees  (creates user + employee)
    ↓
Invitation email sent to employee (token valid 48h)
    ↓
Employee: /setup-password?token=...
    ↓
POST /api/auth/setup-password
    ↓
Account: INVITED → ACTIVE
    ↓
POST /api/auth/login  (employee receives JWT)
```

**Default admin credentials (first run):**
- Email: value of `ADMIN_EMAIL` in your `.env`
- Password: value of `ADMIN_PASSWORD` in your `.env`

> ⚠️ **Change the admin password immediately after first login!**

---

## 🗄️ Database Schema

```
roles
  └── users (role_id FK)
        └── employees (user_id FK — 1:1)
              ├── auth_tokens     (user_id FK)
              ├── attendance      (employee_id FK)
              ├── leave_requests  (employee_id FK, reviewed_by FK → users)
              ├── salary_structures (employee_id FK)
              └── documents       (employee_id FK)
```

Flyway auto-runs all migrations (`V1` through `V9`) on first boot. Data is persisted in the `postgres_data` Docker volume.

---

## 📡 API Reference

### Public Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Login → JWT |
| `POST` | `/api/auth/setup-password` | Set password via invite token |
| `POST` | `/api/auth/verify-email` | Verify email address |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Reset password via token |

### Employee Endpoints (JWT required — `EMPLOYEE` role)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/employees/me` | Own profile |
| `PUT` | `/api/employees/me` | Update phone/address/picture |
| `POST` | `/api/attendance/check-in` | Check in |
| `POST` | `/api/attendance/check-out` | Check out |
| `GET` | `/api/attendance/me` | Own attendance history |
| `POST` | `/api/leaves` | Apply for leave |
| `GET` | `/api/leaves/me` | Own leave requests |
| `GET` | `/api/salary/me` | Own salary info |
| `GET` | `/api/documents/me` | Own documents |

### Admin Endpoints (JWT required — `ADMIN` role)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/employees` | Create employee |
| `GET` | `/api/admin/employees` | List all employees (paginated) |
| `GET` | `/api/admin/employees/{id}` | Get employee |
| `PUT` | `/api/admin/employees/{id}` | Update employee |
| `PATCH` | `/api/admin/employees/{id}/status` | Change account status |
| `GET` | `/api/admin/attendance` | All attendance records |
| `PUT` | `/api/admin/leaves/{id}/approve` | Approve leave |
| `PUT` | `/api/admin/leaves/{id}/reject` | Reject leave |
| `POST` | `/api/admin/salary/employee/{id}` | Create salary structure |
| `PUT` | `/api/admin/salary/{id}` | Update salary structure |
| `POST` | `/api/admin/documents/employee/{id}` | Upload document |
| `DELETE` | `/api/admin/documents/{id}` | Delete document |

> Full interactive docs available at **http://localhost:8081/swagger-ui.html** after launch.

---

## 📮 Postman Collection

Import `DayFlow/DayFlow_HRMS.postman_collection.json` into Postman for a ready-to-use collection covering all 7 modules. Tokens are auto-captured from login responses.

---

## 🧑‍💻 Local Development (Without Docker)

### Backend
**Prerequisites:** Java 21, PostgreSQL 14+, Maven 3.9+

```powershell
cd DayFlow
cp .env.example .env        # fill in values

# Set env vars (PowerShell example)
$env:DB_URL = "jdbc:postgresql://localhost:5432/dayflow"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "yourpassword"
$env:JWT_SECRET = "your-256-bit-secret"
$env:ADMIN_EMAIL = "admin@dayflow.local"
$env:ADMIN_PASSWORD = "AdminPass@2024"

# Run
.\mvnw.cmd spring-boot:run
# → API at http://localhost:8080
# → Swagger at http://localhost:8080/swagger-ui.html
```

### Frontend
**Prerequisites:** Node.js 18+

```bash
cd DayFlowFrontend
cp .env.example .env        # set VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
# → App at http://localhost:5173
```

---

## 🧪 Running Tests

```powershell
cd DayFlow
.\mvnw.cmd clean test
```

**30 tests — all passing:**
- AuthService: 11 tests
- AttendanceService: 5 tests
- EmployeeService: 4 tests
- LeaveService: 6 tests
- SalaryService: 3 tests
- ApplicationTest: 1 test

---

## 🚢 Production Deployment Notes

1. **Generate a strong JWT secret:**
   ```bash
   openssl rand -base64 64
   ```

2. **Use strong passwords** for `DB_PASSWORD` and `ADMIN_PASSWORD`.

3. **Email:** Gmail App Passwords are sufficient for small-scale use. For production volume, consider SendGrid / AWS SES.

4. **HTTPS:** Place a reverse proxy (Nginx/Traefik/Caddy) in front with a TLS certificate (Let's Encrypt).

5. **Ports:** In production, close `8081` (backend) and `5433` (postgres) to the public. Only expose port `80`/`443` (frontend + proxy).

6. **Backups:** The `postgres_data` volume contains all data. Back it up regularly:
   ```bash
   docker exec dayflow-postgres pg_dump -U postgres dayflow > backup.sql
   ```

---

## 🤝 Team

**TechTitans** — NMITxOdoo Hackathon 2026

---

## 📄 License

This project was built for hackathon purposes. All rights reserved by the TechTitans team.
