---
name: workflow-status
description: Menampilkan status seluruh feature workflow tanpa melakukan perubahan.
disable-model-invocation: true
---

# /workflow-status — Workflow Status Overview

Menampilkan status seluruh feature workflow.

## Usage

```
/workflow-status
```

## Aturan

1. **Read-only** — tidak boleh mengubah source atau status.
2. Hanya membaca dan melaporkan.
3. Tidak menjalankan test, build, atau deployment.

## Output

### Summary Table

```
╔══════════════════════════════════════════════╗
║         NC MULIA SDLC Workflow Status       ║
║         Branch: chore/claude-sdlc-workflow   ║
╠══════════════════════════════════════════════╣
║  NOT_STARTED     : <n>                       ║
║  SPEC_IN_PROGRESS: <n>                      ║
║  SPEC_READY     : <n>                       ║
║  BUILD_IN_PROGRESS: <n>                     ║
║  BUILD_COMPLETE : <n>                       ║
║  REVIEW_FAILED  : <n>                       ║
║  BLOCKED        : <n>                       ║
║  READY          : <n>                       ║
╠══════════════════════════════════════════════╣
║  Total Features : 16                         ║
║  Progress       : <ready>/16 (<pct>%)        ║
╚══════════════════════════════════════════════╝
```

### Feature List

```
| Modul | Status | Cycle | Blocker |
|-------|--------|-------|---------|
| auth-registration-login | READY | - | - |
| ... | ... | ... | ... |
```

### Active Feature

Jika ada fitur sedang dikerjakan:

```
ACTIVE FEATURE: <name>
STATUS: <status>
CYCLE: <n>/3
LAST BUILD: <result>
LAST REVIEW: <result>
BLOCKERS: <list>
FILES CHANGED: <count>
```

### Recommended Next Commands

Berdasarkan status terkini:

1. Jika ada NOT_STARTED: `Run /spec <feature-name>`
2. Jika ada SPEC_READY: `Run /build <feature-name>`
3. Jika ada REVIEW_FAILED: `Run /build <feature-name>`
4. Jika ada READY >= 13: `Run /release-check`
5. Jika ada BLOCKED: Manual intervention required

### Release Gate Status

```
RELEASE GATE: <NOT_READY | READY_FOR_PREVIEW | READY_FOR_PRODUCTION_APPROVAL>
```

### Git Status Summary

```
Working tree: <clean|dirty>
Untracked files: <n>
Changed files: <n>
Branch: <name>
```

## Sources

Baca dari:
- `docs/workflow/FEATURE_MATRIX.md`
- `docs/workflow/CURRENT_TASK.md`
- `docs/workflow/RELEASE_GATE.md`
- `git status --short`
