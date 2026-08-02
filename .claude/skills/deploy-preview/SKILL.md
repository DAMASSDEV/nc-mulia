---
name: deploy-preview
description: Menyiapkan dan menjalankan Vercel Preview hanya setelah release gate READY_FOR_PREVIEW.
disable-model-invocation: true
---

# /deploy-preview — Vercel Preview Deployment

Menyiapkan dan menjalankan Vercel Preview deployment.

## Prerequisites

```
RELEASE_GATE.md must contain:
STATUS: READY_FOR_PREVIEW
```

## Usage

```
/deploy-preview
```

## Aturan

1. **Hanya Preview** — jangan gunakan `--prod`
2. Jangan merge ke main
3. Jangan jalankan migration destructive
4. Jangan cetak secret di output
5. Jangan masukkan secret melalui command yang masuk log
6. Jika credential belum tersedia, **berhenti** dan beri instruksi manual
7. Jangan lanjut ke production

## Deployment Sequence

### Phase 1 — Persiapan

1. Baca `docs/workflow/RELEASE_GATE.md` — pastikan STATUS = READY_FOR_PREVIEW
2. Baca credential yang diperlukan
3. Cek .env files untuk kedua project

### Phase 2 — Backend Preview

1. Deploy backend ke Vercel (sebagai serverless function atau separate project)
2. Verifikasi: `GET <backend-preview-url>/api/health`
3. Verifikasi koneksi database
4. Jika gagal → **STOP**, status = PREVIEW_FAILED

### Phase 3 — Frontend Preview

1. Set `VITE_API_URL=<backend-preview-url>`
2. Set `VITE_GOOGLE_MAPS_API_KEY` (jika ada)
3. Deploy frontend ke Vercel Preview
4. Jika gagal → **STOP**, status = PREVIEW_FAILED

### Phase 4 — Smoke Test

Jalankan smoke test terhadap preview URLs:

| # | Test | Endpoint | Expected |
|---|---|---|---|
| 1 | Registration | POST /api/auth/register | 201 + user data |
| 2 | Login | POST /api/auth/login | 200 + token in cookie |
| 3 | Auth /me | GET /api/auth/me | 200 + user profile |
| 4 | Admin login | POST /api/auth/login (admin creds) | 200 + admin role |
| 5 | Products list | GET /api/products | 200 + product array |
| 6 | Cart add | POST /api/cart/items | 200 + updated cart |
| 7 | Cart view | GET /api/cart | 200 + cart items |
| 8 | Checkout | POST /api/transactions | 201 + transaction |
| 9 | Payment | POST /api/payments | 200 + payment |
| 10 | Membership status | GET /api/membership/status | 200 |
| 11 | Consultation create | POST /api/consultations | 201 |
| 12 | Chat connection | Socket.IO handshake | connected |
| 13 | Location list | GET /api/locations | 200 + locations |
| 14 | Direct route | Navigate to /admin/dashboard | Redirect ke login jika belum auth |

### Phase 5 — Browser E2E

Jalankan subset Playwright test terhadap preview URL:

```bash
PLAYWRIGHT_BASE_URL=<frontend-preview-url> npm run test:e2e
```

### Phase 6 — Result

#### Jika seluruh smoke test LULUS

1. Update `docs/workflow/RELEASE_GATE.md`:
   ```
   STATUS: READY_FOR_PRODUCTION_APPROVAL
   Frontend Preview: <url>
   Backend Preview: <url>
   Preview Date: <date>
   Preview Result: PASS
   ```
2. Tampilkan deployment summary
3. Rekomendasi: `Run /deploy-production I-APPROVE-PRODUCTION`

#### Jika ada failure

1. Update `docs/workflow/RELEASE_GATE.md`:
   ```
   STATUS: NOT_READY
   Preview Result: FAILED
   Failed Step: <step-name>
   Failure Details: <description>
   ```
2. **Jangan lanjut production**
3. Berhenti

## Credential Checklist

Jika credential belum tersedia, tampilkan instruksi manual:

```
CREDENTIALS REQUIRED:
- VERCEL_TOKEN: <instructions>
- FRONTEND_PROJECT_ID: <instructions>
- BACKEND_PROJECT_ID: <instructions>
- DATABASE_URL: <use existing env>
- VITE_GOOGLE_MAPS_API_KEY: <optional>

ACTION: Configure credentials in .env or Vercel dashboard, then re-run /deploy-preview
```

## Rollback Plan

Jika preview gagal setelah partial deployment:
1. Vercel otomatis me-rollback ke deployment sebelumnya
2. Hapus environment variable yang sudah di-set jika perlu
3. Dokumentasikan failure untuk investigation

## Safety Rules

1. Tidak ada `vercel --prod`
2. Tidak ada `vercel deploy --prod`
3. Tidak ada `prisma migrate reset`
4. Tidak ada destructive database operation
5. Semua secret di-set via Vercel dashboard, bukan command line
