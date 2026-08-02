---
name: feature-loop
description: Menjalankan siklus terkendali spec-build-review untuk satu fitur dengan maksimal tiga review cycle.
argument-hint: <nama-fitur>
disable-model-invocation: true
---

# /feature-loop — Feature Development Loop

Menjalankan siklus terkendali spec-build-review untuk satu fitur.

## Usage

```
/feature-loop <nama-fitur>
```

## Flow

```
/spec <feature>  →  /build <feature>  →  /review <feature>
                                              ↓
                                          PASS? → STOP (READY)
                                              ↓
                                           FAIL
                                              ↓
                                    /build <feature> (with fixes)
                                              ↓
                                    /review <feature> (cycle 2)
                                              ↓
                                          PASS? → STOP (READY)
                                              ↓
                                           FAIL
                                              ↓
                                    /build <feature> (with fixes)
                                              ↓
                                    /review <feature> (cycle 3)
                                              ↓
                                          PASS? → STOP (READY)
                                              ↓
                                           FAIL → STOP (BLOCKED)
```

## Pre-Cycle Display

Sebelum setiap cycle, tampilkan:

```
FEATURE: <name>
CURRENT STATUS: <status>
CYCLE: <n>/3
NEXT ACTION: <spec|build|review>
TESTS TO RUN: <test commands>
STOP CONDITION: <when to stop>
```

## Implementation

### Step 1 — Check Status
Baca `docs/workflow/FEATURE_MATRIX.md` untuk status fitur saat ini.

### Step 2 — Determine Next Action

| Status | Next Action |
|---|---|
| NOT_STARTED | /spec |
| SPEC_IN_PROGRESS | continue spec |
| SPEC_READY | /build |
| BUILD_IN_PROGRESS | continue build |
| BUILD_COMPLETE | /review |
| REVIEW_FAILED | /build (with fixes) |
| READY | Already done |
| BLOCKED | Stop, explain |

### Step 3 — Execute

Panggil skill yang sesuai (/spec, /build, /review) sesuai hasil langkah 2.

### Step 4 — Evaluate

Setelah review, cek result:
- **PASS** → Update status READY, berhenti
- **FAIL** → Increment cycle, jalankan /build lagi
- **BLOCKED** → Berhenti, jelaskan

### Step 5 — Repeat

Kembali ke step 1 dengan status terbaru.

## Aturan

1. **Maksimal 3 review cycle** — setelah cycle 3 tetap FAIL → BLOCKED
2. Jangan mengulang secara tidak terbatas
3. Jangan pindah ke fitur lain
4. Jangan jalankan subagent paralel
5. Jangan deploy, auto-commit, atau auto-push
6. Setiap cycle harus memperbaiki masalah berbeda (root cause berbeda)

## Aturan Subagent

1. Maksimal **satu subagent aktif** pada satu waktu
2. Jangan spawn subagent paralel
3. Tunggu subagent selesai sebelum melanjutkan

## After Loop

Tampilkan ringkasan:

```
FEATURE: <name>
FINAL STATUS: PASS | FAIL | BLOCKED
CYCLES COMPLETED: <n>
FILES CHANGED: <count>
TESTS RUN: <list>
REVIEW REPORT: docs/workflow/reviews/<feature>-cycle-<n>.md
BLOCKER: <if blocked>
NEXT COMMAND: /workflow-status
```
