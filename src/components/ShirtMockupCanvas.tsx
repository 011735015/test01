import React, { useRef, useState, useEffect } from 'react';
import { PrintLayer, ShirtColor, ShirtStyle, PrintSizeOption } from '../types';
import { 
  RotateCw, 
  Trash2, 
  Maximize2, 
  Move, 
  Eye, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface ShirtMockupCanvasProps {
  shirtStyle: ShirtStyle;
  shirtColor: ShirtColor;
  onSelectShirtColor?: (color: ShirtColor) => void;
  availableColors?: ShirtColor[];
  activeSide: 'front' | 'back';
  onToggleSide: (side: 'front' | 'back') => void;
  layers: PrintLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<PrintLayer>) => void;
  onDeleteLayer: (id: string) => void;
  printSize: PrintSizeOption;
  onDropImageFile?: (file: File) => void;
  onOpen3DViewer?: () => void;
}

const ShirtMockupCanvasComponent: React.FC<ShirtMockupCanvasProps> = ({
  shirtStyle,
  shirtColor,
  onSelectShirtColor,
  availableColors,
  activeSide,
  onToggleSide,
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  printSize,
  onDropImageFile,
  onOpen3DViewer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [isTransforming, setIsTransforming] = useState<'scale' | 'rotate' | null>(null);
  const [dragStart, setDragStart] = useState({ 
    mouseX: 0, 
    mouseY: 0, 
    layerX: 0, 
    layerY: 0, 
    scale: 1, 
    rotation: 0,
    rectWidth: 320,
    rectHeight: 400
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showFabricTexture, setShowFabricTexture] = useState(false);
  const [showPrintZoneGuide, setShowPrintZoneGuide] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [snapX, setSnapX] = useState(false);
  const [snapY, setSnapY] = useState(false);

  // Active layers on the current view side
  const currentSideLayers = layers.filter(layer => layer.side === activeSide);
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // Handle Drag & Drop of image files directly onto the shirt canvas
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onDropImageFile) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onDropImageFile(file);
      }
    }
  };

  // Start dragging a layer - pre-measure bounding rect to avoid layout thrashing during mousemove
  const handleLayerMouseDown = (e: React.MouseEvent, layer: PrintLayer) => {
    e.stopPropagation();
    onSelectLayer(layer.id);
    setIsDragging(true);
    const rect = printAreaRef.current?.getBoundingClientRect();
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      layerX: layer.x,
      layerY: layer.y,
      scale: layer.scale,
      rotation: layer.rotation,
      rectWidth: rect?.width || 320,
      rectHeight: rect?.height || 400,
    });
  };

  // Touch support for dragging - pre-measure bounding rect
  const handleLayerTouchStart = (e: React.TouchEvent, layer: PrintLayer) => {
    e.stopPropagation();
    onSelectLayer(layer.id);
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = printAreaRef.current?.getBoundingClientRect();
    setDragStart({
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      layerX: layer.x,
      layerY: layer.y,
      scale: layer.scale,
      rotation: layer.rotation,
      rectWidth: rect?.width || 320,
      rectHeight: rect?.height || 400,
    });
  };

  // Start scale or rotate handle
  const handleTransformStart = (e: React.MouseEvent | React.TouchEvent, type: 'scale' | 'rotate') => {
    e.stopPropagation();
    if (!selectedLayer) return;
    setIsTransforming(type);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = printAreaRef.current?.getBoundingClientRect();
    setDragStart({
      mouseX: clientX,
      mouseY: clientY,
      layerX: selectedLayer.x,
      layerY: selectedLayer.y,
      scale: selectedLayer.scale,
      rotation: selectedLayer.rotation,
      rectWidth: rect?.width || 320,
      rectHeight: rect?.height || 400,
    });
  };

  // RequestAnimationFrame reference for 60-120 FPS buttery smooth interaction
  const rafRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<{ id: string; updates: Partial<PrintLayer> } | null>(null);

  const scheduleLayerUpdate = (id: string, updates: Partial<PrintLayer>) => {
    pendingUpdateRef.current = { id, updates };
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingUpdateRef.current) {
          onUpdateLayer(pendingUpdateRef.current.id, pendingUpdateRef.current.updates);
          pendingUpdateRef.current = null;
        }
        rafRef.current = null;
      });
    }
  };

  // Mouse move effect during dragging or transforming - ZERO getBoundingClientRect calls during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedLayer) return;

      if (isDragging) {
        const deltaX = ((e.clientX - dragStart.mouseX) / (dragStart.rectWidth * zoomLevel)) * 100;
        const deltaY = ((e.clientY - dragStart.mouseY) / (dragStart.rectHeight * zoomLevel)) * 100;
        
        let newX = dragStart.layerX + deltaX;
        let newY = dragStart.layerY + deltaY;

        // Snapping within ±2% to center (deduplicated to avoid redundant re-renders)
        const isNearX = Math.abs(newX) < 2;
        if (isNearX) {
          newX = 0;
        }
        setSnapX(prev => (prev !== isNearX ? isNearX : prev));

        const isNearY = Math.abs(newY) < 2;
        if (isNearY) {
          newY = 0;
        }
        setSnapY(prev => (prev !== isNearY ? isNearY : prev));

        // Clamp inside printable zone
        newX = Math.max(-48, Math.min(48, newX));
        newY = Math.max(-48, Math.min(48, newY));

        scheduleLayerUpdate(selectedLayer.id, { x: newX, y: newY });
      } else if (isTransforming === 'scale') {
        const deltaY = e.clientY - dragStart.mouseY;
        const deltaScale = (deltaY * 0.005);
        const newScale = Math.max(0.2, Math.min(2.5, dragStart.scale + deltaScale));
        scheduleLayerUpdate(selectedLayer.id, { scale: Number(newScale.toFixed(2)) });
      } else if (isTransforming === 'rotate') {
        const deltaX = e.clientX - dragStart.mouseX;
        const newRotation = (dragStart.rotation + deltaX * 0.8) % 360;
        scheduleLayerUpdate(selectedLayer.id, { rotation: Math.round(newRotation) });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!selectedLayer || e.touches.length === 0) return;
      const touch = e.touches[0];

      if (isDragging) {
        const deltaX = ((touch.clientX - dragStart.mouseX) / (dragStart.rectWidth * zoomLevel)) * 100;
        const deltaY = ((touch.clientY - dragStart.mouseY) / (dragStart.rectHeight * zoomLevel)) * 100;
        let newX = Math.max(-48, Math.min(48, dragStart.layerX + deltaX));
        let newY = Math.max(-48, Math.min(48, dragStart.layerY + deltaY));

        const isNearX = Math.abs(newX) < 2;
        if (isNearX) newX = 0;
        setSnapX(prev => (prev !== isNearX ? isNearX : prev));

        const isNearY = Math.abs(newY) < 2;
        if (isNearY) newY = 0;
        setSnapY(prev => (prev !== isNearY ? isNearY : prev));

        scheduleLayerUpdate(selectedLayer.id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (pendingUpdateRef.current) {
        onUpdateLayer(pendingUpdateRef.current.id, pendingUpdateRef.current.updates);
        pendingUpdateRef.current = null;
      }
      setIsDragging(false);
      setIsTransforming(null);
      setSnapX(false);
      setSnapY(false);
    };

    if (isDragging || isTransforming) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isTransforming, dragStart, selectedLayer, zoomLevel, onUpdateLayer]);

  // Adjust printable box size based on chosen print size
  const getPrintZoneDimensions = () => {
    switch (printSize.id) {
      case 'A5':
        return { width: '38%', height: '36%', top: '24%', label: 'A5: 15 × 21 cm (อกซ้าย / โลโก้)' };
      case 'A4':
        return { width: '52%', height: '54%', top: '22%', label: 'A4: 21 × 30 cm (อกกลางมาตรฐาน)' };
      case 'A3':
        return { width: '64%', height: '68%', top: '18%', label: 'A3: 30 × 42 cm (เต็มอกพรีเมียม)' };
      case 'JUMBO':
        return { width: '74%', height: '78%', top: '15%', label: 'Jumbo: 40 × 50 cm (สกรีนเต็มตัว)' };
      default:
        return { width: '60%', height: '62%', top: '20%', label: '30 × 42 cm' };
    }
  };

  const zoneDims = getPrintZoneDimensions();

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-[#0B0D12] overflow-hidden select-none"
      onClick={() => onSelectLayer(null)}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-40 bg-amber-500/20 backdrop-blur-sm border-2 border-dashed border-amber-400 flex flex-col items-center justify-center text-white pointer-events-none">
          <Move className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
          <p className="text-lg font-bold">วางไฟล์รูปภาพลงที่นี่</p>
          <p className="text-xs text-slate-300">รองรับไฟล์ PNG, JPG, WebP, SVG</p>
        </div>
      )}

      {/* Top Floating Utility Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: View & Garment info */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#141822]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs shadow-md">
          <span className="font-semibold text-slate-200">{shirtStyle.name}</span>
          <span className="text-slate-500">·</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span 
              className="w-3 h-3 rounded-full border border-white/20 inline-block shadow-inner"
              style={{ backgroundColor: shirtColor.hex }}
            />
            {shirtColor.thaiName}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-amber-400 font-medium">
            {activeSide === 'front' ? 'ด้านหน้า (Front)' : 'ด้านหลัง (Back)'}
          </span>
        </div>

        {/* Right: Quick Controls (Zoom, Texture, Guides) */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#141822]/90 backdrop-blur-md p-1 rounded-lg border border-white/10 text-xs shadow-md">
          {onOpen3DViewer && (
            <button
              onClick={onOpen3DViewer}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 rounded hover:from-amber-300 hover:to-amber-200 transition-all shadow-sm active:scale-95"
              title="เปิดห้องแสดงแบบ 3 มิติ 360 องศา"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>โหมด 3D 360°</span>
            </button>
          )}

          <div className="w-px h-4 bg-white/10 my-auto" />

          <button
            onClick={() => onToggleSide(activeSide === 'front' ? 'back' : 'front')}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="สลับมุมมองหน้า/หลัง"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">หมุนเสื้อ</span>
          </button>

          <div className="w-px h-4 bg-white/10 my-auto" />

          <button
            onClick={() => setShowFabricTexture(!showFabricTexture)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              showFabricTexture ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
            }`}
            title="เปิด/ปิดการผสานเนื้อผ้าสมจริง"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">ผสานผ้าจริง</span>
          </button>

          <button
            onClick={() => setShowPrintZoneGuide(!showPrintZoneGuide)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              showPrintZoneGuide ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
            }`}
            title="แสดงกรอบพื้นที่สกรีน"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">กรอบสกรีน</span>
          </button>

          <div className="w-px h-4 bg-white/10 my-auto" />

          <button
            onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.15))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="ย่อมุมมอง"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-slate-400 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="ขยายมุมมอง"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Mockup Stage with Scale Animation */}
      <div 
        className="relative w-full max-w-[580px] aspect-[4/5] flex items-center justify-center transition-transform duration-200 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Realistic SVG Garment Base (GPU Optimized) */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none transform-gpu">
          {/* Ambient Ground Shadow for realistic studio lighting */}
          <div className="absolute inset-x-10 bottom-4 h-14 bg-black/65 blur-2xl rounded-full pointer-events-none -z-10" />

          <svg
            viewBox="0 0 600 700"
            className="w-full h-full object-contain"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Studio Key Light / Softbox 3D Volume Gradient */}
              <linearGradient id="bodyShade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.34" />
                <stop offset="9%" stopColor="#000000" stopOpacity="0.14" />
                <stop offset="22%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.02" />
                <stop offset="78%" stopColor="#000000" stopOpacity="0.04" />
                <stop offset="91%" stopColor="#000000" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.38" />
              </linearGradient>

              {/* Top-down Shoulder Light */}
              <linearGradient id="topShoulderLight" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                <stop offset="28%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
              </linearGradient>

              {/* Natural Chest Volume Specular Highlight */}
              <radialGradient id="chestVolume" cx="50%" cy="36%" r="48%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
                <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.24" />
              </radialGradient>

              {/* Sleeve fold shadow Left */}
              <linearGradient id="sleeveShadowL" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
                <stop offset="65%" stopColor="#000000" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </linearGradient>

              {/* Sleeve fold shadow Right */}
              <linearGradient id="sleeveShadowR" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
                <stop offset="65%" stopColor="#000000" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </linearGradient>

              {/* Neck inner cavity gradient */}
              <radialGradient id="neckCavity" cx="50%" cy="25%" r="75%">
                <stop offset="0%" stopColor="#222630" stopOpacity="1" />
                <stop offset="60%" stopColor="#12141a" stopOpacity="1" />
                <stop offset="100%" stopColor="#08090c" stopOpacity="1" />
              </radialGradient>

              {/* Hardware-Accelerated Fabric Grain Pattern */}
              <pattern id="fabricNoise" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="2" height="2" fill="#ffffff" fillOpacity="0.05" />
                <rect x="2" y="2" width="2" height="2" fill="#000000" fillOpacity="0.07" />
              </pattern>
            </defs>

            {/* Inner collar tag & neck cavity background (Front view only) */}
            {activeSide === 'front' && (
              <g>
                <path
                  d="M 218,92 Q 300,162 382,92 Q 355,64 300,62 Q 245,64 218,92 Z"
                  fill="url(#neckCavity)"
                />
                {/* Back Neck Reinforcement Tape */}
                <path
                  d="M 230,86 Q 300,102 370,86 L 372,92 Q 300,108 228,92 Z"
                  fill="#0b0d12"
                  opacity="0.8"
                />
                {/* Woven Satin Neck Brand Label */}
                <rect x="282" y="70" width="36" height="25" rx="2" fill="#e2e8f0" opacity="0.95" />
                <line x1="284" y1="72" x2="316" y2="72" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,1" />
                <text x="300" y="81" fill="#0f172a" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">SCREENLAB</text>
                <text x="300" y="89" fill="#d97706" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">HEAVY COTTON</text>
              </g>
            )}

            {/* T-Shirt Garment Body Silhouette */}
            {shirtStyle.id === 'hoodie' ? (
              // 1. Streetwear Heavy Hoodie
              <g>
                {/* Main Hoodie Silhouette */}
                <path
                  d="M 185,110 
                     Q 125,145 65,220 
                     L 100,265 
                     Q 142,225 175,198 
                     L 165,580 
                     L 165,630 Q 300,642 435,630 
                     L 435,580 
                     L 425,198 
                     Q 458,225 500,265 
                     L 535,220 
                     Q 475,145 415,110 
                     Q 300,135 185,110 Z"
                  fill={shirtColor.hex}
                />

                {/* Kangaroo Pocket with curved hand entry and depth */}
                {activeSide === 'front' && (
                  <g>
                    {/* Pocket Shadow */}
                    <path
                      d="M 205,465 Q 200,530 180,578 L 420,578 Q 400,530 395,465 Q 300,458 205,465 Z"
                      fill="#000000"
                      fillOpacity="0.22"
                    />
                    {/* Pocket Body */}
                    <path
                      d="M 208,460 Q 202,525 182,572 L 418,572 Q 398,525 392,460 Q 300,454 208,460 Z"
                      fill={shirtColor.hex}
                      stroke={shirtColor.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)'}
                      strokeWidth="1.5"
                    />
                    {/* Hand Pocket Openings Stitch */}
                    <path d="M 208,460 Q 202,525 182,572" fill="none" stroke={shirtColor.isDark ? '#ffffff' : '#000000'} strokeWidth="1.5" strokeDasharray="3,2" strokeOpacity="0.3" />
                    <path d="M 392,460 Q 398,525 418,572" fill="none" stroke={shirtColor.isDark ? '#ffffff' : '#000000'} strokeWidth="1.5" strokeDasharray="3,2" strokeOpacity="0.3" />
                  </g>
                )}

                {/* Volumetric Layered Hood */}
                <path
                  d="M 215,112 
                     C 205,45 240,24 300,22 
                     C 360,24 395,45 385,112 
                     Q 345,155 300,158 
                     Q 255,155 215,112 Z"
                  fill={shirtColor.hex}
                  stroke={shirtColor.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                  strokeWidth="2"
                />
                {/* Inner Hood Cavity Depth */}
                <path
                  d="M 235,108 Q 300,146 365,108 Q 345,56 300,52 Q 255,56 235,108 Z"
                  fill="url(#neckCavity)"
                />

                {/* Cotton Braided Drawstrings with Metal Aglets */}
                {activeSide === 'front' && (
                  <g>
                    {/* Metal Eyelets */}
                    <circle cx="264" cy="138" r="4" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
                    <circle cx="336" cy="138" r="4" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
                    
                    {/* Left String */}
                    <path d="M 264,142 C 262,190 252,225 256,265" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
                    <rect x="253.5" y="265" width="5" height="12" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
                    
                    {/* Right String */}
                    <path d="M 336,142 C 338,190 348,225 344,265" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
                    <rect x="341.5" y="265" width="5" height="12" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
                  </g>
                )}

                {/* Ribbed Bottom Waistband */}
                <path
                  d="M 165,585 L 165,632 Q 300,644 435,632 L 435,585 Z"
                  fill="none"
                  stroke={shirtColor.isDark ? '#ffffff' : '#000000'}
                  strokeWidth="1.5"
                  strokeOpacity="0.25"
                />
              </g>
            ) : (
              // 2. Premium Streetwear T-Shirt (Oversized, Crewneck, Boxy Washed)
              <g>
                {/* Main Body Silhouette with Organic Draping Curves */}
                <path
                  d={
                    shirtStyle.id === 'oversized'
                      ? // Dropped Shoulder Streetwear Oversized Silhouette
                        `M 218,92 
                         Q 158,112 108,142 
                         L 58,245 
                         Q 86,268 116,280 
                         Q 146,242 172,246 
                         L 162,630 
                         Q 300,644 438,630 
                         L 428,246 
                         Q 454,242 484,280 
                         Q 514,268 542,245 
                         L 492,142 
                         Q 442,112 382,92 
                         Q 300, ${activeSide === 'front' ? 158 : 108} 218,92 Z`
                      : shirtStyle.id === 'boxy_washed'
                      ? // Boxy Cut Vintage Silhouette
                        `M 218,92 
                         Q 150,110 98,136 
                         L 48,235 
                         Q 80,260 112,272 
                         Q 142,238 165,242 
                         L 158,620 
                         Q 300,632 442,620 
                         L 435,242 
                         Q 458,238 488,272 
                         Q 520,260 552,235 
                         L 502,136 
                         Q 450,110 382,92 
                         Q 300, ${activeSide === 'front' ? 158 : 108} 218,92 Z`
                      : // Classic Tailored Standard Crewneck
                        `M 218,92 
                         Q 165,115 124,136 
                         L 78,222 
                         Q 102,242 128,252 
                         Q 154,218 174,222 
                         L 165,630 
                         Q 300,642 435,630 
                         L 426,222 
                         Q 446,218 472,252 
                         Q 498,242 522,222 
                         L 476,136 
                         Q 435,115 382,92 
                         Q 300, ${activeSide === 'front' ? 154 : 106} 218,92 Z`
                  }
                  fill={shirtColor.hex}
                />

                {/* Dropped Shoulder Seam Stitch line (for Oversized / Boxy) */}
                {shirtStyle.id !== 'crewneck' && (
                  <g>
                    <path d="M 125,130 Q 150,185 168,240" fill="none" stroke={shirtColor.isDark ? '#ffffff' : '#000000'} strokeWidth="1" strokeDasharray="3,2" strokeOpacity="0.22" />
                    <path d="M 475,130 Q 450,185 432,240" fill="none" stroke={shirtColor.isDark ? '#ffffff' : '#000000'} strokeWidth="1" strokeDasharray="3,2" strokeOpacity="0.22" />
                  </g>
                )}

                {/* Natural Fabric Wrinkle Folds at Underarms (Realistic Creases) */}
                <g stroke={shirtColor.isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.22)'} fill="none">
                  {/* Left Armpit Creases */}
                  <path d="M 172,246 Q 192,268 186,295" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 170,260 Q 182,278 178,305" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
                  {/* Right Armpit Creases */}
                  <path d="M 428,246 Q 408,268 414,295" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 430,260 Q 418,278 422,305" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
                </g>

                {/* Subtle Hem & Seam double-needle lockstitching lines */}
                <path
                  d="M 166,616 Q 300,630 434,616"
                  fill="none"
                  stroke={shirtColor.isDark ? '#ffffff' : '#000000'}
                  strokeWidth="1.2"
                  strokeDasharray="4,2.5"
                  strokeOpacity="0.25"
                />
                <path
                  d="M 165,621 Q 300,635 435,621"
                  fill="none"
                  stroke={shirtColor.isDark ? '#ffffff' : '#000000'}
                  strokeWidth="1.2"
                  strokeDasharray="4,2.5"
                  strokeOpacity="0.25"
                />

                {/* Left & Right Sleeve cuffs double stitching */}
                <path
                  d={
                    shirtStyle.id === 'oversized'
                      ? "M 66,238 Q 92,258 118,270"
                      : "M 84,216 Q 106,232 128,244"
                  }
                  fill="none"
                  stroke={shirtColor.isDark ? '#ffffff' : '#000000'}
                  strokeWidth="1.2"
                  strokeDasharray="4,2.5"
                  strokeOpacity="0.25"
                />
                <path
                  d={
                    shirtStyle.id === 'oversized'
                      ? "M 534,238 Q 508,258 482,270"
                      : "M 516,216 Q 494,232 472,244"
                  }
                  fill="none"
                  stroke={shirtColor.isDark ? '#ffffff' : '#000000'}
                  strokeWidth="1.2"
                  strokeDasharray="4,2.5"
                  strokeOpacity="0.25"
                />
              </g>
            )}

            {/* Fast Fabric Texture Overlay when active */}
            {showFabricTexture && (
              <rect x="50" y="80" width="500" height="560" fill="url(#fabricNoise)" pointerEvents="none" opacity="0.75" />
            )}

            {/* Soft Shading & Ambient Depth (Key Light + Cylindrical Volume) */}
            <path
              d="M 180,120 L 162,630 Q 300,644 438,630 L 420,120 Z"
              fill="url(#bodyShade)"
            />

            {/* Chest Ambient Volume Light */}
            <ellipse cx="300" cy="340" rx="160" ry="200" fill="url(#chestVolume)" />

            {/* Top Shoulder Key Light */}
            <path
              d="M 218,92 Q 158,112 108,142 L 172,246 L 428,246 L 492,142 Q 442,112 382,92 Z"
              fill="url(#topShoulderLight)"
            />

            {/* Sleeve Crease Shadows */}
            <path d="M 60,240 L 172,246 L 165,295 Z" fill="url(#sleeveShadowL)" />
            <path d="M 540,240 L 428,246 L 435,295 Z" fill="url(#sleeveShadowR)" />

            {/* Heavy Ribbed Collar Construction */}
            {activeSide === 'front' ? (
              <g>
                {/* Natural Drop Shadow Beneath Collar onto Chest */}
                <path
                  d="M 214,94 Q 300,172 386,94 Q 300,158 214,94 Z"
                  fill="#000000"
                  fillOpacity="0.32"
                />

                {/* Thick 1.2 Inch Streetwear Ribbed Neckband */}
                <path
                  d="M 218,92 Q 300,160 382,92 Q 355,76 300,74 Q 245,76 218,92 Z"
                  fill={shirtColor.hex}
                  stroke={shirtColor.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)'}
                  strokeWidth="1.5"
                />

                {/* Ribbed Band Texture Strokes */}
                <path
                  d="M 222,96 Q 300,154 378,96"
                  fill="none"
                  stroke={shirtColor.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
                  strokeWidth="8"
                  strokeLinecap="round"
                />

                {/* Double-Needle Seam along Neckband Base */}
                <path
                  d="M 216,92 Q 300,164 384,92"
                  fill="none"
                  stroke={shirtColor.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
                  strokeWidth="1.2"
                  strokeDasharray="4,2.5"
                />
              </g>
            ) : (
              // Back Collar Construction
              <g>
                <path
                  d="M 218,92 Q 300,112 382,92 Q 355,80 300,78 Q 245,80 218,92 Z"
                  fill={shirtColor.hex}
                  stroke={shirtColor.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)'}
                  strokeWidth="1.5"
                />
                <path
                  d="M 216,92 Q 300,116 384,92"
                  fill="none"
                  stroke={shirtColor.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
                  strokeWidth="1.2"
                  strokeDasharray="4,2.5"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Printable Area Safe Zone */}
        <div
          ref={printAreaRef}
          className={`absolute pointer-events-auto ${
            showPrintZoneGuide
              ? 'border-2 border-dashed border-amber-400/60 bg-amber-400/[0.03]'
              : 'border border-transparent'
          }`}
          style={{
            width: zoneDims.width,
            height: zoneDims.height,
            top: zoneDims.top,
          }}
          onClick={(e) => {
            // When clicking specifically on empty space of the print area, deselect
            if (e.target === e.currentTarget) {
              onSelectLayer(null);
            }
          }}
        >
          {/* Printable Zone Tag */}
          {showPrintZoneGuide && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900/90 text-amber-400 text-[10px] font-mono tracking-tight border border-amber-400/30 whitespace-nowrap shadow-sm pointer-events-none">
              {zoneDims.label}
            </div>
          )}

          {/* Snapping Center Guide Lines */}
          {snapX && (
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-amber-400 shadow-[0_0_8px_#f59e0b] z-20 pointer-events-none" />
          )}
          {snapY && (
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-amber-400 shadow-[0_0_8px_#f59e0b] z-20 pointer-events-none" />
          )}

          {/* Render Active Layers */}
          {currentSideLayers.map(layer => {
            const isSelected = layer.id === selectedLayerId;

            return (
              <div
                key={layer.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLayer(layer.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleLayerMouseDown(e, layer);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleLayerTouchStart(e, layer);
                }}
                className={`absolute cursor-move select-none transform-gpu ${
                  isDragging || isTransforming ? 'transition-none' : 'transition-shadow'
                } ${
                  isSelected 
                    ? 'z-30 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0B0D12] shadow-xl' 
                    : 'z-10 hover:ring-1 hover:ring-white/40'
                }`}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(calc(-50% + ${layer.x}%), calc(-50% + ${layer.y}%), 0) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                  willChange: isDragging || isTransforming ? 'transform' : 'auto',
                  opacity: layer.opacity,
                  mixBlendMode: layer.blendMode,
                }}
              >
                {/* Content Rendering: Image or Text */}
                {layer.type === 'text' ? (
                  layer.textProps?.curved ? (
                    // Curved Arc Text using SVG textPath
                    (() => {
                      const curveRadius = layer.textProps?.curveRadius ?? 35;
                      const textLen = Math.max(6, layer.content.length);
                      const fontSize = layer.textProps?.fontSize || 28;
                      const boxW = Math.max(220, textLen * fontSize * 0.72 + 50);
                      const boxH = Math.max(100, Math.abs(curveRadius) * 2.2 + 50);
                      const startY = curveRadius >= 0 ? boxH - 25 : 35;
                      const ctrlY = curveRadius >= 0 
                        ? startY - Math.abs(curveRadius) * 1.6 
                        : startY + Math.abs(curveRadius) * 1.6;
                      const pathId = `curve-path-${layer.id}`;
                      const pathD = `M 20,${startY} Q ${boxW / 2},${ctrlY} ${boxW - 20},${startY}`;

                      return (
                        <div
                          className="relative flex items-center justify-center pointer-events-none select-none"
                          style={{
                            width: `${boxW}px`,
                            height: `${boxH}px`,
                            filter: (layer.textProps?.shadowBlur || 0) > 0
                              ? `drop-shadow(${layer.textProps?.shadowOffsetX || 2}px ${layer.textProps?.shadowOffsetY || 3}px ${layer.textProps?.shadowBlur || 4}px ${layer.textProps?.shadowColor || 'rgba(0,0,0,0.85)'})`
                              : undefined,
                          }}
                        >
                          <svg
                            width={boxW}
                            height={boxH}
                            viewBox={`0 0 ${boxW} ${boxH}`}
                            className="overflow-visible"
                          >
                            <defs>
                              <path id={pathId} d={pathD} fill="none" />
                            </defs>
                            <text
                              fontFamily={layer.textProps?.fontFamily || 'Prompt, sans-serif'}
                              fontSize={`${fontSize}px`}
                              fontWeight={layer.textProps?.isBold ? 800 : 500}
                              letterSpacing={`${layer.textProps?.letterSpacing || 1}px`}
                              fill={layer.textProps?.color || '#ffffff'}
                              stroke={layer.textProps?.strokeWidth ? (layer.textProps?.strokeColor || '#000000') : 'none'}
                              strokeWidth={layer.textProps?.strokeWidth || 0}
                              strokeLinejoin="round"
                              paintOrder="stroke fill"
                              textAnchor="middle"
                            >
                              <textPath href={`#${pathId}`} startOffset="50%">
                                {layer.content}
                              </textPath>
                            </text>
                          </svg>
                        </div>
                      );
                    })()
                  ) : (
                    // Regular Straight Text with Stroke and Drop Shadow
                    <div
                      style={{
                        fontFamily: layer.textProps?.fontFamily || 'Prompt, sans-serif',
                        fontSize: `${layer.textProps?.fontSize || 28}px`,
                        color: layer.textProps?.color || '#ffffff',
                        fontWeight: layer.textProps?.isBold ? 800 : 500,
                        textAlign: layer.textProps?.textAlign || 'center',
                        letterSpacing: `${layer.textProps?.letterSpacing || 1}px`,
                        whiteSpace: 'nowrap',
                        WebkitTextStroke: (layer.textProps?.strokeWidth || 0) > 0
                          ? `${layer.textProps?.strokeWidth}px ${layer.textProps?.strokeColor || '#000000'}`
                          : undefined,
                        paintOrder: 'stroke fill',
                        filter: (layer.textProps?.shadowBlur || 0) > 0
                          ? `drop-shadow(${layer.textProps?.shadowOffsetX || 2}px ${layer.textProps?.shadowOffsetY || 3}px ${layer.textProps?.shadowBlur || 4}px ${layer.textProps?.shadowColor || 'rgba(0,0,0,0.85)'})`
                          : undefined,
                        textShadow: (layer.textProps?.shadowBlur || 0) > 0 ? undefined : (
                          shirtColor.isDark 
                            ? '0 1px 3px rgba(0,0,0,0.8)' 
                            : '0 1px 2px rgba(255,255,255,0.4)'
                        ),
                      }}
                      className="px-2 py-1"
                    >
                      {layer.content}
                    </div>
                  )
                ) : (
                  <div className="relative max-w-[260px] max-h-[260px] flex items-center justify-center">
                    <img
                      src={layer.content}
                      alt={layer.name}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain pointer-events-none filter drop-shadow-sm"
                      style={{
                        filter: showFabricTexture
                          ? 'contrast(1.05) saturate(1.02)'
                          : undefined,
                      }}
                    />
                    {/* Layer Quality / Status Indicator Badges */}
                    {(layer.isBgRemoved || layer.isUpscaled) && (
                      <div className="absolute -bottom-2 -left-2 bg-slate-900/90 text-amber-400 text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-amber-400/40 shadow flex items-center gap-1 pointer-events-none">
                        {layer.isBgRemoved && '✂️ ไดคัท'}
                        {layer.isUpscaled && '✨ 300 DPI'}
                      </div>
                    )}
                  </div>
                )}

                {/* Transform Handles when layer is selected */}
                {isSelected && (
                  <>
                    {/* Top Rotate Handle */}
                    <div
                      onMouseDown={(e) => handleTransformStart(e, 'rotate')}
                      onTouchStart={(e) => handleTransformStart(e, 'rotate')}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md hover:scale-110 transition-transform"
                      title="ลากเพื่อหมุนลายเสื้อ"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </div>

                    {/* Bottom-Right Scale Handle */}
                    <div
                      onMouseDown={(e) => handleTransformStart(e, 'scale')}
                      onTouchStart={(e) => handleTransformStart(e, 'scale')}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute -bottom-3 -right-3 w-6 h-6 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center cursor-se-resize shadow-md hover:scale-110 transition-transform"
                      title="ลากเพื่อปรับขนาดลาย"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>

                    {/* Top-Right Delete Handle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLayer(layer.id);
                      }}
                      className="absolute -top-3 -right-3 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-rose-600 hover:scale-110 transition-transform"
                      title="ลบลายนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            );
          })}

          {/* Empty State message inside printable area if no layers on this side */}
          {currentSideLayers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none opacity-40">
              <Move className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-medium text-slate-300">พื้นที่วางลายสกรีน ({activeSide === 'front' ? 'อกหน้า' : 'หลังเสื้อ'})</p>
              <p className="text-[11px] text-slate-400 mt-0.5">ลากไฟล์ภาพลงที่นี่ หรือเลือกจากแถบเครื่องมือด้านข้าง</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status, Quick color picker & Quick side switch hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2.5 max-w-[96%] pointer-events-auto">
        {/* Quick Color Palette Bar */}
        {onSelectShirtColor && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141822]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
            <span className="text-[11px] text-slate-400 font-semibold hidden lg:inline">สีเสื้อ:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              {(availableColors || shirtStyle.availableColors).map(c => {
                const isSelected = shirtColor.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectShirtColor(c);
                    }}
                    className={`relative group w-6 h-6 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'scale-125 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0B0D12] z-10 border-white shadow-md' 
                        : 'hover:scale-110 opacity-80 hover:opacity-100 border-white/20'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.thaiName}
                  >
                    {isSelected && (
                      <span className={`w-1.5 h-1.5 rounded-full ${c.isDark ? 'bg-white' : 'bg-slate-900'}`} />
                    )}
                    {/* Tooltip */}
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-medium whitespace-nowrap shadow-xl pointer-events-none border border-white/15 z-30">
                      {c.thaiName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Side Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#141822]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
          <button
            onClick={() => onToggleSide('front')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeSide === 'front'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            อกหน้า
          </button>
          <button
            onClick={() => onToggleSide('back')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeSide === 'back'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            หลังเสื้อ
          </button>
        </div>
      </div>
    </div>
  );
};

export const ShirtMockupCanvas = React.memo(ShirtMockupCanvasComponent);
