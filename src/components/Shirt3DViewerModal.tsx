import React, { useState, useRef, useEffect } from 'react';
import { ShirtStyle, ShirtColor, PrintLayer, PrintSizeOption } from '../types';
import { 
  X, 
  RotateCw, 
  Play, 
  Pause, 
  Camera, 
  Sparkles, 
  SunMedium, 
  Eye, 
  Check, 
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Shirt3DViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  shirtStyle: ShirtStyle;
  shirtColor: ShirtColor;
  layers: PrintLayer[];
  printSize: PrintSizeOption;
}

const Shirt3DViewerModalComponent: React.FC<Shirt3DViewerModalProps> = ({
  isOpen,
  onClose,
  shirtStyle,
  shirtColor,
  layers,
  printSize,
}) => {
  const [rotationY, setRotationY] = useState(0); // 0 to 360 degrees
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [lightingMode, setLightingMode] = useState<'studio' | 'spotlight' | 'soft'>('studio');
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  // Auto-rotation loop
  useEffect(() => {
    if (!isOpen || !isAutoRotating || isDragging) return;

    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      setRotationY(prev => (prev + (delta * 0.035)) % 360);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isOpen, isAutoRotating, isDragging]);

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouseX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setLastMouseX(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastMouseX;
      setLastMouseX(e.clientX);
      setRotationY(prev => {
        let next = prev + deltaX * 0.5;
        if (next < 0) next += 360;
        return next % 360;
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - lastMouseX;
      setLastMouseX(touchX);
      setRotationY(prev => {
        let next = prev + deltaX * 0.5;
        if (next < 0) next += 360;
        return next % 360;
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, lastMouseX]);

  // Take snapshot
  const handleTakeSnapshot = () => {
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2000);
  };

  if (!isOpen) return null;

  // Normalized rotation in 0-360
  const normalizedAngle = ((rotationY % 360) + 360) % 360;

  // Viewing side calculation: Front is between 270°-90°, Back is between 90°-270°
  const isFrontFacing = normalizedAngle < 90 || normalizedAngle > 270;
  
  // Angle relative to front or back center (-90 to +90)
  const faceRelativeAngle = isFrontFacing
    ? (normalizedAngle > 270 ? normalizedAngle - 360 : normalizedAngle)
    : normalizedAngle - 180;

  // Shading calculations based on rotation
  const rad = (normalizedAngle * Math.PI) / 180;
  const lightFactor = Math.cos(rad); // -1 (back light) to 1 (front light)
  const sideLightFactor = Math.sin(rad); // side highlights

  // Layers on current facing side
  const activeSide = isFrontFacing ? 'front' : 'back';
  const visibleLayers = layers.filter(l => l.side === activeSide);

  // Cylindrical perspective projection calculation
  const cosAngle = Math.cos((faceRelativeAngle * Math.PI) / 180);
  const layerScaleX = Math.max(0.15, cosAngle);
  const layerSkewY = Math.sin((faceRelativeAngle * Math.PI) / 180) * 12;
  const layerOffsetX = Math.sin((faceRelativeAngle * Math.PI) / 180) * 45;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div 
        className="relative w-full max-w-4xl bg-[#0C0F17] border border-white/10 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-white/10 bg-[#0E1016]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/20 font-black">
              3D
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>3D 360° Interactive Showroom</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono">
                  หมุนรอบทิศ 360 องศา
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ลากเมาส์หรือปัดหน้าจอเพื่อหมุนดูสรีระเสื้อและลายสกรีนได้รอบตัว
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

        {/* 3D Stage Area */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`relative flex-1 bg-gradient-to-b from-[#0E1016] via-[#121622] to-[#0A0C11] flex items-center justify-center overflow-hidden select-none cursor-grab ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
        >
          {/* Studio Radial Spotlight background */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background: lightingMode === 'spotlight'
                ? 'radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.15) 0%, transparent 65%)'
                : lightingMode === 'studio'
                ? 'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)'
                : 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
            }}
          />

          {/* Pedestal Reflection Ring on Floor */}
          <div className="absolute bottom-10 w-[380px] h-[70px] rounded-full border border-white/10 bg-radial from-white/[0.04] via-black/40 to-transparent blur-[1px] pointer-events-none" />

          {/* Main 3D Simulated Garment Container */}
          <div 
            className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center transform-gpu"
            style={{
              perspective: '1000px',
            }}
          >
            {/* Ambient Shadow under shirt */}
            <div className="absolute inset-x-8 bottom-6 h-12 bg-black/70 blur-2xl rounded-full pointer-events-none -z-10" />

            {/* The Rotating Shirt Mesh Wrapper */}
            <div 
              className="relative w-full h-full flex items-center justify-center transform-gpu"
              style={{
                transform: `rotateY(${faceRelativeAngle * 0.4}deg)`,
                transformStyle: 'preserve-3d',
                willChange: 'transform',
              }}
            >
              {/* SVG 3D Garment Mesh with Angle-Adaptive Shading */}
              <svg
                viewBox="0 0 600 700"
                className="w-full h-full object-contain pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Dynamic Shading Gradient */}
                  <linearGradient id="mesh3dShade" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop 
                      offset="0%" 
                      stopColor="#000000" 
                      stopOpacity={Math.max(0.15, 0.45 - sideLightFactor * 0.2)} 
                    />
                    <stop 
                      offset="25%" 
                      stopColor="#ffffff" 
                      stopOpacity={Math.max(0.02, 0.12 + lightFactor * 0.08)} 
                    />
                    <stop 
                      offset="50%" 
                      stopColor="#ffffff" 
                      stopOpacity={Math.max(0.03, 0.15 + lightFactor * 0.1)} 
                    />
                    <stop 
                      offset="80%" 
                      stopColor="#000000" 
                      stopOpacity={Math.max(0.1, 0.25 + sideLightFactor * 0.2)} 
                    />
                    <stop 
                      offset="100%" 
                      stopColor="#000000" 
                      stopOpacity={Math.max(0.2, 0.5 + sideLightFactor * 0.25)} 
                    />
                  </linearGradient>

                  {/* Rim light highlight */}
                  <linearGradient id="rimLight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Inner Collar Cavity (Front view only) */}
                {isFrontFacing && shirtStyle.id !== 'hoodie' && (
                  <path
                    d={
                      shirtStyle.id === 'vneck'
                        ? "M 218,90 L 300,192 L 382,90 Q 355,65 300,64 Q 245,65 218,90 Z"
                        : shirtStyle.id === 'tanktop'
                        ? "M 210,90 Q 300,180 390,90 Q 355,65 300,64 Q 245,65 210,90 Z"
                        : "M 220,90 Q 300,160 380,90 Q 355,65 300,64 Q 245,65 220,90 Z"
                    }
                    fill="#15171d"
                  />
                )}

                {/* Garment Base Silhouette */}
                <g fill={shirtColor.hex}>
                  <path
                    d={
                      shirtStyle.id === 'hoodie'
                        ? `M 185,110 Q 125,145 65,220 L 100,265 Q 142,225 175,198 L 165,630 Q 300,642 435,630 L 425,198 Q 458,225 500,265 L 535,220 Q 475,145 415,110 Q 300,135 185,110 Z`
                        : shirtStyle.id === 'tanktop'
                        ? `M 214,92 L 248,94 Q 235,180 178,285 L 165,630 Q 300,642 435,630 L 422,285 Q 365,180 352,94 L 386,92 Q 300, ${isFrontFacing ? 180 : 120} 214,92 Z`
                        : shirtStyle.id === 'longsleeve'
                        ? `M 218,90 Q 162,112 118,136 L 38,446 L 66,468 L 174,242 L 165,628 Q 300,642 435,628 L 426,242 L 534,468 L 562,446 L 482,136 Q 438,112 382,90 Q 300, ${isFrontFacing ? 154 : 106} 218,90 Z`
                        : shirtStyle.id === 'vneck'
                        ? `M 218,90 Q 158,110 108,140 L 58,242 Q 86,266 116,278 Q 146,240 172,244 L 162,628 Q 300,642 438,628 L 428,244 Q 454,240 484,278 Q 514,266 542,242 L 492,140 Q 442,110 382,90 L 300, ${isFrontFacing ? 192 : 106} L 218,90 Z`
                        : `M 218,90 Q 158,110 108,140 L 58,242 Q 86,266 116,278 Q 146,240 172,244 L 162,628 Q 300,642 438,628 L 428,244 Q 454,240 484,278 Q 514,266 542,242 L 492,140 Q 442,110 382,90 Q 300, ${isFrontFacing ? (shirtStyle.id === 'polo' ? 130 : 156) : 106} 218,90 Z`
                    }
                  />
                </g>

                {/* 3D Surface Light & Volume */}
                <path
                  d={
                    shirtStyle.id === 'hoodie'
                      ? `M 185,110 Q 125,145 65,220 L 100,265 Q 142,225 175,198 L 165,630 Q 300,642 435,630 L 425,198 Q 458,225 500,265 L 535,220 Q 475,145 415,110 Q 300,135 185,110 Z`
                      : shirtStyle.id === 'tanktop'
                      ? `M 214,92 L 248,94 Q 235,180 178,285 L 165,630 Q 300,642 435,630 L 422,285 Q 365,180 352,94 L 386,92 Q 300, ${isFrontFacing ? 180 : 120} 214,92 Z`
                      : shirtStyle.id === 'longsleeve'
                      ? `M 218,90 Q 162,112 118,136 L 38,446 L 66,468 L 174,242 L 165,628 Q 300,642 435,628 L 426,242 L 534,468 L 562,446 L 482,136 Q 438,112 382,90 Q 300, ${isFrontFacing ? 154 : 106} 218,90 Z`
                      : shirtStyle.id === 'vneck'
                      ? `M 218,90 Q 158,110 108,140 L 58,242 Q 86,266 116,278 Q 146,240 172,244 L 162,628 Q 300,642 438,628 L 428,244 Q 454,240 484,278 Q 514,266 542,242 L 492,140 Q 442,110 382,90 L 300, ${isFrontFacing ? 192 : 106} L 218,90 Z`
                      : `M 218,90 Q 158,110 108,140 L 58,242 Q 86,266 116,278 Q 146,240 172,244 L 162,628 Q 300,642 438,628 L 428,244 Q 454,240 484,278 Q 514,266 542,242 L 492,140 Q 442,110 382,90 Q 300, ${isFrontFacing ? (shirtStyle.id === 'polo' ? 130 : 156) : 106} 218,90 Z`
                  }
                  fill="url(#mesh3dShade)"
                />

                {/* Torso Cylinder Curvature Wrinkles */}
                <path d="M 172,248 Q 192,268 186,295" stroke="rgba(0,0,0,0.22)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 428,248 Q 408,268 414,295" stroke="rgba(0,0,0,0.22)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 175,390 Q 300,410 425,390" stroke="rgba(0,0,0,0.12)" strokeWidth="3" fill="none" />
                <path d="M 170,520 Q 300,540 430,520" stroke="rgba(0,0,0,0.15)" strokeWidth="3" fill="none" />

                {/* Double Hem Stitching at Bottom */}
                <path d="M 166,616 Q 300,630 434,616" stroke={shirtColor.isDark ? '#ffffff' : '#000000'} strokeWidth="1.2" strokeDasharray="4,2.5" strokeOpacity="0.25" fill="none" />

                {/* Collar Construction in 3D */}
                {shirtStyle.id === 'polo' ? (
                  isFrontFacing ? (
                    <g>
                      {/* Placket */}
                      <rect x="286" y="96" width="28" height="88" rx="2" fill={shirtColor.hex} stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" />
                      <circle cx="300" cy="120" r="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                      <circle cx="300" cy="154" r="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                      {/* Left & Right Collar Wings */}
                      <path d="M 215,84 C 242,82 276,86 295,102 L 252,158 L 204,142 Z" fill={shirtColor.hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                      <path d="M 385,84 C 358,82 324,86 305,102 L 348,158 L 396,142 Z" fill={shirtColor.hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                    </g>
                  ) : (
                    <path d="M 215,86 Q 300,104 385,86 Q 355,70 300,68 Q 245,70 215,86 Z" fill={shirtColor.hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                  )
                ) : shirtStyle.id === 'vneck' ? (
                  isFrontFacing ? (
                    <g>
                      <path d="M 218,90 L 300,192 L 382,90" fill="none" stroke={shirtColor.hex} strokeWidth="8" strokeLinecap="round" />
                      <path d="M 218,90 L 300,192 L 382,90" fill="none" stroke={shirtColor.isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'} strokeWidth="1.5" />
                    </g>
                  ) : (
                    <path d="M 218,90 Q 300,108 382,90" fill="none" stroke={shirtColor.hex} strokeWidth="8" strokeLinecap="round" />
                  )
                ) : shirtStyle.id === 'tanktop' ? (
                  <path
                    d={`M 214,92 Q 300,${isFrontFacing ? 180 : 120} 386,92`}
                    fill="none"
                    stroke={shirtColor.isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'}
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                ) : shirtStyle.id === 'hoodie' ? (
                  // Hood
                  <g>
                    <path d="M 215,112 C 205,45 240,24 300,22 C 360,24 395,45 385,112 Q 345,155 300,158 Q 255,155 215,112 Z" fill={shirtColor.hex} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
                    {isFrontFacing && (
                      <path d="M 205,475 Q 200,535 180,580 L 420,580 Q 400,535 395,475 Z" fill={shirtColor.hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                    )}
                  </g>
                ) : (
                  // Standard / Oversized / Longsleeve Crewneck
                  <g>
                    <path
                      d={`M 218,90 Q 300,${isFrontFacing ? 156 : 106} 382,90 Q 355,${isFrontFacing ? 76 : 78} 300,${isFrontFacing ? 74 : 76} Q 245,${isFrontFacing ? 76 : 78} 218,90 Z`}
                      fill={shirtColor.hex}
                      stroke={shirtColor.isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'}
                      strokeWidth="2"
                    />
                    <path
                      d={`M 222,94 Q 300,${isFrontFacing ? 150 : 102} 378,94`}
                      fill="none"
                      stroke={shirtColor.isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </svg>

              {/* Cylindrical Projected Layers mapped onto chest/back */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  opacity: Math.max(0, cosAngle),
                  transform: `translateX(${layerOffsetX}px) scaleX(${layerScaleX}) skewY(${layerSkewY}deg)`,
                  transition: isAutoRotating || isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform',
                }}
              >
                <div className="relative w-[240px] h-[320px] -mt-8 flex items-center justify-center">
                  {visibleLayers.map(layer => (
                    <div
                      key={layer.id}
                      className="absolute"
                      style={{
                        left: `calc(50% + ${layer.x}%)`,
                        top: `calc(50% + ${layer.y}%)`,
                        transform: `translate(-50%, -50%) scale(${layer.scale * 0.85}) rotate(${layer.rotation}deg)`,
                        opacity: layer.opacity,
                        mixBlendMode: layer.blendMode,
                        filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.4))`,
                      }}
                    >
                      {layer.type === 'text' ? (
                        <div
                          style={{
                            fontFamily: layer.textProps?.fontFamily || 'Prompt, sans-serif',
                            fontSize: `${layer.textProps?.fontSize || 28}px`,
                            color: layer.textProps?.color || '#ffffff',
                            fontWeight: layer.textProps?.isBold ? 800 : 500,
                            letterSpacing: `${layer.textProps?.letterSpacing || 1}px`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {layer.content}
                        </div>
                      ) : (
                        <img
                          src={layer.content}
                          alt={layer.name}
                          className="max-w-[200px] max-h-[200px] object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Angle Gauge Badge */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs flex items-center gap-2 shadow-lg pointer-events-none">
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-amber-400 font-bold">{Math.round(normalizedAngle)}°</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-semibold">
              {isFrontFacing ? 'ด้านหน้า (Front)' : 'ด้านหลัง (Back)'}
            </span>
          </div>

          {/* Lighting Mode Selector Floating */}
          <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-white/10 text-xs flex items-center gap-1 shadow-lg pointer-events-auto">
            <button
              onClick={() => setLightingMode('studio')}
              className={`px-2.5 py-1 rounded transition-colors ${
                lightingMode === 'studio' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              สตูดิโอ
            </button>
            <button
              onClick={() => setLightingMode('spotlight')}
              className={`px-2.5 py-1 rounded transition-colors ${
                lightingMode === 'spotlight' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              สปอตไลท์
            </button>
            <button
              onClick={() => setLightingMode('soft')}
              className={`px-2.5 py-1 rounded transition-colors ${
                lightingMode === 'soft' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              แสงนุ่ม
            </button>
          </div>

          {/* Snapshot Confirmation Toast */}
          {snapshotTaken && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>บันทึกภาพถ่ายโมเดล 3D เรียบร้อยแล้ว!</span>
            </div>
          )}

          {/* Drag Instruction Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-slate-400 border border-white/10 pointer-events-none flex items-center gap-2">
            <span>🖱️ แตะหรือลากเพื่อหมุนเสื้อ 360°</span>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 sm:px-6 bg-[#0E1016] border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Quick Angle Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">มุมมองลัด:</span>
            {[
              { label: 'อกหน้า (0°)', angle: 0 },
              { label: 'เฉียง 3/4 (45°)', angle: 45 },
              { label: 'ด้านข้าง (90°)', angle: 90 },
              { label: 'หลังเสื้อ (180°)', angle: 180 },
              { label: 'เฉียงหลัง (225°)', angle: 225 },
            ].map(preset => (
              <button
                key={preset.angle}
                onClick={() => setRotationY(preset.angle)}
                className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
                  Math.abs(normalizedAngle - preset.angle) < 15
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Right: Auto-rotate Toggle & Snapshot */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isAutoRotating
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoRotating ? 'หยุดหมุน' : 'หมุนอัตโนมัติ'}</span>
            </button>

            <button
              onClick={handleTakeSnapshot}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>ถ่ายรูปจำลอง 3D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Shirt3DViewerModal = React.memo(Shirt3DViewerModalComponent);
