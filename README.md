# NC MULIA - Konsultasi Nutrisi & Kesehatan

Aplikasi web full-stack untuk platform konsultasi nutrisi dan kesehatan berbasis produk Herbalife.

## Tech Stack

**Backend:** Express.js + TypeScript + Prisma ORM + MySQL + Socket.IO
**Frontend:** React 19 + Vite + Tailwind CSS v4 + Framer Motion

## Struktur Direktori

```
apps/
  backend/          # Express API (port 3000)
    src/
      modules/      # Feature modules (auth, users, products, cart, transactions, payments, memberships, bmi, consultations, chat)
      middleware/   # auth, error, rateLimit
      socket/       # Socket.IO setup
  frontend/         # React SPA (port 5173)
    src/
      pages/        # User & admin pages
      components/   # UI & layout components
      contexts/     # CartContext
      lib/          # api, bmi, formatters, recommendations
      data/         # Product catalog
```

## Setup Cepat

1. Buat database MySQL: `nc_mulia`
2. Copy `.env.example` ke `.env` di `apps/backend/` dan sesuaikan `DATABASE_URL`
3. `npm install`
4. `cd apps/backend && npx prisma migrate dev --name init`
5. `npm run seed:admin` (opsional, buat admin default)
6. `npm run dev:all`

Lihat [docs/RUNNING.md](docs/RUNNING.md) untuk panduan lengkap.

## Menu Admin

- Overview
- Pengguna
- Produk
- Transaksi
- Pembayaran
- BMI
- Konsultasi
- Live Chat

## User Menu

- Dashboard
- Konsultasi
- Hitung BMI
- Produk
- Keranjang
- Pembayaran
- Riwayat Saya
- Live Chat
- Lokasi

## Role & Membership

- **Role:** `admin` | `user` (otentikasi)
- **Membership:** `regular` | `member` (diskon 30%)
- Member tidak adalah role. Diskon berlaku untuk produk eligible saat membership aktif.

## Scripts

```bash
npm run dev:frontend    # Frontend dev server
npm run dev:backend    # Backend dev server
npm run dev:all        # Keduanya
npm run build          # Build semua
npm run lint           # Lint semua
npm run verify         # Lint + build
```

Lihat [docs/](docs/) untuk dokumentasi lengkap.
