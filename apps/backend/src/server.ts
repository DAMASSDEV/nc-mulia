import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import { prisma } from './lib/db.js';
import { initSocket } from './socket/index.js';
import { env } from './config/env.js';

async function main() {
  await prisma.$connect();
  console.log('SQLLite Connected');

  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

main().catch(err => {
  console.error('Server failed:', err);
  process.exit(1);
});
