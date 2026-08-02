# Feature: auth-registration-login

## 1. Feature
User registration, login, logout, and session management for NC MULIA platform. Supports JWT-based authentication via httpOnly cookies, role assignment on registration, and RBAC-aware profile retrieval.

## 2. Current Behavior

### Registration (POST /auth/register)
- Input: name, email, phone (optional), password
- Validation: name 2-100 chars, valid email, password min 8 chars
- Behavior: Creates user with REGULAR membership, assigns user role, returns 201 with success message (no auto-login)
- Errors: 409 if email exists, 400 for validation failures
- Rate limit: 10 requests per 15 minutes per IP

### Login (POST /auth/login)
- Input: email, password
- Behavior: Validates credentials, sets accessToken JWT cookie (httpOnly, 7-day), returns user data
- Errors: 401 wrong credentials, 403 if account inactive
- Rate limit: 20 requests per 15 minutes per IP

### Logout (POST /auth/logout)
- Clears accessToken cookie, returns success message, no auth required

### Get Profile (GET /auth/me)
- Auth required: JWT cookie
- Returns full user profile with resolved role slug
- Errors: 401 no token, 404 user not found

## 3. Problem
No identified problems. The existing implementation is complete and functional.

## 4. User Roles
Regular user (user): Yes on registration, permissions: products:read, locations:read
Admin (admin): No on registration, assigned by super_admin
Super Admin (super_admin): No on registration, assigned by seed, all 38 permissions + bypass
Role resolution priority: super_admin > admin > user.

## 5. Business Rules
1. Email uniqueness: Case-insensitive, stored lowercase
2. Password hashing: bcrypt cost factor 12
3. JWT payload: { userId, role } signed with JWT_SECRET
4. Cookie: httpOnly, sameSite=lax, secure in production only
5. Inactive accounts: Login returns 403
6. Rate limiting: Per-IP via in-memory store
7. Registration assigns USER role via userRoles junction with hardcoded seed_role_user ID

## 6. UI Requirements
Login Modal: Email + password inputs, Eye/EyeOff toggle, loading state, error display, Daftar link
Register Modal: Name, email, phone (optional), password inputs, toggle, loading, error, Masuk link
Navbar: Masuk button when logged out; user name/email, admin link, logout, cart badge when logged in
Route Guards: AdminRouteGuard redirects non-admins to /; UserRouteGuard redirects unauth to /

## 7. Backend Requirements
POST /auth/register - No auth, 10/15min rate limit
POST /auth/login - No auth, 20/15min rate limit
POST /auth/logout - No auth
GET /auth/me - JWT required
JWT: secret=JWT_SECRET env, expiry=JWT_EXPIRES_IN (default 7d)

## 8. API Contract
POST /auth/register: 201 { success: true, message: Registrasi berhasil. }
POST /auth/login: 200 { success: true, message: Login berhasil., data: { id, name, email, phone, role, membershipStatus, membershipExpiresAt, isActive, createdAt } }
POST /auth/logout: 200 { success: true, message: Logout berhasil. }
GET /auth/me: 200 { success: true, message: OK., data: { /* same as login */ } }

## 9. Database Impact
Model: User (no schema change needed). On registration: creates one UserRole linking to seed_role_user. email is @unique.

## 10. Authorization Matrix
POST /auth/register: Public=Yes, User=Yes, Admin=Yes, SuperAdmin=Yes
POST /auth/login: Public=Yes, User=Yes, Admin=Yes, SuperAdmin=Yes
POST /auth/logout: Public=Yes, User=Yes, Admin=Yes, SuperAdmin=Yes
GET /auth/me: Public=No, User=Yes, Admin=Yes, SuperAdmin=Yes

## 11. Validation Rules
name: min 2, max 100 chars - Nama minimal 2 karakter
email: valid format - Email tidak valid
phone: optional
password (register): min 8 chars - Password minimal 8 karakter
password (login): min 1 char - Password diperlukan

## 12. Error Handling
409 Email already registered - Email sudah terdaftar.
400 Invalid email - Email tidak valid
400 Password too short - Password minimal 8 karakter
401 Wrong credentials - Email atau password salah.
403 Inactive account - Akun dinonaktifkan. Hubungi admin.
401 Missing token - Unauthorized.
401 Invalid token - Invalid or expired token.
404 User not found - User tidak ditemukan.
429 Rate limit - (express-rate-limit)

## 13. Acceptance Criteria
### Registration
- [x] User can register with name, email, phone (optional), password
- [x] Password hashed bcrypt cost 12
- [x] Email normalized to lowercase
- [x] New user gets user role via UserRole junction
- [x] Duplicate email returns 409
- [x] Validation errors return 400
- [x] Rate limited 10/15min
- [x] No JWT cookie set on registration
### Login
- [x] Valid creds sets httpOnly JWT cookie
- [x] Cookie 7-day maxAge, httpOnly, sameSite=lax, secure in prod
- [x] Wrong password returns 401
- [x] Non-existent email returns 401
- [x] Inactive account returns 403
- [x] Returns user data without passwordHash
- [x] Rate limited 20/15min
### Logout
- [x] Clears accessToken cookie
- [x] Returns success message
- [x] Works without authentication
### Profile
- [x] Returns full profile with role slug
- [x] Returns 401 if no valid token
- [x] Returns 404 if user deleted
### Frontend
- [x] Login modal opens from navbar Masuk button
- [x] Register modal switches from login modal
- [x] Password visibility toggle works
- [x] Error messages display correctly
- [x] Loading state during auth operations
- [x] Post-login: modal closes, navbar updates
- [x] Post-register: modal closes, switches to login, pre-fills email
- [x] Logout clears user from navbar
- [x] Admin routes protected by AdminRouteGuard
- [x] User routes protected by UserRouteGuard
- [x] Cart badge shows correct count

## 14. Test Matrix
All 18 test cases implemented and passing in auth.test.ts:
- hashPassword uses cost 12
- Register: creates user + assigns role
- Register: 409 on duplicate email
- Register: normalizes email to lowercase
- Login: returns token + user on correct creds
- Login: 401 on wrong password
- Login: 401 on non-existent user
- Login: 403 on inactive account
- getProfile: returns profile with role slug
- getProfile: 404 when user not found
- Role slug: super_admin priority
- Role slug: admin priority
- Role slug: user as default
- Controller: register 201, no cookie
- Controller: register 400 on validation
- Controller: login sets httpOnly cookie
- Controller: logout clears cookie
- Controller: me returns user data

## 15. Files
All files already exist. No changes needed.
Backend:
- apps/backend/src/modules/auth/service.ts - Business logic
- apps/backend/src/modules/auth/controller.ts - HTTP handlers, Zod validation
- apps/backend/src/modules/auth/routes.ts - Route definitions with rate limiting
- apps/backend/src/modules/auth/index.ts - Module exports
- apps/backend/src/modules/auth/auth.test.ts - Unit tests (all passing)
- apps/backend/src/middleware/auth.ts - JWT verification, requireUser/Admin/SuperAdmin
- apps/backend/prisma/schema.prisma - User model (no changes needed)
Frontend:
- apps/frontend/src/components/layout/AuthModals.tsx - Login/Register modal UI
- apps/frontend/src/components/layout/Navbar.tsx - Auth state display, logout button
- apps/frontend/src/App.tsx - Auth state, handlers, route guards
- apps/frontend/src/lib/api.ts - API client functions
- apps/frontend/src/types/index.ts - User type definitions

## 16. Out of Scope
Password reset, Email verification, OAuth, Multi-device sessions, Admin-initiated user creation, User deletion (deactivation only), Profile editing (separate from auth)

## 17. Risks
1. Hardcoded USER_ROLE_ID in service.ts must match seed.ts - mitigated by deterministic IDs
2. No account lockout - rate limiting provides mitigation
3. Registration before seed - FK constraint error if seed_role_user missing, mitigated by seed being part of setup

## 18. Rollback Consideration
Registration data: Users remain in DB after rollback, manual cleanup via admin. Role assignments: UserRole records can be deleted directly. No breaking changes to API contract.
