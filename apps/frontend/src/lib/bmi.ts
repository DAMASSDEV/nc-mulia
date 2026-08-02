import type { BmiResult, BmiCategory } from '../types';

const BMI_CATEGORIES: ReadonlyArray<{
  category: BmiCategory;
  min: number;
  max: number;
  description: string;
}> = Object.freeze([
  { category: 'Kurus',        min: 0,      max: 18.5,  description: 'BMI di bawah normal. Disarankan menambah asupan kalori dan nutrisi.' },
  { category: 'Normal',       min: 18.5,   max: 25,    description: 'BMI dalam rentang ideal. Pertahankan pola makan seimbang dan aktivitas fisik teratur.' },
  { category: 'Kelebihan Berat', min: 25,   max: 30,    description: 'BMI di atas normal. Disarankan mengatur pola makan dan meningkatkan aktivitas fisik.' },
  { category: 'Obesitas',     min: 30,     max: Infinity, description: 'BMI dalam kategori obesitas. Konsultasikan dengan tenaga kesehatan profesional.' },
]);

export function classifyBmi(bmi: number): BmiCategory {
  for (const { category, min, max } of BMI_CATEGORIES) {
    if (bmi >= min && bmi < max) return category;
  }
  return 'Obesitas';
}

export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error('Berat dan tinggi harus bernilai positif.');
  }
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm)) {
    throw new Error('Berat dan tinggi harus berupa angka.');
  }

  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  const category = classifyBmi(bmi);
  const catEntry = BMI_CATEGORIES.find(c => c.category === category)!;

  return { value: bmi, category, description: catEntry.description };
}

export const BMI_CATEGORY_INFO = Object.freeze(
  Object.fromEntries(BMI_CATEGORIES.map(({ category, description }) => [category, description]))
) as Record<BmiCategory, string>;
