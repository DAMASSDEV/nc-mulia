import type { BmiCategory, Recommendation } from '../types';

const RECOMMENDATIONS: Record<BmiCategory, Recommendation> = {
  Kurus: {
    title: 'Rekomendasi untuk Kategori Kurus',
    description: 'Disarankan menambah asupan kalori dan protein untuk mencapai berat badan ideal.',
    productIds: ['1', '2', '3', '4', '5', '6', '13', '17', '31', '32'],
    disclaimer: 'Rekomendasi ini bersifat awal dan bukan pengganti konsultasi dengan ahli gizi berlisensi.',
  },
  Normal: {
    title: 'Rekomendasi untuk Kategori Normal',
    description: 'Pola makan seimbang sudah baik. Lanjutkan gaya hidup sehat dengan suplemen pendukung.',
    productIds: ['7', '8', '17', '18', '46', '50'],
    disclaimer: 'Rekomendasi ini bersifat awal dan bukan pengganti konsultasi dengan ahli gizi berlisensi.',
  },
  'Kelebihan Berat': {
    title: 'Rekomendasi untuk Kelebihan Berat Badan',
    description: 'Disarankan mengatur pola makan, mengurangi karbohidrat sederhana, dan meningkatkan aktivitas fisik.',
    productIds: ['7', '8', '9', '10', '11', '14', '18', '20', '26', '28', '36', '38'],
    disclaimer: 'Rekomendasi ini bersifat awal dan bukan pengganti konsultasi dengan ahli gizi berlisensi.',
  },
  Obesitas: {
    title: 'Rekomendasi untuk Kategori Obesitas',
    description: 'Konsultasikan dengan tenaga kesehatan profesional. Pengaturan pola makan dan olahraga terstruktur sangat disarankan.',
    productIds: ['7', '14', '18', '20', '26', '28', '36', '37', '38'],
    disclaimer: 'Rekomendasi ini bersifat awal dan bukan pengganti konsultasi dengan ahli gizi berlisensi. Segera temui tenaga kesehatan profesional.',
  },
};

export function normalizeBmiCategory(cat?: string | null): BmiCategory | null {
  if (!cat) return null;
  const upper = cat.trim().toUpperCase();
  if (upper.includes('KURUS') || upper.includes('UNDERWEIGHT')) return 'Kurus';
  if (upper.includes('NORMAL')) return 'Normal';
  if (upper.includes('KELEBIHAN') || upper.includes('BERAT') || upper.includes('OVERWEIGHT')) return 'Kelebihan Berat';
  if (upper.includes('OBES') || upper.includes('OBESITY')) return 'Obesitas';
  return null;
}

export function getRecommendation(category?: string | null): Recommendation | null {
  const normalized = normalizeBmiCategory(category);
  if (!normalized) return null;
  return RECOMMENDATIONS[normalized];
}
