---
name: spec
description: Menganalisis satu fitur NC MULIA dan membuat specification serta acceptance criteria tanpa mengubah source production.
argument-hint: <nama-fitur>
disable-model-invocation: true
---

# /spec — Feature Specification

Menganalisis dan mendokumentasikan satu fitur NC MULIA.

## Usage

```
/spec <nama-fitur>
```

Contoh: `/spec cart-checkout`

## Aturan

1. Hanya mengerjakan **satu fitur** per invocation.
2. **Tidak boleh** mengubah source production.
3. **Boleh** membaca: source frontend, source backend, Prisma schema, migration, API, test, dokumentasi.
4. Identifikasi **existing behavior** sebelum merancang perubahan.
5. Jangan mendesain ulang sistem tanpa alasan kuat.
6. Jangan mengarang endpoint atau model yang sudah tersedia.
7. Simpan spec ke: `docs/workflow/specs/<nama-fitur>.md`

## Spec Template

Setiap spec wajib содержит следующие разделы:

```markdown
# Feature: <nama-fitur>

## 1. Feature
## 2. Current Behavior
## 3. Problem (jika ada)
## 4. User Roles
## 5. Business Rules
## 6. UI Requirements
## 7. Backend Requirements
## 8. API Contract
## 9. Database Impact
## 10. Authorization Matrix
## 11. Validation Rules
## 12. Error Handling
## 13. Acceptance Criteria (Given–When–Then)
## 14. Test Matrix
## 15. Files Expected to Change
## 16. Out of Scope
## 17. Risks
## 18. Rollback Consideration
```

## After Completion

1. Update `docs/workflow/FEATURE_MATRIX.md` — set spec column = SPEC_READY
2. Update `docs/workflow/CURRENT_TASK.md`
3. Tampilkan ringkasan:
   - Feature name
   - Spec path
   - Key acceptance criteria
   - Files expected to change
4. **Berhenti** — jangan menjalankan /build otomatis

## Jika Fitur Tidak Ditemukan

- Tampilkan `BLOCKED`
- Jelaskan informasi yang kurang
- **Jangan menebak**

## Jika Requirement Ambgu

- Tampilkan `BLOCKED`
- Identifikasi ambiguitas spesifik
- Minta klarifikasi sebelum melanjutkan
