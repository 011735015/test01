import React, { useState, useRef } from 'react';
import { 
  ShirtStyle, 
  ShirtColor, 
  PrintLayer, 
  PrintTechnology, 
  PrintSizeOption, 
  PresetArt,
  TextProperties 
} from '../types';
import { 
  SHIRT_STYLES, 
  PRINT_TECHNOLOGIES, 
  PRINT_SIZES, 
  PRESET_ARTWORKS 
} from '../data/mockData';
import { 
  Upload, 
  Sparkles, 
  Type, 
  Shirt, 
  Sliders, 
  Layers, 
  Check, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  RotateCw,
  Eye,
  Info,
  Scissors,
  Maximize2,
  Users,
  Palette,
  SunMedium
} from 'lucide-react';

interface StudioControlsProps {
  shirtStyle: ShirtStyle;
  onSelectShirtStyle: (style: ShirtStyle) => void;
  shirtColor: ShirtColor;
  onSelectShirtColor: (color: ShirtColor) => void;
  activeSide: 'front' | 'back';
  onToggleSide: (side: 'front' | 'back') => void;
  printTech: PrintTechnology;
  onSelectPrintTech: (tech: PrintTechnology) => void;
  printSize: PrintSizeOption;
  onSelectPrintSize: (size: PrintSizeOption) => void;
  layers: PrintLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onAddImageLayer: (imageUrl: string, name: string) => void;
  onAddTextLayer: (text: string, font: string, color: string, isBold: boolean, textProps?: Partial<TextProperties>) => void;
  onDeleteLayer: (id: string) => void;
  onOpenImageAiTools?: (tab: 'remove_bg' | 'upscale' | 'ai_prompt') => void;
  onOpenTeamRoster?: () => void;
}

type TabType = 'upload' | 'ai_prompt' | 'preset' | 'text' | 'garment' | 'tech' | 'layers';

const StudioControlsComponent: React.FC<StudioControlsProps> = ({
  shirtStyle,
  onSelectShirtStyle,
  shirtColor,
  onSelectShirtColor,
  activeSide,
  onToggleSide,
  printTech,
  onSelectPrintTech,
  printSize,
  onSelectPrintSize,
  layers,
  selectedLayerId,
  onSelectLayer,
  onAddImageLayer,
  onAddTextLayer,
  onDeleteLayer,
  onOpenImageAiTools,
  onOpenTeamRoster,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset Art filter
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>('All');

  // Garment Style filter
  const [styleCategoryFilter, setStyleCategoryFilter] = useState<'all' | 'tshirt' | 'polo' | 'long' | 'tank'>('all');

  // Text layer form states
  const [customText, setCustomText] = useState('BANGKOK');
  const [fontFamily, setFontFamily] = useState<'Prompt, sans-serif' | 'Impact, sans-serif' | 'monospace' | 'serif'>('Prompt, sans-serif');
  const [textColor, setTextColor] = useState('#ffffff');
  const [isTextBold, setIsTextBold] = useState(true);

  // Advanced typography states
  const [isCurved, setIsCurved] = useState(false);
  const [curveRadius, setCurveRadius] = useState(35);
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(0);
  const [shadowColor, setShadowColor] = useState('rgba(0,0,0,0.85)');

  // Upload history in this session
  const [uploadedImages, setUploadedImages] = useState<{ url: string; name: string }[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          const name = file.name.replace(/\.[^/.]+$/, '');
          setUploadedImages(prev => [{ url, name }, ...prev]);
          onAddImageLayer(url, name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onAddTextLayer(customText.trim(), fontFamily, textColor, isTextBold, {
      curved: isCurved,
      curveRadius: isCurved ? curveRadius : 0,
      strokeWidth,
      strokeColor,
      shadowBlur,
      shadowColor,
      shadowOffsetX: 2,
      shadowOffsetY: 3,
    });
  };

  const filteredPresets = selectedPresetCategory === 'All'
    ? PRESET_ARTWORKS
    : PRESET_ARTWORKS.filter(p => p.category === selectedPresetCategory);

  const presetCategories = ['All', 'Streetwear', 'Japanese & Neo', 'Vintage', 'Typography', 'Thai Neo'];

  const colorPalettes = [
    '#ffffff', '#121316', '#f59e0b', '#ef4444', '#38bdf8', '#10b981', '#a855f7', '#fb7185', '#d97706'
  ];

  return (
    <div className="w-full lg:w-[430px] flex flex-col bg-[#11141C] border-l border-white/10 h-full overflow-hidden text-slate-100">
      {/* Top Tab Bar */}
      <div className="flex items-center overflow-x-auto border-b border-white/10 bg-[#0E1015] scrollbar-none p-1.5 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
            activeTab === 'upload'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>อัปโหลดรูป</span>
        </button>

        <button
          onClick={() => {
            if (onOpenImageAiTools) {
              onOpenImageAiTools('ai_prompt');
            } else {
              setActiveTab('ai_prompt');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
            activeTab === 'ai_prompt'
              ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-bold shadow-sm'
              : 'text-amber-400 hover:bg-amber-400/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>เจนด้วย AI</span>
        </button>

        <button
          onClick={() => setActiveTab('preset')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
            activeTab === 'preset'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>คลังลาย</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
            activeTab === 'text'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>ข้อความ</span>
        </button>

        <button
          onClick={() => setActiveTab('garment')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
            activeTab === 'garment'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>ทรง & สี</span>
        </button>

        <button
          onClick={() => setActiveTab('tech')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
            activeTab === 'tech'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>เทคนิค</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
            activeTab === 'layers'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>เลเยอร์ ({layers.length})</span>
        </button>
      </div>

      {/* Target Side & Quick Color Bar */}
      <div className="flex flex-col gap-1.5 px-4 py-2 bg-white/[0.03] border-b border-white/5 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-300">สีเสื้อ:</span>
            <span className="font-semibold text-amber-400 text-[11px]">{shirtColor.thaiName}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleSide('front')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                activeSide === 'front' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              อกหน้า
            </button>
            <button
              type="button"
              onClick={() => onToggleSide('back')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                activeSide === 'back' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              หลังเสื้อ
            </button>
          </div>
        </div>

        {/* 11 Quick Colors Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          {shirtStyle.availableColors.map(c => {
            const isSelected = shirtColor.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectShirtColor(c)}
                className={`relative group w-5 h-5 rounded-full border transition-all shrink-0 flex items-center justify-center ${
                  isSelected 
                    ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-[#11141C] scale-110 border-white' 
                    : 'border-white/20 hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.thaiName}
              >
                {isSelected && (
                  <span className={`w-1 h-1 rounded-full ${c.isDark ? 'bg-white' : 'bg-slate-900'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* TAB 1: UPLOAD LOCAL IMAGE */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">ใส่รูปภาพจากเครื่องของคุณ</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                อัปโหลดรูปถ่าย กราฟิก หรือโลโก้ (PNG, JPG, SVG, WebP)
              </p>
            </div>

            {/* Hidden Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Upload Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-white/20 hover:border-amber-400/80 bg-white/[0.02] hover:bg-amber-400/[0.03] rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 group-hover:bg-amber-400/20 text-amber-400 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                  คลิกเพื่อเลือกไฟล์รูปจากอุปกรณ์
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">หรือลากไฟล์ภาพมาวางบนเสื้อได้ทันที</p>
              </div>
            </div>

            {/* AI Enhancement Quick Action Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-400/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <span>มีรูปติดพื้นหลัง หรือภาพแตกไม่ชัด?</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ระบบมีเครื่องมือ AI ช่วยตัดพื้นหลังเนียนกริบ และอัปสเกล 300 DPI ป้องกันปัญหาภาพแตกเมื่อพิมพ์จริง
              </p>
              <div className="flex items-center gap-2 pt-1">
                {onOpenImageAiTools && (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenImageAiTools('remove_bg')}
                      className="px-2.5 py-1.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-300 transition-all flex items-center gap-1"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>ลบพื้นหลัง AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenImageAiTools('upscale')}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>อัปสเกล 300 DPI</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Recent Uploads tray in this session */}
            {uploadedImages.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-slate-300">รูปภาพที่อัปโหลดไว้แล้วในเซสชันนี้:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((img, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square bg-[#1a1e29] rounded-lg border border-white/10 overflow-hidden p-1.5 flex flex-col items-center justify-center transition-all"
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="max-h-full max-w-full object-contain"
                      />
                      <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity p-1">
                        <button
                          onClick={() => onAddImageLayer(img.url, img.name)}
                          className="w-full py-1 bg-amber-400 text-slate-950 text-[10px] font-bold rounded"
                        >
                          + วางลงเสื้อ
                        </button>
                        {onOpenImageAiTools && (
                          <button
                            onClick={() => onOpenImageAiTools('remove_bg')}
                            className="w-full py-1 bg-white/20 text-white text-[9px] rounded flex items-center justify-center gap-0.5"
                          >
                            <Scissors className="w-2.5 h-2.5" />
                            <span>ไดคัท</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI PROMPT GENERATOR QUICK TRIGGER */}
        {activeTab === 'ai_prompt' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>สั่ง AI เจนลายเสื้อด้วยคำสั่งภาษาไทย</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                เพียงพิมพ์ไอเดีย เช่น &quot;แมวอวกาศสไตล์ไซเบอร์พังก์&quot; ได้ลายเสื้อเท่ๆ ทันที
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <p className="text-xs text-slate-300">
                เปิดเครื่องมือเต็มรูปแบบเพื่อเลือกสไตล์ (Cyberpunk, 90s Vintage, Neo Thai, Manga) และสั่งไดคัทพื้นหลังอัตโนมัติ
              </p>
              <button
                type="button"
                onClick={() => onOpenImageAiTools?.('ai_prompt')}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>เปิดห้องทำงาน AI Image Generator</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PRESET ARTWORKS */}
        {activeTab === 'preset' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">เลือกลายเสื้อสำเร็จรูป</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                กราฟิกสไตล์สตรีทแวร์ เรโทร ญี่ปุ่น นีโอไทย คมชัดพร้อมสกรีน
              </p>
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {presetCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedPresetCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                    selectedPresetCategory === cat
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'All' ? 'ทุกลาย' : cat}
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredPresets.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => onAddImageLayer(preset.svgDataUri, preset.title)}
                  className="group relative bg-[#181C26] hover:bg-[#1E2330] border border-white/10 hover:border-amber-400/80 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center"
                >
                  <div className="w-full aspect-square bg-[#0F121A] rounded-lg p-2 flex items-center justify-center overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                    <img
                      src={preset.svgDataUri}
                      alt={preset.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                    {preset.title}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {preset.category}
                  </span>
                  <button className="mt-2 w-full py-1 text-[11px] font-medium bg-white/5 group-hover:bg-amber-400 group-hover:text-slate-950 rounded text-slate-300 transition-colors flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span>วางลงเสื้อ</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOM TEXT & TEAM ROSTER */}
        {activeTab === 'text' && (
          <form onSubmit={handleAddText} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">เพิ่มข้อความตัวอักษร</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  พิมพ์ชื่อแบรนด์ คำคม โลโก้ หรือเบอร์เสื้อ
                </p>
              </div>

              {onOpenTeamRoster && (
                <button
                  type="button"
                  onClick={onOpenTeamRoster}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/20 flex items-center gap-1 transition-colors"
                  title="สั่งสกรีนชื่อ & เบอร์ทีมตามไซส์"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>สกรีนชื่อทีม</span>
                </button>
              )}
            </div>

            {/* Input Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">ข้อความของคุณ:</label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="เช่น BANGKOK, 1998, OVERSIZE..."
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none rounded-xl text-sm text-white placeholder-slate-500"
              />
            </div>

            {/* Font Family Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">รูปแบบฟอนต์ (Font Style):</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Prompt, sans-serif', label: 'Prompt (โมเดิร์น)' },
                  { id: 'Impact, sans-serif', label: 'Impact (สตรีทหนา)' },
                  { id: 'monospace', label: 'Monospace (มินิมอล)' },
                  { id: 'serif', label: 'Serif (วินเทจ)' },
                ].map(font => (
                  <button
                    type="button"
                    key={font.id}
                    onClick={() => setFontFamily(font.id as any)}
                    className={`px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                      fontFamily === font.id
                        ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                    }`}
                    style={{ fontFamily: font.id }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Enhancements: Curved Arc, Stroke, Shadow */}
            <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-3">
              <span className="text-xs font-bold text-amber-400 block">ลูกเล่นตัวอักษรสตรีท & วินเทจ:</span>

              {/* Curved Text Arc */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="curveToggle"
                      checked={isCurved}
                      onChange={(e) => setIsCurved(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                    <label htmlFor="curveToggle" className="text-xs text-slate-300 cursor-pointer">
                      ดัดโค้งข้อความ (Curved Text Arc)
                    </label>
                  </div>
                  {isCurved && <span className="font-mono text-xs text-amber-400">{curveRadius}%</span>}
                </div>
                {isCurved && (
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={curveRadius}
                    onChange={(e) => setCurveRadius(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded accent-amber-400 cursor-pointer"
                  />
                )}
              </div>

              {/* Stroke */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">เส้นขอบตัวอักษร (Stroke):</span>
                  <span className="font-mono text-amber-400">{strokeWidth} px</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-700 rounded accent-amber-400 cursor-pointer"
                  />
                  {strokeWidth > 0 && (
                    <div className="flex items-center gap-1">
                      {['#000000', '#ffffff', '#f59e0b', '#ef4444'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setStrokeColor(c)}
                          className={`w-4 h-4 rounded-full border ${strokeColor === c ? 'border-amber-400 scale-110' : 'border-white/20'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Shadow */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">เงาตกกระทบ (Drop Shadow):</span>
                  <span className="font-mono text-amber-400">{shadowBlur} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={shadowBlur}
                  onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Text Color Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">สีข้อความ:</label>
                <span className="font-mono text-xs text-amber-400">{textColor}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {colorPalettes.map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setTextColor(c)}
                    className={`w-7 h-7 rounded-lg border transition-transform ${
                      textColor === c ? 'border-amber-400 scale-110 shadow-md ring-2 ring-amber-400/50' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border border-white/20"
                  title="เลือกสีอื่น"
                />
              </div>
            </div>

            {/* Bold Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="boldText"
                checked={isTextBold}
                onChange={(e) => setIsTextBold(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
              <label htmlFor="boldText" className="text-xs text-slate-300 cursor-pointer">
                ตัวหนาพิเศษ (Bold Typography)
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มข้อความลงบนเสื้อ ({activeSide === 'front' ? 'อกหน้า' : 'หลังเสื้อ'})</span>
            </button>
          </form>
        )}

        {/* TAB 5: GARMENT STYLE & FABRIC COLOR */}
        {activeTab === 'garment' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-white">เลือกรุ่นทรงเสื้อ & สีเนื้อผ้า</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                คอตตอนคุณภาพพรีเมียม ตัดเย็บเกรดส่งออก นุ่ม ทรงสวย ซักไม่ย้วย
              </p>
            </div>

            {/* Garment Cut list */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-white">ทรงเสื้อ:</label>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-mono font-semibold border border-amber-400/20">
                    {SHIRT_STYLES.length} รูปแบบ
                  </span>
                </div>
                <span className="text-[11px] text-amber-400 font-bold">{shirtStyle.thaiName.split(' ')[0]}</span>
              </div>

              {/* Style Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {[
                  { id: 'all', label: 'ทั้งหมด (8)' },
                  { id: 'tshirt', label: 'คอกลม & คอวี' },
                  { id: 'polo', label: 'คอปกโปโล' },
                  { id: 'long', label: 'แขนยาว & ฮู้ด' },
                  { id: 'tank', label: 'เสื้อกล้าม' },
                ].map(cat => {
                  const isCatSelected = styleCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setStyleCategoryFilter(cat.id as typeof styleCategoryFilter)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                        isCatSelected
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {SHIRT_STYLES
                  .filter(style => {
                    if (styleCategoryFilter === 'all') return true;
                    if (styleCategoryFilter === 'tshirt') return ['crewneck', 'oversized', 'vneck', 'boxy_washed'].includes(style.id);
                    if (styleCategoryFilter === 'polo') return style.id === 'polo';
                    if (styleCategoryFilter === 'long') return ['longsleeve', 'hoodie'].includes(style.id);
                    if (styleCategoryFilter === 'tank') return style.id === 'tanktop';
                    return true;
                  })
                  .map(style => {
                    const isSelected = shirtStyle.id === style.id;
                    const badge = (() => {
                      switch (style.id) {
                        case 'polo': return { text: 'คอปกพรีเมียม', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
                        case 'crewneck': return { text: 'คอกลมมาตรฐาน', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
                        case 'oversized': return { text: 'ยอดนิยมสูงสุด', bg: 'bg-amber-400/20 text-amber-300 border-amber-400/30' };
                        case 'vneck': return { text: 'คอวีโมเดิร์น', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
                        case 'longsleeve': return { text: 'แขนยาวจั๊มปลาย', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
                        case 'tanktop': return { text: 'เสื้อกล้ามสปอร์ต', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
                        case 'boxy_washed': return { text: 'วินเทจ 90s', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
                        case 'hoodie': return { text: 'ฮู้ดดี้หนานุ่ม', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
                        default: return null;
                      }
                    })();

                    return (
                      <div
                        key={style.id}
                        onClick={() => {
                          onSelectShirtStyle(style);
                          if (!style.availableColors.some(c => c.id === shirtColor.id)) {
                            onSelectShirtColor(style.availableColors[0]);
                          }
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-white truncate">{style.name}</span>
                            {badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold shrink-0 ${badge.bg}`}>
                                {badge.text}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                            ฿{style.basePrice}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">{style.thaiName}</p>
                        <div className="flex items-center gap-2.5 mt-2 text-[10px] text-slate-500 font-mono">
                          <span className="font-semibold text-slate-400">{style.gsm} GSM</span>
                          <span>·</span>
                          <span className="truncate">{style.thaiMaterial}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Fabric Color Swatches - 11 Core Colors */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-white">สีเสื้อ (11 สีมาตรฐาน):</label>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-mono font-semibold border border-amber-400/20">
                    11 สี
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block shadow-inner"
                    style={{ backgroundColor: shirtColor.hex }}
                  />
                  <span className="font-semibold text-amber-400">{shirtColor.thaiName}</span>
                </div>
              </div>

              {/* 11 Colors Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {shirtStyle.availableColors.map(color => {
                  const isSelected = shirtColor.id === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => onSelectShirtColor(color)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left group ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 shadow-md ring-1 ring-amber-400/30'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full border shadow-inner flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          color.id === 'white' ? 'border-slate-400' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 ${color.isDark ? 'text-white' : 'text-slate-900'} stroke-[3]`} />
                        )}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-xs truncate ${isSelected ? 'text-amber-300 font-bold' : 'text-slate-200 font-medium'}`}>
                          {color.thaiName}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PRINT TECHNOLOGY */}
        {activeTab === 'tech' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-white">เทคนิคการสกรีน & ขนาดยาง</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                เลือกรูปแบบการพิมพ์ที่เหมาะกับลายเสื้อและงบประมาณของคุณ
              </p>
            </div>

            {/* Print Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">ขนาดพื้นที่สกรีน:</label>
              <div className="grid grid-cols-2 gap-2">
                {PRINT_SIZES.map(size => {
                  const isSelected = printSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => onSelectPrintSize(size)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 text-white font-bold ring-1 ring-amber-400/30'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span>{size.name.split('-')[0].trim()}</span>
                        <span className="font-mono text-amber-400">
                          {size.priceDelta > 0 ? `+฿${size.priceDelta}` : 'รวมในราคาหลัก'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{size.dimensions}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Print Tech list */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-semibold text-slate-300">เทคโนโลยีการพิมพ์:</label>
              {PRINT_TECHNOLOGIES.map(tech => {
                const isSelected = printTech.id === tech.id;
                return (
                  <div
                    key={tech.id}
                    onClick={() => onSelectPrintTech(tech)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tech.thaiName}</span>
                      <span className="text-[10px] font-mono text-amber-400">
                        {tech.priceDelta > 0 ? `+฿${tech.priceDelta}/ตัว` : 'รวมในราคาหลัก'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">{tech.description}</p>
                    <div className="mt-2 text-[10px] text-amber-300 font-medium">
                      ✓ {tech.highlight}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 7: LAYERS LIST */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">จัดการเลเยอร์ลายสกรีน</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                เลือก ปรับแต่ง หรือลบองค์ประกอบต่างๆ บนเสื้อ
              </p>
            </div>

            {layers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                ยังไม่มีลายสกรีนบนเสื้อ คลิกที่แถบ &apos;อัปโหลดรูป&apos; หรือ &apos;เจนด้วย AI&apos; เพื่อเริ่มออกแบบ
              </div>
            ) : (
              <div className="space-y-2">
                {layers.map(layer => {
                  const isSelected = layer.id === selectedLayerId;
                  return (
                    <div
                      key={layer.id}
                      onClick={() => onSelectLayer(layer.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between gap-2 transition-all ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 text-white'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {layer.type === 'text' ? (
                          <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                            <Type className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white/5 p-1 flex items-center justify-center shrink-0">
                            <img src={layer.content} alt={layer.name} className="max-w-full max-h-full object-contain" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold truncate text-white">{layer.name}</p>
                          <span className="text-[10px] text-slate-400">
                            {layer.side === 'front' ? 'อกหน้า' : 'หลังเสื้อ'} · ขนาด {Math.round(layer.scale * 100)}%
                            {layer.isBgRemoved && ' · ไดคัท'}
                            {layer.isUpscaled && ' · 300 DPI'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLayer(layer.id);
                          }}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
                          title="ลบเลเยอร์นี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const StudioControls = React.memo(StudioControlsComponent);
