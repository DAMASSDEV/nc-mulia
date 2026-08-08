import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL;

  // If using a remote database (postgres, mysql, etc.), return as-is
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // For SQLite (file: URL or no URL), resolve the database path
  // We always use prisma/dev.db as the canonical location
  const bundledDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');

  // Not on Vercel? Just return the standard path
  if (!process.env.VERCEL) {
    console.log(`[db] Local mode, using: ${bundledDbPath}`);
    return `file:${bundledDbPath}`;
  }

  // On Vercel BUILD: filesystem is writable, write directly to bundled path
  if (process.env.VERCEL_BUILD) {
    console.log(`[db] Vercel BUILD mode, writing directly to: ${bundledDbPath}`);
    return `file:${bundledDbPath}`;
  }

  // On Vercel RUNTIME: filesystem is read-only, copy to /tmp
  const tmpPath = '/tmp/dev.db';
  if (!fs.existsSync(tmpPath)) {
    // Search for the database file in known locations
    const searchPaths = [
      bundledDbPath,                                                    // prisma/dev.db
      path.resolve(process.cwd(), 'prisma', 'prisma', 'dev.db'),       // prisma/prisma/dev.db
    ];

    console.log(`[db] Vercel RUNTIME: searching for bundled database...`);
    let found = false;
    for (const searchPath of searchPaths) {
      console.log(`[db]   checking: ${searchPath} (exists: ${fs.existsSync(searchPath)})`);
      if (fs.existsSync(searchPath)) {
        fs.copyFileSync(searchPath, tmpPath);
        const stat = fs.statSync(tmpPath);
        console.log(`[db]   ✓ Copied to ${tmpPath} (${stat.size} bytes)`);
        found = true;
        break;
      }
    }

    if (!found) {
      // List all files under prisma/ for debugging
      const prismaDir = path.resolve(process.cwd(), 'prisma');
      console.error(`[db]   ✗ Database NOT FOUND in any known location!`);
      try {
        const listFiles = (dir: string, prefix = ''): string[] => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          const files: string[] = [];
          for (const e of entries) {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) files.push(...listFiles(full, `${prefix}${e.name}/`));
            else files.push(`${prefix}${e.name} (${fs.statSync(full).size}b)`);
          }
          return files;
        };
        console.error(`[db]   Files in prisma/: ${JSON.stringify(listFiles(prismaDir))}`);
      } catch { /* ignore */ }
    }
  }

  return `file:${tmpPath}`;
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
