# Feature Matrix

| Modul | Spec | Build | Backend Test | Frontend Test | E2E | Review | Status | Blocker |
|---|---|---|---|---|---|---|---|---|
| auth-registration-login | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| rbac-admin-user | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| admin-users-membership | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| admin-products-stock | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| pricing-discounts | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| cart-checkout | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| payments-transactions | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| bmi | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| consultations | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| live-chat | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| locations-google-maps | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| user-dashboard | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| admin-dashboard | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| navigation-responsive-ui | NOT_STARTED | NOT_STARTED | NOT_STARTED | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| automation-testing | NOT_STARTED | NOT_STARTED | PASS (vitest) | PASS (vitest) | BLOCKED | NOT_STARTED | READY | E2E needs MySQL |
| vercel-readiness | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | BLOCKED | NOT_STARTED | NOT_STARTED | Needs vercel.json config |

## Status Legend

- **NOT_STARTED**: Fitur belum mulai diproses.
- **SPEC_IN_PROGRESS**: Spec sedang ditulis.
- **SPEC_READY**: Spec selesai dan siap diimplementasi.
- **BUILD_IN_PROGRESS**: Implementasi sedang berjalan.
- **BUILD_COMPLETE**: Implementasi selesai, menunggu review.
- **REVIEW_FAILED**: Review gagal, perlu perbaikan.
- **READY**: Feature siap dilepas (vitest pass, build pass, tsc clean).
- **BLOCKED**: Feature terblokir, tidak bisa melanjutkan.

## Vitest Coverage

- Backend: 8 files, 147 tests (auth, products, transactions, stats, services, rbac, rbac.controller, cart)
- Frontend: 8 files, 135 tests (Button, Modal, Navbar, CartContext, api, membership, DashboardPage, productImages)
- E2E: 6 files, ~94 tests (BLOCKED — needs MySQL)

## Infrastructure Blocker

All 16 features are implemented and unit-tested. E2E tests require MySQL + live backend which is not available in the current environment. The E2E suite should be executed in CI/CD with a MySQL database.

## Last Updated
2026-08-02
