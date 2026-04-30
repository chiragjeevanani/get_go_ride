# Safar Setto Backend Implementation Plan

This plan outlines the systematic development of the Safar Setto backend, transitioning from mock data to a production-ready RESTful API. We will follow a strict **TDD (Test-Driven Development)** workflow, implementing one feature/API at a time.

## Tech Stack (Locked)
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB
- **ORM:** Mongoose
- **API Style:** REST
- **Authentication:** JWT Tokens
- **Testing:** Vitest + Supertest

## Implementation Strategy: TDD Workflow
Every feature implementation will follow these three steps:
1. **RED:** Create a failing test case in `backend/tests/` using Supertest.
2. **GREEN:** Write the minimal Mongoose model and Express route logic to make the test pass.
3. **REFACTOR:** Clean up the folder structure (Controller/Service/Routes) and ensure centralized error handling.

---

## Phase 1: Foundation & Authentication
Implementing core infrastructure, MongoDB connection, and JWT security.

### 1.1 Project Initialization
- Initialize `backend/package.json` with ESM.
- Configure `vitest.config.js` for API testing.
- Setup `.env` for MongoDB URI and JWT secrets.

### 1.2 MongoDB Connection [TDD]
- **RED:** Test if database connection fails gracefully.
- **GREEN:** Setup Mongoose connection utility.

### 1.3 Auth: Admin Login [TDD]
- **RED:** Write test for `POST /api/auth/login`.
- **GREEN:** Create Admin model and login controller.
- **REFACTOR:** Implement JWT signing service.

---

## Phase 2: Category & Vehicle Management
Defining the platform's core service offerings.

### 2.1 Service Categories API [TDD]
- `GET /api/categories`
- `POST /api/categories` (Model: Name, Slug, Icon, Count)

### 2.2 Vehicle Types API [TDD]
- `GET /api/vehicles`
- `POST /api/vehicles` (Model: Name, Capacity, Icon)

---

## Phase 3: Identity & Verification
Managing Users and Service Partners.

### 3.1 User Management [TDD]
- `GET /api/users` (List with pagination)
- `PATCH /api/users/:id/status` (Toggle Active/Blocked)

### 3.2 Vendor Hub [TDD]
- `GET /api/vendors` (Comprehensive list)
- `PATCH /api/vendors/:id/verify` (Verified badge logic)
- `PATCH /api/vendors/:id/status` (Suspend access)

---

## Phase 4: Marketplace Engine
Leads, lifecycle, and safety moderation.

### 4.1 Leads Management [TDD]
- `GET /api/leads` (Filter by category/status)
- `PATCH /api/leads/:id/close` (Admin force-close)

### 4.2 Moderation Hub [TDD]
- `GET /api/reviews` (Pending moderation list)
- `PATCH /api/reviews/:id/approve` (Approve/Reject content)

---

## Phase 5: Billing & Analytics
Revenue tracking and plan configuration.

### 5.1 Subscription Plans [TDD]
- `GET/POST /api/plans` (Define Basic/Premium tiers)

### 5.2 Revenue Dashboard Data [TDD]
- `GET /api/revenue/stats` (Aggregated KPIs for Dashboard widgets)

---

## Phase 6: System Orchestration

### 6.1 Notifications API [TDD]
- `GET /api/notifications` (Admin alerts)

### 6.2 Global Settings [TDD]
- `GET/PATCH /api/settings` (Platform branding & matching radius)

---

## Verification Plan

### Automated Coverage
- Every endpoint MUST have at least 1 Happy Path and 1 Error Path (e.g., 401 Unauthorized) test file in `backend/tests/`.

### Manual Audit
- Final comparison against mocked frontend views to ensure data parity.
