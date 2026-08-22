# DayFlow HRMS — Human Resource Management System

A production-quality Spring Boot backend for a full-featured HRMS, built for the **TechTitans** team.

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 4.1.1 |
| Security | Spring Security 7 + JWT (Nimbus) |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Migrations | Flyway |
| Build | Maven |
| Email | Spring Boot Mail (Gmail SMTP) |
| API Docs | SpringDoc OpenAPI 2.x (Swagger UI) |
| Testing | JUnit 5 + Mockito |

---

## 🏗️ Architecture

```
com.techtitans.dayflow
│
├── DayFlowApplication.java      # Entry point
├── config/                      # Spring configuration
│   ├── SecurityConfig.java      # Spring Security 7 config
│   ├── OpenApiConfig.java       # Swagger UI config
│   └── DataSeeder.java          # Initial admin seed
│
├── security/                    # JWT + UserDetails
│   ├── JwtService.java          # Nimbus JOSE JWT
│   ├── JwtAuthenticationFilter.java
│   ├── CustomUserDetailsService.java
│   └── SecurityUser.java
│
├── auth/                        # Authentication module
├── user/                        # User + Role entities
├── employee/                    # Employee management
├── attendance/                  # Check-in/out
├── leave/                       # Leave requests
├── salary/                      # Salary structures
├── document/                    # Document management
├── notification/                # Email service
└── common/                      # Enums, exceptions, DTOs
```

---

## 🗄️ Database Design

```
roles
  └── users (role_id FK)
        └── employees (user_id FK, 1:1)
              ├── auth_tokens (user_id FK)
              ├── attendance (employee_id FK)
              ├── leave_requests (employee_id FK, reviewed_by FK → users)
              ├── salary_structures (employee_id FK)
              └── documents (employee_id FK)
```

**Key constraints:**
- `users.email` — UNIQUE, NOT NULL
- `employees.employee_code` — UNIQUE, NOT NULL
- `employees.user_id` — UNIQUE (1:1 relationship)
- `attendance(employee_id, attendance_date)` — UNIQUE (one record per day)
- `auth_tokens.token_hash` — UNIQUE, hashed with SHA-256

---

## 🔐 Authentication Flow

### JWT Structure
```json
{
  "sub": "1",          // userId
  "userId": 1,
  "role": "EMPLOYEE",
  "employeeId": 5,
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Employee Onboarding Flow
```
ADMIN LOGIN
    ↓
POST /api/admin/employees  (creates user + employee record)
    ↓
Invitation email sent (token valid 48h)
    ↓
Employee clicks: /setup-password?token=...
    ↓
POST /api/auth/setup-password
    ↓
Account status: INVITED → ACTIVE
    ↓
POST /api/auth/login  (returns JWT)
```

### Token Security
- Tokens generated with `SecureRandom` (256-bit)
- Stored as **SHA-256 hashes** — raw token only in email
- Single-use (marked `used_at` after consumption)
- Configurable expiry per type

---

## 📧 Email Setup

Uses Gmail SMTP with App Passwords.

### Get a Gmail App Password
1. Enable 2-Step Verification on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Create an App Password for "Mail"
4. Use this password as `MAIL_PASSWORD`

---

## ⚙️ Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/dayflow` |
| `DB_USERNAME` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `yourpassword` |
| `JWT_SECRET` | JWT signing key (256-bit min) | `openssl rand -base64 64` |
| `JWT_EXPIRATION_MS` | Token expiry in ms | `86400000` (24h) |
| `MAIL_USERNAME` | Gmail address | `yourname@gmail.com` |
| `MAIL_PASSWORD` | Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `APP_BASE_URL` | Base URL for email links | `http://localhost:5173` |
| `ADMIN_EMAIL` | Initial admin email | `admin@dayflow.local` |
| `ADMIN_PASSWORD` | Initial admin password | `AdminPass@2024` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins | `http://localhost:5173` |

---

## 🐘 PostgreSQL Setup

```sql
-- Create database
CREATE DATABASE dayflow;

-- Create user (optional)
CREATE USER dayflow_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dayflow TO dayflow_user;
```

---

## 🐳 Running with Docker (Recommended)

Run the entire system (PostgreSQL 16 + DayFlow Spring Boot backend) in one command:

```bash
# 1. Start containers
docker compose up -d --build

# 2. View backend logs
docker compose logs -f backend

# 3. Stop containers
docker compose down
```

**Access URLs:**
- Backend API: `http://localhost:8081` (or `8080` if overridden)
- Swagger UI / OpenAPI Docs: `http://localhost:8081/swagger-ui.html`
- PostgreSQL (external port): `localhost:5433` (`postgres` / `1234` / db: `dayflow`)

---

## 📮 Postman API Testing

Import the included `DayFlow_HRMS.postman_collection.json` directly into Postman:

1. Open **Postman** -> Click **Import** -> Select `DayFlow_HRMS.postman_collection.json`.
2. The collection has pre-configured environment variables:
   - `base_url`: `http://localhost:8081` (Docker) or `http://localhost:8080` (Local)
   - `admin_token`: Automatically captured when running **Admin Login**.
   - `employee_token`: Automatically captured when running **Employee Login**.
   - `created_employee_id`: Automatically captured on employee creation.
3. Test all endpoints across the 7 modules:
   - 1. **Authentication** (Admin Login, Setup Password, Forgot/Reset Password)
   - 2. **Admin - Employee Management** (Create, List, View, Update, Status)
   - 3. **Employee Profile** (View profile, Update contact info)
   - 4. **Attendance Management** (Check-in, Check-out, History)
   - 5. **Leave Management** (Apply, View, Admin Approve/Reject)
   - 6. **Salary Management** (Create structure, View salary history)
   - 7. **Document Management** (Upload documents, View, Delete)

---

## 🚀 Running Locally (Without Docker)

### Prerequisites
- Java 21 (`jdk-21.0.8.9-hotspot`)
- PostgreSQL 14+
- Maven 3.9+ (or use included `mvnw`)

### Steps

1. **Configure environment in `.env`**
   ```bash
   cp .env.example .env
   ```

2. **Set environment variables (PowerShell)**
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
   $env:DB_URL = "jdbc:postgresql://localhost:5432/dayflow"
   $env:DB_USERNAME = "postgres"
   $env:DB_PASSWORD = "1234"
   $env:JWT_SECRET = "/cfnKLQlry52dsdUbQKThBWjkLhx1Jxun8DxV+bFrZM="
   $env:ADMIN_EMAIL = "admin@dayflow.local"
   $env:ADMIN_PASSWORD = "AdminPass@2024"
   ```

3. **Run**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

4. **Access**
   - API: `http://localhost:8080`
   - Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## 🌱 Flyway Migrations

Flyway runs automatically on startup. Migrations are in:
```
src/main/resources/db/migration/
├── V1__create_roles.sql
├── V2__create_users.sql
├── V3__create_employees.sql
├── V4__create_auth_tokens.sql
├── V5__create_attendance.sql
├── V6__create_leave_requests.sql
├── V7__create_salary_structures.sql
├── V8__create_documents.sql
└── V9__seed_roles.sql
```

The initial ADMIN is created by `DataSeeder` (ApplicationRunner) using `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars.

---

## 📡 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/setup-password` | Set password via invitation token |
| POST | `/api/auth/verify-email?token=...` | Verify email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password via token |

### Employee (EMPLOYEE role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees/me` | Own profile |
| PUT | `/api/employees/me` | Update phone/address/picture |
| POST | `/api/attendance/check-in` | Check in |
| POST | `/api/attendance/check-out` | Check out |
| GET | `/api/attendance/me` | Own attendance |
| POST | `/api/leaves` | Apply for leave |
| GET | `/api/leaves/me` | Own leave requests |
| GET | `/api/salary/me` | Own salary (read-only) |
| GET | `/api/documents/me` | Own documents |

### Admin (ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/employees` | Create employee |
| GET | `/api/admin/employees` | List employees (paginated) |
| GET | `/api/admin/employees/{id}` | Get employee |
| PUT | `/api/admin/employees/{id}` | Update employee |
| PATCH | `/api/admin/employees/{id}/status` | Change account status |
| GET | `/api/admin/attendance` | All attendance (paginated) |
| GET | `/api/admin/attendance/employee/{id}` | Employee attendance |
| GET | `/api/admin/leaves` | All leave requests |
| PUT | `/api/admin/leaves/{id}/approve` | Approve leave |
| PUT | `/api/admin/leaves/{id}/reject` | Reject leave |
| GET | `/api/admin/salary/employee/{id}` | Employee salary history |
| POST | `/api/admin/salary/employee/{id}` | Create salary structure |
| PUT | `/api/admin/salary/{id}` | Update salary structure |
| GET | `/api/admin/documents/employee/{id}` | Employee documents |
| POST | `/api/admin/documents/employee/{id}` | Upload document |
| DELETE | `/api/admin/documents/{id}` | Delete document |

---

## 🧪 Testing with cURL/Postman

### 1. Login as Admin
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dayflow.local","password":"AdminPass@2024"}'
```

Response:
```json
{
  "token": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "userId": 1,
  "employeeId": null,
  "role": "ADMIN",
  "email": "admin@dayflow.local"
}
```

### 2. Create Employee (Admin)
```bash
curl -X POST http://localhost:8080/api/admin/employees \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeCode": "EMP001",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    "designation": "Software Engineer",
    "department": "Engineering",
    "joiningDate": "2026-08-22"
  }'
```

### 3. Setup Password (Employee)
```bash
# Token is from the invitation email
curl -X POST http://localhost:8080/api/auth/setup-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<token-from-email>",
    "newPassword": "SecurePass@123",
    "confirmPassword": "SecurePass@123"
  }'
```

### 4. Check In (Employee)
```bash
curl -X POST http://localhost:8080/api/attendance/check-in \
  -H "Authorization: Bearer <employee-token>"
```

### 5. Apply for Leave (Employee)
```bash
curl -X POST http://localhost:8080/api/leaves \
  -H "Authorization: Bearer <employee-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "PAID",
    "startDate": "2026-09-01",
    "endDate": "2026-09-05",
    "remarks": "Annual vacation"
  }'
```

---

## 🧪 Running Tests

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
.\mvnw.cmd clean test
```

**Test coverage:**
- ✅ AuthService: 11 tests (login, setup-password, verify-email, forgot-password, reset-password)
- ✅ AttendanceService: 5 tests (check-in, check-out, duplicates, ordering)
- ✅ EmployeeService: 4 tests (create, duplicates, not-found)
- ✅ LeaveService: 6 tests (apply, approve, reject, business rules)
- ✅ SalaryService: 3 tests (create, view, validation)
- ✅ ApplicationTest: 1 test

**Total: 30 tests, all passing**

---

## 🏗️ Build

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
.\mvnw.cmd clean package -DskipTests
```

JAR produced at: `target/DayFlow-0.0.1-SNAPSHOT.jar`

---

## ⚠️ Important Notes

1. **JAVA_HOME**: Must point to Java 21. If `JAVA_HOME` points to JDK 17, set it before running Maven.
2. **First login**: Change the admin password immediately after first login.
3. **Email**: Gmail requires App Passwords, not your regular Gmail password.
4. **Tokens**: Password setup tokens expire in 48h, reset tokens in 1h.
5. **Salary**: Always stored as `BigDecimal` — never use `double/float` for money.
