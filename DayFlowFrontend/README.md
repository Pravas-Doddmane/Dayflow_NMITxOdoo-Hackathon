# DayFlow Frontend — Human Resource Management System (HRMS)

A modern, responsive, and feature-rich Single Page Application (SPA) frontend for **DayFlow HRMS**, built with **React 19**, **Vite**, and **Tailwind CSS v4**.

Designed for modern organizations, DayFlow provides intuitive portals for both **Administrators / HR Managers** and **Employees**, featuring real-time clock-in/out, leave lifecycle tracking, payroll visualization, secure document management, interactive calendars, and full dark/light theme support.

---

## 📋 Tech Stack

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

## ✨ Features & Portals

### 🔐 1. Authentication & Onboarding
- **Admin & Company Registration**: Self-service onboarding for new companies and company admins.
- **Email Verification**: Link-based account verification for secure administrative sign-ups.
- **Employee Invitation & Password Setup**: Token-based password onboarding for invited staff members.
- **Secure Login**: JWT-based authentication with auto-redirects based on user role (`ADMIN` vs `EMPLOYEE`).
- **Forgot & Reset Password**: Secure tokenized password recovery flows.
- **Session Auto-Expiry Handling**: Automatic token cleanup and redirection on session expiration (401).

### 🛠️ 2. Administrator Portal (`/admin/*`)
- **Executive Dashboard**: Real-time KPI statistics (total employees, active today, on leave, pending requests) with quick navigation shortcuts.
- **Employee Management Directory**:
  - Filterable, searchable, and paginated employee list.
  - Multi-tab detailed employee view: Personal info, Job details, Contact info, Attendance logs, Leave history, Salary structure, and Uploaded documents.
  - Add new employees with instant email invitation generation.
  - Edit employee records and toggle account status (`ACTIVE` / `DISABLED`).
- **Attendance Management**: Organization-wide attendance ledger with date-range filters, employee search, and status tracking (`PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`).
- **Leave Approval Workflow**: Review employee leave applications, approve or reject with custom administrative remarks.
- **Payroll & Salary Configuration**: Manage employee salary structures (Basic, HRA, Allowances, Deductions) and view compensation histories.
- **Company & Admin Profile**: Configure company name, business email, contact details, work policy, and organizational profile.

### 👤 3. Employee Self-Service Portal (`/employee/*`)
- **Employee Dashboard**:
  - One-click **Clock In** / **Clock Out** interactive attendance widget with live working hours timer.
  - Quick overview of personal leave balance, upcoming company holidays, and recent attendance.
- **Personal Profile (`/employee/profile`)**:
  - View official job details, designation, department, and joining date.
  - Update personal contact details, residential address, emergency contact, and profile avatar.
- **Attendance History (`/employee/attendance`)**: Complete chronological attendance log with monthly summaries, hours worked, and check-in/out timestamps.
- **Leave Management Portal (`/employee/leaves`)**:
  - Apply for leaves (`PAID`, `SICK`, `UNPAID`) with start/end date calculators and reason notes.
  - Track leave request statuses (`PENDING`, `APPROVED`, `REJECTED`) and reviewer feedback.
- **My Salary (`/employee/salary`)**: Transparent breakdown of monthly gross salary, allowances, deductions, and net salary.
- **Document Vault (`/employee/documents`)**: Secure repository for personal documents (Offer Letters, Contracts, ID proofs, Certificates) with direct download capabilities.
- **Interactive Calendar (`/employee/calendar`)**: Month/Year view combining personal attendance history, approved leaves, and gazetted national/public holidays.
- **Company Info Directory (`/employee/company`)**: View company details, organization values, office address, and contact information.

### 🎨 4. Design & UI/UX Highlights
- **Universal Dark/Light Theme**: Seamless theme toggler with persistence in `localStorage` and system preference detection.
- **Toast Notification System**: Lightweight contextual alert notifications for success, warning, error, and info states.
- **Responsive Layout**: Collapsible dynamic sidebar, mobile navigation header, and responsive data tables.
- **Modal Dialogs & Confirmation Prompts**: Accessible modals for destructive actions, employee creation, leave requests, and document viewing.

---

## 🏗️ Project Architecture

```
DayFlowFrontend/
├── public/                     # Static assets (favicons, logos)
├── src/
│   ├── api/                    # Axios API service modules
│   │   ├── axios.js            # Axios client instance with JWT & 401 interceptors
│   │   ├── authApi.js          # Auth endpoints (login, register, reset, verify)
│   │   ├── employeeApi.js      # Admin & Employee profile APIs
│   │   ├── attendanceApi.js    # Check-in, check-out, attendance logs
│   │   ├── leaveApi.js         # Leave requests and approvals
│   │   ├── salaryApi.js        # Salary structure management
│   │   ├── documentApi.js      # File uploads & document downloads
│   │   └── companyApi.js       # Company profile management
│   │
│   ├── components/
│   │   ├── common/             # Reusable UI components
│   │   │   ├── ConfirmDialog.jsx   # Action confirmation modal
│   │   │   ├── EmptyState.jsx      # Placeholder for empty data lists
│   │   │   ├── Modal.jsx           # Generic accessible modal container
│   │   │   ├── Navbar.jsx          # Header with user menu & theme toggle
│   │   │   ├── Pagination.jsx      # Reusable pagination controls
│   │   │   ├── ProtectedRoute.jsx  # Role-based route guard
│   │   │   ├── Sidebar.jsx         # Navigation sidebar (Admin/Employee links)
│   │   │   ├── StatCard.jsx        # Dashboard KPI stat card
│   │   │   └── StatusBadge.jsx     # Visual pill badges for statuses
│   │   └── layout/
│   │       ├── AuthLayout.jsx      # Minimal layout for login/register pages
│   │       └── DashboardLayout.jsx # Main app shell (Navbar + Sidebar + Content)
│   │
│   ├── context/                # React Context Providers
│   │   ├── AuthContext.jsx     # User authentication state & token handling
│   │   ├── ThemeContext.jsx    # Dark/Light theme state
│   │   └── ToastContext.jsx    # Toast notification queue and dispatchers
│   │
│   ├── pages/
│   │   ├── auth/               # Authentication & onboarding views
│   │   │   ├── LoginPage.jsx
│   │   │   ├── AdminRegisterPage.jsx
│   │   │   ├── SetupPasswordPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   └── VerifyEmailPage.jsx
│   │   ├── admin/              # Administrator portal views
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── EmployeeListPage.jsx
│   │   │   ├── EmployeeDetailPage.jsx
│   │   │   ├── AttendanceManagementPage.jsx
│   │   │   ├── LeaveManagementPage.jsx
│   │   │   ├── PayrollManagementPage.jsx
│   │   │   └── AdminProfilePage.jsx
│   │   ├── employee/           # Employee self-service views
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AttendanceHistoryPage.jsx
│   │   │   ├── LeavePortalPage.jsx
│   │   │   ├── MySalaryPage.jsx
│   │   │   ├── MyDocumentsPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   └── CompanyInfoPage.jsx
│   │   └── NotFoundPage.jsx    # 404 Fallback page
│   │
│   ├── utils/
│   │   ├── constants.js        # Enums (ROLES, STATUSES, LEAVE_TYPES, etc.)
│   │   └── formatters.js       # Date, currency, name, and string formatting
│   │
│   ├── App.jsx                 # Application router & route definitions
│   ├── main.jsx                # Application root entry point
│   └── index.css               # Global Tailwind CSS and styling variables
│
├── .env.example                # Sample environment variables
├── index.html                  # HTML template
├── package.json                # Project dependencies and npm scripts
└── vite.config.js              # Vite configuration
```

---

## 🧩 Component & Page Directory

### Common Components (`src/components/common/`)

| Component | Description |
|---|---|
| `ProtectedRoute` | Validates authentication and verifies user role permissions before rendering protected routes. |
| `Navbar` | Top navigation bar containing user avatar, company title, notification alerts, theme toggle button, and logout dropdown. |
| `Sidebar` | Collapsible navigation sidebar dynamically populated based on active user role (`ADMIN` or `EMPLOYEE`). |
| `StatCard` | KPI statistic display card with icon, title, metric value, and trend indicators. |
| `StatusBadge` | Color-coded status badge for Account status, Attendance status, and Leave approval state. |
| `Modal` | Accessible, animated dialog modal for forms and overlays. |
| `ConfirmDialog` | Confirmation prompt for critical/destructive actions (e.g., status toggle, leave rejection, document deletion). |
| `Pagination` | Page navigation bar with page size selectors and previous/next page triggers. |
| `EmptyState` | Stylized illustration and message displayed when data tables or lists contain no records. |

### Application Pages (`src/pages/`)

| Route Path | Page Component | Access Role | Description |
|---|---|---|---|
| `/login` | `LoginPage` | Public | Email and password login for admins and employees. |
| `/register-admin` | `AdminRegisterPage` | Public | Registration page for new companies and company admins. |
| `/setup-password` | `SetupPasswordPage` | Public | Password creation page for newly invited employees. |
| `/forgot-password` | `ForgotPasswordPage` | Public | Password reset request form. |
| `/reset-password` | `ResetPasswordPage` | Public | Password reset execution page via email token. |
| `/verify-email` | `VerifyEmailPage` | Public | Email confirmation token validator. |
| `/admin` | `AdminDashboard` | `ADMIN` | Admin metric overview, quick actions, and recent activity. |
| `/admin/employees` | `EmployeeListPage` | `ADMIN` | Searchable, paginated directory of all organization employees. |
| `/admin/employees/:id` | `EmployeeDetailPage` | `ADMIN` | Comprehensive employee profile, attendance, leaves, salary, and document tabs. |
| `/admin/attendance` | `AttendanceManagementPage` | `ADMIN` | Master attendance ledger with date range & employee filtering. |
| `/admin/leaves` | `LeaveManagementPage` | `ADMIN` | Leave request review queue with approve/reject actions. |
| `/admin/payroll` | `PayrollManagementPage` | `ADMIN` | Overview of salary structures across all employees. |
| `/admin/profile` | `AdminProfilePage` | `ADMIN` | Company organization settings, branding, and admin profile. |
| `/employee` | `EmployeeDashboard` | `EMPLOYEE` | Employee overview with live check-in widget and leave summaries. |
| `/employee/profile` | `ProfilePage` | `EMPLOYEE` | Personal profile view and contact/photo editor. |
| `/employee/attendance` | `AttendanceHistoryPage` | `EMPLOYEE` | Detailed history of check-ins, check-outs, and hours worked. |
| `/employee/leaves` | `LeavePortalPage` | `EMPLOYEE` | Leave application form and historical status tracker. |
| `/employee/salary` | `MySalaryPage` | `EMPLOYEE` | Personal salary structure and breakdown details. |
| `/employee/documents` | `MyDocumentsPage` | `EMPLOYEE` | Personal document archive with secure download options. |
| `/employee/calendar` | `CalendarPage` | `EMPLOYEE` | Interactive monthly calendar showing attendance, leaves, and holidays. |
| `/employee/company` | `CompanyInfoPage` | `EMPLOYEE` | Organization directory, work guidelines, and company info. |
| `*` | `NotFoundPage` | Public | 404 page for nonexistent routes. |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (Recommended: `v20.x` or `v22.x`)
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)
- **Backend API**: The DayFlow Spring Boot backend running on `http://localhost:8081` (or your configured port).

---

### Installation Steps

1. **Navigate to the frontend directory:**
   ```bash
   cd DayFlowFrontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `DayFlowFrontend` root directory:
   ```bash
   cp .env.example .env
   ```

   Ensure `VITE_API_BASE_URL` points to your active backend server:
   ```env
   # DayFlow Backend API Base URL
   VITE_API_BASE_URL=http://localhost:8081
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in your browser:**
   ```
   http://localhost:5173
   ```

---

## 🛠️ Available Scripts

In the `DayFlowFrontend` directory, you can run:

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR) at `http://localhost:5173`. |
| `npm run build` | Bundles and optimizes the app for production in the `dist/` directory. |
| `npm run preview` | Runs a local static server to preview the production build in `dist/`. |
| `npm run lint` | Runs the Oxlint linter to check for code issues and syntax warnings. |

---

## 🌐 API & Authentication Architecture

- **Token Storage**: On successful login, the JWT access token and user profile object are saved in browser `localStorage` (`dayflow_token` and `dayflow_user`).
- **Axios Interceptor**: `src/api/axios.js` automatically attaches `Authorization: Bearer <token>` to all outgoing API requests.
- **Automatic 401 Interception**: When a request returns HTTP `401 Unauthorized`, the interceptor clears cached auth tokens and redirects the user to `/login?session_expired=true`.
- **Role Guarding**: `ProtectedRoute` verifies if `user.role` matches the route's `allowedRoles`. Unauthorized access attempts are redirected to their appropriate role home.

---

## 🤝 Pair Programming & Support

DayFlow is crafted for fast and seamless HR operations. For backend setup, database migrations, and API documentation, refer to the [Backend README](../DayFlow/README.md).
