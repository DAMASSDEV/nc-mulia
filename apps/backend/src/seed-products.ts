import 'dotenv/config';
import { prisma } from './lib/db.js';
import { Prisma } from '@prisma/client';
import { herbalifeProducts } from './data/herbalife-products.js';
import { getProductImage } from './data/productImages.js';

async function seed() {
  console.log(`Seeding ${herbalifeProducts.length} products...`);

  let created = 0;
  let updated = 0;

  for (const product of herbalifeProducts) {
    const imageUrl = getProductImage(product.name);

    const existing = await prisma.product.findFirst({ where: { name: product.name } });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          category: product.category,
          description: product.description,
          imageUrl,
          isAvailable: true,
          isActive: true,
        },
      });
      updated++;
    } else {
      await prisma.product.create({
        data: {
          name: product.name,
          category: product.category,
          description: product.description,
          price: new Prisma.Decimal(product.basePrice),
          imageUrl,
          isAvailable: true,
          isMemberDiscountEligible: true,
          isActive: true,
        },
      });
      created++;
    }
  }

  console.log(`Done: ${created} created, ${updated} updated.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
