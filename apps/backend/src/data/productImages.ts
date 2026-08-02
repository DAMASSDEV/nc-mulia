const MENU = "/menu/";

export function getProductImage(productName: string): string {
  const n = productName.toLowerCase().replace(/\s+/g, ' ').trim();

  if (n.includes("formula 1 shake")) {
    if (n.includes("vanilla")) return `${MENU}formula-1-vanilla.png`;
    if (n.includes("chocolate") || n.includes("dutch chocolate")) return `${MENU}formula-1-chocolate.png`;
    if (n.includes("orange cream") || n.includes("orange-cream")) return `${MENU}formula-1-orange-cream.png`;
    if (n.includes("cookies") || (n.includes("cream") && !n.includes("orange"))) return `${MENU}formula-1-cookies-and-cream.png`;
    if (n.includes("mango")) return `${MENU}formula-1-mango.png`;
    if (n.includes("banana")) return `${MENU}formula-1-banana.png`;
    if (n.includes("strawberry")) return `${MENU}formula-1-wild-berry.png`;
    if (n.includes("coffee") || n.includes("cafe") || n.includes("latte") || n.includes("mocha")) return `${MENU}formula-1-chocolate.png`;
    if (n.includes("pina colada") || n.includes("tropical")) return `${MENU}formula-1-banana.png`;
    if (n.includes("berry")) return `${MENU}formula-1-wild-berry.png`;
  }

  if (n.includes("tea mix") || n.includes("herbal tea")) {
    if (n.includes("original")) return `${MENU}herbal-tea-original.png`;
    if (n.includes("lemon")) return `${MENU}herbal-tea-concentrate-lemon.png`;
    if (n.includes("raspberry")) return `${MENU}herbal-tea-concentrate-raspberry.png`;
    if (n.includes("peach")) return `${MENU}herbal-tea-concentrate-peach.png`;
    if (n.includes("mint")) return `${MENU}herbal-tea-original.png`;
    if (n.includes("hibiscus") || n.includes("ginger") || n.includes("cinnamon") || n.includes("green")) {
      return `${MENU}herbal-tea-original.png`;
    }
  }

  if (n.includes("herbal concentrate") || n.includes("herbalifeline")) {
    return `${MENU}herbal-concentrate.png`;
  }

  if (n.includes("protein bar")) {
    if (n.includes("chocolate") || n.includes("peanut")) return `${MENU}protein-bar-chocolate-peanut.png`;
    if (n.includes("vanilla") || n.includes("almond")) return `${MENU}protein-bar-vanilla-almond.png`;
    if (n.includes("citrus") || n.includes("lemon")) return `${MENU}protein-bar-citrus-lemon.png`;
    if (n.includes("caramel") || n.includes("coconut")) return `${MENU}protein-bar-vanilla-almond.png`;
    return `${MENU}protein-bar-vanilla-almond.png`;
  }

  if (n.includes("protein powder") || n.includes("personalized protein")) {
    return `${MENU}protein-powder.png`;
  }

  if (n.includes("cell-u-loss")) return `${MENU}cell-u-loss.png`;

  if (n.includes("xtra-cal") || n.includes("extra-cal")) return `${MENU}xtra-cal.png`;
  if (n.includes("calcium plus")) return `${MENU}calcium-plus.png`;

  if (n.includes("multivitamin")) return `${MENU}multivitamin.png`;

  if (n.includes("active fiber")) return `${MENU}active-fiber.png`;

  if (n.includes("nitework")) return `${MENU}herbal-tea-original.png`;

  if (n.includes("prolessa duo")) {
    if (n.includes("advanced")) return `${MENU}prolessa-duo-advanced.png`;
    return `${MENU}prolessa-duo.png`;
  }

  if (n.includes("omega-3") || n.includes("omega 3")) return `${MENU}herbal-tea-original.png`;
  if (n.includes("coq10") || n.includes("co q10")) return `${MENU}herbal-tea-original.png`;
  if (n.includes("chromium")) return `${MENU}herbal-tea-original.png`;

  if (n.includes("immune booster")) return `${MENU}immune-booster.png`;

  if (n.includes("snack defense")) return `${MENU}snack-defense.png`;

  if (n.includes("express bar")) return `${MENU}f1-express-bar.png`;

  return `${MENU}generic-product.svg`;
}
