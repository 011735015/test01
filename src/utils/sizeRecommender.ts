import { SIZING_CHART } from '../data/mockData';
import { ShirtStyle } from '../types';

export interface SizeRecommendationInput {
  heightCm: number;
  weightKg: number;
  fitPreference: 'regular' | 'oversized' | 'baggy';
  gender?: 'men' | 'women' | 'unisex';
}

export interface SizeRecommendationResult {
  recommendedSize: string;
  secondarySize?: string;
  estimatedChestInch: number;
  estimatedChestCm: number;
  bmi: number;
  explanation: string;
  fitAdvice: string;
  garmentChestInch: string;
  garmentLengthInch: string;
  isOversizedCut: boolean;
}

/**
 * Intelligent Size Advisor based on anthropometric body metrics and garment specs
 */
export const calculateRecommendedSize = (
  input: SizeRecommendationInput,
  shirtStyle: ShirtStyle
): SizeRecommendationResult => {
  const { heightCm, weightKg, fitPreference } = input;

  // Calculate BMI: weight / (height/100)^2
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  // Estimate natural chest circumference (inches)
  // Standard anthropometric formula: ~0.53 * weight + base constant
  let estChestCm = (weightKg * 0.6) + (heightCm * 0.32) + 20;
  if (input.gender === 'women') {
    estChestCm -= 4;
  }
  const estChestInch = parseFloat((estChestCm / 2.54).toFixed(1));

  // Determine baseline regular fit size according to estimated chest
  // Sizes: S(38"), M(40"), L(44"), XL(48"), 2XL(52"), 3XL(56")
  let baselineSize = 'L';
  if (estChestInch <= 35) {
    baselineSize = 'S';
  } else if (estChestInch <= 38.5) {
    baselineSize = 'M';
  } else if (estChestInch <= 42) {
    baselineSize = 'L';
  } else if (estChestInch <= 45.5) {
    baselineSize = 'XL';
  } else if (estChestInch <= 49.5) {
    baselineSize = '2XL';
  } else {
    baselineSize = '3XL';
  }

  // Adjust for Fit Preference
  const sizeOrder = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
  const baseIdx = sizeOrder.indexOf(baselineSize);

  let targetIdx = baseIdx;
  if (fitPreference === 'oversized') {
    // If the shirt itself is already an oversized cut, 1 size up gives great drape, or stay baseline
    targetIdx = Math.min(sizeOrder.length - 1, baseIdx + (shirtStyle.id === 'oversized' ? 0 : 1));
  } else if (fitPreference === 'baggy') {
    targetIdx = Math.min(sizeOrder.length - 1, baseIdx + 1);
  } else if (fitPreference === 'regular') {
    targetIdx = baseIdx;
  }

  const primarySize = sizeOrder[targetIdx];
  const secondarySize = targetIdx < sizeOrder.length - 1 ? sizeOrder[targetIdx + 1] : sizeOrder[targetIdx - 1];

  const matchedChart = SIZING_CHART.find(s => s.size === primarySize) || SIZING_CHART[2];

  const isOversizedCut = shirtStyle.id === 'oversized' || shirtStyle.id === 'boxy_washed';

  let explanation = '';
  let fitAdvice = '';

  if (shirtStyle.id === 'oversized') {
    explanation = `คุณเหมาะกับไซส์ ${primarySize} หากชอบทรงสตรีทโอเวอร์ไซส์ไหล่ตกที่กำลังพอดี หรือไซส์ ${secondarySize} หากต้องการลุคหลวมพิเศษ`;
    fitAdvice = `รุ่นนี้เป็นทรง Heavy Oversized ไหล่ตก ออกแบบให้รอบอกกว้างกว่าปกติอยู่แล้ว (+${parseFloat(matchedChart.chestInch) - estChestInch > 0 ? (parseFloat(matchedChart.chestInch) - estChestInch).toFixed(1) : 4} นิ้วจากรอบอกจริง) สวมใส่สบายทรงสวย ไม่ต้องเผื่อไซส์เกิน 1 เบอร์`;
  } else if (shirtStyle.id === 'boxy_washed') {
    explanation = `คุณเหมาะกับไซส์ ${primarySize} สำหรับลุคบ็อกซี่ฟอกวินเทจยุค 90s พอดีสรีระ`;
    fitAdvice = `ชายเสื้อทรงตัดตรงสั้นสไตล์เรโทร แนะนำไซส์ ${primarySize} เพื่อความสมดุลระหว่างความกว้างไหล่และความยาวลำตัว`;
  } else {
    explanation = `คุณเหมาะกับไซส์ ${primarySize} หากชอบใส่พอดีตัว หรือ ${secondarySize} หากชอบทรงหลวมสตรีทแวร์`;
    fitAdvice = `รอบอกของคุณประมาณ ${estChestInch} นิ้ว ตัวเสื้อไซส์ ${primarySize} มีรอบอก ${matchedChart.chestInch} ความยาว ${matchedChart.lengthInch} เหมาะกับส่วนสูง ${heightCm} ซม. และน้ำหนัก ${weightKg} กก. อย่างลงตัว`;
  }

  return {
    recommendedSize: primarySize,
    secondarySize,
    estimatedChestInch: estChestInch,
    estimatedChestCm: Math.round(estChestCm),
    bmi,
    explanation,
    fitAdvice,
    garmentChestInch: matchedChart.chestInch,
    garmentLengthInch: matchedChart.lengthInch,
    isOversizedCut,
  };
};
