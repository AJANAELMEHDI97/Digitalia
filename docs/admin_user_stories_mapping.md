# Admin User Stories — Mapping & Implementation Notes

* Scope: mappings for Admin-priority user stories extracted from the provided CDC (SocialPulse.pro). Use this file as the source of truth for tasks and quick code locations.

* How to read: each story shows Acceptance Criteria (AC), Code locations (suggested files), and Implementation tasks.

## 1. Invite a user
* AC: `POST /organization/members/invite` creates an invitation, stores token, sends email, status `invited`, log `member_invited`.
* Code (backend): `apps/api/src/routes/organization.ts` (invite handlers), `apps/api/src/lib/notifications.ts` or `apps/api/src/lib/email.ts` (mailer), `apps/api/src/db/*` (queries).
* Code (frontend): `apps/web/src/components/admin/` or `apps/web/src/pages/admin/Members.tsx` (admin UI list/invite modal).
* Tasks: add invite endpoint (if missing), implement token expiry, implement mail send, add UI modal and list view, add tests, add log event.

## 2. Assign / revoke roles
* AC: `PUT /organization/members/:id/role` updates role; middleware enforces only Admin can call; action logged as `member_role_changed`.
* Code: `apps/api/src/middleware/auth.ts`, `apps/api/src/lib/roles.ts`, `apps/api/src/routes/organization.ts`.
* Tasks: ensure RBAC middleware exists and is used on role endpoints; add unit tests for role changes; add frontend admin role dropdown and confirmation flow.

## 3. Toggle public signup
* AC: Admin toggles `ALLOW_PUBLIC_SIGNUP`; `POST /auth/register` returns 403 when disabled; `GET /auth/config` exposes flag; UI reflects state.
* Code: `apps/api/src/config/env.ts`, `apps/api/src/routes/auth.ts`, `apps/web/src/pages/Signup.tsx`.
* Tasks: verify flag wired everywhere (auth routes + admin UI); add admin endpoint to change the flag or link to a global rules service; add tests.

## 4. Approve / Reject posts (validation workflow)
* AC: endpoints for `/posts/pending`, `/posts/:id/approve`, `/posts/:id/reject` exist; notifications and history recorded (`post_approved`, `post_rejected`).
* Code: `apps/api/src/routes/posts.ts`, `apps/api/src/lib/postWorkflow.ts`, `apps/web/src/pages/validation/`.
* Tasks: implement endpoints if missing; ensure permissions; add UI table and action buttons; add logging and notifications; create tests.

## 5. Integrations management (OAuth keys)
* AC: Admin can CRUD integrations, keys stored encrypted, status visible, logs `integration_added` / `integration_removed`.
* Code: `apps/api/src/routes/integrations.ts`, `apps/api/src/lib/storage.ts` (or vault), `apps/web/src/pages/admin/integrations.tsx`.
* Tasks: add integrations endpoints, key encryption, admin UI, webhook status monitoring, tests.

## 6. Global rules & enforcement
* AC: CRUD `/global-rules` with versioning; rules immediately applied (e.g., require 2FA for role X, retention policy).
* Code: propose `apps/api/src/routes/globalRules.ts`, middleware to apply rules (e.g., `apps/api/src/middleware/rules.ts`).
* Tasks: scaffold API, add admin UI for rules, implement rule application hooks in auth & posts flows.

## 7. Audit / Logs for Admin
* AC: `/admin/logs` filterable by action, user, date; export CSV/JSON.
* Code: `apps/api/src/lib/logs.ts`, `apps/api/src/routes/admin/logs.ts`.
* Tasks: create logs storage (DB table), read endpoints, frontend admin audit viewer, export functionality.

---

## Next immediate deliverables
* Create concrete issues/tasks for the high-priority items: invite flow, roles, toggle signup, approve/reject, basic audit.
* Implement quick, low-risk fixes first: verify `ALLOW_PUBLIC_SIGNUP` wiring (partially implemented), add admin endpoint to view config, tighten auth rate-limits, add missing logs.
* Provide PRs with unit tests for each change and include acceptance criteria in each PR description.

---

File created by mapping run on 2026-03-31.
