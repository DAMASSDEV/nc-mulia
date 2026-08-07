import { prisma } from '../../lib/db.js';
import { getMemberDiscountRate } from '../pricing/index.js';

export class CartService {
  private async isMemberActive(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { membershipStatus: true, membershipExpiresAt: true, isActive: true } });
    if (!user || !user.isActive) return false;
    return user.membershipStatus === 'MEMBER' && (!user.membershipExpiresAt || user.membershipExpiresAt > new Date());
  }

  private async formatCartItems(userId: string, productIds: string[]) {
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
    const productMap = new Map(products.map(p => [p.id, p]));
    const isMember = await this.isMemberActive(userId);
    const discountRate = isMember ? await getMemberDiscountRate() : 0;

    return productIds
      .filter(id => productMap.has(id))
      .map(id => {
        const product = productMap.get(id)!;
        const price = typeof product.price === 'number' ? product.price : Number(product.price);
        const discountPercentage = isMember && product.isMemberDiscountEligible ? discountRate * 100 : 0;
        const discountAmount = Math.round(price * discountPercentage / 100);
        const finalUnitPrice = price - discountAmount;
        return { productId: product.id, productName: product.name, imageUrl: product.imageUrl, price, discountPercentage, discountAmount, finalUnitPrice };
      });
  }

  async getCart(userId: string) {
    const cart = await prisma.cartItem.findUnique({ where: { userId }, include: { items: true } });
    if (!cart || cart.items.length === 0) return [];

    const productIds = cart.items.map(i => i.productId);
    const items = await this.formatCartItems(userId, productIds);
    const qtyMap = new Map(cart.items.map(i => [i.productId, i.quantity]));

    return items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      imageUrl: i.imageUrl,
      quantity: qtyMap.get(i.productId) ?? 1,
      basePrice: i.price,
      discountPercentage: i.discountPercentage,
      discountAmount: i.discountAmount,
      finalUnitPrice: i.finalUnitPrice,
      subtotal: i.finalUnitPrice * (qtyMap.get(i.productId) ?? 1),
    }));
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) { const err: any = new Error('Produk tidak ditemukan atau tidak tersedia.'); err.statusCode = 404; throw err; }

    let cart = await prisma.cartItem.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cartItem.create({ data: { userId, items: { create: { productId, quantity } } }, include: { items: true } });
    } else {
      const existing = await prisma.cartProduct.findUnique({ where: { cartItemId_productId: { cartItemId: cart.id, productId } } });
      if (existing) {
        await prisma.cartProduct.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
      } else {
        await prisma.cartProduct.create({ data: { cartItemId: cart.id, productId, quantity } });
      }
    }
    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    const cart = await prisma.cartItem.findUnique({ where: { userId } });
    if (!cart) { const err: any = new Error('Keranjang kosong.'); err.statusCode = 404; throw err; }
    const existing = await prisma.cartProduct.findUnique({ where: { cartItemId_productId: { cartItemId: cart.id, productId } } });
    if (!existing) { const err: any = new Error('Item tidak ditemukan di keranjang.'); err.statusCode = 404; throw err; }
    await prisma.cartProduct.update({ where: { id: existing.id }, data: { quantity } });
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await prisma.cartItem.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartProduct.deleteMany({ where: { cartItemId: cart.id, productId } });
    }
    return this.getCart(userId);
  }

  async clear(userId: string) {
    await prisma.cartItem.deleteMany({ where: { userId } });
    return [];
  }
}
