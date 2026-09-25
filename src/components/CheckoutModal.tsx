import React, { useState } from 'react';
import { 
  ShirtStyle, 
  ShirtColor, 
  PrintLayer, 
  PrintTechnology, 
  PrintSizeOption, 
  SizeQtyMap,
  CustomerOrder,
  TeamMemberRosterItem 
} from '../types';
import { calculateOrderPrice } from '../data/mockData';
import { 
  X, 
  CheckCircle2, 
  ShoppingBag, 
  QrCode, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Ruler,
  Users
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  shirtStyle: ShirtStyle;
  shirtColor: ShirtColor;
  layers: PrintLayer[];
  printTech: PrintTechnology;
  printSize: PrintSizeOption;
  onCompleteOrder: (order: CustomerOrder) => void;
  initialSizeQuantities?: SizeQtyMap;
  teamRoster?: TeamMemberRosterItem[];
  onOpenSizeGuide?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  shirtStyle,
  shirtColor,
  layers,
  printTech,
  printSize,
  onCompleteOrder,
  initialSizeQuantities,
  teamRoster = [],
  onOpenSizeGuide,
}) => {
  if (!isOpen) return null;

  const frontLayers = layers.filter(l => l.side === 'front');
  const backLayers = layers.filter(l => l.side === 'back');
  const hasBackPrint = backLayers.length > 0;

  // Size distribution state (defaults: from initialSizeQuantities or 1 piece of L)
  const [sizeQuantities, setSizeQuantities] = useState<SizeQtyMap>(() => {
    if (initialSizeQuantities && Object.values(initialSizeQuantities).some(v => v > 0)) {
      return initialSizeQuantities;
    }
    return {
      S: 0,
      M: 0,
      L: 1,
      XL: 0,
      '2XL': 0,
      '3XL': 0,
    };
  });

  // Customer contact form
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    subdistrict: '',
    district: '',
    province: 'กรุงเทพมหานคร',
    postalCode: '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'cod' | 'card'>('promptpay');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total quantities
  const totalQty = Object.values(sizeQuantities).reduce((acc, q) => acc + q, 0);

  // Real-time calculated price
  const pricing = calculateOrderPrice(
    shirtStyle.basePrice,
    printTech.priceDelta,
    printSize.priceDelta,
    hasBackPrint,
    Math.max(1, totalQty)
  );

  const handleQtyChange = (size: string, delta: number) => {
    setSizeQuantities(prev => {
      const current = prev[size] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [size]: next };
    });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (totalQty <= 0) {
      setErrorMsg('กรุณาเลือกจำนวนเสื้ออย่างน้อย 1 ตัว');
      return;
    }

    if (!customerInfo.fullName.trim()) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุล ผู้รับ');
      return;
    }

    if (!customerInfo.phone.trim() || customerInfo.phone.length < 9) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ที่ติดต่อได้ถูกต้อง');
      return;
    }

    if (!customerInfo.address.trim()) {
      setErrorMsg('กรุณากรอกที่อยู่จัดส่ง');
      return;
    }

    if (!customerInfo.postalCode.trim() || customerInfo.postalCode.length !== 5) {
      setErrorMsg('กรุณากรอกรหัสไปรษณีย์ 5 หลัก');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderId = `SL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: CustomerOrder = {
      orderId: generatedOrderId,
      createdAt: new Date().toISOString(),
      shirtStyle,
      shirtColor,
      sizeQuantities,
      totalQuantity: totalQty,
      printTech,
      printSize,
      hasFrontPrint: frontLayers.length > 0,
      hasBackPrint,
      frontLayers,
      backLayers,
      customerInfo,
      pricing,
      paymentMethod,
      status: paymentMethod === 'promptpay' ? 'pending_payment' : 'in_production',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onCompleteOrder(newOrder);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#12151E] border border-white/10 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0E1017]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">สั่งสกรีนเสื้อออนไลน์ทันที</h2>
              <p className="text-xs text-slate-400">ยืนยันสเปกเสื้อ ขนาด และข้อมูลจัดส่ง</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns on desktop */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Spec & Size Quantities) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Design Spec Summary Box */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">สเปกงานสกรีนที่คุณออกแบบ:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-[#181C26] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-400 block">ทรงเสื้อ:</span>
                  <span className="font-semibold text-white truncate block">{shirtStyle.name}</span>
                  <span className="text-[10px] text-amber-400 font-mono">{shirtStyle.gsm} GSM</span>
                </div>
                <div className="bg-[#181C26] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-400 block">สีผ้า:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: shirtColor.hex }}
                    />
                    <span className="font-semibold text-white truncate">{shirtColor.thaiName}</span>
                  </div>
                </div>
                <div className="bg-[#181C26] p-2.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-400 block">ขนาดกรอบพิมพ์:</span>
                  <span className="font-semibold text-white">{printSize.id}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{printSize.dimensions}</span>
                </div>
                <div className="bg-[#181C26] p-2.5 rounded-lg border border-white/5 col-span-2 sm:col-span-3">
                  <span className="text-[10px] text-slate-400 block">เทคนิคสกรีน:</span>
                  <span className="font-semibold text-amber-300">{printTech.thaiName}</span>
                  <span className="text-[10px] text-slate-400 block">{printTech.highlight}</span>
                </div>
              </div>

              {/* Elements summary */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>ลายอกหน้า: <strong className="text-white font-mono">{frontLayers.length}</strong> ชิ้น</span>
                <span>ลายหลังเสื้อ: <strong className="text-white font-mono">{backLayers.length}</strong> ชิ้น {hasBackPrint ? '(+฿70/ตัว)' : ''}</span>
              </div>

              {/* Team Roster Tag if present */}
              {teamRoster && teamRoster.length > 0 && (
                <div className="mt-2 p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-lg flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>แนบสกรีนชื่อ & เบอร์ทีม ({teamRoster.length} รายชื่อ)</span>
                  </div>
                  <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded text-white">
                    พร้อมผลิต
                  </span>
                </div>
              )}
            </div>

            {/* Size Breakdown Stepper Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">เลือกจำนวนตามไซส์เสื้อ:</h3>
                  <p className="text-xs text-slate-400">เลือกจำนวนตัวสำหรับแต่ละขนาด (S - 3XL)</p>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenSizeGuide && (
                    <button
                      type="button"
                      onClick={onOpenSizeGuide}
                      className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-400/20 flex items-center gap-1 transition-colors"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>แนะนำไซส์</span>
                    </button>
                  )}
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                    รวม {totalQty} ตัว
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(['S', 'M', 'L', 'XL', '2XL', '3XL'] as const).map(size => {
                  const qty = sizeQuantities[size] || 0;
                  return (
                    <div
                      key={size}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        qty > 0 
                          ? 'bg-amber-400/10 border-amber-400/60 text-white' 
                          : 'bg-white/[0.02] border-white/10 text-slate-400'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-bold block">{size}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {size === 'S' ? 'อก 38"' : size === 'M' ? 'อก 40"' : size === 'L' ? 'อก 44"' : size === 'XL' ? 'อก 48"' : size === '2XL' ? 'อก 52"' : 'อก 56"'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(size, -1)}
                          disabled={qty <= 0}
                          className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-mono font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-sm text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(size, 1)}
                          className="w-6 h-6 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-mono font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Volume Discount Notice */}
              <div className="p-3 bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-400 rounded-r-xl text-xs text-slate-300 flex items-center justify-between">
                <span>
                  🔥 ส่วนลดตามจำนวน: สั่ง 3+ (ลด 5%), 5+ (ลด 10%), 10+ (ลด 15%), 20+ (ลด 20%)
                </span>
                {pricing.discountPercent > 0 && (
                  <span className="font-bold text-amber-400 shrink-0 font-mono">
                    ได้ลด {pricing.discountPercent}% (-฿{pricing.discountAmount.toLocaleString()})
                  </span>
                )}
              </div>
            </div>

            {/* Customer Shipping Form */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white">ข้อมูลจัดส่งสินค้า:</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">ชื่อ-นามสกุล ผู้รับ *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="สมชาย ใจดี"
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none rounded-lg text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">เบอร์โทรศัพท์ติดต่อ *</label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="081-234-5678"
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none rounded-lg text-xs text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-slate-300">ที่อยู่จัดส่ง (บ้านเลขที่, หมู่, ซอย, ถนน) *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123/45 หมู่บ้านสุขใจ ซอย 9 ถ.สุขุมวิท"
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none rounded-lg text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">จังหวัด</label>
                  <input
                    type="text"
                    value={customerInfo.province}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, province: e.target.value }))}
                    placeholder="กรุงเทพมหานคร"
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none rounded-lg text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">รหัสไปรษณีย์ (5 หลัก) *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={customerInfo.postalCode}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="10110"
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none rounded-lg text-xs text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-slate-300">หมายเหตุถึงช่างสกรีน (ถ้ามี)</label>
                  <input
                    type="text"
                    value={customerInfo.note}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="เช่น ขอสกรีนเน้นสีสด, กำหนดใช้งานด่วน..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Payment & Order Calculation) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            {/* Payment Method Selector */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">วิธีชำระเงินออนไลน์:</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                    paymentMethod === 'promptpay'
                      ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">สแกน QR พร้อมเพย์ (PromptPay)</span>
                      <span className="text-[10px] text-slate-400">อนุมัติคำสั่งผลิตทันทีหลังสแกน</span>
                    </div>
                  </div>
                  {paymentMethod === 'promptpay' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">เก็บเงินปลายทาง (COD)</span>
                      <span className="text-[10px] text-slate-400">ชำระเงินเมื่อพนักงานส่งของถึงมือคุณ</span>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">บัตรเครดิต / เดบิต (VISA / Mastercard)</span>
                      <span className="text-[10px] text-slate-400">ปลอดภัยด้วยระบบ 3D Secure</span>
                    </div>
                  </div>
                  {paymentMethod === 'card' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>
              </div>

              {/* PromptPay QR Preview Card if promptpay selected */}
              {paymentMethod === 'promptpay' && (
                <div className="bg-white p-4 rounded-xl text-slate-900 shadow-md flex flex-col items-center text-center space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#143d66]">
                    <QrCode className="w-4 h-4" />
                    <span>Thai QR Payment (PromptPay)</span>
                  </div>
                  {/* Simulated Crisp QR Pattern */}
                  <div className="w-36 h-36 border-2 border-slate-800 p-2 bg-white flex flex-col items-center justify-center relative">
                    <div className="w-full h-full bg-slate-950 flex flex-col justify-between p-1.5 rounded-sm">
                      <div className="flex justify-between">
                        <div className="w-6 h-6 bg-white border-2 border-slate-950" />
                        <div className="w-6 h-6 bg-white border-2 border-slate-950" />
                      </div>
                      <div className="text-[10px] font-mono font-bold text-white text-center">
                        SCREENLAB PAY
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-6 h-6 bg-white border-2 border-slate-950" />
                        <div className="w-4 h-4 bg-amber-400 rounded-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">ยอดชำระ: ฿{pricing.netTotal.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-600" />
                      QR มีอายุ 15 นาที
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Breakdown Card */}
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 text-xs">
              <h4 className="font-bold text-white mb-2">สรุปรายการคำนวณราคา:</h4>
              
              <div className="flex justify-between text-slate-400">
                <span>ราคาต่อตัว ({totalQty} ตัว × ฿{pricing.unitPrice.toLocaleString()})</span>
                <span className="font-mono text-white">฿{pricing.subtotal.toLocaleString()}</span>
              </div>

              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>ส่วนลดจำนวน ({pricing.discountPercent}%)</span>
                  <span className="font-mono">-฿{pricing.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>ค่าจัดส่งพัสดุ (EMS / Kerry)</span>
                <span className="font-mono text-white">
                  {pricing.shippingFee === 0 ? <strong className="text-emerald-400">ส่งฟรี</strong> : `฿${pricing.shippingFee}`}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline text-white">
                <div>
                  <span className="text-sm font-bold">ยอดชำระสุทธิ:</span>
                  <span className="text-[10px] text-slate-400 block">(รวมภาษีมูลค่าเพิ่มแล้ว)</span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    ฿{pricing.netTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>กำลังประมวลผลคำสั่งซื้อ...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>ยืนยันการสั่งสกรีน (฿{pricing.netTotal.toLocaleString()})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs rounded-xl transition-colors"
              >
                กลับไปแก้ไขการออกแบบ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
