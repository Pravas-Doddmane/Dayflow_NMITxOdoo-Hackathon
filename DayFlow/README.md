# DayFlow HRMS — Human Resource Management System

A production-quality Spring Boot backend for **DayFlow HRMS**, a full-featured Human Resource Management System built for the **TechTitans** team.

DayFlow offers enterprise-grade employee management, multi-company/tenant profile support, automated email workflows, token-based self-onboarding, real-time attendance tracking, leave lifecycle processing, payroll management, and secure document vaults.

---

## 📋 Tech Stack

| Layer / Concern | Technology | Description |
|---|---|---|
| **Language** | Java 21 | Modern LTS Java runtime |
| **Framework** | Spring Boot 4.1.1 | Enterprise application framework |
| **Security** | Spring Security 7 + OAuth2 Resource Server | Stateless authentication & role-based authorization |
| **JWT Engine** | Nimbus JOSE + JWT | Cryptographically signed HMAC-SHA256 tokens |
| **Database** | PostgreSQL 14+ | Relational data store |
| **ORM / Data Access** | Spring Data JPA / Hibernate | Object-relational mapping & repository abstractions |
| **Database Migrations** | Flyway Core + PostgreSQL | Version-controlled, deterministic database schema |
| **Build & Dependency Tool** | Apache Maven 3.9+ (with Maven Wrapper `mvnw`) | Project build and lifecycle management |
| **Email Service** | Spring Boot Starter Mail | Transactional email notifications via SMTP (Gmail) |
| **API Documentation** | SpringDoc OpenAPI 2.8.9 (Swagger UI) | Interactive REST API explorer and schema docs |
| **Testing** | JUnit 5 + Mockito + H2 In-Memory DB | Comprehensive unit & integration testing |

---

## 🏗️ Architecture & Package Structure

```
com.techtitans.dayflow
│
├── DayFlowApplication.java          # Spring Boot main entry point
│
├── config/                          # Application & Security configuration
│   ├── SecurityConfig.java          # Spring Security 7 filter chain & CORS config
│   ├── OpenApiConfig.java           # Swagger / OpenAPI documentation configuration
│   └── DataSeeder.java              # Initial system admin seeder (ApplicationRunner)
│
├── security/                        # Security infrastructure
│   ├── JwtService.java              # Nimbus JOSE JWT generation, signing & extraction
│   ├── JwtAuthenticationFilter.java # Bearer token extraction & SecurityContext setup
│   ├── CustomUserDetailsService.java# User lookup by email/company
│   └── SecurityUser.java            # Spring Security UserDetails adapter
│
├── auth/                            # Authentication & Onboarding module
│   ├── controller/                  # Public auth & onboarding REST endpoints
│   ├── dto/                         # Login, Registration, Password setup/reset DTOs
│   ├── entity/                      # AuthToken entity (invitations, email verify, password reset)
│   ├── repository/                  # AuthTokenRepository
│   └── service/                     # AuthService (token hashing, email dispatch, credential verify)
│
├── company/                         # Company & Organization Profile module
│   ├── controller/                  # Company profile REST endpoints
│   ├── dto/                         # Company profile request/response DTOs
│   ├── entity/                      # Company entity
│   ├── repository/                  # CompanyRepository
│   └── service/                     # CompanyService
│
├── user/                            # User & Role module
│   ├── entity/                      # User & Role entities
│   └── repository/                  # UserRepository & RoleRepository
│
├── employee/                        # Employee management & Profile module
│   ├── controller/                  # AdminEmployeeController & EmployeeProfileController
│   ├── dto/                         # Employee creation, update & profile DTOs
│   ├── entity/                      # Employee entity (personal, job & contact info)
│   ├── repository/                  # EmployeeRepository
│   └── service/                     # EmployeeService
│
├── attendance/                      # Attendance tracking module
│   ├── controller/                  # AttendanceController (Check-in, check-out, history)
│   ├── dto/                         # Attendance DTOs & response mappings
│   ├── entity/                      # Attendance entity
│   ├── repository/                  # AttendanceRepository
│   └── service/                     # AttendanceService
│
├── leave/                           # Leave management module
│   ├── controller/                  # LeaveController (Apply, review, approve/reject)
│   ├── dto/                         # LeaveRequestDto, LeaveResponse, LeaveReviewRequest
│   ├── entity/                      # LeaveRequest entity
│   ├── repository/                  # LeaveService & LeaveRequestRepository
│   └── service/                     # LeaveService
│
├── salary/                          # Payroll & Compensation module
│   ├── controller/                  # SalaryController
│   ├── dto/                         # SalaryRequest & SalaryResponse DTOs
│   ├── entity/                      # SalaryStructure entity
│   ├── repository/                  # SalaryStructureRepository
│   └── service/                     # SalaryService
│
├── document/                        # Document vault & file storage module
│   ├── controller/                  # DocumentController (Upload, list, download, delete)
│   ├── dto/                         # DocumentResponse DTO
│   ├── entity/                      # Document entity
│   ├── repository/                  # DocumentRepository
│   └── service/                     # DocumentService & file storage engine
│
├── notification/                    # Email notification module
│   └── service/                     # EmailService (invitation emails, reset emails, templates)
│
└── common/                          # Cross-cutting concerns & shared utilities
    ├── enums/                       # AccountStatus, AttendanceStatus, LeaveType, LeaveStatus, etc.
    ├── exception/                   # Custom exceptions (ResourceNotFound, Conflict, Unauthorized, etc.)
    └── handler/                     # GlobalExceptionHandler (@ControllerAdvice)
```

---

## 🗄️ Database Schema & Relationships

```
companies
  └── users (company_id FK, role_id FK)
        └── employees (user_id FK, 1:1)
              ├── auth_tokens (user_id FK)
              ├── attendance (employee_id FK)
              ├── leave_requests (employee_id FK, reviewed_by FK → users)
              ├── salary_structures (employee_id FK)
              └── documents (employee_id FK)
```

### Key Database Constraints:
- **`companies.name`** / **`companies.company_code`** — Identified company profile.
- **`users(email, company_id)`** — Unique email scoped per company.
- **`employees.employee_code`** — Unique employee identifier within the organization.
- **`employees.user_id`** — Unique 1:1 relationship between User account and Employee profile.
- **`attendance(employee_id, attendance_date)`** — Composite Unique constraint (maximum 1 attendance record per employee per calendar date).
- **`auth_tokens.token_hash`** — Cryptographically hashed token with SHA-256 (unique, single-use, time-bound).

---

## 🌱 Flyway Migrations

Database schema versioning is managed automatically via Flyway located in `src/main/resources/db/migration/`:

| Version | Migration Script | Description |
|---|---|---|
| `V1` | `V1__create_roles.sql` | Creates the `roles` lookup table (`ADMIN`, `EMPLOYEE`). |
| `V2` | `V2__create_users.sql` | Creates the `users` credentials table. |
| `V3` | `V3__create_employees.sql` | Creates the `employees` master profile table. |
| `V4` | `V4__create_auth_tokens.sql` | Creates `auth_tokens` for invitations, password resets, and verification. |
| `V5` | `V5__create_attendance.sql` | Creates `attendance` ledger table. |
| `V6` | `V6__create_leave_requests.sql` | Creates `leave_requests` table with review metadata. |
| `V7` | `V7__create_salary_structures.sql` | Creates `salary_structures` table for compensation management. |
| `V8` | `V8__create_documents.sql` | Creates `documents` metadata table for uploaded employee files. |
| `V9` | `V9__seed_roles.sql` | Seeds initial `ADMIN` and `EMPLOYEE` role records. |
| `V10` | `V10__create_companies.sql` | Creates `companies` table for organization-level profiles. |
| `V11` | `V11__allow_same_email_multiple_companies.sql` | Adds `company_id` foreign key to `users` and adjusts scoping. |
| `V12` | `V12__drop_old_unique_email_constraints.sql` | Drops legacy global unique email constraint in favor of per-company unique index. |

---

## 🔐 Authentication & Onboarding Lifecycle

### 1. Admin & Company Self-Registration Flow
```
POST /api/auth/register-admin (Company info + Admin credentials)
    ↓
Company & Admin User record created in PENDING verification state
    ↓
Verification email dispatched with secure token (valid 24h)
    ↓
Admin clicks email link: /verify-email?token=...
    ↓
POST /api/auth/verify-email → Account status becomes ACTIVE
```

### 2. Employee Invitation Flow
```
ADMIN LOGIN (JWT with ADMIN role)
    ↓
POST /api/admin/employees (Admin specifies employee name, email, designation, department)
    ↓
User created (status: INVITED) + Employee profile initialized
    ↓
Invitation email sent with single-use setup token (valid 48h)
    ↓
Employee clicks: /setup-password?token=...
    ↓
POST /api/auth/setup-password (Sets new password)
    ↓
Account status transitions: INVITED → ACTIVE
    ↓
POST /api/auth/login → Returns JWT token
```

### 3. JWT Payload Structure
```json
{
  "sub": "1",
  "userId": 1,
  "role": "EMPLOYEE",
  "employeeId": 5,
  "iat": 1740220000,
  "exp": 1740306400
}
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `DayFlow` root directory from `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example Value |
|---|---|---|
| `DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/dayflow` |
| `DB_USERNAME` | PostgreSQL database user | `postgres` |
| `DB_PASSWORD` | PostgreSQL database password | `1234` |
| `JWT_SECRET` | 256-bit min Base64 HMAC secret key | `/cfnKLQlry52dsdUbQKThBWjkLhx1Jxun8DxV+bFrZM=` |
| `JWT_EXPIRATION_MS` | JWT validity duration (milliseconds) | `86400000` (24 hours) |
| `MAIL_USERNAME` | SMTP Gmail address | `your-email@gmail.com` |
| `MAIL_PASSWORD` | SMTP Gmail App Password (16 characters) | `xxxx xxxx xxxx xxxx` |
| `APP_BASE_URL` | Frontend URL for email verification/setup links | `http://localhost:5173` |
| `ADMIN_EMAIL` | Default seeded admin email | `admin@dayflow.local` |
| `ADMIN_PASSWORD` | Default seeded admin password | `AdminPass@2024` |
| `UPLOAD_DIR` | Directory where employee files are saved | `./uploads` |
| `TOKEN_SETUP_EXPIRY_HOURS` | Expiration for employee invitation token | `48` |
| `TOKEN_RESET_EXPIRY_HOURS` | Expiration for password reset token | `1` |
| `TOKEN_EMAIL_VERIFY_EXPIRY_HOURS`| Expiration for admin email verification token | `24` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173,http://localhost:3000` |

---

## 🐳 Running with Docker (Recommended)

You can launch both the PostgreSQL 16 database and the DayFlow Spring Boot application using Docker Compose:

```bash
# 1. Build and start containers in detached mode
docker compose up -d --build

# 2. Inspect application logs
docker compose logs -f backend

# 3. Stop containers and networks
docker compose down
```

**Service Endpoints:**
- **Backend API**: `http://localhost:8081`
- **Swagger UI API Docs**: `http://localhost:8081/swagger-ui.html`
- **PostgreSQL Database**: `localhost:5433` (User: `postgres` / Password: `1234` / DB: `dayflow`)

---

## 🚀 Running Locally (Without Docker)

### Prerequisites
- **Java**: JDK 21 (e.g. Eclipse Adoptium OpenJDK 21)
- **PostgreSQL**: PostgreSQL 14 or higher running on port `5432`
- **Maven**: 3.9+ (or use the included `./mvnw` / `mvnw.cmd` wrapper)

### Step-by-Step Setup

1. **Create the PostgreSQL Database:**
   ```sql
   CREATE DATABASE dayflow;
   ```

2. **Configure Environment Variables (PowerShell example):**
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
   $env:DB_URL = "jdbc:postgresql://localhost:5432/dayflow"
   $env:DB_USERNAME = "postgres"
   $env:DB_PASSWORD = "1234"
   $env:JWT_SECRET = "/cfnKLQlry52dsdUbQKThBWjkLhx1Jxun8DxV+bFrZM="
   $env:MAIL_USERNAME = "your-email@gmail.com"
   $env:MAIL_PASSWORD = "your-gmail-app-password"
   $env:ADMIN_EMAIL = "admin@dayflow.local"
   $env:ADMIN_PASSWORD = "AdminPass@2024"
   ```

3. **Start the Spring Boot Server:**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   *(On Linux/macOS: `./mvnw spring-boot:run`)*

4. **Verify Application Startup:**
   - Server runs on: `http://localhost:8081`
   - Interactive Swagger Docs: `http://localhost:8081/swagger-ui.html`
   - OpenAPI Schema JSON: `http://localhost:8081/api-docs`

---

## 📡 Complete REST API Reference

### 1. Authentication Endpoints (Public)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register-admin` | Register a new company and admin account (sends verification email). |
| `POST` | `/api/auth/verify-email?token=...` | Verify email address using token. |
| `POST` | `/api/auth/login` | Authenticate with email and password; returns JWT token. |
| `POST` | `/api/auth/setup-password` | Set initial password using invitation token from email. |
| `POST` | `/api/auth/forgot-password` | Request a password reset link. |
| `POST` | `/api/auth/reset-password` | Reset password using the reset token. |

### 2. Company Profile Endpoints
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/company/profile` | `ADMIN`, `EMPLOYEE` | Get company profile details (name, code, address, policy). |
| `PUT` | `/api/admin/company/profile` | `ADMIN` | Update company information, address, and branding. |

### 3. Employee Self-Service Endpoints (`EMPLOYEE` Role)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/employees/me` | Retrieve own employee profile. |
| `PUT` | `/api/employees/me` | Update personal contact info (phone, address, avatar). |
| `POST` | `/api/attendance/check-in` | Clock in for the current working day. |
| `POST` | `/api/attendance/check-out` | Clock out for the current working day. |
| `GET` | `/api/attendance/me` | Retrieve own attendance history (optional `from` and `to` date filters). |
| `POST` | `/api/leaves` | Submit a new leave request (`PAID`, `SICK`, `UNPAID`). |
| `GET` | `/api/leaves/me` | List all personal leave requests and approval statuses. |
| `GET` | `/api/salary/me` | View own salary structure and compensation breakdown. |
| `GET` | `/api/documents/me` | List all personal uploaded documents. |
| `GET` | `/api/documents/{documentId}/download`| Download document file (`PDF`, `PNG`, `JPEG`, etc.). |

### 4. Admin Management Endpoints (`ADMIN` Role)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/employees` | Create employee record and dispatch invitation email. |
| `GET` | `/api/admin/employees` | Get paginated list of all organization employees. |
| `GET` | `/api/admin/employees/{id}` | Get complete profile of an employee by ID. |
| `PUT` | `/api/admin/employees/{id}` | Update employee job, department, designation, or personal info. |
| `PATCH`| `/api/admin/employees/{id}/status` | Toggle employee account status (`ACTIVE` / `DISABLED`). |
| `GET` | `/api/admin/attendance` | View organization-wide attendance records (paginated, date filters). |
| `GET` | `/api/admin/attendance/employee/{employeeId}` | View attendance history for a specific employee. |
| `GET` | `/api/admin/leaves` | List all leave requests across the company (filterable by `status`). |
| `PUT` | `/api/admin/leaves/{id}/approve` | Approve an employee leave request with optional review notes. |
| `PUT` | `/api/admin/leaves/{id}/reject` | Reject an employee leave request with review reason. |
| `GET` | `/api/admin/salary/employee/{employeeId}` | Get salary structure history for an employee. |
| `POST` | `/api/admin/salary/employee/{employeeId}` | Create new salary structure for an employee. |
| `PUT` | `/api/admin/salary/{salaryId}` | Update an existing salary structure. |
| `POST` | `/api/admin/documents/employee/{employeeId}` | Upload a document for an employee (Multipart `file` + `documentType`). |
| `GET` | `/api/admin/documents/employee/{employeeId}` | List all documents belonging to an employee. |
| `DELETE`| `/api/admin/documents/{documentId}` | Delete an uploaded document. |

---

## 🧪 Testing & Quality Assurance

### Run Automated Unit & Integration Tests:
```powershell
.\mvnw.cmd clean test
```

**Test Coverage Summary:**
- **`AuthServiceTest`**: Login validation, account statuses, password setup, email verification, password resets.
- **`EmployeeServiceTest`**: Employee creation, duplicate prevention, updates, profile lookup.
- **`AttendanceServiceTest`**: Daily check-in/out logic, duplicate check-in prevention, duration calculation.
- **`LeaveServiceTest`**: Application validation, date range verification, admin approval and rejection workflows.
- **`SalaryServiceTest`**: Compensation calculation, BigDecimal precision, structure updates.
- **`ApplicationTest`**: Spring ApplicationContext load tests with H2 in-memory DB.

---

## 📮 Postman Collection

The project includes a ready-to-use Postman test suite: [`DayFlow_HRMS.postman_collection.json`](DayFlow_HRMS.postman_collection.json).

1. Open **Postman** -> Click **Import** -> Select `DayFlow_HRMS.postman_collection.json`.
2. The collection includes pre-configured collection variables:
   - `base_url`: `http://localhost:8081` (or your local port)
   - `admin_token`: Automatically captured upon running **Admin Login**.
   - `employee_token`: Automatically captured upon running **Employee Login**.
   - `created_employee_id`: Automatically populated when creating a new employee.

---

## 📦 Building for Production

To create a standalone production JAR executable:

```powershell
.\mvnw.cmd clean package -DskipTests
```

The resulting executable JAR will be located at:
```
target/DayFlow-0.0.1-SNAPSHOT.jar
```

Run the production JAR:
```bash
java -jar target/DayFlow-0.0.1-SNAPSHOT.jar
```

---

## 👥 Frontend Integration

For the accompanying user interface, refer to the [DayFlow Frontend React Application](../DayFlowFrontend/README.md).
