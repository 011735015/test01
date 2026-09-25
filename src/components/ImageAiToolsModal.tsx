import React, { useState, useRef, useEffect } from 'react';
import { PrintLayer, PrintSizeOption } from '../types';
import { 
  removeImageBackground, 
  upscaleAndEnhanceImage, 
  calculatePrintQuality,
  loadImage 
} from '../utils/imageProcessing';
import { 
  X, 
  Scissors, 
  Maximize2, 
  Sparkles, 
  Sliders, 
  Check, 
  RotateCcw, 
  Pipette, 
  AlertTriangle, 
  ShieldCheck, 
  Loader2, 
  Download,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ImageAiToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLayer: PrintLayer | null;
  onApplyModifiedImage: (layerId: string, newImageUrl: string, metadata?: { isBgRemoved?: boolean; isUpscaled?: boolean }) => void;
  onAddNewAiLayer?: (imageUrl: string, promptName: string) => void;
  printSize: PrintSizeOption;
  initialTab?: 'remove_bg' | 'upscale' | 'ai_prompt';
}

export const ImageAiToolsModal: React.FC<ImageAiToolsModalProps> = ({
  isOpen,
  onClose,
  targetLayer,
  onApplyModifiedImage,
  onAddNewAiLayer,
  printSize,
  initialTab = 'remove_bg',
}) => {
  const [activeTab, setActiveTab] = useState<'remove_bg' | 'upscale' | 'ai_prompt'>(initialTab);

  // Background removal states
  const [bgTolerance, setBgTolerance] = useState(28);
  const [bgFeather, setBgFeather] = useState(3);
  const [pickedColor, setPickedColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [processedBgImage, setProcessedBgImage] = useState<string | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState(false);

  // Upscale states
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 4>(2);
  const [sharpnessLevel, setSharpnessLevel] = useState(65);
  const [contrastBoost, setContrastBoost] = useState(true);
  const [processedUpscaleImage, setProcessedUpscaleImage] = useState<string | null>(null);
  const [upscaleMeta, setUpscaleMeta] = useState<{ originalDpi: number; newDpi: number; width: number; height: number } | null>(null);
  const [isProcessingUpscale, setIsProcessingUpscale] = useState(false);
  const [splitSliderPos, setSplitSliderPos] = useState(50); // % for comparison

  // AI Prompt Image Generation states
  const [promptInput, setPromptInput] = useState('แมวอวกาศสไตล์ไซเบอร์พังก์');
  const [selectedStyle, setSelectedStyle] = useState('Cyberpunk Streetwear');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3'>('1:1');
  const [autoRemoveAiBg, setAutoRemoveAiBg] = useState(true);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedAiResult, setGeneratedAiResult] = useState<string | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  // Canvas ref for color picker
  const pickerCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync initial tab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setProcessedBgImage(null);
      setProcessedUpscaleImage(null);
      setPickedColor(null);
    }
  }, [isOpen, initialTab, targetLayer]);

  // Run background removal preview when parameters change
  useEffect(() => {
    if (!isOpen || activeTab !== 'remove_bg' || !targetLayer || targetLayer.type === 'text') return;

    let isCancelled = false;
    const runRemoval = async () => {
      setIsProcessingBg(true);
      try {
        const result = await removeImageBackground(targetLayer.content, {
          tolerance: bgTolerance,
          feather: bgFeather,
          targetColor: pickedColor,
        });
        if (!isCancelled) {
          setProcessedBgImage(result.dataUrl);
        }
      } catch (err) {
        console.error('BG removal error:', err);
      } finally {
        if (!isCancelled) setIsProcessingBg(false);
      }
    };

    const timeout = setTimeout(runRemoval, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [isOpen, activeTab, targetLayer, bgTolerance, bgFeather, pickedColor]);

  // Run upscale processing
  const handleExecuteUpscale = async () => {
    if (!targetLayer || targetLayer.type === 'text') return;
    setIsProcessingUpscale(true);
    try {
      const result = await upscaleAndEnhanceImage(targetLayer.content, {
        scale: upscaleFactor,
        sharpness: sharpnessLevel,
        contrastBoost: contrastBoost,
      });
      setProcessedUpscaleImage(result.dataUrl);
      setUpscaleMeta({
        originalDpi: result.originalDpi,
        newDpi: result.newDpi,
        width: result.width,
        height: result.height,
      });
    } catch (err) {
      console.error('Upscale error:', err);
    } finally {
      setIsProcessingUpscale(false);
    }
  };

  // Run AI Image generation via server API
  const handleGenerateAiImage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    setIsGeneratingAi(true);
    setAiErrorMsg(null);
    setGeneratedAiResult(null);

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput.trim(),
          style: selectedStyle,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ไม่สามารถสร้างภาพได้ในขณะนี้');
      }

      let finalUrl = data.imageUrl;

      // Auto-remove background if requested
      if (autoRemoveAiBg && finalUrl) {
        try {
          const cut = await removeImageBackground(finalUrl, { tolerance: 22, feather: 2 });
          finalUrl = cut.dataUrl;
        } catch {
          // Keep original if cutout fails
        }
      }

      setGeneratedAiResult(finalUrl);
    } catch (err: any) {
      setAiErrorMsg(err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ AI');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Handle color sampling click
  const handleCanvasClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPickingColor || !targetLayer) return;
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * img.naturalHeight);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setPickedColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    setIsPickingColor(false);
  };

  if (!isOpen) return null;

  // Print quality analysis
  const quality = calculatePrintQuality(
    targetLayer?.originalWidth || 800,
    targetLayer?.originalHeight || 800,
    printSize.id
  );

  const stylePresets = [
    { label: '🚀 ไซเบอร์พังก์ (Cyberpunk)', value: 'Cyberpunk Neon Streetwear' },
    { label: '🔥 วินเทจ 90s Bootleg', value: '90s Vintage Rap Tee Bootleg' },
    { label: '🇯🇵 นีโอเจแปน (Neo Japanese)', value: 'Japanese Ukiyo-e Graphic Streetwear' },
    { label: '⚡ สตรีทกราฟิตี้ (Graffiti)', value: 'Urban Streetwear Graffiti Art' },
    { label: '🐅 เสือเผ่น นีโอไทย', value: 'Neo Thai Sak Yant Tattoo Modern' },
    { label: '🐱 สติกเกอร์น่ารัก (Chibi)', value: 'Cute Chibi Anime Mascot Kawaii' },
    { label: '💀 ดาร์กเมทัล (Dark Grunge)', value: 'Dark Metal Distressed Gothic Skull' },
    { label: '🎨 มินิมอลลายเส้น (Minimalist)', value: 'Minimalist Line Art Vector' },
  ];

  const quickPrompts = [
    'แมวอวกาศสไตล์ไซเบอร์พังก์',
    'เสือมังกรนีโอไทย กราฟิกสตรีทแวร์',
    'กะโหลกวินเทจยุค 90s ตัวหนังสือฮิปฮอป',
    'นักบินอวกาศลอยในกาแล็กซีสไตล์มินิมอล',
    'ซามูไรจักรกลถือดาบคาตานะเลเซอร์',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#12151E] border border-amber-400/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-white/10 bg-[#0E1016]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>AI & Smart Studio Tools</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-mono font-normal border border-amber-400/20">
                  300 DPI READY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ลบพื้นหลังเนียนกริบ · อัปสเกลภาพคมชัด · เจนลายด้วยคำสั่ง Prompt
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

        {/* Feature Tab Bar */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-[#171B26] border-b border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('remove_bg')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'remove_bg'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>1. ลบพื้นหลังเนียนกริบ (Remove BG)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upscale');
              if (!processedUpscaleImage) {
                handleExecuteUpscale();
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'upscale'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>2. อัปสเกล 300 DPI คมชัด (Super Resolution)</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_prompt')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'ai_prompt'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-inherit" />
            <span>3. เจนลายใหม่ด้วย AI Prompt</span>
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: BACKGROUND REMOVAL */}
          {activeTab === 'remove_bg' && (
            <div className="space-y-6">
              {!targetLayer || targetLayer.type === 'text' ? (
                <div className="p-8 text-center bg-white/[0.02] border border-white/10 rounded-2xl">
                  <Scissors className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">กรุณาเลือกเลเยอร์ที่เป็นรูปภาพเพื่อลบพื้นหลัง</p>
                  <p className="text-xs text-slate-400 mt-1">
                    คลิกเลือกรูปภาพบนเสื้อ หรือแท็บ 'เจนลายใหม่ด้วย AI' ด้านบน
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Visual Comparison Stage */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        พรีวิวหลังลบพื้นหลัง (Transparent Grid):
                      </span>
                      {pickedColor && (
                        <div className="flex items-center gap-1.5 text-[11px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          <span>สีที่เลือกดูด:</span>
                          <span 
                            className="w-3.5 h-3.5 rounded border border-white/20"
                            style={{ backgroundColor: `rgb(${pickedColor.r}, ${pickedColor.g}, ${pickedColor.b})` }}
                          />
                          <button 
                            onClick={() => setPickedColor(null)}
                            className="text-rose-400 hover:underline ml-1"
                          >
                            รีเซ็ต
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stage Preview Box */}
                    <div className="relative aspect-square w-full bg-transparency-grid rounded-2xl border border-white/15 overflow-hidden flex items-center justify-center p-4 shadow-inner">
                      {isProcessingBg ? (
                        <div className="flex flex-col items-center gap-2 text-amber-400">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span className="text-xs font-semibold">กำลังคำนวณการไดคัทขอบเนียน...</span>
                        </div>
                      ) : processedBgImage ? (
                        <img
                          src={processedBgImage}
                          alt="Processed cutout"
                          className="max-w-full max-h-full object-contain filter drop-shadow-lg"
                        />
                      ) : (
                        <img
                          src={targetLayer.content}
                          alt="Original"
                          onClick={handleCanvasClick}
                          className={`max-w-full max-h-full object-contain ${
                            isPickingColor ? 'cursor-crosshair ring-2 ring-amber-400' : ''
                          }`}
                        />
                      )}

                      {/* Side-by-side thumbnail of original */}
                      <div className="absolute top-3 left-3 bg-[#0B0D12]/90 backdrop-blur-md border border-white/15 rounded-lg p-1.5 flex items-center gap-2 shadow-lg">
                        <img 
                          src={targetLayer.content} 
                          alt="Thumbnail original" 
                          className="w-10 h-10 object-contain rounded bg-black/40 border border-white/10" 
                        />
                        <div className="text-[10px] text-slate-300 pr-1">
                          <p className="font-semibold text-white">รูปต้นฉบับ</p>
                          <p className="text-slate-400 truncate max-w-[80px]">{targetLayer.name}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 text-center">
                      💡 ลายตารางหมากรุกแสดงพื้นที่โปร่งใส (ไม่มีหมึกสีขาวติดสกรีน ไดคัทลายเนียนกริบ)
                    </p>
                  </div>

                  {/* Right Column: Controls */}
                  <div className="lg:col-span-5 space-y-5 bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <span>ปรับความละเอียดการลบพื้นหลัง</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        เลื่อนปรับระดับความไว เพื่อเก็บรายละเอียดขอบลายหรือขจัดเงารอบรูป
                      </p>
                    </div>

                    {/* Tolerance Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-slate-300 font-medium">ระดับการตรวจจับสี (Tolerance):</label>
                        <span className="font-mono text-amber-400 font-bold">{bgTolerance}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="85"
                        value={bgTolerance}
                        onChange={(e) => setBgTolerance(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg accent-amber-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>ลบน้อย (เก็บรายละเอียด)</span>
                        <span>ลบมาก (ขจัดพื้นหลังเกลี้ยง)</span>
                      </div>
                    </div>

                    {/* Feather Edge Smoothing Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-slate-300 font-medium">ความนุ่มนวลของขอบ (Edge Feather):</label>
                        <span className="font-mono text-amber-400 font-bold">{bgFeather} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={bgFeather}
                        onChange={(e) => setBgFeather(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg accent-amber-400 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">
                        ช่วยไม่ให้ขอบภาพเป็นรอยฟันปลาหรือมีขอบขาวลอยขึ้นมาบนเสื้อสีเข้ม
                      </p>
                    </div>

                    {/* Pipette Eye Dropper Tool */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">ต้องการลบสีเฉพาะจุด?</span>
                        <button
                          onClick={() => setIsPickingColor(!isPickingColor)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                            isPickingColor
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Pipette className="w-3.5 h-3.5" />
                          <span>{isPickingColor ? 'คลิกที่รูปเพื่อเลือกสี' : 'ดูดสีพื้นหลัง'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        หากภาพของคุณมีพื้นหลังสีอื่น (เช่น สีเขียว, สีเทา, หรือสีแดง) ให้กดปุ่มดูดสีแล้วคลิกที่ส่วนพื้นหลัง
                      </p>
                    </div>

                    {/* Action Apply Button */}
                    <div className="pt-2 space-y-2">
                      <button
                        onClick={() => {
                          if (processedBgImage && targetLayer) {
                            onApplyModifiedImage(targetLayer.id, processedBgImage, { isBgRemoved: true });
                            onClose();
                          }
                        }}
                        disabled={!processedBgImage || isProcessingBg}
                        className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>นำภาพที่ไดคัทแล้วไปใส่บนเสื้อทันที</span>
                      </button>

                      <button
                        onClick={() => {
                          setBgTolerance(28);
                          setBgFeather(3);
                          setPickedColor(null);
                        }}
                        className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>รีเซ็ตค่าเริ่มต้น</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUPER RESOLUTION UPSCALE (300 DPI) */}
          {activeTab === 'upscale' && (
            <div className="space-y-6">
              {!targetLayer || targetLayer.type === 'text' ? (
                <div className="p-8 text-center bg-white/[0.02] border border-white/10 rounded-2xl">
                  <Maximize2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">กรุณาเลือกเลเยอร์ที่เป็นรูปภาพเพื่ออัปสเกล</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Visual Split Comparison */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        เปรียบเทียบก่อน - หลังอัปสเกล (Before / After):
                      </span>
                      <span className="text-[11px] font-mono text-amber-400">
                        {upscaleMeta ? `${upscaleMeta.originalDpi} DPI ➜ ${upscaleMeta.newDpi} DPI` : 'กำลังเตรียมพร้อม...'}
                      </span>
                    </div>

                    {/* Split View Container */}
                    <div className="relative aspect-square w-full bg-[#0B0D12] rounded-2xl border border-white/15 overflow-hidden flex items-center justify-center shadow-inner select-none">
                      {isProcessingUpscale ? (
                        <div className="flex flex-col items-center gap-3 text-amber-400">
                          <Loader2 className="w-10 h-10 animate-spin" />
                          <span className="text-xs font-semibold">กำลังประมวลผล Super Resolution & Edge Sharpening...</span>
                        </div>
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                          {/* After image (full width) */}
                          <img
                            src={processedUpscaleImage || targetLayer.content}
                            alt="Upscaled"
                            className="max-w-full max-h-full object-contain"
                          />

                          {/* Before image clipped on left side */}
                          {processedUpscaleImage && (
                            <div 
                              className="absolute inset-0 p-4 flex items-center justify-center overflow-hidden pointer-events-none"
                              style={{ clipPath: `inset(0 ${100 - splitSliderPos}% 0 0)` }}
                            >
                              <img
                                src={targetLayer.content}
                                alt="Original before"
                                className="max-w-full max-h-full object-contain filter blur-[0.6px]"
                              />
                            </div>
                          )}

                          {/* Split Divider Handle */}
                          {processedUpscaleImage && (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_12px_#f59e0b] z-20 pointer-events-none"
                              style={{ left: `${splitSliderPos}%` }}
                            >
                              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow-lg">
                                ↔
                              </div>
                            </div>
                          )}

                          {/* Tags: Before and After */}
                          <div className="absolute bottom-3 left-3 bg-black/80 px-2 py-1 rounded text-[10px] font-mono text-slate-300 pointer-events-none">
                            ก่อน (72 DPI)
                          </div>
                          <div className="absolute bottom-3 right-3 bg-amber-400/90 text-slate-950 px-2 py-1 rounded text-[10px] font-mono font-bold pointer-events-none">
                            หลัง (300 DPI คมกริบ)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comparison Slider Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>ลากเพื่อสไลด์ดูความต่าง:</span>
                        <span>{splitSliderPos}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={splitSliderPos}
                        onChange={(e) => setSplitSliderPos(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right Column: Upscaler Parameters */}
                  <div className="lg:col-span-5 space-y-5 bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>ระบบขยายความละเอียด Super Resolution</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        ช่วยให้ภาพที่เซฟจากมือถือ/อินเทอร์เน็ต คมชัด ไม่แตกเป็นพิกเซลเมื่อสกรีนลงผ้าจริง
                      </p>
                    </div>

                    {/* Scale Factor Buttons */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">อัตราการขยาย (Scale Factor):</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setUpscaleFactor(2);
                            setTimeout(handleExecuteUpscale, 50);
                          }}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            upscaleFactor === 2
                              ? 'bg-amber-400/10 border-amber-400 text-amber-300 ring-1 ring-amber-400/30'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          ขยาย 2 เท่า (2X Sharp)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUpscaleFactor(4);
                            setTimeout(handleExecuteUpscale, 50);
                          }}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            upscaleFactor === 4
                              ? 'bg-amber-400/10 border-amber-400 text-amber-300 ring-1 ring-amber-400/30'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          ขยาย 4 เท่า (4X Ultra HD)
                        </button>
                      </div>
                    </div>

                    {/* Sharpness Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-slate-300 font-medium">ความคมชัดลายเส้น (Edge Sharpness):</label>
                        <span className="font-mono text-amber-400 font-bold">{sharpnessLevel}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={sharpnessLevel}
                        onChange={(e) => setSharpnessLevel(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Print Contrast Boost */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="contrastBoost"
                        checked={contrastBoost}
                        onChange={(e) => setContrastBoost(e.target.checked)}
                        className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                      />
                      <label htmlFor="contrastBoost" className="text-xs text-slate-300 cursor-pointer">
                        ปรับสีสดและเพิ่มคอนทราสต์สำหรับการพิมพ์ DTF (Vivid DTF Boost)
                      </label>
                    </div>

                    {/* Re-calculate button */}
                    <button
                      type="button"
                      onClick={handleExecuteUpscale}
                      disabled={isProcessingUpscale}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>ประมวลผลใหม่อีกครั้ง</span>
                    </button>

                    {/* Action Apply Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          if (processedUpscaleImage && targetLayer) {
                            onApplyModifiedImage(targetLayer.id, processedUpscaleImage, { isUpscaled: true });
                            onClose();
                          }
                        }}
                        disabled={!processedUpscaleImage || isProcessingUpscale}
                        className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>บันทึกภาพคมชัด 300 DPI ลงบนเสื้อ</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI IMAGE GENERATION (PROMPT TO SHIRT) */}
          {activeTab === 'ai_prompt' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Prompt Input & Settings */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>พิมพ์คำอธิบายภาพ เพื่อเจนลายเสื้อด้วย AI</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      เพียงพิมพ์ไอเดียสั้นๆ เช่น &quot;แมวอวกาศสไตล์ไซเบอร์พังก์&quot; ระบบจะสร้างภาพพร้อมสกรีนให้ทันที
                    </p>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      คำอธิบายภาพที่คุณต้องการ (Prompt):
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder="เช่น มังกรนีโอเจแปนพ่นไฟสีฟ้า, เสือเผ่าไทยโบราณ, กะโหลกฮิปฮอปยุค 90s..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none rounded-xl text-sm text-white placeholder-slate-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Quick Prompt Ideas */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-400">ไอเดียยอดนิยม (คลิกเพื่อลอง):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickPrompts.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPromptInput(q)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-white/5 hover:bg-amber-400/10 hover:text-amber-300 text-slate-300 border border-white/10 transition-colors"
                        >
                          + {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Presets Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">
                      สไตล์งานกราฟิกสกรีน (Art Style):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {stylePresets.map(preset => (
                        <button
                          type="button"
                          key={preset.value}
                          onClick={() => setSelectedStyle(preset.value)}
                          className={`p-2.5 text-xs text-left rounded-xl border transition-all ${
                            selectedStyle === preset.value
                              ? 'bg-amber-400/10 border-amber-400 text-white font-bold ring-1 ring-amber-400/40'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Extra Options: Transparent BG & Aspect Ratio */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white/5 border border-white/10 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="autoCutAi"
                        checked={autoRemoveAiBg}
                        onChange={(e) => setAutoRemoveAiBg(e.target.checked)}
                        className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                      />
                      <label htmlFor="autoCutAi" className="text-slate-200 cursor-pointer font-medium">
                        ไดคัทลบพื้นหลังอัตโนมัติ (Transparent Cutout)
                      </label>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">สัดส่วน:</span>
                      {(['1:1', '3:4', '4:3'] as const).map(ratio => (
                        <button
                          type="button"
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                            aspectRatio === ratio
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={() => handleGenerateAiImage()}
                    disabled={isGeneratingAi || !promptInput.trim()}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>AI กำลังสร้างสรรค์ผลงาน...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>สั่ง AI เจนลายเสื้อทันที</span>
                      </>
                    )}
                  </button>

                  {aiErrorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{aiErrorMsg}</span>
                    </div>
                  )}
                </div>

                {/* Right Column: Generated Result Preview */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold">ผลงานที่ได้ (Generated Result):</span>
                    {generatedAiResult && (
                      <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> พร้อมวางลงเสื้อ
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-square w-full bg-transparency-grid rounded-2xl border border-white/15 overflow-hidden flex items-center justify-center p-4 shadow-inner">
                    {isGeneratingAi ? (
                      <div className="flex flex-col items-center gap-3 text-amber-400 text-center px-4">
                        <div className="relative">
                          <Loader2 className="w-12 h-12 animate-spin text-amber-400" />
                          <Sparkles className="w-5 h-5 absolute inset-0 m-auto text-white animate-pulse" />
                        </div>
                        <p className="text-xs font-bold text-white">กำลังสังเคราะห์ภาพกราฟิกด้วย Gemini Model</p>
                        <p className="text-[11px] text-slate-400">
                          จัดรูปแบบลายเส้นให้คมชัดระดับ 300 DPI พร้อมพิมพ์สกรีน
                        </p>
                      </div>
                    ) : generatedAiResult ? (
                      <img
                        src={generatedAiResult}
                        alt="AI Result"
                        className="max-w-full max-h-full object-contain filter drop-shadow-2xl animate-fade-in"
                      />
                    ) : (
                      <div className="text-center p-6 text-slate-500 space-y-2">
                        <Sparkles className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                        <p className="text-xs font-medium text-slate-400">ยังไม่มีภาพที่เจน</p>
                        <p className="text-[11px] text-slate-500">
                          พิมพ์ข้อความด้านซ้ายแล้วกดปุ่ม &quot;สั่ง AI เจนลายเสื้อทันที&quot;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button: Apply Generated Result */}
                  {generatedAiResult && onAddNewAiLayer && (
                    <button
                      onClick={() => {
                        onAddNewAiLayer(generatedAiResult, promptInput.substring(0, 20) || 'AI Graphic');
                        onClose();
                      }}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>วางลายที่สร้างลงบนเสื้อทันที</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
