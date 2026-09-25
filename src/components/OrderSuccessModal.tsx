import React, { useEffect } from 'react';
import { CustomerOrder } from '../types';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Package, 
  Download, 
  PlusCircle, 
  Truck, 
  Printer, 
  Calendar,
  Share2
} from 'lucide-react';

interface OrderSuccessModalProps {
  order: CustomerOrder | null;
  onClose: () => void;
  onStartNewDesign: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onStartNewDesign,
}) => {
  useEffect(() => {
    if (order) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#ffffff'],
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [order]);

  if (!order) return null;

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-[#121622] border border-amber-400/40 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">สั่งสกรีนเสื้อสำเร็จเรียบร้อย!</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            ระบบได้รับคำสั่งผลิตงานสกรีนแล้ว ช่างจะเริ่มขึ้นบล็อกพิมพ์ทันที
          </p>
          <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-amber-400 mt-1">
            หมายเลขคำสั่งซื้อ: <strong className="text-white">{order.orderId}</strong>
          </div>
        </div>

        {/* Production Pipeline Steps */}
        <div className="my-6 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <h4 className="text-xs font-semibold text-slate-300 mb-3">สถานะกระบวนการผลิตงานสกรีน:</h4>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="text-emerald-400 font-semibold block">รับออเดอร์</span>
            </div>
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 mx-auto flex items-center justify-center font-bold animate-pulse">
                2
              </div>
              <span className="text-amber-400 font-semibold block">จัดเตรียมบล็อก/ไฟล์</span>
            </div>
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-white/10 text-slate-400 mx-auto flex items-center justify-center">
                3
              </div>
              <span className="text-slate-400 block">สกรีน & อบความร้อน</span>
            </div>
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-white/10 text-slate-400 mx-auto flex items-center justify-center">
                4
              </div>
              <span className="text-slate-400 block">QC & จัดส่งพัสดุ</span>
            </div>
          </div>
        </div>

        {/* Order Details Receipt Box */}
        <div className="space-y-3 p-4 rounded-xl bg-[#171B26] border border-white/5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-slate-400">รุ่นเสื้อ & สี:</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <span 
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: order.shirtColor.hex }}
              />
              {order.shirtStyle.name} ({order.shirtColor.thaiName})
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">ขนาดไซส์ที่สั่ง:</span>
            <div className="font-mono text-white flex items-center gap-2">
              {Object.entries(order.sizeQuantities)
                .filter(([_, qty]) => qty > 0)
                .map(([size, qty]) => (
                  <span key={size} className="bg-white/10 px-1.5 py-0.5 rounded text-[11px]">
                    {size}: {qty} ตัว
                  </span>
                ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">เทคโนโลยีการสกรีน:</span>
            <span className="text-amber-400 font-medium">{order.printTech.thaiName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">ขนาดลายสกรีน:</span>
            <span className="font-mono text-white">{order.printSize.id} ({order.printSize.dimensions})</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">ผู้รับ & เบอร์โทร:</span>
            <span className="text-white font-medium">{order.customerInfo.fullName} ({order.customerInfo.phone})</span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-slate-400">ที่อยู่จัดส่ง:</span>
            <span className="text-right text-slate-300 max-w-[240px]">
              {order.customerInfo.address} {order.customerInfo.province} {order.customerInfo.postalCode}
            </span>
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
            <span>ยอดชำระสุทธิ:</span>
            <span className="text-amber-400 font-mono text-base">฿{order.pricing.netTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handlePrintReceipt}
            className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>พิมพ์ใบสั่งสกรีน</span>
          </button>

          <button
            onClick={onStartNewDesign}
            className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-500/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ออกแบบตัวต่อไป</span>
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={onClose}
            className="text-[11px] text-slate-500 hover:text-slate-300 underline"
          >
            ปิดหน้าต่างนี้
          </button>
        </div>
      </div>
    </div>
  );
};
