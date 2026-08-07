import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl || envUrl.startsWith('file:')) {
    let dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
    
    // On Vercel, the filesystem is read-only except for /tmp.
    // SQLite requires a writable directory for journal/lock files.
    if (process.env.VERCEL) {
      const tmpPath = '/tmp/dev.db';
      if (!fs.existsSync(tmpPath)) {
        console.log('Copying SQLite database to /tmp/dev.db for writable access...');
        if (fs.existsSync(dbPath)) {
          fs.copyFileSync(dbPath, tmpPath);
        } else {
          console.warn(`Warning: source database not found at ${dbPath}`);
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
