import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Get the directory of THIS file at runtime
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL;

  // If using a remote database (postgres, mysql, etc.), return as-is
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // For SQLite: determine where the database file is
  // On Vercel, files end up at /var/task/apps/backend/dist/
  // so we use import.meta.url to find our actual location
  
  // Possible locations to search for the database file
  const searchPaths = [
    // 1. dist/prisma/dev.db (copied during vercel-build)
    path.resolve(__dirname, '..', 'prisma', 'dev.db'),
    // 2. Standard local dev: prisma/dev.db relative to CWD
    path.resolve(process.cwd(), 'prisma', 'dev.db'),
    // 3. Nested: prisma/prisma/dev.db
    path.resolve(process.cwd(), 'prisma', 'prisma', 'dev.db'),
    // 4. Vercel monorepo: apps/backend/prisma/dev.db
    path.resolve(process.cwd(), 'apps', 'backend', 'prisma', 'dev.db'),
    // 5. Vercel monorepo dist: apps/backend/dist/prisma/dev.db
    path.resolve(process.cwd(), 'apps', 'backend', 'dist', 'prisma', 'dev.db'),
  ];

  console.log(`[db] __dirname: ${__dirname}`);
  console.log(`[db] cwd: ${process.cwd()}`);

  // Find the first existing database file
  let dbPath: string | null = null;
  for (const p of searchPaths) {
    const exists = fs.existsSync(p);
    console.log(`[db] checking: ${p} (exists: ${exists})`);
    if (exists) {
      dbPath = p;
      break;
    }
  }

  if (!dbPath) {
    console.error(`[db] ERROR: No database file found in any search path!`);
    // Fallback to standard path (will create empty db)
    dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  }

  console.log(`[db] Using database at: ${dbPath} (${fs.existsSync(dbPath) ? fs.statSync(dbPath).size + 'b' : 'NOT FOUND'})`);

  // On Vercel RUNTIME: copy to /tmp for write access
  if (process.env.VERCEL && !process.env.VERCEL_BUILD) {
    const tmpPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpPath) || fs.statSync(tmpPath).size === 0) {
      console.log(`[db] Vercel RUNTIME: copying to ${tmpPath}...`);
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, tmpPath);
        console.log(`[db] Copied successfully (${fs.statSync(tmpPath).size} bytes)`);
      }
    }
    return `file:${tmpPath}`;
  }

  return `file:${dbPath}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
