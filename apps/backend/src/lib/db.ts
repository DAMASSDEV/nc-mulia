import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl || envUrl.startsWith('file:')) {
    // Prisma resolves file: URLs relative to schema.prisma location (prisma/ dir).
    // We mirror that: e.g. file:./dev.db → prisma/dev.db
    const schemaDir = path.resolve(process.cwd(), 'prisma');
    const relPath = envUrl ? envUrl.replace(/^file:/, '') : './dev.db';
    let dbPath = path.resolve(schemaDir, relPath);

    console.log(`[db] Resolved database path: ${dbPath} (exists: ${fs.existsSync(dbPath)})`);
    
    // On Vercel RUNTIME, the filesystem is read-only except for /tmp.
    // SQLite requires a writable directory for journal/lock files.
    // During BUILD (VERCEL_BUILD=1), filesystem is writable so skip this.
    if (process.env.VERCEL && !process.env.VERCEL_BUILD) {
      const tmpPath = '/tmp/dev.db';
      if (!fs.existsSync(tmpPath)) {
        console.log(`[db] Copying database to ${tmpPath} for writable access...`);
        if (fs.existsSync(dbPath)) {
          fs.copyFileSync(dbPath, tmpPath);
          console.log(`[db] Copy successful.`);
        } else {
          console.warn(`[db] WARNING: source database not found at ${dbPath}`);
          // Try fallback paths
          const fallbacks = [
            path.resolve(process.cwd(), 'prisma', 'dev.db'),
            path.resolve(process.cwd(), 'prisma', 'prisma', 'dev.db'),
          ];
          for (const fb of fallbacks) {
            if (fs.existsSync(fb)) {
              console.log(`[db] Found database at fallback: ${fb}`);
              fs.copyFileSync(fb, tmpPath);
              break;
            }
          }
        }
      }
      dbPath = tmpPath;
    }
    
    return `file:${dbPath}`;
  }
  return envUrl;
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
