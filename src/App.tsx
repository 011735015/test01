import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ShirtMockupCanvas } from './components/ShirtMockupCanvas';
import { StudioControls } from './components/StudioControls';
import { SelectedLayerBar } from './components/SelectedLayerBar';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { PresetGalleryModal } from './components/PresetGalleryModal';
import { ImageAiToolsModal } from './components/ImageAiToolsModal';
import { Shirt3DViewerModal } from './components/Shirt3DViewerModal';
import { TeamRosterModal } from './components/TeamRosterModal';
import { DraftAndShareModal } from './components/DraftAndShareModal';
import { 
  ShirtStyle, 
  ShirtColor, 
  PrintLayer, 
  PrintTechnology, 
  PrintSizeOption, 
  CustomerOrder,
  TeamMemberRosterItem,
  SavedDesignDraft,
  SizeQtyMap,
  TextProperties
} from './types';
import { 
  SHIRT_STYLES, 
  SHIRT_COLORS, 
  PRINT_TECHNOLOGIES, 
  PRINT_SIZES, 
  PRESET_ARTWORKS 
} from './data/mockData';
import { 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  RotateCcw, 
  HelpCircle,
  Upload,
  Layers,
  ChevronRight,
  Scissors,
  Maximize2,
  Users,
  Share2
} from 'lucide-react';

export default function App() {
  // Main Studio States
  const [shirtStyle, setShirtStyle] = useState<ShirtStyle>(SHIRT_STYLES[0]); // Heavy Cotton Oversized
  const [shirtColor, setShirtColor] = useState<ShirtColor>(SHIRT_COLORS[1]); // Black (ดำ)
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [printTech, setPrintTech] = useState<PrintTechnology>(PRINT_TECHNOLOGIES[0]); // DTF Digital
  const [printSize, setPrintSize] = useState<PrintSizeOption>(PRINT_SIZES[2]); // A3 (30x42cm)

  // Layers on shirt
  const [layers, setLayers] = useState<PrintLayer[]>([
    {
      id: 'default-layer-1',
      type: 'preset',
      side: 'front',
      name: 'Cyber Mecha Skull',
      content: PRESET_ARTWORKS[0].svgDataUri,
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
      blendMode: 'normal',
    },
  ]);

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>('default-layer-1');

  // Modals & Tools
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isPresetGalleryOpen, setIsPresetGalleryOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CustomerOrder | null>(null);

  // New Feature Modals
  const [isImageAiToolsOpen, setIsImageAiToolsOpen] = useState(false);
  const [imageAiToolsInitialTab, setImageAiToolsInitialTab] = useState<'remove_bg' | 'upscale' | 'ai_prompt'>('remove_bg');
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false);
  const [isTeamRosterOpen, setIsTeamRosterOpen] = useState(false);
  const [isDraftAndShareOpen, setIsDraftAndShareOpen] = useState(false);

  // Team Roster & Size distribution
  const [teamRoster, setTeamRoster] = useState<TeamMemberRosterItem[]>([]);
  const [sizeQuantities, setSizeQuantities] = useState<SizeQtyMap>({
    S: 0,
    M: 0,
    L: 1,
    XL: 0,
    '2XL': 0,
    '3XL': 0,
  });

  // Check URL query on mount for shared link
  useEffect(() => {
    try {
      const search = window.location.search;
      if (search.includes('design=') || window.location.hash.includes('share')) {
        setIsDraftAndShareOpen(true);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Layer handlers
  const handleAddImageLayer = useCallback((imageUrl: string, name: string) => {
    const newLayer: PrintLayer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      side: activeSide,
      name: name || 'รูปภาพของฉัน',
      content: imageUrl,
      x: 0,
      y: 0,
      scale: 0.95,
      rotation: 0,
      opacity: 1,
      blendMode: 'normal',
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, [activeSide]);

  const handleAddTextLayer = useCallback((
    text: string, 
    font: string, 
    color: string, 
    isBold: boolean,
    additionalProps?: Partial<TextProperties>
  ) => {
    const newLayer: PrintLayer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'text',
      side: activeSide,
      name: text.length > 15 ? text.substring(0, 15) + '...' : text,
      content: text,
      x: 0,
      y: -15,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
      blendMode: 'normal',
      textProps: {
        fontFamily: font,
        fontSize: 32,
        color: color,
        isBold: isBold,
        textAlign: 'center',
        letterSpacing: 2,
        curved: additionalProps?.curved || false,
        curveRadius: additionalProps?.curveRadius ?? 35,
        strokeWidth: additionalProps?.strokeWidth ?? 0,
        strokeColor: additionalProps?.strokeColor || '#000000',
        shadowBlur: additionalProps?.shadowBlur ?? 0,
        shadowColor: additionalProps?.shadowColor || 'rgba(0,0,0,0.85)',
        shadowOffsetX: additionalProps?.shadowOffsetX ?? 2,
        shadowOffsetY: additionalProps?.shadowOffsetY ?? 3,
      },
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, [activeSide]);

  const handleUpdateLayer = useCallback((id: string, updates: Partial<PrintLayer>) => {
    setLayers(prev =>
      prev.map(layer => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  }, []);

  const handleDeleteLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== id));
    setSelectedLayerId(prev => (prev === id ? null : prev));
  }, []);

  const handleDuplicateLayer = useCallback((id: string) => {
    setLayers(prev => {
      const target = prev.find(l => l.id === id);
      if (!target) return prev;
      const duplicated: PrintLayer = {
        ...target,
        id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        x: Math.min(40, target.x + 5),
        y: Math.min(40, target.y + 5),
        name: `${target.name} (สำเนา)`,
      };
      setSelectedLayerId(duplicated.id);
      return [...prev, duplicated];
    });
  }, []);

  const handleMoveLayerOrder = useCallback((id: string, direction: 'up' | 'down') => {
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx === -1) return prev;
      const copy = [...prev];
      if (direction === 'up' && idx < copy.length - 1) {
        const temp = copy[idx];
        copy[idx] = copy[idx + 1];
        copy[idx + 1] = temp;
      } else if (direction === 'down' && idx > 0) {
        const temp = copy[idx];
        copy[idx] = copy[idx - 1];
        copy[idx - 1] = temp;
      }
      return copy;
    });
  }, []);

  const handleResetDesign = useCallback(() => {
    if (window.confirm('คุณต้องการรีเซ็ตลายสกรีนบนเสื้อทั้งหมดหรือไม่?')) {
      setLayers([]);
      setSelectedLayerId(null);
    }
  }, []);

  const handleDropImageFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const url = e.target.result as string;
        const name = file.name.replace(/\.[^/.]+$/, '');
        handleAddImageLayer(url, name);
      }
    };
    reader.readAsDataURL(file);
  }, [handleAddImageLayer]);

  const handleStartNewDesign = useCallback(() => {
    setCompletedOrder(null);
    setLayers([]);
    setSelectedLayerId(null);
    setActiveSide('front');
    setTeamRoster([]);
    setSizeQuantities({ S: 0, M: 0, L: 1, XL: 0, '2XL': 0, '3XL': 0 });
  }, []);

  // Open AI modal with specific tab
  const handleOpenImageAiTools = useCallback((tab: 'remove_bg' | 'upscale' | 'ai_prompt') => {
    setImageAiToolsInitialTab(tab);
    setIsImageAiToolsOpen(true);
  }, []);

  // Apply modified image from AI Studio
  const handleApplyModifiedImage = useCallback((
    layerId: string, 
    newImageUrl: string, 
    metadata?: { isBgRemoved?: boolean; isUpscaled?: boolean }
  ) => {
    setLayers(prev =>
      prev.map(l =>
        l.id === layerId
          ? {
              ...l,
              content: newImageUrl,
              isBgRemoved: metadata?.isBgRemoved !== undefined ? metadata.isBgRemoved : l.isBgRemoved,
              isUpscaled: metadata?.isUpscaled !== undefined ? metadata.isUpscaled : l.isUpscaled,
            }
          : l
      )
    );
  }, []);

  // Add new layer generated by AI Prompt
  const handleAddNewAiLayer = useCallback((imageUrl: string, promptName: string) => {
    handleAddImageLayer(imageUrl, promptName || 'AI Graphic');
  }, [handleAddImageLayer]);

  // Apply team roster
  const handleApplyRoster = useCallback((newRoster: TeamMemberRosterItem[], newSizes: SizeQtyMap) => {
    setTeamRoster(newRoster);
    setSizeQuantities(newSizes);
    setIsCheckoutOpen(true);
  }, []);

  // Load saved draft
  const handleLoadDraft = useCallback((draft: SavedDesignDraft) => {
    const matchedStyle = SHIRT_STYLES.find(s => s.id === draft.shirtStyleId) || SHIRT_STYLES[0];
    const matchedColor = matchedStyle.availableColors.find(c => c.id === draft.shirtColorId) || matchedStyle.availableColors[0];
    const matchedTech = PRINT_TECHNOLOGIES.find(t => t.id === draft.printTechId) || PRINT_TECHNOLOGIES[0];
    const matchedSize = PRINT_SIZES.find(s => s.id === draft.printSizeId) || PRINT_SIZES[2];

    setShirtStyle(matchedStyle);
    setShirtColor(matchedColor);
    setPrintTech(matchedTech);
    setPrintSize(matchedSize);
    setLayers(draft.layers);
    setSelectedLayerId(draft.layers[0]?.id || null);
  }, []);

  // Select recommended size from Advisor
  const handleSelectRecommendedSize = useCallback((recommendedSize: string) => {
    setSizeQuantities({
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      '2XL': 0,
      '3XL': 0,
      [recommendedSize]: 1,
    });
  }, []);

  const totalItemCount = useMemo(() => {
    return Object.values(sizeQuantities).reduce((acc, q) => acc + q, 0);
  }, [sizeQuantities]);

  const handleSelectPreset = useCallback((svg: string, title: string, side: 'front' | 'back') => {
    const newLayer: PrintLayer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'preset',
      side: side,
      name: title,
      content: svg,
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
      blendMode: 'normal',
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveSide(side);
    setSelectedLayerId(newLayer.id);
  }, []);

  const selectedLayer = useMemo(() => {
    return layers.find(l => l.id === selectedLayerId) || null;
  }, [layers, selectedLayerId]);

  return (
    <div className="min-h-screen bg-[#0E1015] text-slate-100 flex flex-col font-['Prompt',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        totalItems={totalItemCount}
        totalLayers={layers.length}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenPresetGallery={() => setIsPresetGalleryOpen(true)}
        onOpen3DViewer={() => setIs3DViewerOpen(true)}
        onOpenTeamRoster={() => setIsTeamRosterOpen(true)}
        onOpenDraftAndShare={() => setIsDraftAndShareOpen(true)}
        onOpenAiTools={() => handleOpenImageAiTools('ai_prompt')}
        activeSide={activeSide}
        onToggleSide={setActiveSide}
      />

      {/* Main Studio Work Area */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left / Center: Interactive Shirt Mockup Canvas Stage */}
        <div className="relative flex-1 flex flex-col min-h-[540px] lg:min-h-0 bg-[#0A0C10]">
          {/* Selected Layer Floating Quick Toolbar */}
          <SelectedLayerBar
            selectedLayer={selectedLayer}
            onUpdateLayer={handleUpdateLayer}
            onDeleteLayer={handleDeleteLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onMoveLayerOrder={handleMoveLayerOrder}
            onDeselect={() => setSelectedLayerId(null)}
            onOpenImageAiTools={handleOpenImageAiTools}
          />

          {/* Canvas Component with Drag & Drop & Realtime Preview */}
          <ShirtMockupCanvas
            shirtStyle={shirtStyle}
            onSelectShirtStyle={setShirtStyle}
            shirtColor={shirtColor}
            onSelectShirtColor={setShirtColor}
            availableColors={shirtStyle.availableColors}
            activeSide={activeSide}
            onToggleSide={setActiveSide}
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayer={handleUpdateLayer}
            onDeleteLayer={handleDeleteLayer}
            printSize={printSize}
            onDropImageFile={handleDropImageFile}
            onOpen3DViewer={() => setIs3DViewerOpen(true)}
          />
        </div>

        {/* Right Sidebar: Studio Controls */}
        <StudioControls
          shirtStyle={shirtStyle}
          onSelectShirtStyle={setShirtStyle}
          shirtColor={shirtColor}
          onSelectShirtColor={setShirtColor}
          activeSide={activeSide}
          onToggleSide={setActiveSide}
          printTech={printTech}
          onSelectPrintTech={setPrintTech}
          printSize={printSize}
          onSelectPrintSize={setPrintSize}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onAddImageLayer={handleAddImageLayer}
          onAddTextLayer={handleAddTextLayer}
          onDeleteLayer={handleDeleteLayer}
          onOpenImageAiTools={handleOpenImageAiTools}
          onOpenTeamRoster={() => setIsTeamRosterOpen(true)}
        />
      </main>

      {/* Bottom Value Props Banner */}
      <footer className="bg-[#0B0D12] border-t border-white/10 px-4 py-3 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>สกรีนเริ่มต้น 1 ตัว ไม่มีขั้นต่ำ</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>ส่งฟรีทั่วประเทศ เมื่อสั่งครบ ฿1,000</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>ผลิตเสร็จและจัดส่งภายใน 2-3 วันทำการ</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>รับประกันหมึกพิมพ์ไม่แตกหลุดลอก 100%</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDesign}
              className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตลายทั้งหมด</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500 font-mono text-[11px]">
              SCREENLAB STUDIO © 2026
            </span>
          </div>
        </div>
      </footer>

      {/* MODALS - Lazily mounted only when open for maximum frame rate */}
      {/* 1. Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          shirtStyle={shirtStyle}
          shirtColor={shirtColor}
          layers={layers}
          printTech={printTech}
          printSize={printSize}
          initialSizeQuantities={sizeQuantities}
          teamRoster={teamRoster}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          onCompleteOrder={(order) => {
            setIsCheckoutOpen(false);
            setCompletedOrder(order);
          }}
        />
      )}

      {/* 2. Order Success Modal */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onStartNewDesign={handleStartNewDesign}
        />
      )}

      {/* 3. Size Guide & Smart Advisor Modal */}
      {isSizeGuideOpen && (
        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
          shirtStyle={shirtStyle}
          onSelectRecommendedSize={handleSelectRecommendedSize}
        />
      )}

      {/* 4. Preset Gallery Modal */}
      {isPresetGalleryOpen && (
        <PresetGalleryModal
          isOpen={isPresetGalleryOpen}
          onClose={() => setIsPresetGalleryOpen(false)}
          onSelectPreset={handleSelectPreset}
          currentSide={activeSide}
        />
      )}

      {/* 5. AI Image Tools Modal (Remove BG / 300 DPI Upscale / Prompt Generator) */}
      {isImageAiToolsOpen && (
        <ImageAiToolsModal
          isOpen={isImageAiToolsOpen}
          onClose={() => setIsImageAiToolsOpen(false)}
          targetLayer={selectedLayer}
          onApplyModifiedImage={handleApplyModifiedImage}
          onAddNewAiLayer={handleAddNewAiLayer}
          printSize={printSize}
          initialTab={imageAiToolsInitialTab}
        />
      )}

      {/* 6. 3D 360° Showroom Modal */}
      {is3DViewerOpen && (
        <Shirt3DViewerModal
          isOpen={is3DViewerOpen}
          onClose={() => setIs3DViewerOpen(false)}
          shirtStyle={shirtStyle}
          shirtColor={shirtColor}
          layers={layers}
          printSize={printSize}
        />
      )}

      {/* 7. Team / Group Roster Modal */}
      {isTeamRosterOpen && (
        <TeamRosterModal
          isOpen={isTeamRosterOpen}
          onClose={() => setIsTeamRosterOpen(false)}
          shirtStyle={shirtStyle}
          shirtColor={shirtColor}
          initialRoster={teamRoster}
          onApplyRoster={handleApplyRoster}
        />
      )}

      {/* 8. Draft Saver & Friend Voting Modal */}
      {isDraftAndShareOpen && (
        <DraftAndShareModal
          isOpen={isDraftAndShareOpen}
          onClose={() => setIsDraftAndShareOpen(false)}
          shirtStyle={shirtStyle}
          shirtColor={shirtColor}
          layers={layers}
          printTech={printTech}
          printSize={printSize}
          onLoadDraft={handleLoadDraft}
        />
      )}
    </div>
  );
}
