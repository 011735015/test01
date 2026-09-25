export type ShirtCut = 'oversized' | 'crewneck' | 'boxy_washed' | 'hoodie';

export interface ShirtColor {
  id: string;
  name: string;
  thaiName: string;
  hex: string;
  textColor: string;
  isDark: boolean;
  category?: 'classic' | 'earth' | 'vibrant' | 'pastel';
}

export interface ShirtStyle {
  id: ShirtCut;
  name: string;
  thaiName: string;
  subtitle: string;
  gsm: number;
  material: string;
  thaiMaterial: string;
  basePrice: number;
  availableColors: ShirtColor[];
  description: string;
}

export type LayerType = 'image' | 'text' | 'preset';

export interface TextProperties {
  fontFamily: string;
  fontSize: number;
  color: string;
  isBold: boolean;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing?: number;
  // Typography enhancements: Curved, Stroke, Shadow, Distressed
  curved?: boolean;
  curveRadius?: number; // -100 to 100 (% of arc bend)
  strokeColor?: string;
  strokeWidth?: number; // 0 to 12
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  distressed?: boolean;
}

export interface PrintLayer {
  id: string;
  type: LayerType;
  side: 'front' | 'back';
  content: string; // Image URL / data URI or text content
  x: number; // percentage from center (0 = center, -50 to 50)
  y: number; // percentage from center (0 = center, -50 to 50)
  scale: number; // 0.2 to 2.5
  rotation: number; // -180 to 180 degrees
  opacity: number; // 0 to 1
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  textProps?: TextProperties;
  name: string;
  aspectRatio?: number;
  // Image metadata for upscale / resolution
  originalWidth?: number;
  originalHeight?: number;
  isUpscaled?: boolean;
  isBgRemoved?: boolean;
}

export interface TeamMemberRosterItem {
  id: string;
  size: string; // S, M, L, XL, 2XL, 3XL
  name: string; // e.g. สมชาย
  number: string; // e.g. 09
  positionOrNote?: string; // e.g. กองหน้า, กัปตันทีม
}

export interface SavedDesignDraft {
  id: string;
  name: string;
  updatedAt: string;
  shirtStyleId: ShirtCut;
  shirtColorId: string;
  layers: PrintLayer[];
  printTechId: string;
  printSizeId: string;
  previewThumbnail?: string;
}

export interface PrintTechnology {
  id: 'dtg' | 'silkscreen' | 'rubber' | 'vintage';
  name: string;
  thaiName: string;
  description: string;
  highlight: string;
  priceDelta: number;
  minQty: number;
}

export interface PrintSizeOption {
  id: 'A5' | 'A4' | 'A3' | 'JUMBO';
  name: string;
  thaiName: string;
  dimensions: string;
  priceDelta: number;
  recommended: string;
}

export interface SizeQtyMap {
  [size: string]: number;
}

export interface PresetArt {
  id: string;
  title: string;
  category: 'Streetwear' | 'Japanese & Neo' | 'Vintage' | 'Typography' | 'Thai Neo' | 'Badges' | 'Minimalist';
  svgDataUri: string;
}

export interface CustomerOrder {
  orderId: string;
  createdAt: string;
  shirtStyle: ShirtStyle;
  shirtColor: ShirtColor;
  sizeQuantities: SizeQtyMap;
  totalQuantity: number;
  printTech: PrintTechnology;
  printSize: PrintSizeOption;
  hasFrontPrint: boolean;
  hasBackPrint: boolean;
  frontLayers: PrintLayer[];
  backLayers: PrintLayer[];
  customerInfo: {
    fullName: string;
    phone: string;
    address: string;
    subdistrict: string;
    district: string;
    province: string;
    postalCode: string;
    note?: string;
  };
  pricing: {
    unitPrice: number;
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    shippingFee: number;
    netTotal: number;
  };
  paymentMethod: 'promptpay' | 'cod' | 'card';
  status: 'pending_payment' | 'preparing_artwork' | 'in_production' | 'shipped';
}
