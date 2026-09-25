import React, { useState } from 'react';
import { PrintLayer } from '../types';
import { 
  AlignCenter, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Maximize2, 
  RotateCw,
  Sliders,
  Type,
  Scissors,
  Sparkles,
  SunMedium,
  Palette,
  Eye,
  Check,
  X
} from 'lucide-react';

interface SelectedLayerBarProps {
  selectedLayer: PrintLayer | null;
  onUpdateLayer: (id: string, updates: Partial<PrintLayer>) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onMoveLayerOrder: (id: string, direction: 'up' | 'down') => void;
  onDeselect: () => void;
  onOpenImageAiTools?: (tab: 'remove_bg' | 'upscale') => void;
}

const SelectedLayerBarComponent: React.FC<SelectedLayerBarProps> = ({
  selectedLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onMoveLayerOrder,
  onDeselect,
  onOpenImageAiTools,
}) => {
  const [openTextTool, setOpenTextTool] = useState<'curve' | 'stroke' | 'shadow' | null>(null);

  if (!selectedLayer) return null;

  const isText = selectedLayer.type === 'text';
  const textProps = selectedLayer.textProps || {
    fontFamily: 'Prompt, sans-serif',
    fontSize: 32,
    color: '#ffffff',
    isBold: true,
    textAlign: 'center',
    curved: false,
    curveRadius: 40,
    strokeColor: '#000000',
    strokeWidth: 0,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 0,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
  };

  const handleUpdateTextProps = (updates: Partial<typeof textProps>) => {
    onUpdateLayer(selectedLayer.id, {
      textProps: {
        ...textProps,
        ...updates,
      },
    });
  };

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-4xl bg-[#141822]/95 backdrop-blur-md border border-amber-400/30 rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-black/80 flex flex-col gap-2.5 text-xs"
    >
      {/* Row 1: Core Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Layer Name / Type indicator */}
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
            {isText ? <Type className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-white truncate max-w-[120px] sm:max-w-[160px]">
              {selectedLayer.name}
            </span>
            <span className="text-[10px] text-slate-400">
              {selectedLayer.side === 'front' ? 'อกหน้า' : 'หลังเสื้อ'}
              {selectedLayer.isBgRemoved && ' · ไดคัทแล้ว'}
              {selectedLayer.isUpscaled && ' · 300 DPI'}
            </span>
          </div>
        </div>

        {/* AI Quick Tools for Image Layer */}
        {!isText && onOpenImageAiTools && (
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => onOpenImageAiTools('remove_bg')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-semibold transition-colors"
              title="ลบพื้นหลังรูปภาพด้วย AI"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>ลบพื้นหลัง</span>
            </button>

            <button
              onClick={() => onOpenImageAiTools('upscale')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold transition-colors"
              title="อัปสเกล 300 DPI คมชัดพร้อมสกรีน"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>อัปสเกล 300 DPI</span>
            </button>
          </div>
        )}

        {/* Text Enhancements Tools (Curved Arc, Stroke, Shadow) */}
        {isText && (
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setOpenTextTool(openTextTool === 'curve' ? null : 'curve')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                textProps.curved || openTextTool === 'curve'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="ดัดโค้งตัวอักษรรอบโลโก้"
            >
              <span>ดัดโค้ง</span>
              {textProps.curved && <Check className="w-3 h-3 stroke-[3]" />}
            </button>

            <button
              onClick={() => setOpenTextTool(openTextTool === 'stroke' ? null : 'stroke')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                (textProps.strokeWidth || 0) > 0 || openTextTool === 'stroke'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="ใส่เส้นขอบตัวอักษร"
            >
              <span>เส้นขอบ</span>
              {(textProps.strokeWidth || 0) > 0 && <Check className="w-3 h-3 stroke-[3]" />}
            </button>

            <button
              onClick={() => setOpenTextTool(openTextTool === 'shadow' ? null : 'shadow')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                (textProps.shadowBlur || 0) > 0 || openTextTool === 'shadow'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="ใส่เงาตกกระทบ Drop Shadow"
            >
              <span>เงาตัวอักษร</span>
              {(textProps.shadowBlur || 0) > 0 && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          </div>
        )}

        {/* Quick Align to Center */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => onUpdateLayer(selectedLayer.id, { x: 0 })}
            className="px-2 py-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors flex items-center gap-1"
            title="จัดกึ่งกลางแนวนอน"
          >
            <AlignCenter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">กลาง X</span>
          </button>
          <button
            onClick={() => onUpdateLayer(selectedLayer.id, { y: 0 })}
            className="px-2 py-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors flex items-center gap-1"
            title="จัดกึ่งกลางแนวตั้ง"
          >
            <span className="hidden sm:inline">กลาง Y</span>
          </button>
        </div>

        {/* Sliders: Scale & Rotation */}
        <div className="flex items-center gap-3">
          {/* Scale */}
          <div className="flex items-center gap-1.5" title="ปรับขนาดลาย">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.05"
              value={selectedLayer.scale}
              onChange={(e) => onUpdateLayer(selectedLayer.id, { scale: parseFloat(e.target.value) })}
              className="w-16 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="font-mono text-[10px] text-slate-300 w-8">
              {Math.round(selectedLayer.scale * 100)}%
            </span>
          </div>

          {/* Rotate */}
          <div className="flex items-center gap-1.5" title="หมุนองศา">
            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={selectedLayer.rotation}
              onChange={(e) => onUpdateLayer(selectedLayer.id, { rotation: parseInt(e.target.value) })}
              className="w-14 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="font-mono text-[10px] text-slate-300 w-7">
              {selectedLayer.rotation}°
            </span>
          </div>
        </div>

        {/* Layer Operations (Duplicate, Order, Delete) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMoveLayerOrder(selectedLayer.id, 'up')}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="เลื่อนขึ้นหน้าสุด"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveLayerOrder(selectedLayer.id, 'down')}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="เลื่อนลงหลังสุด"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicateLayer(selectedLayer.id)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="ทำซ้ำเลเยอร์"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteLayer(selectedLayer.id)}
            className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/20 transition-colors"
            title="ลบลายนี้"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-white/15 my-auto mx-0.5" />
          <button
            onClick={onDeselect}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="ยกเลิกการเลือก (หรือคลิกที่ว่าง)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Secondary Tool Expanders for Text (Curved Arc, Stroke, Shadow) */}
      {isText && openTextTool && (
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap bg-black/20 p-2 rounded-xl animate-in fade-in">
          {/* Sub-tool 1: Curved Arc */}
          {openTextTool === 'curve' && (
            <div className="flex items-center gap-3 w-full justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableCurve"
                  checked={textProps.curved || false}
                  onChange={(e) => handleUpdateTextProps({ curved: e.target.checked })}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
                <label htmlFor="enableCurve" className="text-xs font-semibold text-slate-200 cursor-pointer">
                  เปิดการดัดโค้ง (Curved Arc)
                </label>
              </div>

              {textProps.curved && (
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <span className="text-[11px] text-slate-400">โค้งหงาย / โค้งคว่ำ:</span>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={textProps.curveRadius ?? 35}
                    onChange={(e) => handleUpdateTextProps({ curveRadius: parseInt(e.target.value) })}
                    className="flex-1 h-1.5 accent-amber-400 bg-slate-700 rounded cursor-pointer"
                  />
                  <span className="font-mono text-xs text-amber-400 w-8">
                    {textProps.curveRadius ?? 35}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Sub-tool 2: Stroke */}
          {openTextTool === 'stroke' && (
            <div className="flex items-center gap-4 w-full justify-between flex-wrap">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <span className="text-[11px] text-slate-300 font-semibold">ความหนาขอบ:</span>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={textProps.strokeWidth ?? 0}
                  onChange={(e) => handleUpdateTextProps({ strokeWidth: parseFloat(e.target.value) })}
                  className="flex-1 h-1.5 accent-amber-400 bg-slate-700 rounded cursor-pointer"
                />
                <span className="font-mono text-xs text-amber-400 w-8">
                  {textProps.strokeWidth ?? 0}px
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">สีเส้นขอบ:</span>
                {['#000000', '#ffffff', '#f59e0b', '#ef4444', '#38bdf8'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleUpdateTextProps({ strokeColor: c })}
                    className={`w-5 h-5 rounded-full border ${textProps.strokeColor === c ? 'border-amber-400 scale-110' : 'border-white/20'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sub-tool 3: Shadow */}
          {openTextTool === 'shadow' && (
            <div className="flex items-center gap-4 w-full justify-between flex-wrap">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <span className="text-[11px] text-slate-300 font-semibold">ระดับความฟุ้งเงา:</span>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={textProps.shadowBlur ?? 0}
                  onChange={(e) => handleUpdateTextProps({ 
                    shadowBlur: parseInt(e.target.value),
                    shadowOffsetX: 2,
                    shadowOffsetY: 3,
                  })}
                  className="flex-1 h-1.5 accent-amber-400 bg-slate-700 rounded cursor-pointer"
                />
                <span className="font-mono text-xs text-amber-400 w-8">
                  {textProps.shadowBlur ?? 0}px
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">สีเงา:</span>
                {[
                  { label: 'ดำเข้ม', color: 'rgba(0,0,0,0.85)' },
                  { label: 'เหลืองเรืองแสง', color: 'rgba(245,158,11,0.7)' },
                  { label: 'แดงนีออน', color: 'rgba(239,68,68,0.7)' },
                  { label: 'ฟ้านีออน', color: 'rgba(56,189,248,0.7)' },
                ].map(c => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => handleUpdateTextProps({ shadowColor: c.color })}
                    className="px-2 py-0.5 rounded text-[10px] bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SelectedLayerBar = React.memo(SelectedLayerBarComponent);
