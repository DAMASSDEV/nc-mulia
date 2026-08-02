---
name: release-check
description: Menjalankan quality gate seluruh sistem sebelum Preview deployment tanpa melakukan deployment.
disable-model-invocation: true
---

# /release-check — Release Quality Gate

Menjalankan quality gate seluruh sistem sebelum Preview deployment.

## Usage

```
/release-check
```

## Critical Features

Fitur berikut harus READY sebelum release:

1. auth-registration-login
2. rbac-admin-user
3. admin-users-membership
4. admin-products-stock
5. pricing-discounts
6. cart-checkout
7. payments-transactions
8. consultations
9. live-chat
10. locations-google-maps
11. user-dashboard
12. admin-dashboard
13. automation-testing
14. navigation-responsive-ui

## Quality Gate Checklist

Jalankan dan catat hasil untuk setiap item:

### Pre-flight

| # | Check | Command | Expected |
|---|---|---|---|
| 1 | Git working tree clean | `git status --short` | 0 changed files* |
| 2 | No test.only in source | `grep -r "test.only\|describe.only" apps/ --include="*.ts" --include="*.tsx"` | No results |
| 3 | No critical test.skip | `grep -r "test\.skip\|describe\.skip" apps/ --include="*.ts" --include="*.tsx"` | Report only |
| 4 | .env not git-tracked | Check gitignore | .env excluded |

*Working tree may have .claude/ workflow files untracked. Only source changes are checked.

### Build Phase

| # | Check | Command | Expected |
|---|---|---|---|
| 5 | Frontend build | `npm run build:frontend` | 0 errors |
| 6 | Backend build | `npm run build:backend` | 0 errors |

### Test Phase

| # | Check | Command | Expected |
|---|---|---|---|
| 7 | Backend unit tests | `npm -w apps/backend exec vitest run` | All pass |
| 8 | Frontend component tests | `npm -w apps/frontend exec vitest run` | All pass |
| 9 | E2E critical path | `npm run test:e2e` | All pass |
| 10 | Full suite 1st run | `npm run test:all` | All pass |
| 11 | Full suite 2nd run | `npm run test:all` | All pass (confirms no flaky) |

### Security & Quality

| # | Check | Command | Expected |
|---|---|---|---|
| 12 | No secrets in source | Manual review | No API keys, passwords in code |
| 13 | No localhost in prod | `grep -r "localhost" apps/frontend/src --include="*.ts" --include="*.tsx" \| grep -v "localhost:5173\|localhost:3000" \| grep -v "comment\|//"` | No results |
| 14 | RBAC backend tests | Backend test output | All permission tests pass |
| 15 | RBAC frontend tests | Frontend test output | All auth tests pass |
| 16 | Cart flow | E2E output | Cart + checkout pass |
| 17 | Payment flow | E2E output | Payment pass |
| 18 | Consultation & chat | E2E output | Both pass |
| 19 | Location & maps | Manual review | Maps fallback works |
| 20 | No test watch process | `Get-Process node \| Select-Object Id,CommandLine` | No vitest --watch running |

### Database

| # | Check | Command | Expected |
|---|---|---|---|
| 21 | Database tests isolated | Review test setup | Tests use separate DB or mock |
| 22 | No prod DB URL in test | Check test config | No production connection |
| 23 | No migration on prod | Manual | No prisma migrate run detected |

### Deployment

| # | Check | Command | Expected |
|---|---|---|---|
| 24 | Vercel not deployed | Manual check | No active deployment |
| 25 | No destructive migration | Review | No reset, no force push |

## Result

### Jika seluruh gate LULUS

1. Update `docs/workflow/RELEASE_GATE.md`:
   ```
   STATUS: READY_FOR_PREVIEW
   ```
2. Tampilkan gate summary
3. Rekomendasi: `Run /deploy-preview`

### Jika ada failure

1. Update `docs/workflow/RELEASE_GATE.md`:
   ```
   STATUS: NOT_READY
   ```
2. Tampilkan gate summary dengan failure yang jelas
3. Jangan memperbaiki dalam /release-check
4. Rekomendasi: `Run /build <failing-feature>` atau `Run /workflow-status`

## Aturan

1. **Jangan memperbaiki** failure dalam skill ini — hanya audit dan laporan.
2. Semua test harus **non-watch mode**.
3. Jangan jalankan destructive operations.
4. Jangan deploy.
5. Catat setiap gate result dengan expected vs actual.
