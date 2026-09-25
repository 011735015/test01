import React, { useState } from 'react';
import { ShirtStyle, ShirtColor, TeamMemberRosterItem, SizeQtyMap } from '../types';
import { 
  X, 
  Users, 
  Plus, 
  Trash2, 
  Upload, 
  Check, 
  Shirt, 
  Download, 
  AlertCircle, 
  Percent, 
  Copy, 
  Eye,
  FileSpreadsheet
} from 'lucide-react';

interface TeamRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  shirtStyle: ShirtStyle;
  shirtColor: ShirtColor;
  onApplyRoster: (roster: TeamMemberRosterItem[], sizeQuantities: SizeQtyMap) => void;
  initialRoster?: TeamMemberRosterItem[];
}

export const TeamRosterModal: React.FC<TeamRosterModalProps> = ({
  isOpen,
  onClose,
  shirtStyle,
  shirtColor,
  onApplyRoster,
  initialRoster = [],
}) => {
  const [roster, setRoster] = useState<TeamMemberRosterItem[]>(
    initialRoster.length > 0
      ? initialRoster
      : [
          { id: '1', size: 'M', name: 'สมชาย (SOMCHAI)', number: '09', positionOrNote: 'กัปตันทีม' },
          { id: '2', size: 'L', name: 'สมศรี (SOMSRI)', number: '10', positionOrNote: 'กองหน้า' },
          { id: '3', size: 'L', name: 'กิตติศักดิ์ (KITTI)', number: '07', positionOrNote: 'กองกลาง' },
          { id: '4', size: 'XL', name: 'ธนากร (THANAKORN)', number: '01', positionOrNote: 'ผู้รักษาประตู' },
        ]
  );

  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState(
    `M, สมชาย, 09, กัปตัน\nL, สมศรี, 10, กองหน้า\nXL, อรรถพล, 23, กองหลัง\n2XL, ภานุมาศ, 99, ผู้จัดการ`
  );
  const [nameFont, setNameFont] = useState<'Impact, sans-serif' | 'Prompt, sans-serif'>('Impact, sans-serif');
  const [fontColor, setFontColor] = useState('#ffffff');

  if (!isOpen) return null;

  // Add individual row
  const handleAddRow = () => {
    const newItem: TeamMemberRosterItem = {
      id: `roster-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      size: 'L',
      name: '',
      number: '',
      positionOrNote: '',
    };
    setRoster(prev => [...prev, newItem]);
    setActivePreviewIndex(roster.length);
  };

  // Update row
  const handleUpdateRow = (id: string, updates: Partial<TeamMemberRosterItem>) => {
    setRoster(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    setRoster(prev => prev.filter(item => item.id !== id));
    if (activePreviewIndex >= roster.length - 1) {
      setActivePreviewIndex(Math.max(0, roster.length - 2));
    }
  };

  // Bulk import parse
  const handleProcessBulkImport = () => {
    const lines = bulkInputText.split('\n');
    const newItems: TeamMemberRosterItem[] = [];

    for (const line of lines) {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      if (parts.length >= 2 && parts[0]) {
        let size = parts[0].toUpperCase();
        if (!['S', 'M', 'L', 'XL', '2XL', '3XL'].includes(size)) {
          size = 'L';
        }
        const name = parts[1] || '';
        const number = parts[2] || '';
        const note = parts[3] || '';

        newItems.push({
          id: `roster-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          size,
          name,
          number,
          positionOrNote: note,
        });
      }
    }

    if (newItems.length > 0) {
      setRoster(newItems);
      setIsBulkImportOpen(false);
      setActivePreviewIndex(0);
    }
  };

  // Calculate size counts
  const sizeCounts: SizeQtyMap = { S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0 };
  roster.forEach(item => {
    if (sizeCounts[item.size] !== undefined) {
      sizeCounts[item.size] += 1;
    } else {
      sizeCounts[item.size] = 1;
    }
  });

  const totalQty = roster.length;

  // Bulk discount calculation
  let discountPercent = 0;
  if (totalQty >= 50) discountPercent = 30;
  else if (totalQty >= 20) discountPercent = 20;
  else if (totalQty >= 10) discountPercent = 12;
  else if (totalQty >= 5) discountPercent = 5;

  const currentPreviewMember = roster[activePreviewIndex] || roster[0] || {
    size: 'L',
    name: 'NAME',
    number: '00',
  };

  const handleApplyToOrder = () => {
    onApplyRoster(roster, sizeCounts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div 
        className="relative w-full max-w-5xl bg-[#10131B] border border-amber-400/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-white/10 bg-[#0E1016]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/20 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>ระบบสกรีนชื่อ & เบอร์เสื้อเรียงตามไซส์ (Team Roster)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-mono">
                  รวม {totalQty} ตัว
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                กรอกรายชื่อนักกีฬา สมาชิกแก๊ง หรือพนักงาน เพื่อพิมพ์สกรีนหลังเสื้ออัตโนมัติ ไม่ต้องสั่งทีละตัว
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

        {/* Main Body Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Roster Table & Quick Add (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ เพิ่มรายชื่อ</span>
                </button>

                <button
                  onClick={() => setIsBulkImportOpen(!isBulkImportOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                  <span>วางข้อมูลจาก Excel / LINE</span>
                </button>
              </div>

              {/* Discount Badge */}
              {discountPercent > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <Percent className="w-3.5 h-3.5" />
                  <span>ส่วนลดทีม {discountPercent}%</span>
                </div>
              )}
            </div>

            {/* Bulk Import Drawer */}
            {isBulkImportOpen && (
              <div className="p-3.5 bg-white/5 border border-white/15 rounded-xl space-y-2.5 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">วางข้อความเรียง: ไซส์, ชื่อ, เบอร์, ตำแหน่ง</span>
                  <span className="text-[10px] text-slate-400">(บรรทัดละ 1 คน)</span>
                </div>
                <textarea
                  rows={4}
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-slate-200 focus:border-amber-400 focus:outline-none"
                  placeholder="M, สมชาย, 09, กองหน้า&#10;L, สมศรี, 10, กัปตัน"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsBulkImportOpen(false)}
                    className="px-3 py-1 text-slate-400 hover:text-white"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleProcessBulkImport}
                    className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-lg"
                  >
                    นำเข้ารายชื่อ
                  </button>
                </div>
              </div>
            )}

            {/* Roster Input Rows Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161B26] text-slate-400 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3 w-20">ไซส์</th>
                    <th className="py-2.5 px-3">ชื่อสกรีนหลัง</th>
                    <th className="py-2.5 px-3 w-20">เบอร์</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">ตำแหน่ง / โน้ต</th>
                    <th className="py-2.5 px-2 w-16 text-center">ดูแบบ</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {roster.map((item, idx) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-white/[0.03] transition-colors ${
                        activePreviewIndex === idx ? 'bg-amber-400/[0.08]' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <select
                          value={item.size}
                          onChange={(e) => handleUpdateRow(item.id, { size: e.target.value })}
                          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                        >
                          {['S', 'M', 'L', 'XL', '2XL', '3XL'].map(s => (
                            <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateRow(item.id, { name: e.target.value })}
                          placeholder="ชื่อสกรีน (เช่น SOMCHAI)"
                          className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:border-amber-400 focus:outline-none font-semibold uppercase"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          maxLength={3}
                          value={item.number}
                          onChange={(e) => handleUpdateRow(item.id, { number: e.target.value })}
                          placeholder="เบอร์"
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white text-center font-mono font-bold focus:border-amber-400 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 hidden sm:table-cell">
                        <input
                          type="text"
                          value={item.positionOrNote || ''}
                          onChange={(e) => handleUpdateRow(item.id, { positionOrNote: e.target.value })}
                          placeholder="เช่น กัปตัน, เบอร์ 1"
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-slate-300 focus:border-amber-400 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => setActivePreviewIndex(idx)}
                          className={`p-1.5 rounded transition-colors ${
                            activePreviewIndex === idx ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                          }`}
                          title="ดูพรีวิวตัวนี้"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="ลบแถวนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Size Summary Breakdown */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs space-y-1.5">
              <span className="font-semibold text-slate-300">สรุปยอดรวมแต่ละไซส์:</span>
              <div className="flex flex-wrap gap-2 pt-1 font-mono">
                {Object.entries(sizeCounts).map(([size, count]) => (
                  <div key={size} className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">{size}:</span>
                    <span className="text-white font-semibold">{count} ตัว</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Back Mockup Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shirt className="w-4 h-4 text-amber-400" />
                <span>พรีวิวหลังเสื้อ (คนปัจจุบัน):</span>
              </span>
              <span className="text-[11px] font-mono text-amber-400">
                ไซส์ {currentPreviewMember.size} · {currentPreviewMember.name || 'ไม่มีชื่อ'} #{currentPreviewMember.number || '--'}
              </span>
            </div>

            {/* Back Shirt Canvas Preview */}
            <div className="relative aspect-[4/5] w-full bg-[#0B0D12] rounded-xl border border-white/10 flex items-center justify-center p-3 overflow-hidden shadow-inner">
              <svg
                viewBox="0 0 600 700"
                className="w-full h-full object-contain pointer-events-none filter drop-shadow-lg"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Garment silhouette back */}
                <path
                  d="M 220,80 Q 300,95 380,80 L 470,120 L 535,210 L 460,255 L 435,210 L 430,620 Q 300,630 170,620 L 165,210 L 140,255 L 65,210 L 130,120 Z"
                  fill={shirtColor.hex}
                />
                {/* Collar */}
                <path
                  d="M 220,80 Q 300,105 380,80 Q 345,72 300,72 Q 255,72 220,80 Z"
                  fill="none"
                  stroke={shirtColor.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                  strokeWidth="8"
                />
              </svg>

              {/* Roster Name & Number overlay on back */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center pt-8">
                {/* Name curved / straight */}
                <div 
                  className="font-black tracking-widest uppercase transition-all px-4 text-center filter drop-shadow-md"
                  style={{
                    fontFamily: nameFont,
                    color: fontColor,
                    fontSize: '24px',
                    letterSpacing: '4px',
                    textShadow: shirtColor.isDark ? '0 2px 4px rgba(0,0,0,0.9)' : '0 1px 2px rgba(255,255,255,0.6)',
                  }}
                >
                  {currentPreviewMember.name || 'YOUR NAME'}
                </div>

                {/* Big Jersey Number */}
                <div 
                  className="font-black font-mono transition-all filter drop-shadow-md leading-none mt-2"
                  style={{
                    color: fontColor,
                    fontSize: '80px',
                    textShadow: shirtColor.isDark ? '0 3px 6px rgba(0,0,0,0.9)' : '0 1px 2px rgba(255,255,255,0.6)',
                  }}
                >
                  {currentPreviewMember.number || '00'}
                </div>

                {/* Position subtitle */}
                {currentPreviewMember.positionOrNote && (
                  <div className="text-[11px] font-bold text-amber-400 mt-2 tracking-wider uppercase bg-black/40 px-2 py-0.5 rounded">
                    {currentPreviewMember.positionOrNote}
                  </div>
                )}
              </div>
            </div>

            {/* Typography Controls for Roster */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">สีตัวอักษรเบอร์:</span>
                <div className="flex items-center gap-1.5">
                  {['#ffffff', '#f59e0b', '#ef4444', '#38bdf8', '#10b981', '#121316'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFontColor(c)}
                      className={`w-5 h-5 rounded-full border ${fontColor === c ? 'border-amber-400 scale-110' : 'border-white/20'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">ฟอนต์ชื่อ:</span>
                <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded">
                  <button
                    onClick={() => setNameFont('Impact, sans-serif')}
                    className={`px-2 py-0.5 rounded text-[11px] ${nameFont === 'Impact, sans-serif' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    Varsity Impact
                  </button>
                  <button
                    onClick={() => setNameFont('Prompt, sans-serif')}
                    className={`px-2 py-0.5 rounded text-[11px] ${nameFont === 'Prompt, sans-serif' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    Prompt Modern
                  </button>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={handleApplyToOrder}
              disabled={roster.length === 0}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all active:scale-95 mt-auto"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>นำรายชื่อทั้งหมด {totalQty} ตัว ไปจัดออเดอร์ทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
