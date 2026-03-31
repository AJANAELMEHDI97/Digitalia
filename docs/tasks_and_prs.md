# Implementation Tasks & PR Outlines

This file lists immediate fixes and suggested PRs to create from the current workspace state.

1) Disable public signup (done)
- Branch: `chore/disable-public-signup`
- What: set `ALLOW_PUBLIC_SIGNUP=false` in `docker-compose.yml` so the API rejects public registrations by default.
- Files changed: `docker-compose.yml`
- Verification: `GET /auth/config` should return `{ "allowPublicSignup": false }` after restart.

2) DB image / locale fix (done)
- Branch: `chore/db-image-postgres16`
- What: switch DB image from `postgres:16-alpine` to `postgres:16` and set `LANG`/`LC_ALL` to avoid locale warnings and the initdb "trust" fallback warnings on some platforms.
- Files changed: `docker-compose.yml`
- Verification: `docker compose up --build` should not show the "no usable system locales were found" or the trust-initdb warning in DB logs.

3) Improve auth validation error payloads (PR required)
- Branch: `fix/auth-validation-errors`
- What: return structured validation errors from `parseOrRespond` (field-level messages) and ensure `POST /auth/register` returns clear errors for missing/invalid fields (currently returns 400 with empty body in some cases).
- Files to change: `apps/api/src/lib/validation.ts`, `apps/api/src/routes/auth.ts`
- Tests: add unit tests for `register` validation and API integration tests for invalid payloads.

4) Logging & Audit improvements (PR required)
- Branch: `feat/logging-audit`
- What: ensure `logEvent` covers important actions (user_registered, login_failed, login_success, member_role_changed, post_approved/rejected). Add an admin `/admin/logs` read endpoint and export CSV.
- Files to change: `apps/api/src/lib/logs.ts`, `apps/api/src/routes/admin/logs.ts`, frontend admin view.
- Tests: unit tests for `logEvent` and integration tests for logs endpoint.

5) CI / Tests (PR required)
- Branch: `ci/add-tests`
- What: add basic integration tests for auth flows, and add a lightweight CI script that runs `npm test` for `apps/api` and `apps/web`.
- Files to change: create `package.json` test scripts (if missing), add `tests/` directory with jest/vitest configs.

How to create a branch and commit locally (example):
```powershell
# create branch
git checkout -b chore/disable-public-signup-and-db-fix
# add changes
git add docker-compose.yml docs/tasks_and_prs.md
git commit -m "chore: disable public signup by default; use postgres:16 and set locales"
# push (optional)
git push -u origin chore/disable-public-signup-and-db-fix
```

If you want, I can create the local branch and commit these changes for you now (I will not push), then generate PR descriptions you can paste into GitHub.
