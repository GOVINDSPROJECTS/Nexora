# Nexora Phase 1 QA Report

## Test Plan
1. [ ] User Authentication & Persistence
2. [ ] Tenant-Aware Data Isolation
3. [ ] Employee Management (CRUD)
4. [ ] Leave Management (Types & Requests)
5. [ ] Attendance Tracking (Clock-in/out)
6. [ ] Job Postings (ATS)

## Issues Found
| ID | Module | Issue Description | Status |
|----|--------|-------------------|--------|
| 01 | Auth | State lost on page refresh | Fixed ✅ |
| 02 | Employee | Unable to add new employee | Fixed ✅ |
| 03 | Tenancy | Dashboard stats were 0 | Fixed ✅ |
| 04 | Core | Attendance & Jobs routes missing | Fixed ✅ |

## Live Testing Log
*   **2026-05-15 14:40**: Fixed Auth persistence by adding `AuthProvider`.
*   **2026-05-15 14:41**: Successfully tested Employee creation in browser. "John New" added.
*   **2026-05-15 14:47**: Created and registered Attendance and Jobs pages. Routes are now active.
*   **2026-05-15 15:00**: Implemented linked User account creation in Employee form.
*   **2026-05-15 15:02**: Expanded seeder with multiple roles:
    *   `admin@nexora.com` (Admin)
    *   `hr@nexora.com` (HR)
    *   `manager@nexora.com` (Manager)
    *   `employee@nexora.com` (Employee)
