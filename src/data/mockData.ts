import { ShirtColor, ShirtStyle, PrintTechnology, PrintSizeOption, PresetArt } from '../types';

export const SHIRT_COLORS: ShirtColor[] = [
  { id: 'white', name: 'White', thaiName: 'ขาว (White)', hex: '#F8FAFC', textColor: '#111827', isDark: false },
  { id: 'black', name: 'Black', thaiName: 'ดำ (Black)', hex: '#111215', textColor: '#ffffff', isDark: true },
  { id: 'grey', name: 'Grey', thaiName: 'เทา (Grey)', hex: '#525763', textColor: '#ffffff', isDark: true },
  { id: 'red', name: 'Red', thaiName: 'แดง (Red)', hex: '#DC2626', textColor: '#ffffff', isDark: true },
  { id: 'blue', name: 'Blue', thaiName: 'น้ำเงิน (Blue)', hex: '#1D4ED8', textColor: '#ffffff', isDark: true },
  { id: 'green', name: 'Green', thaiName: 'เขียว (Green)', hex: '#15803D', textColor: '#ffffff', isDark: true },
  { id: 'yellow', name: 'Yellow', thaiName: 'เหลือง (Yellow)', hex: '#EAB308', textColor: '#111827', isDark: false },
  { id: 'orange', name: 'Orange', thaiName: 'ส้ม (Orange)', hex: '#EA580C', textColor: '#ffffff', isDark: true },
  { id: 'pink', name: 'Pink', thaiName: 'ชมพู (Pink)', hex: '#EC4899', textColor: '#ffffff', isDark: false },
  { id: 'purple', name: 'Purple', thaiName: 'ม่วง (Purple)', hex: '#7E22CE', textColor: '#ffffff', isDark: true },
  { id: 'brown', name: 'Brown', thaiName: 'น้ำตาล (Brown)', hex: '#633B26', textColor: '#ffffff', isDark: true },
];

export const SHIRT_STYLES: ShirtStyle[] = [
  {
    id: 'crewneck',
    name: 'Classic Standard Crewneck',
    thaiName: 'คอกลมคลาสสิก คอมบ์ 32 (190 GSM)',
    subtitle: 'ผ้าคอตตอนสัมผัสนุ่มพิเศษ สวมใส่สบาย ระบายอากาศดีเยี่ยม',
    gsm: 190,
    material: '100% Combed Cotton #32',
    thaiMaterial: 'ผ้าคอตตอนคอมบ์ 100% เกรดพรีเมียม สัมผัสเนียนนุ่ม',
    basePrice: 280,
    availableColors: SHIRT_COLORS,
    description: 'ทรงมาตรฐานยอดนิยมสำหรับทำแบรนด์ เสื้อทีม หรือสวมใส่ในชีวิตประจำวัน เนื้อผ้าเรียบเนียน เหมาะกับงานสกรีนที่ต้องการความละเอียดสูง',
  },
  {
    id: 'polo',
    name: 'Premium Pique Polo Shirt',
    thaiName: 'เสื้อโปโลคอปก ลาคอสท์พรีเมียม (220 GSM)',
    subtitle: 'คอปกทอหนา สาบกระดุม 2 เม็ด เรียบหรู ภูมิฐาน ใส่ทำงานหรือลำลอง',
    gsm: 220,
    material: 'CVC Pique Lacoste Cotton Blend',
    thaiMaterial: 'ผ้าคอตตอนจูติลาคอสท์ ระบายอากาศดีเยี่ยม ไม่หดไม่ย้วย',
    basePrice: 380,
    availableColors: SHIRT_COLORS,
    description: 'เสื้อโปโลคอปกมาตรฐานสากล ปกทอแน่นเป็นทรง สาบกระดุมเปลือกหอย 2 เม็ด แขนจั๊มครึ่ง สกรีนอกซ้าย อกขวา หรือกลางหลังได้อย่างสง่างาม',
  },
  {
    id: 'oversized',
    name: 'Heavy Cotton Oversized',
    thaiName: 'สตรีทโอเวอร์ไซส์ ไหล่ตก (240 GSM)',
    subtitle: 'ทรงหลวมสวย คอชิดฟิตเป๊ะ ผ้ายีนส์หนานุ่ม ยอดนิยมสูงสุด',
    gsm: 240,
    material: '100% Premium Heavyweight Cotton',
    thaiMaterial: 'คอตตอน 100% เนื้อหนาพรีเมียม ไหล่สโลป ไม่ย้วย',
    basePrice: 350,
    availableColors: SHIRT_COLORS,
    description: 'ทรงเสื้อยอดนิยมสไตล์เกาหลีและสตรีทแวร์ คอหนา 1.2 นิ้ว เย็บดามคอ แขนเสื้อปล่อยกว้าง รองรับงานสกรีนทุกเฉดสี',
  },
  {
    id: 'vneck',
    name: 'Modern Cut V-Neck Tee',
    thaiName: 'เสื้อยืดคอวีโมเดิร์น (180 GSM)',
    subtitle: 'คอวีสโลปสวยพอดี ไม่ลึกเกินไป ช่วยเสริมให้ช่วงคอดูโปร่งเพรียว',
    gsm: 180,
    material: '100% Soft Spun Combed Cotton',
    thaiMaterial: 'คอตตอนคอมบ์เนื้อละเอียด ทิ้งตัวนุ่ม ผิวสัมผัสเนียนกริบ',
    basePrice: 290,
    availableColors: SHIRT_COLORS,
    description: 'เสื้อยืดคอวีทรงโมเดิร์น สลิมฟิตกำลังดี คอวีตัดเย็บประณีต ซ่อนตะเข็บเรียบเนียน เหมาะกับงานสกรีนมินิมอลหรือลายกราฟิก',
  },
  {
    id: 'longsleeve',
    name: 'Streetwear Long Sleeve Tee',
    thaiName: 'เสื้อยืดแขนยาวสตรีทแวร์ (220 GSM)',
    subtitle: 'แขนยาวจั๊มปลายแขน 2 นิ้ว สกรีนได้ทั้งหน้าอก หลัง และลำตัว',
    gsm: 220,
    material: '100% Heavyweight Cotton Ribbed Cuffs',
    thaiMaterial: 'คอตตอนพรีเมียมหนานุ่ม ข้อมือทอจั๊มริบกันลมยืดหยุ่น',
    basePrice: 360,
    availableColors: SHIRT_COLORS,
    description: 'เสื้อยืดแขนยาวสไตล์สตรีทแฟชั่น ปลายแขนเย็บจั๊มริบหนา 2 นิ้ว เพิ่มความกระชับ ทรงทิ้งตัวสวย สกรีนลายได้โดดเด่นทั้งแขนและลำตัว',
  },
  {
    id: 'tanktop',
    name: 'Athletic Street Tank Top',
    thaiName: 'เสื้อกล้ามสตรีท & สปอร์ต (200 GSM)',
    subtitle: 'ไร้แขน วงแขนกว้างพอดี สวมใส่คล่องตัว สำหรับสตรีทและออกกำลังกาย',
    gsm: 200,
    material: '100% Breathable Ring-Spun Cotton',
    thaiMaterial: 'ผ้าคอตตอนเนื้อนุ่ม ระบายความร้อนและเหงื่อได้ดีเยี่ยม',
    basePrice: 260,
    availableColors: SHIRT_COLORS,
    description: 'เสื้อกล้ามทรงสปอร์ตสตรีท ไร้แขน เดินดามรอบคอและวงแขนอย่างแข็งแรง ไม่ระคายเคือง เหมาะสำหรับใส่เล่นกีฬา แฟชั่นหน้าร้อน หรือสตรีทแวร์',
  },
  {
    id: 'boxy_washed',
    name: 'Vintage Washed Boxy Tee',
    thaiName: 'บ็อกซี่ฟอกสนิมวินเทจ (230 GSM)',
    subtitle: 'ผ่านการฟอกนุ่มพิเศษ ซักไม่หด ชายเสื้อปล่อย ทรงบ็อกซี่',
    gsm: 230,
    material: 'Garment Enzyme Washed Cotton',
    thaiMaterial: 'ผ้าฟอกเอนไซม์วินเทจ สัมผัสทิ้งตัวนุ่มฟู',
    basePrice: 390,
    availableColors: SHIRT_COLORS,
    description: 'เนื้อผ้าผ่านการฟอกสีแบบวินเทจ ให้รอยเฟดที่เป็นเอกลักษณ์เฉพาะตัว ตะเข็บเดี่ยว ชายเสื้อบ็อกซี่ สไตล์เรโทรยุค 90s',
  },
  {
    id: 'hoodie',
    name: 'Streetwear Heavy Hoodie',
    thaiName: 'ฮู้ดดี้สตรีทแวร์ บุสำลีหนานุ่ม (360 GSM)',
    subtitle: 'เสื้อกันหนาวมีฮู้ด กระเป๋าจิงโจ้ ทรงสวยหนาอยู่ทรง',
    gsm: 360,
    material: 'Heavy Fleece Cotton Blend',
    thaiMaterial: 'คอตตอนฟรีซเกรดส่งออก หนา อุ่น นุ่มลื่น',
    basePrice: 650,
    availableColors: SHIRT_COLORS,
    description: 'เสื้อมีฮู้ดทรงโอเวอร์ไซส์ ผ้าหนานุ่มด้านในบุสำลีอย่างดี มีเชือกถักปรับกระชับ เหมาะสำหรับสกรีนอก หรือสกรีนเต็มหลัง',
  },
];

export const PRINT_TECHNOLOGIES: PrintTechnology[] = [
  {
    id: 'dtg',
    name: 'Direct-to-Film / DTG Digital Screen',
    thaiName: 'สกรีนดิจิทัล DTF คมชัดสูง (ไม่จำกัดสี)',
    description: 'พิมพ์สีสด ลายเส้นคมชัด รองรับไฟล์รูปถ่าย ไล่เฉดสี และรูปภาพจากมือถือ/กล้องได้สมจริง 100%',
    highlight: 'แนะนำสำหรับรูปถ่าย และงานสกรีน 1-20 ตัว',
    priceDelta: 0,
    minQty: 1,
  },
  {
    id: 'silkscreen',
    name: 'Silkscreen Plastisol Pro',
    thaiName: 'ซิลค์สกรีน บล็อกสีพลาสติซอลพรีเมียม',
    description: 'งานสกรีนบล็อกสีสด เนื้อสีฝังแน่น ทนทานต่อการซักสูงมาก สัมผัสสีแน่นระดับแบรนด์สตรีทชั้นนำ',
    highlight: 'แนะนำสำหรับลายกราฟิกเวกเตอร์ ออเดอร์ 10+ ตัว',
    priceDelta: 20,
    minQty: 5,
  },
  {
    id: 'rubber',
    name: 'Soft Rubber Ink / Waterbase',
    thaiName: 'สกรีนสียางนุ่มมือ ระบายอากาศ (Soft Feel)',
    description: 'เนื้อหมึกบางเบา ซึมเข้าสู่เนื้อผ้า ไม่ร้อน ระบายเหงื่อดี รีดทับลายได้โดยตรง',
    highlight: 'เนื้อสัมผัสนุ่ม ไม่หนา สวมใส่สบายตัว',
    priceDelta: 30,
    minQty: 10,
  },
  {
    id: 'vintage',
    name: 'Distressed Vintage Crack',
    thaiName: 'สกรีนลายแตกวินเทจ (Vintage Distressed)',
    description: 'หมึกพิเศษทำให้เกิดรอยแตกลายงาอย่างมีสไตล์ เหมาะสำหรับเสื้อสไตล์เรโทรและงานฟอก',
    highlight: 'สไตล์เก่าวินเทจแท้ 90s รอยแตกเนียนเป็นธรรมชาติ',
    priceDelta: 40,
    minQty: 10,
  },
];

export const PRINT_SIZES: PrintSizeOption[] = [
  {
    id: 'A5',
    name: 'A5 - Chest Pocket / Small Badge',
    thaiName: 'A5 (15 x 21 ซม.) - อกซ้าย / สัญลักษณ์เล็ก',
    dimensions: '15 × 21 cm',
    priceDelta: 0,
    recommended: 'เหมาะกับโลโก้ตรา อกซ้าย หรือข้อความเรียบมินิมอล',
  },
  {
    id: 'A4',
    name: 'A4 - Center Standard Chest',
    thaiName: 'A4 (21 x 30 ซม.) - อกกลางมาตรฐาน',
    dimensions: '21 × 30 cm',
    priceDelta: 40,
    recommended: 'ขนาดยอดนิยมที่สุด สมดุล สวยพอดีกับเสื้อทุกไซส์',
  },
  {
    id: 'A3',
    name: 'A3 - Full Front / Poster Print',
    thaiName: 'A3 (30 x 42 ซม.) - เต็มอกพรีเมียม / เต็มหลัง',
    dimensions: '30 × 42 cm',
    priceDelta: 90,
    recommended: 'ลายใหญ่โดดเด่น สไตล์สตรีทแวร์หรือกราฟิกรูปถ่าย',
  },
  {
    id: 'JUMBO',
    name: 'JUMBO - Oversized 40x50 cm',
    thaiName: 'จัมโบ้ (40 x 50 ซม.) - เต็มตัวสุดพรีเมียม',
    dimensions: '40 × 50 cm',
    priceDelta: 150,
    recommended: 'สกรีนเต็มตัวขนาดใหญ่พิเศษ อลังการสะดุดตา',
  },
];

export const SIZING_CHART = [
  { size: 'S', chestInch: '38"', chestCm: '96', lengthInch: '27"', lengthCm: '68', sleeveCm: '21' },
  { size: 'M', chestInch: '40"', chestCm: '102', lengthInch: '28"', lengthCm: '71', sleeveCm: '22' },
  { size: 'L', chestInch: '44"', chestCm: '112', lengthInch: '29"', lengthCm: '74', sleeveCm: '23' },
  { size: 'XL', chestInch: '48"', chestCm: '122', lengthInch: '30"', lengthCm: '76', sleeveCm: '24' },
  { size: '2XL', chestInch: '52"', chestCm: '132', lengthInch: '31"', lengthCm: '79', sleeveCm: '25' },
  { size: '3XL', chestInch: '56"', chestCm: '142', lengthInch: '32"', lengthCm: '81', sleeveCm: '26' },
];

// Built-in crisp SVG artwork vectors designed specifically for screen printing test & instant selection
export const PRESET_ARTWORKS: PresetArt[] = [
  {
    id: 'art-neo-cyber-skull',
    title: 'Cyber Mecha Skull',
    category: 'Streetwear',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23f59e0b" />
          <stop offset="100%" stop-color="%23ef4444" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="30" fill="none"/>
      <circle cx="200" cy="200" r="170" fill="none" stroke="%23f59e0b" stroke-width="4" stroke-dasharray="16,8"/>
      <path d="M120 140 C120 70 280 70 280 140 C280 190 270 220 250 250 L250 300 L150 300 L150 250 C130 220 120 190 120 140 Z" fill="none" stroke="url(%23grad1)" stroke-width="12" stroke-linejoin="round"/>
      <circle cx="160" cy="160" r="28" fill="%23ef4444"/>
      <circle cx="240" cy="160" r="28" fill="%23ef4444"/>
      <path d="M190 200 L210 200 L200 225 Z" fill="%23f59e0b"/>
      <path d="M165 260 L165 295 M190 260 L190 295 M210 260 L210 295 M235 260 L235 295" stroke="%23f59e0b" stroke-width="8" stroke-linecap="round"/>
      <text x="200" y="355" font-family="sans-serif" font-weight="900" font-size="28" fill="%23ffffff" text-anchor="middle" letter-spacing="6">CYBER SCREEN</text>
    </svg>`,
  },
  {
    id: 'art-japanese-sun-wave',
    title: 'Great Wave & Rising Sun',
    category: 'Japanese & Neo',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <circle cx="200" cy="170" r="100" fill="%23dc2626"/>
      <path d="M40 310 C90 260 140 330 200 270 C240 230 270 210 320 250 C350 270 380 250 400 280 L400 350 L0 350 L0 290 C15 295 25 305 40 310 Z" fill="%230284c7" stroke="%23ffffff" stroke-width="6"/>
      <path d="M80 320 C120 280 180 340 240 290 C280 260 320 270 360 300" fill="none" stroke="%2338bdf8" stroke-width="8"/>
      <text x="200" y="380" font-family="sans-serif" font-weight="900" font-size="22" fill="%23ffffff" text-anchor="middle" letter-spacing="8">TOKYO CULTURE</text>
    </svg>`,
  },
  {
    id: 'art-thai-freedom-tiger',
    title: 'เสือเผ่น นีโอไทย (Neo Thai Tiger)',
    category: 'Thai Neo',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <circle cx="200" cy="200" r="175" fill="none" stroke="%23f59e0b" stroke-width="8"/>
      <path d="M80 200 L320 200" stroke="%23f59e0b" stroke-width="2" stroke-dasharray="8,8"/>
      <text x="200" y="80" font-family="'Prompt',sans-serif" font-weight="800" font-size="30" fill="%23f59e0b" text-anchor="middle" letter-spacing="4">อิสระภาพ</text>
      <path d="M140 150 C120 190 140 260 200 260 C260 260 280 190 260 150 C240 180 230 200 200 200 C170 200 160 180 140 150 Z" fill="%23f59e0b"/>
      <circle cx="170" cy="180" r="10" fill="%23ffffff"/>
      <circle cx="230" cy="180" r="10" fill="%23ffffff"/>
      <path d="M185 220 L215 220 L200 235 Z" fill="%23121316"/>
      <text x="200" y="340" font-family="'Prompt',sans-serif" font-weight="700" font-size="22" fill="%23ffffff" text-anchor="middle" letter-spacing="6">BANGKOK ORIGINALS</text>
    </svg>`,
  },
  {
    id: 'art-street-typography',
    title: 'STREET DIVISION 1998',
    category: 'Typography',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <rect x="20" y="40" width="360" height="320" fill="none" stroke="%23ffffff" stroke-width="4"/>
      <text x="200" y="130" font-family="Impact, sans-serif" font-weight="900" font-size="68" fill="%23ffffff" text-anchor="middle" letter-spacing="4">OVERSIZE</text>
      <line x1="40" y1="160" x2="360" y2="160" stroke="%23f59e0b" stroke-width="8"/>
      <text x="200" y="215" font-family="'Prompt',sans-serif" font-weight="800" font-size="34" fill="%23f59e0b" text-anchor="middle" letter-spacing="8">HEAVY COTTON</text>
      <text x="200" y="270" font-family="monospace" font-size="20" fill="%2394a3b8" text-anchor="middle" letter-spacing="6">SPEC NO. 240-GSM</text>
      <text x="200" y="325" font-family="Impact, sans-serif" font-size="32" fill="%23ffffff" text-anchor="middle" letter-spacing="6">LIMITED RUN</text>
    </svg>`,
  },
  {
    id: 'art-vintage-motorcycle',
    title: 'Custom Speed & Moto Club',
    category: 'Vintage',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <polygon points="200,30 360,110 360,290 200,370 40,290 40,110" fill="none" stroke="%23f59e0b" stroke-width="6"/>
      <polygon points="200,48 344,120 344,280 200,352 56,280 56,120" fill="none" stroke="%23ffffff" stroke-width="2"/>
      <text x="200" y="130" font-family="sans-serif" font-weight="900" font-size="28" fill="%23f59e0b" text-anchor="middle" letter-spacing="6">RAW SPEED</text>
      <circle cx="200" cy="205" r="48" fill="none" stroke="%23ffffff" stroke-width="6"/>
      <text x="200" y="218" font-family="Impact, sans-serif" font-size="44" fill="%23ffffff" text-anchor="middle">58</text>
      <text x="200" y="290" font-family="sans-serif" font-weight="800" font-size="22" fill="%23ffffff" text-anchor="middle" letter-spacing="4">GARAGE BUILT</text>
      <text x="200" y="325" font-family="monospace" font-size="16" fill="%2394a3b8" text-anchor="middle">EST. 1974</text>
    </svg>`,
  },
  {
    id: 'art-cosmic-astronaut',
    title: 'Cosmic Lost Astronaut',
    category: 'Streetwear',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <circle cx="200" cy="200" r="160" fill="%230f172a" stroke="%2338bdf8" stroke-width="6"/>
      <ellipse cx="200" cy="180" rx="90" ry="70" fill="%231e293b" stroke="%23ffffff" stroke-width="6"/>
      <ellipse cx="200" cy="175" rx="70" ry="45" fill="%2306b6d4"/>
      <path d="M150 160 Q170 150 190 160" stroke="%23ffffff" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="140" y="250" width="120" height="45" rx="10" fill="%23e2e8f0"/>
      <text x="200" y="340" font-family="'Prompt',sans-serif" font-weight="800" font-size="22" fill="%2338bdf8" text-anchor="middle" letter-spacing="6">DEEP SPACE</text>
    </svg>`,
  },
  {
    id: 'art-minimal-face-line',
    title: 'Minimalist Line Art Silhouette',
    category: 'Minimalist',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <circle cx="270" cy="160" r="80" fill="%23fbbf24" opacity="0.3"/>
      <path d="M160 80 C190 80 230 110 230 160 C230 200 200 220 200 250 L200 290 C220 300 250 310 280 340 M180 180 C210 180 220 195 240 195 M150 230 C170 235 190 230 200 240" fill="none" stroke="%23ffffff" stroke-width="8" stroke-linecap="round"/>
      <circle cx="190" cy="150" r="8" fill="%23ffffff"/>
      <text x="200" y="375" font-family="serif" font-style="italic" font-size="26" fill="%23ffffff" text-anchor="middle" letter-spacing="3">L'Élégance Simple</text>
    </svg>`,
  },
  {
    id: 'art-y2k-smile-star',
    title: 'Acid Y2K Star Smiley',
    category: 'Streetwear',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <polygon points="200,20 245,130 365,140 275,220 305,340 200,275 95,340 125,220 35,140 155,130" fill="%23a855f7" stroke="%23facc15" stroke-width="8"/>
      <ellipse cx="165" cy="190" rx="14" ry="24" fill="%23121316"/>
      <ellipse cx="235" cy="190" rx="14" ry="24" fill="%23121316"/>
      <path d="M150 235 Q200 280 250 235" stroke="%23121316" stroke-width="12" fill="none" stroke-linecap="round"/>
      <text x="200" y="380" font-family="Impact, sans-serif" font-size="34" fill="%23facc15" text-anchor="middle" letter-spacing="4">NO BAD DAYS</text>
    </svg>`,
  },
];

// Calculation helper for tiered volume pricing
export function calculateOrderPrice(
  basePrice: number,
  techDelta: number,
  sizeDelta: number,
  hasBackPrint: boolean,
  quantity: number
) {
  // Extra print side (back) costs ฿70 per piece
  const extraBackFee = hasBackPrint ? 70 : 0;
  const unitPrice = basePrice + techDelta + sizeDelta + extraBackFee;
  const subtotal = unitPrice * quantity;

  // Volume discount tiers
  let discountPercent = 0;
  if (quantity >= 50) {
    discountPercent = 30; // 30% off for 50+
  } else if (quantity >= 20) {
    discountPercent = 20; // 20% off for 20+
  } else if (quantity >= 10) {
    discountPercent = 15; // 15% off for 10+
  } else if (quantity >= 5) {
    discountPercent = 10; // 10% off for 5+
  } else if (quantity >= 3) {
    discountPercent = 5;  // 5% off for 3+
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const discountedSubtotal = subtotal - discountAmount;
  
  // Free shipping for orders >= ฿1000, otherwise flat ฿50
  const shippingFee = discountedSubtotal >= 1000 ? 0 : 50;
  const netTotal = discountedSubtotal + shippingFee;

  return {
    unitPrice,
    subtotal,
    discountPercent,
    discountAmount,
    shippingFee,
    netTotal,
  };
}
