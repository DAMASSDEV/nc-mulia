import { prisma } from '../lib/db.js';

async function main() {
  const result = await prisma.product.updateMany({
    data: {
      isAvailable: true,
      isActive: true,
      stock: 100,
    },
  });
  console.log(`Berhasil mengelola ${result.count} produk di database.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
