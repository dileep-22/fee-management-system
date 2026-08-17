# FeeManage Pro v2.0 — Full Stack Fee Management System

A production-ready fee management system with Spring Boot backend and React frontend.

---

## 🏗️ Architecture

```
fee-management-v2/
├── backend/          Spring Boot 3.2 + Java 17
│   ├── entity/       JPA entities with indexes + audit fields
│   ├── repository/   Spring Data JPA + custom JPQL queries
│   ├── dto/          DTOs with Hibernate Validator
│   ├── mapper/       MapStruct mappers
│   ├── service/      Interfaces + implementations (clean architecture)
│   ├── controller/   REST controllers (versioned /api/v1/...)
│   ├── security/     JWT auth + Spring Security
│   ├── util/         PDF receipts (iText7), CSV export, late fee calculator
│   └── config/       Security, CORS, scheduler, data initializer
└── frontend/         React 18 + Tailwind CSS + React Query
    ├── api/          Axios layer with JWT auto-refresh
    ├── context/      AuthContext (login/logout/role)
    ├── pages/        Dashboard, Students, FeeRecords, Categories, Reports
    └── components/   Layout, shared UI (Modal, Table, Pagination...)
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- MySQL 8+
- Node.js 18+

### Backend Setup

```bash
cd backend

# 1. Configure database in src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/fee_management_v2
spring.datasource.username=root
spring.datasource.password=yourpassword

# 2. Configure JWT secret (change in production!)
app.jwt.secret=your-super-secret-jwt-key-min-32-chars-change-in-prod

# 3. Build and run
mvn clean install
mvn spring-boot:run
```

Server starts at: http://localhost:8080

**Default users (auto-created on first run):**
| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | ADMIN |
| staff    | staff123  | STAFF |

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## 🔐 Authentication & Roles

All API endpoints are secured with JWT Bearer tokens.

| Role    | Permissions |
|---------|-------------|
| ADMIN   | Full access — create, read, update, delete all resources |
| STAFF   | Create/update students, fee records, categories. Cannot delete |
| STUDENT | Read-only access to own records |

**Login:**
```http
POST /api/v1/auth/login
{ "username": "admin", "password": "admin123" }
```

Response includes `accessToken` (24h) and `refreshToken` (7d).

---

## 📡 API Reference

### Auth
```
POST   /api/v1/auth/login             Login
POST   /api/v1/auth/register          Register new user (ADMIN only)
POST   /api/v1/auth/refresh           Refresh access token
POST   /api/v1/auth/change-password   Change own password
GET    /api/v1/auth/me                Get current user info
```

### Students
```
GET    /api/v1/students               List with pagination, search, filters
POST   /api/v1/students               Create student
GET    /api/v1/students/:id           Get by DB id
GET    /api/v1/students/code/:sid     Get by student ID
PUT    /api/v1/students/:id           Update
DELETE /api/v1/students/:id           Delete (ADMIN only)
GET    /api/v1/students/dropdown      All students for select lists
GET    /api/v1/students/courses       Distinct courses
GET    /api/v1/students/academic-years  Distinct academic years
GET    /api/v1/students/export/csv    Export all students as CSV
```

### Fee Categories
```
GET    /api/v1/fee-categories         List (filter: isActive, feeType, academicYear)
POST   /api/v1/fee-categories         Create
GET    /api/v1/fee-categories/active  Active categories only
GET    /api/v1/fee-categories/:id     Get by id
PUT    /api/v1/fee-categories/:id     Update
PATCH  /api/v1/fee-categories/:id/toggle  Toggle active/inactive
DELETE /api/v1/fee-categories/:id     Delete (ADMIN only)
```

### Fee Records
```
GET    /api/v1/fee-records                  List with pagination + filters
POST   /api/v1/fee-records                  Create fee record
GET    /api/v1/fee-records/:id              Get by id (includes payment history)
PUT    /api/v1/fee-records/:id              Update (not allowed if PAID)
DELETE /api/v1/fee-records/:id              Delete (ADMIN only, not allowed if PAID)
POST   /api/v1/fee-records/:id/payment      Record a payment (partial supported)
GET    /api/v1/fee-records/student/:sid     All records for a student
GET    /api/v1/fee-records/dashboard        Dashboard stats
GET    /api/v1/fee-records/due-soon         Fee records due in next N days
GET    /api/v1/fee-records/:id/receipt      Download PDF receipt
GET    /api/v1/fee-records/export/csv       Export to CSV
POST   /api/v1/fee-records/gateway/create-order   Create payment gateway order
POST   /api/v1/fee-records/gateway/verify         Verify & record gateway payment
POST   /api/v1/fee-records/mark-overdue     Bulk mark overdue (ADMIN)
```

---

## 💳 Payment Gateway (Mock)

The system simulates Razorpay and Stripe flows:

1. **Create Order** → returns `orderId`, `keyId`, `amount`
2. **Checkout** → in production, opens Razorpay/Stripe widget
3. **Verify** → validates signature, records payment and history

For production, replace mock signature verification in `FeeRecordServiceImpl.verifyGatewayPayment()` with real HMAC-SHA256 validation.

---

## 📄 PDF Receipts

Receipts are generated using iText7 and include:
- Student info, course, academic year
- Fee breakdown (total, discount, fine, late fee)
- Payment summary with transaction ID
- QR-ready receipt number

Access: `GET /api/v1/fee-records/:id/receipt`

---

## 📊 Late Fee Calculation

Configured per fee category:
- `lateFeePercentage` — daily rate as % of total amount
- `gracePeriodDays` — days after due date before late fee kicks in

Formula: `lateFee = totalAmount × (lateFeePercentage / 100) × max(0, daysOverdue - gracePeriodDays)`

---

## ⏰ Scheduled Jobs

The `OverdueScheduler` runs daily at 01:00 AM to bulk-mark fee records as `OVERDUE` where `dueDate < today` and status is `PENDING` or `PARTIAL`.

---

## 🗃️ Database Schema

Key tables with indexes:
- `users` — auth accounts with roles
- `students` — indexed on `student_id`, `email`, `status`, `course`
- `fee_categories` — indexed on `is_active`, `fee_type`
- `fee_records` — indexed on `student_id`, `fee_category_id`, `payment_status`, `due_date`, `academic_year`
- `payment_history` — full payment trail per fee record

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Java 17 |
| Security | Spring Security + JWT (jjwt 0.12) |
| Database | MySQL 8 + Spring Data JPA |
| Mapping | MapStruct 1.5 |
| Validation | Hibernate Validator |
| PDF | iText7 |
| CSV | OpenCSV |
| Frontend | React 18, Vite 5 |
| Styling | Tailwind CSS 3.4 |
| State | TanStack Query v5 |
| Forms | React Hook Form |
| Charts | Recharts |
| HTTP | Axios with JWT interceptor |

---

## 🔧 Environment Configuration

Change these before deploying to production:

```properties
# application.properties
spring.datasource.password=CHANGE_ME
app.jwt.secret=CHANGE_TO_LONG_RANDOM_SECRET_MIN_32_CHARS
spring.jpa.hibernate.ddl-auto=validate   # change from 'update' in prod
spring.jpa.show-sql=false
```

---

## 📁 CSV Export Columns

**Fee Records:** Receipt No, Student ID, Student Name, Course, Academic Year, Semester, Fee Category, Total Amount, Paid Amount, Discount, Fine, Late Fee, Balance, Payment Status, Payment Method, Transaction ID, Due Date, Payment Date, Created At, Remarks

**Students:** Student ID, First Name, Last Name, Email, Phone, Date of Birth, Course, Semester, Academic Year, Status, Guardian Name, Guardian Phone, Created At
