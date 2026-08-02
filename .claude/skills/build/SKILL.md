---
name: build
description: Mengimplementasikan satu specification yang sudah berstatus SPEC_READY dan menjalankan validasi terarah.
argument-hint: <nama-fitur>
disable-model-invocation: true
---

# /build — Feature Implementation

Mengimplementasikan satu specification yang sudah berstatus SPEC_READY.

## Usage

```
/build <nama-fitur>
```

## Prerequisites

1. Spec harus ada di `docs/workflow/specs/<nama-fitur>.md`
2. Status fitur wajib: **SPEC_READY** atau **REVIEW_FAILED**

## Aturan

1. Jangan implementasikan fitur tanpa spec.
2. Hanya ubah file yang relevan dengan fitur tersebut.
3. Jangan refactor modul lain.
4. Jangan deploy atau push ke main.
5. Jangan jalankan test dalam watch mode.
6. Jangan jalankan seluruh test suite sebelum targeted test berhasil.
7. Jangan mengubah test hanya supaya hijau.
8. Jangan memperlemah assertion.
9. Jangan gunakan: `test.skip`, `describe.skip`, `test.only`, `expect(true).toBe(true)`, `@ts-ignore`, `@ts-expect-error`, `as any` massal.
10. Jangan gunakan database production.
11. Jangan jalankan `prisma migrate reset` atau destructive db push.
12. Jangan membunuh semua process Node.

## Urutan Pelaksanaan

### 1. Baca Spec
Baca `docs/workflow/specs/<nama-fitur>.md` secara lengkap.

### 2. Baca Review (jika REVIEW_FAILED)
Jika status = REVIEW_FAILED, baca `docs/workflow/reviews/<nama-fitur>-cycle-<n>.md` untuk required fixes.

### 3. Tampilkan Implementation Plan
Sebelum mengubah file, tampilkan:
- File yang akan diubah
- Urutan perubahan
- Test yang akan dijalankan

### 4. Implementasi
Lakukan perubahan terkecil yang mungkin. Iterate cepat.

### 5. Validasi Bertahap

```
a. Backend targeted test
b. Frontend targeted test
c. Build package yang tersentuh
d. E2E fitur (jika ada)
```

### 6. Update Status
- `docs/workflow/FEATURE_MATRIX.md` — set build column
- `docs/workflow/CURRENT_TASK.md` — update current task

## Batas Perbaikan

- **Maksimal 3 percobaan** terhadap failure yang sama.
- Setiap percobaan harus memiliki **root cause berbeda** atau **bukti baru**.
- Setelah 3 kali gagal: status = **BLOCKED**.

## Klasifikasi Failure

| Kode | Tipe | Aksi |
|---|---|---|
| A | Bug production | Dokumentasikan, perbaiki root cause |
| B | Test salah | Perbaiki assertion, bukan source |
| C | Mock salah | Perbaiki mock/fixture |
| D | Fixture salah | Perbaiki data test |
| E | Database test belum siap | Siapkan dulu, jangan dilanjutkan |
| F | Environment conflict | Selidiki dan resolve |
| G | Requirement tidak jelas | STOP, jangan menebak |

## Jika Source Production Perlu Diubah Karena Bug

- Dokumentasikan root cause
- Jangan sekadar menyesuaikan implementasi dengan assertion yang keliru

## Jika Spec Tidak Ditemukan

```
ERROR: Spec not found for "<nama-fitur>"
Run: /spec <nama-fitur>  first
```

## Jika Status Salah

```
ERROR: Feature "<nama-fitur>" has status <current-status>
Expected: SPEC_READY or REVIEW_FAILED
```

## After Completion

Tampilkan:
- Files changed
- Tests run
- Build result
- Next action (usually /review)
