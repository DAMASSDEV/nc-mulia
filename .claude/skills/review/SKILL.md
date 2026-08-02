---
name: review
description: Melakukan review independen dan read-only terhadap implementasi berdasarkan specification.
argument-hint: <nama-fitur>
disable-model-invocation: true
context: fork
agent: qa-reviewer
---

# /review — Independent Feature Review

Melakukan review independen dan read-only terhadap implementasi berdasarkan specification.

## Usage

```
/review <nama-fitur>
```

## Prerequisites

1. Spec harus ada: `docs/workflow/specs/<nama-fitur>.md`
2. Implementation sudah selesai (build complete)

## Aturan Reviewer

1. **Bersifat read-only** — tidak boleh Edit atau Write source.
2. Jangan memperbaiki temuan.
3. Jangan mengubah assertion.
4. Jalankan command non-watch only.
5. Jangan gunakan database development atau production.
6. Laporkan bukti: file, baris, output command, expected, actual.
7. Berikan PASS hanya jika seluruh acceptance criteria critical terpenuhi.
8. UI terlihat bagus **bukan** bukti feature functional.
9. HTTP 200 saja **bukan** bukti data tersimpan benar.
10. Menu tersembunyi **bukan** bukti backend authorization aman.

## Checklist Review

### Functional
- [ ] Kesesuaian dengan spec
- [ ] Seluruh acceptance criteria (Given–When–Then)
- [ ] Loading state
- [ ] Empty state
- [ ] Success state
- [ ] Error state
- [ ] Data integrity

### Security & RBAC
- [ ] Backend authorization middleware
- [ ] Frontend route guard
- [ ] Role permission enforcement
- [ ] No data exposure to unauthorized roles

### Validation & Error
- [ ] Input validation (frontend + backend)
- [ ] Error handling
- [ ] No silent failures

### Testing
- [ ] Backend targeted tests pass
- [ ] Frontend targeted tests pass
- [ ] E2E critical path passes
- [ ] No test.only
- [ ] No disabled critical tests

### Browser & Network
- [ ] No browser console errors
- [ ] Network requests correct
- [ ] Response data correct

### Quality
- [ ] No dummy data
- [ ] No secrets exposed
- [ ] No localhost hardcoded in production paths
- [ ] No UI-only buttons (non-functional)

## Review Output Format

```markdown
# Review: <feature>

Verdict: PASS | FAIL | BLOCKED
Cycle: <n>
Specification: docs/workflow/specs/<feature>.md
Files reviewed: <list>

## Acceptance Criteria
| # | Criteria | Result | Evidence |
|---|----------|--------|----------|
| 1 | ... | PASS/FAIL | ... |

## Functional Findings
## Security Findings
## Data Integrity Findings
## UI/UX Findings
## Test Results
## Regression Risks
## Blocking Issues
## Non-blocking Issues
## Required Fixes (numbered)

## Final Verdict
```

## Result Actions

### PASS
- Update `docs/workflow/FEATURE_MATRIX.md` — status = READY
- Update `docs/workflow/CURRENT_TASK.md`
- Simpan hasil ke `docs/workflow/reviews/<nama-fitur>-cycle-<n>.md`
- **Berhenti**

### FAIL
- Update `docs/workflow/FEATURE_MATRIX.md` — status = REVIEW_FAILED
- Buat daftar **Required Fixes** bernomor
- Simpan hasil ke `docs/workflow/reviews/<nama-fitur>-cycle-<n>.md`
- **Jangan memperbaiki source**
- **Berhenti**

### BLOCKED
- Update `docs/workflow/FEATURE_MATRIX.md` — status = BLOCKED
- Jelaskan blocker spesifik
- Jangan menebak hasil
- Simpan hasil ke `docs/workflow/reviews/<nama-fitur>-cycle-<n>.md`
- **Berhenti**

## Cycle Tracking

Review cycle di-track sebagai `-cycle-<n>` dalam nama file:
- `auth-login-cycle-1.md`
- `auth-login-cycle-2.md`
- `auth-login-cycle-3.md`
