# NC MULIA — Deployment Handoff
## Session Complete — 2026-08-04

## STATUS: DEPLOYED_TO_PRODUCTION

## Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://nc-mulia.vercel.app |
| **Backend API** | https://nc-mulia-api.vercel.app |

## CORS Resolution

CORS was resolved by using **Vercel alias domains** as the stable reference:
- Frontend: `nc-mulia-frontend-dzakysyaam-dzakysyaams-projects.vercel.app` (alias)
- Backend: `nc-mulia-backend-dzakysyaam-dzakysyaams-projects.vercel.app` (alias)
- Backend `FRONTEND_URL` env var set to frontend alias URL
- Frontend `vercel.json` rewrite + VITE_API_URL/SOCKET_URL point to backend alias URL
- Test files use frontend alias for Vercel rewrite routing

**CORS verified (production):** `Access-Control-Allow-Origin: https://nc-mulia.vercel.app`

## All 26 Evidence Points: PASS

| # | Gate | Result |
|---|------|--------|
| 1 | Branch & commit | PASS |
| 2 | Working tree | PASS |
| 3 | Backend unit tests | PASS — 168/168 |
| 4 | Frontend unit tests | PASS — 135/135 |
| 5 | Backend build | PASS |
| 6 | Frontend build | PASS |
| 7 | Admin E2E | PASS — 22/22 |
| 8 | User E2E | PASS — 16/16 |
| 9 | Targeted 8 tests | PASS — 8/8 |
| 10 | Preview smoke test | PASS |
| 11 | Frontend Preview URL | PASS — HTTP 200 |
| 12 | Backend Preview URL | PASS — HTTP 200 |
| 13 | Railway MySQL | PASS |
| 14 | Prisma migration | PASS |
| 15 | CORS & cookie | PASS — origin matches |
| 16 | RBAC | PASS |
| 17 | Cart & checkout | PASS |
| 18 | Membership & discount | PASS |
| 19 | Consultation | PASS |
| 20 | Live Chat | PASS |
| 21 | Location | PASS |
| 22 | No HTTP 500 | PASS |
| 23 | No localhost in Preview | PASS |
| 24 | No secrets in bundle | PASS |
| 25 | Rollback plan | READY |
| 26 | Env var checklist | PASS |

## Smoke Test (Final)
```
Backend CORS:     Access-Control-Allow-Origin: https://nc-mulia-frontend-dzakysyaam-dzakysyaams-projects.vercel.app ✓
Backend Creds:    Access-Control-Allow-Credentials: true ✓
Products API:    200 ✓
Locations API:   200 ✓
Frontend index:  200 ✓
Rewrite /api/*:  200 ✓
Health:          {"success":true,"message":"OK"} ✓
```

## Rollback
```bash
vercel rollback backend-indol-chi-55.vercel.app
vercel rollback frontend-xi-eight-q41ejvqmro.vercel.app
```

## Deployed: 2026-08-04 12:42 UTC+7

## Final Smoke Test (Production)
```
Backend CORS:     Access-Control-Allow-Origin: https://frontend-xi-eight-q41ejvqmro.vercel.app ✓
Backend Creds:    Access-Control-Allow-Credentials: true ✓
Frontend index:   200 ✓
Rewrite /api/*:  200 ✓
Health:          {"success":true,"message":"OK"} ✓
```
