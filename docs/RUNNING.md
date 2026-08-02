# Menjalankan NC MULIA

## Prasyarat

- Node.js 18+
- MySQL 8+ (server, bukan hanya Workbench)

## 1. Install MySQL Server

Jika belum punya MySQL Server:

**Opsi A — Download langsung:**
```
https://dev.mysql.com/downloads/mysql/
```
Pilih: Windows (x86, 64-bit), mysql-installer-community
- Pilih "Server Only" atau "Full"
- Port: 3306
- Set root password, catat

**Opsi B — XAMPP:**
Start Apache + MySQL dari XAMPP Control Panel

---

## 2. Buat Database

```sql
CREATE DATABASE nc_mulia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 3. Setup Environment

```bash
cd apps/backend
cp .env.example .env   # (jika belum ada .env)
```

Edit `apps/backend/.env` — sudah include contoh:

```env
DATABASE_URL="mysql://root:password123@127.0.0.1:3306/nc_mulia"
JWT_SECRET="nc-mulia-jwt-secret-key-min-32-chars-2024"
JWT_EXPIRES_IN="7d"
PAYMENT_SIMULATION_ENABLED="true"
FRONTEND_URL="http://localhost:5173"
SEED_ADMIN_NAME=Admin
SEED_ADMIN_EMAIL=admin@nc-mulia.com
SEED_ADMIN_PASSWORD=password
SEED_USER_NAME=Syam
SEED_USER_EMAIL=syam@nc-mulia.com
SEED_USER_PASSWORD=password
```

---

## 4. Install Dependencies

```bash
npm install
```

---

## 5. Jalankan Migration

```bash
cd apps/backend
npx prisma migrate dev --name init
```

Ini akan membuat semua tabel di database.

---

## 6. Seed RBAC + Admin User

```bash
npm run seed:admin
```

Ini membuat:
- 3 roles: Super Admin, Admin, User
- 38 permissions
- 12 navigation items
- 1 admin user

---

## 7. (Opsional) Seed Products

```bash
npm run seed:products
```

---

## 8. Jalankan Aplikasi

**Mode development (dua terminal):**

```bash
# Terminal 1 — Backend
npm run dev:backend

# Terminal 2 — Frontend
npm run dev:frontend
```

**Atau keduanya sekaligus:**

```bash
npm run dev:all
```

---

## Akses

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

**Login Admin:**
- Email: `admin@nc-mulia.com`
- Password: `password`

**Login Member (demo):**
- Email: `syam@nc-mulia.com`
- Password: `password`

---

## Google Maps (Opsional)

Untuk enable Google Maps autocomplete dan interactive map:

1. Dapatkan API key dari https://console.cloud.google.com/apis/credentials
2. Enable: Maps JavaScript API + Places API
3. Tambahkan ke `apps/frontend/.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
   ```

Tanpa API key, map tetap tampil sebagai iframe fallback (static, no autocomplete).

---

## Troubleshooting

**MySQL connection refused:**
- Pastikan MySQL Server service sedang berjalan
- Cek port 3306 tidak dipakai aplikasi lain

**Prisma generate error:**
```bash
cd apps/backend
npx prisma generate
```

**Reset database:**
```bash
cd apps/backend
npx prisma migrate reset
# WARNING: menghapus semua data!
```
