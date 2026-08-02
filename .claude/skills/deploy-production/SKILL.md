---
name: deploy-production
description: Melakukan production deployment hanya setelah Preview lulus dan pengguna memberikan approval eksplisit.
argument-hit: I-APPROVE-PRODUCTION
disable-model-invocation: true
---

# /deploy-production — Production Deployment

Melakukan production deployment hanya setelah Preview lulus dan approval eksplisit.

## Usage

```
/deploy-production I-APPROVE-PRODUCTION
```

## Argumen WAJIB

Argument harus **persis sama** dengan `I-APPROVE-PRODUCTION`.

Jika berbeda (case-sensitive):
- **TOLAK deployment**
- Jangan jalankan command apa pun
- Tampilkan pesan penolakan

## Prerequisites

```
RELEASE_GATE.md must contain:
STATUS: READY_FOR_PRODUCTION_APPROVAL
```

## Sequence

### Phase 1 — Verify Prerequisites

1. Baca `docs/workflow/RELEASE_GATE.md`
2. Pastikan STATUS = READY_FOR_PRODUCTION_APPROVAL
3. Pastikan Preview PASS (frontend + backend)

### Phase 2 — Pre-Deployment Audit

Sebelum deployment, audit:

| # | Check | Command | Expected |
|---|---|---|---|
| 1 | No migration pending | `git status` | No uncommitted migration |
| 2 | Working tree clean | `git status --short` | Only workflow files |
| 3 | No test.only | `grep -r "test.only" apps/` | No results |
| 4 | Backup available | Manual check | Database backup confirmed |
| 5 | Rollback plan | Manual check | Rollback steps documented |

### Phase 3 — Deployment Plan Display

Tampilkan deployment plan SEBELUM eksekusi:

```
╔══════════════════════════════════════════════════════════╗
║            PRODUCTION DEPLOYMENT PLAN                  ║
╠══════════════════════════════════════════════════════════╣
║  Target:                                               ║
║    Frontend: <vercel-frontend-project>                 ║
║    Backend:  <vercel-backend-project>                  ║
║                                                          ║
║  Environment Variables:                                ║
║    Frontend: VITE_API_URL, VITE_GOOGLE_MAPS_API_KEY  ║
║    Backend:  DATABASE_URL                              ║
║                                                          ║
║  Migration:                                             ║
║    Backend:  prisma migrate deploy                     ║
║                                                          ║
║  Rollback:                                             ║
║    Frontend: vercel rollback --prod <project>          ║
║    Backend:  vercel rollback --prod <project>          ║
║    DB:       Restore from backup                       ║
║                                                          ║
║  Approval: WAITING                                     ║
║  Run: /deploy-production I-APPROVE-PRODUCTION         ║
╚══════════════════════════════════════════════════════════╝
```

### Phase 4 — Confirmation

1. Tampilkan daftar di atas
2. Tunggu persetujuan eksplisit
3. Jika user tidak mengetik `I-APPROVE-PRODUCTION` → **STOP**

### Phase 5 — Production Deployment

```
/!\ PERHATIAN: Ini akan men-deploy ke PRODUCTION /!\
```

Jika approval eksplisit diberikan:

1. **Database Migration (Backend)**
   ```bash
   vercel env pull .env.production --token=<token>
   npx prisma migrate deploy
   ```

2. **Backend Production**
   ```bash
   vercel deploy --prod --token=<token>
   ```

3. **Frontend Production**
   ```bash
   vercel deploy --prod --token=<token>
   ```

4. **Post-Deployment Verification**
   - Smoke test critical endpoints
   - Verifikasi health check
   - Verifikasi database connection

### Phase 6 — Result

#### Jika SUCCESS

1. Update `docs/workflow/RELEASE_GATE.md`:
   ```
   STATUS: DEPLOYED
   Production Frontend: <url>
   Production Backend: <url>
   Deployed At: <date>
   Deployed By: Claude Code
   ```

2. Tampilkan success summary

#### Jika FAILURE

1. **LAKUKAN ROLLBACK**
2. Update `docs/workflow/RELEASE_GATE.md`:
   ```
   STATUS: ROLLBACK_PERFORMED
   Failure At: <step>
   Rollback Status: <success/failed>
   ```
3. Tampilkan failure report dan rollback steps
4. **STOP**

## Operations That Will NEVER Run

```
PRAHALU DIBLOKIR:
- prisma migrate reset       → destructive
- prisma db push --force     → destructive
- git push --force           → destructive
- git reset --hard           → destructive
- taskkill /IM node.exe /F  → kills unrelated processes
- Database truncate           → destructive
- Any --force flag on prod   → dangerous
```

## Production Protection Hook

File `.claude/hooks/protect-production.ps1` harus aktif untuk memblokir
perintah-perintah di atas ketika Release Gate belum siap.

## Jika Credential Tidak Tersedia

```
ERROR: Production credentials not configured.
ACTION REQUIRED:
1. Set VERCEL_TOKEN in environment or .env
2. Verify project IDs for frontend and backend
3. Verify DATABASE_URL for production
4. Re-run /deploy-production I-APPROVE-PRODUCTION
```
