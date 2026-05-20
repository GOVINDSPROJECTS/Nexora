# Nexora Phase 3 — Setup Guide

Phase 3 transforms Nexora into an automation-driven workforce operating platform with ATS improvements, analytics, integrations, mobile-ready APIs, and production hardening.

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8+
- Redis (optional, recommended for queues/cache in production)

## 1. Install dependencies

```bash
composer install
npm install
```

## 2. Environment configuration

Copy `.env.example` to `.env` and configure:

```env
APP_NAME=Nexora
QUEUE_CONNECTION=database

# Integrations (driver-based, mock-ready)
INTEGRATION_MEETING_DRIVER=google_meet
INTEGRATION_CALENDAR_DRIVER=google_calendar

# Realtime (optional — enable when Reverb/Pusher is configured)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-key
REVERB_APP_SECRET=your-secret
```

## 3. Database setup

```bash
php artisan key:generate
php artisan migrate
php artisan db:seed --class=RolesAndPermissionsSeeder
php artisan db:seed --class=InitialDataSeeder
```

`InitialDataSeeder` includes demo tenant users and runs `WorkflowSeeder` for default automations.

### Demo accounts

| Role    | Email              | Password  |
|---------|--------------------|-----------|
| Admin   | admin@nexora.com   | password  |
| HR      | hr@nexora.com      | password  |
| Manager | manager@nexora.com | password  |
| Employee| employee@nexora.com| password  |

## 4. Storage & queue

```bash
php artisan storage:link
php artisan queue:work
```

Or use the dev script (server + queue + Vite):

```bash
composer dev
```

## 5. Scheduled automation

Add to your scheduler (`routes/console.php` or cron):

```bash
php artisan nexora:check-overdue-tasks
```

## 6. Frontend

```bash
npm run dev
```

Visit the app at `http://localhost:8000` (when using `php artisan serve`).

## Phase 3 feature map

### Workflow automation
- Event → Trigger → Action → Queue → Notification
- Events: `EmployeeCreated`, `LeaveApproved`, `TaskOverdue`, `CandidateSelected`, `InterviewScheduled`
- API: `GET/POST/PUT/DELETE /api/v1/workflows`
- UI: `/automation`

### ATS improvements
- Kanban pipeline with drag/drop stages
- Interview scheduling with meeting link generation
- Candidate notes & activity timeline
- Resume uploads
- APIs: `/candidates`, `/interviews`, `/candidates/{id}/activities`

### Integrations (driver pattern)
- Google Meet, Google Calendar, Zoho Cliq (mock/stub drivers)
- Config: `config/integrations.php`
- Future: Teams, Zoom, Slack via new drivers

### Analytics
- `GET /api/v1/dashboard/summary?from=&to=`
- Hiring funnel, leave trends, attendance, task productivity
- Dashboard widgets in React

### Mobile-ready API
- `POST /api/v1/auth/token` — Sanctum bearer token
- `POST /api/v1/auth/refresh` — refresh token
- Consistent pagination: `{ items, pagination }`
- `?all=1` for unpaginated list endpoints where supported

### Notifications
- Categories & priority in notification payload
- Preferences: `GET/PUT /api/v1/notifications/preferences`
- Notification center in app header
- Broadcast-ready: `tenant.{id}.user.{id}` channel

### Production hardening
- API throttling (`throttle:api`)
- Security headers middleware
- API request logging (non-debug)
- Health: `GET /api/v1/health`, `GET /api/v1/health/diagnostics`

### SaaS onboarding
- Tenant branding in settings JSON
- Onboarding walkthrough: `GET /api/v1/onboarding/status`
- UI: `/settings`

## Realtime (optional)

1. Configure Reverb in `.env`
2. Run `php artisan reverb:start`
3. Frontend Echo is pre-wired in `resources/js/app.tsx`

Listen for `notification.sent` on private channel `tenant.{tenantId}.user.{userId}`.

## Architecture notes

- **Modular monolith**: `app/Modules/{Module}/`
- **No drag-drop workflow builder** — configuration via DB + API
- **Tenant scoping**: `BelongsToTenant` trait on models
- **Automation**: `AutomationEventServiceProvider` registers explicit event listeners

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Workflows not firing | Ensure queue worker is running; check `workflows.is_active` and `event_type` matches |
| Notifications empty | Run an action that dispatches events (create employee, approve leave) |
| 401 on API | Use session cookies for SPA or Bearer token for mobile |
| Migration index errors | Drop duplicate indexes if re-running on existing DB |

## Next steps (post Phase 3)

- OAuth for Google/Microsoft calendar
- Full email Mailable templates
- React Native app consuming `/auth/token`
- AI-assisted screening (future integration point)
