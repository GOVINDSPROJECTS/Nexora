# Nexora - Comprehensive Guide & Documentation

Nexora is a multi-tenant HRMS + ATS + Workforce Management SaaS platform built with Laravel 12 and React.

---

## 🏗️ Architecture Overview

### 1. Modular Monolith
The backend is structured into self-contained modules located in `app/Modules/`. Each module follows a standardized folder structure:
- `Controllers`, `Services`, `Repositories`
- `DTOs`, `Requests`, `Resources`
- `Events`, `Listeners`, `Policies`, `Models`, `Routes`

**Core Base Classes:**
- `BaseController`: Standardized API responses via `ApiResponseTrait`.
- `BaseService`: Encapsulates business logic.
- `BaseRepository`: Handles data persistence and Eloquent queries.

### 2. Multi-Tenancy (Hybrid)
Nexora uses a hybrid tenancy approach (currently single database, prepared for multi-database).
- **Identification**: Handled via `IdentifyTenant` middleware (Headers/Subdomains).
- **Context**: Managed by the `TenantManager` singleton.
- **Scoping**: Models use the `BelongsToTenant` trait for automatic global scoping.

### 3. API-First Foundation
- **Versioning**: All API routes are prefixed with `/api/v1/`.
- **Error Handling**: Global exception handling in `bootstrap/app.php` ensures unified JSON responses.
- **Authentication**: Powered by Laravel Sanctum.

### 4. Frontend Architecture (React SPA)
The frontend is a decoupled React SPA served by a catch-all Laravel route.
- **Routing**: React Router (`resources/js/app/routes/router.tsx`).
- **State Management**: Zustand (`resources/js/app/store/authStore.ts`).
- **Data Fetching**: TanStack Query (`resources/js/app/providers/QueryProvider.tsx`).
- **Styling**: TailwindCSS + Shadcn/UI.

---

## 🛠️ Modules Directory

| Module | Description | Status |
| :--- | :--- | :--- |
| **Auth** | Authentication, RBAC, Tokens | Production Ready |
| **Core** | Tenancy, Dashboard, System | Production Ready |
| **Shared** | Base classes, Common Traits | Production Ready |
| **Tenant** | Tenant Management & Settings | Implementation Ready |
| **Employee** | Full Employee Lifecycle (CRUD) | Production Ready |
| **ATS** | Job Postings & Candidates | Foundation Ready |
| **Leave** | Leave Requests & Approvals | Production Ready |
| **Attendance** | Clock-in/out & History | Production Ready |

---

## 🚦 Phase Tracking

### ✅ Phase 0: Foundation & Architecture
- [x] Backend Modular Structure
- [x] API Versioning & Exception Handling
- [x] Tenancy-ready Foundation
- [x] RBAC (Spatie) Setup
- [x] Frontend SPA Architecture (React Router + Zustand)
- [x] Docker & Environment Setup

### ✅ Phase 1: Core Business Modules
- [x] Tenant Registration & Onboarding
- [x] User Profile & Settings
- [x] Full Employee Directory (CRUD)
- [x] Leave Management Workflow
- [x] Attendance (Clock-in/out)
- [x] ATS Foundation (Jobs/Candidates)
- [x] Dashboard Widgets & Stats

---

## 📦 Setup & Deployment

### Local Development
1. **Clone & Install**:
   ```bash
   composer install
   npm install
   ```
2. **Environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
3. **Database**:
   ```bash
   php artisan migrate --seed
   ```
4. **Run**:
   ```bash
   npm run dev
   ```

### Docker
```bash
docker-compose up -d
```
