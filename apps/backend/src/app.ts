import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { prisma } from './lib/db.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import { authRoutes } from './modules/auth/index.js';
import { userProfileRoutes, adminUserRoutes } from './modules/users/index.js';
import { productsRoutes } from './modules/products/index.js';
import { cartRoutes } from './modules/cart/index.js';
import { transactionRoutes } from './modules/transactions/index.js';
import { paymentRoutes } from './modules/payments/index.js';
import { membershipRoutes } from './modules/memberships/index.js';
import { statsRoutes } from './modules/stats/index.js';
import { bmiRoutes } from './modules/bmi/index.js';
import { consultationRoutes } from './modules/consultations/index.js';
import { chatRoutes } from './modules/chat/index.js';
import { locationsRoutes, adminLocationsRoutes } from './modules/locations/index.js';
import rbacRoutes from './modules/rbac/index.js';
import auditRoutes from './modules/audit/index.js';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Parse FRONTEND_URL as comma-separated list of allowed origins
    const allowed = env.FRONTEND_URL.split(',').map(u => u.trim());
    
    // Also allow any Vercel preview URLs for this project
    if (
      allowed.some(u => origin === u) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'OK', data: { timestamp: new Date().toISOString() } });
});

// Temporary debug endpoint to diagnose Vercel database issues
app.get('/api/debug/db', async (_req, res) => {
  const path = await import('path');
  const fs = await import('fs');
  
  const cwd = process.cwd();
  const prismaDir = path.default.resolve(cwd, 'prisma');
  
  const listFiles = (dir: string, prefix = ''): string[] => {
    try {
      const entries = fs.default.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const e of entries) {
        const full = path.default.join(dir, e.name);
        const stat = fs.default.statSync(full);
        if (e.isDirectory()) {
          files.push(`${prefix}${e.name}/`);
          files.push(...listFiles(full, `${prefix}${e.name}/`));
        } else {
          files.push(`${prefix}${e.name} (${stat.size}b)`);
        }
      }
      return files;
    } catch (err: any) {
      return [`ERROR: ${err.message}`];
    }
  };
  
  // Check database tables
  let tables: string[] = [];
  try {
    const result = await prisma.$queryRawUnsafe<Array<{name: string}>>(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    tables = result.map((r: any) => r.name);
  } catch (err: any) {
    tables = [`ERROR: ${err.message}`];
  }
  
  res.json({
    success: true,
    data: {
      cwd,
      env: {
        DATABASE_URL: process.env.DATABASE_URL,
        VERCEL: process.env.VERCEL,
        VERCEL_BUILD: process.env.VERCEL_BUILD,
        NODE_ENV: process.env.NODE_ENV,
      },
      prismaDir: {
        exists: fs.default.existsSync(prismaDir),
        files: listFiles(prismaDir),
      },
      tmpDir: {
        devDbExists: fs.default.existsSync('/tmp/dev.db'),
        devDbSize: fs.default.existsSync('/tmp/dev.db') ? fs.default.statSync('/tmp/dev.db').size : 0,
      },
      rootFiles: listFiles(cwd).slice(0, 30),
      tables,
    },
  });
});

app.get('/api/debug/routes', (_req, res) => {
  const routes: string[] = [];
  app._router.stack.forEach((layer: any) => {
    if (layer.name === 'router') {
      routes.push(layer.regexp.source.substring(0, 60));
    }
  });
  res.json({ success: true, routes });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userProfileRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/admin/locations', adminLocationsRoutes);
app.use('/api/admin/rbac', rbacRoutes);
app.use('/api/admin/audit', auditRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
