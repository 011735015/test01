import React, { useState, useEffect } from 'react';
import { SIZING_CHART } from '../data/mockData';
import { ShirtStyle } from '../types';
import { calculateRecommendedSize, SizeRecommendationResult } from '../utils/sizeRecommender';
import { 
  X, 
  Ruler, 
  Check, 
  Sparkles, 
  Sliders, 
  UserCheck, 
  Info, 
  ArrowRight,
  TrendingUp,
  Shirt
} from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  shirtStyle?: ShirtStyle;
  onSelectRecommendedSize?: (size: string) => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  shirtStyle,
  onSelectRecommendedSize,
}) => {
  const [activeTab, setActiveTab] = useState<'advisor' | 'chart'>('advisor');
  const [unit, setUnit] = useState<'inch' | 'cm'>('inch');

  // Advisor form states
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [fitPreference, setFitPreference] = useState<'regular' | 'oversized' | 'baggy'>('oversized');
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>('unisex');
  const [advisorResult, setAdvisorResult] = useState<SizeRecommendationResult | null>(null);

  // Recalculate recommendation whenever inputs change
  useEffect(() => {
    if (!isOpen) return;
    const defaultStyle: ShirtStyle = shirtStyle || {
      id: 'oversized',
      name: 'Heavy Cotton Oversized',
      thaiName: 'สตรีทโอเวอร์ไซส์',
      subtitle: '',
      gsm: 240,
      material: '',
      thaiMaterial: '',
      basePrice: 350,
      availableColors: [],
      description: '',
    };

    const res = calculateRecommendedSize(
      {
        heightCm,
        weightKg,
        fitPreference,
        gender,
      },
      defaultStyle
    );
    setAdvisorResult(res);
  }, [isOpen, heightCm, weightKg, fitPreference, gender, shirtStyle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div 
        className="relative w-full max-w-3xl bg-[#12151E] border border-amber-400/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-white/10 bg-[#0E1016]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/20 font-bold">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>ระบบแนะนำไซส์เสื้ออัจฉริยะ (Smart Size Advisor)</span>
              </h2>
              <p className="text-xs text-slate-400">
                คำนวณจากส่วนสูงและน้ำหนัก เปรียบเทียบกับขนาดจริงของเสื้อแต่ละรุ่น
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-white/10 bg-[#171B26] p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'advisor'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>1. แนะนำไซส์จากส่วนสูง/น้ำหนัก</span>
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'chart'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>2. ตารางสัดส่วนมาตรฐาน (Size Chart)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'advisor' && (
            <div className="space-y-6">
              {/* Metric Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5">
                {/* Height Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-slate-300 font-semibold">ส่วนสูง (Height):</label>
                    <span className="font-mono text-amber-400 font-bold text-sm">{heightCm} ซม.</span>
                  </div>
                  <input
                    type="range"
                    min="145"
                    max="205"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>145 cm</span>
                    <span>175 cm</span>
                    <span>205 cm</span>
                  </div>
                </div>

                {/* Weight Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-slate-300 font-semibold">น้ำหนัก (Weight):</label>
                    <span className="font-mono text-amber-400 font-bold text-sm">{weightKg} กก.</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="130"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>40 kg</span>
                    <span>68 kg</span>
                    <span>130 kg</span>
                  </div>
                </div>

                {/* Fit Preference Pills */}
                <div className="sm:col-span-2 space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-300">ความชอบทรงการสวมใส่ (Fit Style):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'regular', label: 'พอดีตัว (Regular Fit)', desc: 'ใส่สุภาพ สบายตัว ไม่รัด' },
                      { id: 'oversized', label: 'โอเวอร์ไซส์ (Oversized)', desc: 'ไหล่ตก สตรีทเกาหลี ยอดนิยม' },
                      { id: 'baggy', label: 'สตรีทฮิปฮอป (Baggy)', desc: 'หลวมพิเศษ สไตล์ 90s' },
                    ].map(fit => (
                      <button
                        type="button"
                        key={fit.id}
                        onClick={() => setFitPreference(fit.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          fitPreference === fit.id
                            ? 'bg-amber-400/10 border-amber-400 text-white font-bold ring-1 ring-amber-400/40'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-semibold">{fit.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{fit.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendation Card Output */}
              {advisorResult && (
                <div className="bg-gradient-to-br from-amber-500/10 via-[#161B26] to-amber-500/5 border border-amber-400/30 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex flex-col items-center justify-center font-black shadow-lg shadow-amber-400/30">
                        <span className="text-xl leading-none">{advisorResult.recommendedSize}</span>
                        <span className="text-[9px] uppercase tracking-wider mt-0.5">SIZE</span>
                      </div>
                      <div>
                        <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                          ผลการวิเคราะห์สรีระของคุณ:
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          ไซส์ที่เหมาะสมที่สุดคือ &quot;{advisorResult.recommendedSize}&quot;
                        </h3>
                      </div>
                    </div>

                    {onSelectRecommendedSize && (
                      <button
                        onClick={() => {
                          onSelectRecommendedSize(advisorResult.recommendedSize);
                          onClose();
                        }}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>เลือกไซส์ {advisorResult.recommendedSize} ในออเดอร์ทันที</span>
                      </button>
                    )}
                  </div>

                  {/* Explanation text */}
                  <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 text-xs text-slate-200 leading-relaxed space-y-1.5">
                    <p className="font-semibold text-amber-300">
                      💬 {advisorResult.explanation}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {advisorResult.fitAdvice}
                    </p>
                  </div>

                  {/* Body metrics inspection */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 block">รอบอกประเมิน</span>
                      <span className="text-white font-mono font-bold">{advisorResult.estimatedChestInch}&quot; นิ้ว</span>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 block">รอบอกเสื้อไซส์ {advisorResult.recommendedSize}</span>
                      <span className="text-amber-400 font-mono font-bold">{advisorResult.garmentChestInch}</span>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 block">ความยาวเสื้อ</span>
                      <span className="text-white font-mono font-bold">{advisorResult.garmentLengthInch}</span>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 block">ดัชนีมวลกาย (BMI)</span>
                      <span className="text-emerald-400 font-mono font-bold">{advisorResult.bmi}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="space-y-4">
              {/* Unit Switcher */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">หน่วยวัดขนาด:</span>
                <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
                  <button
                    onClick={() => setUnit('inch')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      unit === 'inch' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    นิ้ว (Inches)
                  </button>
                  <button
                    onClick={() => setUnit('cm')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      unit === 'cm' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    เซนติเมตร (CM)
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181C26] text-slate-300 font-semibold uppercase font-mono">
                    <tr>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">รอบอก (Chest)</th>
                      <th className="py-3 px-4">ความยาว (Length)</th>
                      <th className="py-3 px-4">ความยาวแขน (Sleeve)</th>
                      <th className="py-3 px-4">คำแนะนำส่วนสูง/น้ำหนัก</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {SIZING_CHART.map((row) => (
                      <tr key={row.size} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-bold text-amber-400">{row.size}</td>
                        <td className="py-3 px-4 text-white">
                          {unit === 'inch' ? row.chestInch : `${row.chestCm} cm`}
                        </td>
                        <td className="py-3 px-4 text-white">
                          {unit === 'inch' ? row.lengthInch : `${row.lengthCm} cm`}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {unit === 'inch' ? `${(parseFloat(row.sleeveCm) / 2.54).toFixed(1)}"` : `${row.sleeveCm} cm`}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                          {row.size === 'S' && '155-165 ซม. / 45-55 กก.'}
                          {row.size === 'M' && '165-172 ซม. / 55-65 กก.'}
                          {row.size === 'L' && '170-178 ซม. / 65-78 กก.'}
                          {row.size === 'XL' && '175-185 ซม. / 78-90 กก.'}
                          {row.size === '2XL' && '180-190 ซม. / 90-105 กก.'}
                          {row.size === '3XL' && '185+ ซม. / 105+ กก.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
