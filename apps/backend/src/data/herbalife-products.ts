import { getProductImage } from './productImages.js';

function img(name: string) { return getProductImage(name); }

export interface SeedProduct {
  name: string;
  category: string;
  description: string;
  basePrice: number;
  image: string;
}

export const herbalifeProducts: SeedProduct[] = [
  { name: "Herbalife Formula 1 Shake Vanilla", basePrice: 450000, category: "Shake", description: "Nutrisi lengkap pengganti makan", image: img("Herbalife Formula 1 Shake Vanilla") },
  { name: "Herbalife Formula 1 Shake Chocolate", basePrice: 450000, category: "Shake", description: "Rasa coklat premium", image: img("Herbalife Formula 1 Shake Chocolate") },
  { name: "Herbalife Formula 1 Shake Strawberry", basePrice: 450000, category: "Shake", description: "Rasa stroberi segar", image: img("Herbalife Formula 1 Shake Strawberry") },
  { name: "Herbalife Formula 1 Shake Banana", basePrice: 450000, category: "Shake", description: "Rasa pisang manis", image: img("Herbalife Formula 1 Shake Banana") },
  { name: "Herbalife Formula 1 Shake Mango", basePrice: 455000, category: "Shake", description: "Rasa mangga tropis", image: img("Herbalife Formula 1 Shake Mango") },
  { name: "Herbalife Formula 1 Shake Coffee", basePrice: 460000, category: "Shake", description: "Rasa kopi energik", image: img("Herbalife Formula 1 Shake Coffee") },
  { name: "Herbalife Tea Mix Original", basePrice: 280000, category: "Tea", description: "Teh herbal untuk metabolisme", image: img("Herbalife Tea Mix Original") },
  { name: "Herbalife Tea Mix Lemon", basePrice: 285000, category: "Tea", description: "Teh lemon untuk detox", image: img("Herbalife Tea Mix Lemon") },
  { name: "Herbalife Tea Mix Peach", basePrice: 285000, category: "Tea", description: "Teh persik segar", image: img("Herbalife Tea Mix Peach") },
  { name: "Herbalife Tea Mix Raspberry", basePrice: 290000, category: "Tea", description: "Teh raspberry manis", image: img("Herbalife Tea Mix Raspberry") },
  { name: "Herbalife Protein Bar Chocolate", basePrice: 175000, category: "Bar", description: "Protein bar rasa coklat", image: img("Herbalife Protein Bar Chocolate") },
  { name: "Herbalife Protein Bar Peanut", basePrice: 175000, category: "Bar", description: "Protein bar rasa kacang", image: img("Herbalife Protein Bar Peanut") },
  { name: "Herbalife Personalized Protein Powder", basePrice: 320000, category: "Suplemen", description: "Protein tambahan", image: img("Herbalife Personalized Protein Powder") },
  { name: "Herbalife Cell-U-Loss", basePrice: 265000, category: "Suplemen", description: "Membantu mengurangi retensi air", image: img("Herbalife Cell-U-Loss") },
  { name: "Herbalife Herbal Concentrate", basePrice: 195000, category: "Suplemen", description: "Konsentrat herbal", image: img("Herbalife Herbal Concentrate") },
  { name: "Herbalife Xtra-Cal", basePrice: 210000, category: "Suplemen", description: "Suplemen kalsium", image: img("Herbalife Xtra-Cal") },
  { name: "Herbalife Multivitamin", basePrice: 240000, category: "Suplemen", description: "Multivitamin harian", image: img("Herbalife Multivitamin") },
  { name: "Herbalife Active Fiber Complex", basePrice: 185000, category: "Suplemen", description: "Serat untuk pencernaan", image: img("Herbalife Active Fiber Complex") },
  { name: "Herbalife Niteworks", basePrice: 295000, category: "Suplemen", description: "Suplemen untuk relaksasi", image: img("Herbalife Niteworks") },
  { name: "Herbalife Prolessa Duo", basePrice: 385000, category: "Program", description: "Program penurunan berat badan", image: img("Herbalife Prolessa Duo") },
  { name: "Herbalife Formula 1 Shake Cookies & Cream", basePrice: 455000, category: "Shake", description: "Rasa kue krim", image: img("Herbalife Formula 1 Shake Cookies & Cream") },
  { name: "Herbalife Formula 1 Shake Orange Cream", basePrice: 450000, category: "Shake", description: "Rasa jeruk krim", image: img("Herbalife Formula 1 Shake Orange Cream") },
  { name: "Herbalife Formula 1 Shake Dutch Chocolate", basePrice: 465000, category: "Shake", description: "Coklat premium Belanda", image: img("Herbalife Formula 1 Shake Dutch Chocolate") },
  { name: "Herbalife Formula 1 Shake Cafe Latte", basePrice: 460000, category: "Shake", description: "Rasa kopi latte", image: img("Herbalife Formula 1 Shake Cafe Latte") },
  { name: "Herbalife Formula 1 Shake Pina Colada", basePrice: 455000, category: "Shake", description: "Rasa nanas kelapa", image: img("Herbalife Formula 1 Shake Pina Colada") },
  { name: "Herbalife Tea Mix Mint", basePrice: 285000, category: "Tea", description: "Teh mint segar", image: img("Herbalife Tea Mix Mint") },
  { name: "Herbalife Tea Mix Hibiscus", basePrice: 290000, category: "Tea", description: "Teh bunga rosella", image: img("Herbalife Tea Mix Hibiscus") },
  { name: "Herbalife Tea Mix Ginger", basePrice: 285000, category: "Tea", description: "Teh jahe hangat", image: img("Herbalife Tea Mix Ginger") },
  { name: "Herbalife Protein Bar Almond", basePrice: 179000, category: "Bar", description: "Protein bar rasa almond", image: img("Herbalife Protein Bar Almond") },
  { name: "Herbalife Protein Bar Coconut", basePrice: 179000, category: "Bar", description: "Protein bar rasa kelapa", image: img("Herbalife Protein Bar Coconut") },
  { name: "Herbalife Personalized Protein Powder Chocolate", basePrice: 325000, category: "Suplemen", description: "Protein rasa coklat", image: img("Herbalife Personalized Protein Powder Chocolate") },
  { name: "Herbalife Personalized Protein Powder Vanilla", basePrice: 325000, category: "Suplemen", description: "Protein rasa vanilla", image: img("Herbalife Personalized Protein Powder Vanilla") },
  { name: "Herbalife Cell-U-Loss Advanced", basePrice: 275000, category: "Suplemen", description: "Formula lanjutan", image: img("Herbalife Cell-U-Loss Advanced") },
  { name: "Herbalife Xtra-Cal Advanced", basePrice: 225000, category: "Suplemen", description: "Kalsium dengan vitamin D", image: img("Herbalife Xtra-Cal Advanced") },
  { name: "Herbalife Multivitamin Plus", basePrice: 255000, category: "Suplemen", description: "Multivitamin premium", image: img("Herbalife Multivitamin Plus") },
  { name: "Herbalife Active Fiber Complex Plus", basePrice: 195000, category: "Suplemen", description: "Serat premium", image: img("Herbalife Active Fiber Complex Plus") },
  { name: "Herbalife Niteworks Plus", basePrice: 315000, category: "Suplemen", description: "Untuk relaksasi lebih baik", image: img("Herbalife Niteworks Plus") },
  { name: "Herbalife Prolessa Duo Advanced", basePrice: 415000, category: "Program", description: "Program lanjutan", image: img("Herbalife Prolessa Duo Advanced") },
  { name: "Herbalife Formula 1 Shake Tropical Fruit", basePrice: 450000, category: "Shake", description: "Rasa buah tropis", image: img("Herbalife Formula 1 Shake Tropical Fruit") },
  { name: "Herbalife Formula 1 Shake Berry Bliss", basePrice: 450000, category: "Shake", description: "Rasa berry campur", image: img("Herbalife Formula 1 Shake Berry Bliss") },
  { name: "Herbalife Formula 1 Shake Mocha", basePrice: 460000, category: "Shake", description: "Rasa mocha spesial", image: img("Herbalife Formula 1 Shake Mocha") },
  { name: "Herbalife Tea Mix Green", basePrice: 285000, category: "Tea", description: "Teh hijau alami", image: img("Herbalife Tea Mix Green") },
  { name: "Herbalife Tea Mix Cinnamon", basePrice: 285000, category: "Tea", description: "Teh kayu manis", image: img("Herbalife Tea Mix Cinnamon") },
  { name: "Herbalife Protein Bar Caramel", basePrice: 179000, category: "Bar", description: "Protein bar rasa karamel", image: img("Herbalife Protein Bar Caramel") },
  { name: "Herbalife Protein Bar Lemon", basePrice: 179000, category: "Bar", description: "Protein bar rasa lemon", image: img("Herbalife Protein Bar Lemon") },
  { name: "Herbalife Omega-3", basePrice: 235000, category: "Suplemen", description: "Suplemen Omega-3", image: img("Herbalife Omega-3") },
  { name: "Herbalife CoQ10", basePrice: 265000, category: "Suplemen", description: "Suplemen jantung", image: img("Herbalife CoQ10") },
  { name: "Herbalife Calcium Plus", basePrice: 215000, category: "Suplemen", description: "Kalsium tambahan", image: img("Herbalife Calcium Plus") },
  { name: "Herbalife Chromium", basePrice: 195000, category: "Suplemen", description: "Suplemen mineral chromium", image: img("Herbalife Chromium") },
  { name: "Herbalife Immune Booster", basePrice: 245000, category: "Suplemen", description: "Penguat daya tahan tubuh", image: img("Herbalife Immune Booster") },
];
