import { describe, it, expect } from 'vitest';

// TDD: Tests written FIRST for getProductImage
// Run: cd apps/frontend && npm test
//
// Implementation: src/lib/productImages.ts
// Resolution order: specific flavor -> generic fallback

describe('getProductImage — Formula 1 Shakes', () => {
  const base = '/menu/';

  it('maps Vanilla to formula-1-vanilla.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Vanilla')).toBe(`${base}formula-1-vanilla.png`);
  });

  it('maps Chocolate to formula-1-chocolate.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Chocolate')).toBe(`${base}formula-1-chocolate.png`);
  });

  it('maps Dutch Chocolate to formula-1-chocolate.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Dutch Chocolate')).toBe(`${base}formula-1-chocolate.png`);
  });

  it('maps Cookies & Cream to formula-1-cookies-and-cream.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Cookies & Cream')).toBe(`${base}formula-1-cookies-and-cream.png`);
  });

  it('maps Mango to formula-1-mango.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Mango')).toBe(`${base}formula-1-mango.png`);
  });

  it('maps Orange Cream to formula-1-orange-cream.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Orange Cream')).toBe(`${base}formula-1-orange-cream.png`);
  });

  it('maps Banana to formula-1-banana.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Banana')).toBe(`${base}formula-1-banana.png`);
  });

  it('maps Strawberry to formula-1-wild-berry.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Strawberry')).toBe(`${base}formula-1-wild-berry.png`);
  });

  it('maps Coffee to formula-1-chocolate.png (coffee fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Coffee')).toBe(`${base}formula-1-chocolate.png`);
  });

  it('maps Cafe Latte to formula-1-chocolate.png (coffee fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Cafe Latte')).toBe(`${base}formula-1-chocolate.png`);
  });

  it('maps Mocha to formula-1-chocolate.png (coffee fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Mocha')).toBe(`${base}formula-1-chocolate.png`);
  });

  it('maps Pina Colada to formula-1-banana.png (tropical fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Pina Colada')).toBe(`${base}formula-1-banana.png`);
  });

  it('maps Tropical Fruit to formula-1-banana.png (tropical fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Tropical Fruit')).toBe(`${base}formula-1-banana.png`);
  });

  it('maps Berry Bliss to formula-1-wild-berry.png (berry fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Formula 1 Shake Berry Bliss')).toBe(`${base}formula-1-wild-berry.png`);
  });
});

describe('getProductImage — Tea Mix', () => {
  const base = '/menu/';

  it('maps Tea Mix Original to herbal-tea-original.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Tea Mix Original')).toBe(`${base}herbal-tea-original.png`);
  });

  it('maps Tea Mix Lemon to herbal-tea-concentrate-lemon.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Tea Mix Lemon')).toBe(`${base}herbal-tea-concentrate-lemon.png`);
  });

  it('maps Tea Mix Peach to herbal-tea-concentrate-peach.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Tea Mix Peach')).toBe(`${base}herbal-tea-concentrate-peach.png`);
  });

  it('maps Tea Mix Raspberry to herbal-tea-concentrate-raspberry.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Tea Mix Raspberry')).toBe(`${base}herbal-tea-concentrate-raspberry.png`);
  });

  it('maps Tea Mix Mint to herbal-tea-original.png (mint fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Tea Mix Mint')).toBe(`${base}herbal-tea-original.png`);
  });

  it('maps Tea Mix Green to herbal-tea-original.png (green fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Tea Mix Green')).toBe(`${base}herbal-tea-original.png`);
  });

  it('maps Tea Mix Ginger to herbal-tea-original.png (ginger fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Tea Mix Ginger')).toBe(`${base}herbal-tea-original.png`);
  });

  it('maps Tea Mix Hibiscus to herbal-tea-original.png (hibiscus fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Tea Mix Hibiscus')).toBe(`${base}herbal-tea-original.png`);
  });

  it('maps Tea Mix Cinnamon to herbal-tea-original.png (cinnamon fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Tea Mix Cinnamon')).toBe(`${base}herbal-tea-original.png`);
  });
});

describe('getProductImage — Protein Bars', () => {
  const base = '/menu/';

  it('maps Protein Bar Chocolate to protein-bar-chocolate-peanut.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Protein Bar Chocolate')).toBe(`${base}protein-bar-chocolate-peanut.png`);
  });

  it('maps Protein Bar Peanut to protein-bar-chocolate-peanut.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Protein Bar Peanut')).toBe(`${base}protein-bar-chocolate-peanut.png`);
  });

  it('maps Protein Bar Vanilla Almond to protein-bar-vanilla-almond.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Protein Bar Almond')).toBe(`${base}protein-bar-vanilla-almond.png`);
  });

  it('maps Protein Bar Citrus Lemon to protein-bar-citrus-lemon.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Protein Bar Lemon')).toBe(`${base}protein-bar-citrus-lemon.png`);
  });

  it('maps Protein Bar Caramel to protein-bar-vanilla-almond.png (caramel fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Protein Bar Caramel')).toBe(`${base}protein-bar-vanilla-almond.png`);
  });

  it('maps Protein Bar Coconut to protein-bar-vanilla-almond.png (coconut fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Protein Bar Coconut')).toBe(`${base}protein-bar-vanilla-almond.png`);
  });
});

describe('getProductImage — Supplements & Others', () => {
  const base = '/menu/';

  it('maps Personalized Protein Powder to protein-powder.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Personalized Protein Powder')).toBe(`${base}protein-powder.png`);
  });

  it('maps Personalized Protein Powder Chocolate to protein-powder.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Personalized Protein Powder Chocolate')).toBe(`${base}protein-powder.png`);
  });

  it('maps Personalized Protein Powder Vanilla to protein-powder.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Personalized Protein Powder Vanilla')).toBe(`${base}protein-powder.png`);
  });

  it('maps Cell-U-Loss to cell-u-loss.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Cell-U-Loss')).toBe(`${base}cell-u-loss.png`);
  });

  it('maps Cell-U-Loss Advanced to cell-u-loss.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Cell-U-Loss Advanced')).toBe(`${base}cell-u-loss.png`);
  });

  it('maps Xtra-Cal to xtra-cal.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Xtra-Cal')).toBe(`${base}xtra-cal.png`);
  });

  it('maps Xtra-Cal Advanced to xtra-cal.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Xtra-Cal Advanced')).toBe(`${base}xtra-cal.png`);
  });

  it('maps Calcium Plus to calcium-plus.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Calcium Plus')).toBe(`${base}calcium-plus.png`);
  });

  it('maps Multivitamin to multivitamin.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Multivitamin')).toBe(`${base}multivitamin.png`);
  });

  it('maps Multivitamin Plus to multivitamin.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Multivitamin Plus')).toBe(`${base}multivitamin.png`);
  });

  it('maps Active Fiber Complex to active-fiber.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Active Fiber Complex')).toBe(`${base}active-fiber.png`);
  });

  it('maps Active Fiber Complex Plus to active-fiber.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Active Fiber Complex Plus')).toBe(`${base}active-fiber.png`);
  });

  it('maps Prolessa Duo to prolessa-duo.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Prolessa Duo')).toBe(`${base}prolessa-duo.png`);
  });

  it('maps Prolessa Duo Advanced to prolessa-duo-advanced.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Prolessa Duo Advanced')).toBe(`${base}prolessa-duo-advanced.png`);
  });

  it('maps Immune Booster to immune-booster.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Immune Booster')).toBe(`${base}immune-booster.png`);
  });

  it('maps Herbal Concentrate to herbal-concentrate.png', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Herbal Concentrate')).toBe(`${base}herbal-concentrate.png`);
  });

  it('maps Omega-3 to herbal-tea-original.png (generic supplement fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Omega-3')).toBe(`${base}herbal-tea-original.png`);
  });

  it('maps CoQ10 to herbal-tea-original.png (generic supplement fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife CoQ10')).toBe(`${base}herbal-tea-original.png`);
  });

  it('maps Chromium to herbal-tea-original.png (generic supplement fallback)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Chromium')).toBe(`${base}herbal-tea-original.png`);
  });

  it('maps Niteworks to herbal-tea-original.png (no specific image)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Niteworks')).toBe(`${base}herbal-tea-original.png`);
  });

  it('maps Niteworks Plus to herbal-tea-original.png (no specific image)', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife Niteworks Plus')).toBe(`${base}herbal-tea-original.png`);
  });
});

describe('getProductImage — Case Insensitivity', () => {
  const base = '/menu/';

  it('handles lowercase product names', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('herbalife formula 1 shake vanilla')).toBe(`${base}formula-1-vanilla.png`);
  });

  it('handles mixed case product names', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Herbalife FORMULA 1 SHAKE CHOCOLATE')).toBe(`${base}formula-1-chocolate.png`);
  });

  it('handles product names with extra spaces', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('  Herbalife  Formula  1  Shake  Vanilla  ')).toBe(`${base}formula-1-vanilla.png`);
  });
});

describe('getProductImage — Fallback', () => {
  const base = '/menu/';

  it('returns generic fallback for unknown products', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('Unknown Product XYZ')).toBe(`${base}generic-product.svg`);
  });

  it('returns generic fallback for empty string', async () => {
    const { getProductImage } = await import('../lib/productImages');
    expect(getProductImage('')).toBe(`${base}generic-product.svg`);
  });
});
