# Database Migration & Troubleshooting

## Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Validate schema
npx prisma validate

# Check migration status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (DANGER!)
npx prisma migrate reset
```

## Error P1001 - Can't Connect to MySQL Server

```
Error: P1001: Can't reach database server at HOST:PORT
```

Penyebab: MySQL server tidak berjalan atau `HOST:PORT` salah.

Solusi:
1. Pastikan MySQL berjalan: `mysql -u root -p`
2. Cek port MySQL: `SHOW VARIABLES LIKE 'port';`
3. Periksa `DATABASE_URL` di `.env`
4. Jika pakai XAMPP/WAMP, pastikan service MySQL aktif

## Error P1002 - Database Does Not Exist

```
Error: P1002: Database nc_mulia does not exist
```

Solusi:
```sql
CREATE DATABASE nc_mulia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Error P1009 - Database Already Exists

```
Error: P1009: Database 'nc_mulia' already exists
```

Ini terjadi saat running `prisma migrate dev` berulang. Solusi:

```bash
npx prisma migrate deploy
```

Atau hapus migration yang konflik:
```bash
rm -rf apps/backend/prisma/migrations
npx prisma migrate dev --name init
```

## Error P1017 - Server Closed Connection

```
Error: P1017: Server has closed the connection
```

Solusi:
1. Pastikan `max_connections` MySQL cukup: `SHOW VARIABLES LIKE 'max_connections';`
2. Tambahkan `connection_limit` ke connection string jika perlu

## Error P2003 - Foreign Key Constraint Failed

```
Error: P2003: Foreign key constraint failed
```

Ini terjadi saat menghapus data yang masih direferensikan. Pastikan hapus child records terlebih dahulu.

## Backup Database

```bash
mysqldump -u USER -p nc_mulia > nc_mulia_backup.sql
```

Dengan drop tables terlebih dahulu:
```bash
mysqldump -u USER -p --add-drop-table nc_mulia > nc_mulia_backup.sql
```

## Restore Database

```bash
mysql -u USER -p nc_mulia < nc_mulia_backup.sql
```

## Reset & Fresh Start

```bash
cd apps/backend
npx prisma migrate reset --force
npm run seed:admin
```

## Prisma Client Not Initialized (P1003)

```
Error: P1003: Database nc_mulia does not exist
```

Jika muncul padahal database ada, coba regenerate:
```bash
npx prisma generate
```

## Format DATABASE_URL

```
mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
```

Contoh:
- Local: `mysql://root:@localhost:3306/nc_mulia`
- XAMPP: `mysql://root:@localhost:3306/nc_mulia`
- Docker: `mysql://root:password@host.docker.internal:3306/nc_mulia`
- Production: `mysql://app:SecurePassword@db.example.com:3306/nc_mulia`

## Docker MySQL

```bash
docker run --name nc_mulia_mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=nc_mulia -p 3306:3306 -d mysql:8
```

DATABASE_URL:
```env
DATABASE_URL="mysql://root:password@localhost:3306/nc_mulia"
```
