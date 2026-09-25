import React from 'react';
import { 
  Shirt, 
  ShoppingBag, 
  Ruler, 
  Palette, 
  Sparkles, 
  RotateCw, 
  Users, 
  Share2, 
  Scissors 
} from 'lucide-react';

interface NavbarProps {
  totalItems: number;
  totalLayers: number;
  onOpenCheckout: () => void;
  onOpenSizeGuide: () => void;
  onOpenPresetGallery: () => void;
  onOpen3DViewer: () => void;
  onOpenTeamRoster: () => void;
  onOpenDraftAndShare: () => void;
  onOpenAiTools: () => void;
  activeSide: 'front' | 'back';
  onToggleSide: (side: 'front' | 'back') => void;
}

const NavbarComponent: React.FC<NavbarProps> = ({
  totalItems,
  totalLayers,
  onOpenCheckout,
  onOpenSizeGuide,
  onOpenPresetGallery,
  onOpen3DViewer,
  onOpenTeamRoster,
  onOpenDraftAndShare,
  onOpenAiTools,
  activeSide,
  onToggleSide,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-[#0E1015]/95 backdrop-blur-md border-b border-white/10">
      {/* Zone 1: Logo & Brand wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform font-bold">
            <Shirt className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-['Plus_Jakarta_Sans',sans-serif] tracking-wider text-base sm:text-lg">
            SCREEN<span className="text-amber-400">LAB</span>
            <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono font-normal">STUDIO</span>
          </span>
        </a>

        {/* View Switcher (Front / Back) */}
        <div className="hidden lg:flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 ml-2">
          <button
            onClick={() => onToggleSide('front')}
            className={`px-3 py-1 text-xs rounded-md transition-all font-medium whitespace-nowrap ${
              activeSide === 'front'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            อกหน้า
          </button>
          <button
            onClick={() => onToggleSide('back')}
            className={`px-3 py-1 text-xs rounded-md transition-all font-medium whitespace-nowrap ${
              activeSide === 'back'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            หลังเสื้อ
          </button>
        </div>
      </div>

      {/* Zone 2: Studio Tools Navigation */}
      <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-300">
        {/* 3D 360 Showroom Button */}
        <button
          onClick={onOpen3DViewer}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/25 transition-all whitespace-nowrap active:scale-95 font-semibold"
          title="หมุนดูเสื้อแบบ 3 มิติ 360 องศา"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-400" />
          <span>โหมด 3D 360°</span>
        </button>

        {/* AI Studio button */}
        <button
          onClick={onOpenAiTools}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors whitespace-nowrap"
          title="ลบพื้นหลัง / อัปสเกล / เจนลายด้วย AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>AI เครื่องมือ</span>
        </button>

        {/* Team Roster button */}
        <button
          onClick={onOpenTeamRoster}
          className="flex items-center gap-1.5 hover:text-amber-400 transition-colors whitespace-nowrap"
          title="สกรีนชื่อ & เบอร์เสื้อตามไซส์"
        >
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>สกรีนชื่อทีม</span>
        </button>

        {/* Size Guide & Advisor button */}
        <button
          onClick={onOpenSizeGuide}
          className="flex items-center gap-1.5 hover:text-amber-400 transition-colors whitespace-nowrap"
          title="คำนวณไซส์จากส่วนสูง/น้ำหนัก และดูตารางไซส์"
        >
          <Ruler className="w-3.5 h-3.5 text-slate-400" />
          <span>คำนวณไซส์</span>
        </button>

        {/* Draft & Share button */}
        <button
          onClick={onOpenDraftAndShare}
          className="flex items-center gap-1.5 hover:text-amber-400 transition-colors whitespace-nowrap"
          title="บันทึกแบบร่าง & แชร์ให้เพื่อนโหวต"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-400" />
          <span>แชร์/โหวตแบบ</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action & Mobile Quick Triggers */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpen3DViewer}
          className="md:hidden p-2 text-amber-400 hover:text-white rounded-lg bg-amber-400/10 border border-amber-400/30"
          title="โหมด 3D 360°"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenAiTools}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-white/5"
          title="AI Studio"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
        </button>

        <button
          onClick={onOpenCheckout}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap"
        >
          <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
          <span>สั่งสกรีนทันที</span>
          {totalItems > 0 && (
            <span className="px-1.5 py-0.2 bg-slate-950 text-amber-400 rounded-full text-xs font-mono font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export const Navbar = React.memo(NavbarComponent);
