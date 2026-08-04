# Feature Matrix

| Modul | Spec | Build | Backend Test | Frontend Test | E2E | Review | Status | Blocker |
|---|---|---|---|---|---|---|---|---|
| auth-registration-login | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| rbac-admin-user | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| admin-users-membership | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| admin-products-stock | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| pricing-discounts | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| cart-checkout | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| payments-transactions | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| bmi | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| consultations | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| live-chat | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| locations-google-maps | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| user-dashboard | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| admin-dashboard | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| navigation-responsive-ui | SPEC_READY | BUILD_COMPLETE | NOT_STARTED | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| automation-testing | SPEC_READY | BUILD_COMPLETE | PASS (vitest) | PASS (vitest) | BLOCKED | READY | READY | E2E needs MySQL |
| vercel-readiness | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | BLOCKED | Needs vercel.json |

## Status Legend

- **NOT_STARTED**: Fitur belum mulai diproses.
- **SPEC_IN_PROGRESS**: Spec sedang ditulis.
- **SPEC_READY**: Spec selesai dan siap diimplementasi.
- **BUILD_IN_PROGRESS**: Implementasi sedang berjalan.
- **BUILD_COMPLETE**: Implementasi selesai, menunggu review.
- **REVIEW_FAILED**: Review gagal, perlu perbaikan.
- **READY**: Feature siap dilepas (vitest pass, build pass, tsc clean).
- **BLOCKED**: Feature terblokir, tidak bisa melanjutkan.

## Vitest Coverage (2026-08-02)

- **Backend**: 9 files, **161 tests** (auth, auth.controller, products, transactions, stats, services, rbac, rbac.controller, cart, middleware/auth)
- **Frontend**: 8 files, **135 tests** (Button, Modal, Navbar, CartContext, api, membership, DashboardPage, productImages)
- **E2E**: 6 files, ~94 tests in `apps/frontend/tests/` (auth, admin, checkout, guest, navigation, user-member)

## Test Summary

| Check | Result |
|---|---|
| Backend vitest (161 tests) | PASS |
| Frontend vitest (135 tests) | PASS |
| Backend TypeScript | CLEAN |
| Frontend TypeScript | CLEAN |
| E2E (Playwright, ~94 tests) | BLOCKED — requires MySQL database |

## Infrastructure Blocker

E2E tests require a live MySQL database + running backend. The E2E suite exists at `apps/frontend/tests/` and should be executed in CI/CD with a MySQL database. MySQL is not available in the current environment.

## Auth Registration Verification

Verified in this audit cycle (2026-08-02):
- `AuthService.register()` does NOT return a JWT token (no auto-login)
- `authMiddleware` returns 401 when no token cookie is present
- `authMiddleware` sets `req.user` when valid token is present
- `requireUser` returns 403 for unauthenticated/non-user roles
- `requireAdmin` returns 403 for "user" role
- `requirePermission` returns 401 for undefined user, bypasses for super_admin
- 3 `requirePermission` DB-lookup tests (getUserPermissions) are BLOCKED — vi.mock factory cannot intercept the ESM import in Vitest 4.1.10. Covered by 18 service-level RBAC tests in `rbac.test.ts` instead.

## Last Updated
2026-08-02
