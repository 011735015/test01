import React, { useState } from 'react';
import { PRESET_ARTWORKS } from '../data/mockData';
import { X, Sparkles, Plus, Check } from 'lucide-react';

interface PresetGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (svgDataUri: string, title: string, side: 'front' | 'back') => void;
  currentSide: 'front' | 'back';
}

export const PresetGalleryModal: React.FC<PresetGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  currentSide,
}) => {
  const [targetSide, setTargetSide] = useState<'front' | 'back'>(currentSide);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Streetwear', 'Japanese & Neo', 'Vintage', 'Typography', 'Thai Neo'];

  const filtered = selectedCategory === 'All'
    ? PRESET_ARTWORKS
    : PRESET_ARTWORKS.filter(p => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#12151E] border border-white/10 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-auto max-h-[88vh] flex flex-col p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">คลังลายสกรีนพร้อมพิมพ์</h2>
              <p className="text-xs text-slate-400">เลือกลายกราฟิกสำเร็จรูปเพื่อจัดวางบนเสื้อของคุณได้ทันที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Target Side Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-4">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'ทุกลาย' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
            <span className="text-[11px] text-slate-400 px-2">วางที่:</span>
            <button
              onClick={() => setTargetSide('front')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                targetSide === 'front' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              อกหน้า
            </button>
            <button
              onClick={() => setTargetSide('back')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                targetSide === 'back' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              หลังเสื้อ
            </button>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
          {filtered.map(preset => (
            <div
              key={preset.id}
              className="group bg-[#171B26] hover:bg-[#1E2332] border border-white/10 hover:border-amber-400/80 rounded-xl p-3 flex flex-col items-center text-center transition-all"
            >
              <div className="w-full aspect-square bg-[#0E1016] rounded-lg p-3 flex items-center justify-center overflow-hidden mb-2.5 group-hover:scale-105 transition-transform">
                <img
                  src={preset.svgDataUri}
                  alt={preset.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <h4 className="text-xs font-semibold text-white truncate w-full group-hover:text-amber-400 transition-colors">
                {preset.title}
              </h4>
              <span className="text-[10px] text-slate-400 mt-0.5">{preset.category}</span>

              <button
                onClick={() => {
                  onSelectPreset(preset.svgDataUri, preset.title, targetSide);
                  onClose();
                }}
                className="mt-3 w-full py-1.5 px-2 bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>วางที่{targetSide === 'front' ? 'อกหน้า' : 'หลังเสื้อ'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
