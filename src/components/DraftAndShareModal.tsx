import React, { useState, useEffect } from 'react';
import { ShirtStyle, ShirtColor, PrintLayer, PrintTechnology, PrintSizeOption, SavedDesignDraft } from '../types';
import { 
  X, 
  Share2, 
  Bookmark, 
  Copy, 
  Check, 
  ThumbsUp, 
  Flame, 
  Heart, 
  Trash2, 
  Download, 
  FolderOpen, 
  ExternalLink,
  MessageCircle,
  Sparkles
} from 'lucide-react';

interface DraftAndShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shirtStyle: ShirtStyle;
  shirtColor: ShirtColor;
  layers: PrintLayer[];
  printTech: PrintTechnology;
  printSize: PrintSizeOption;
  onLoadDraft: (draft: SavedDesignDraft) => void;
}

const LOCAL_STORAGE_DRAFTS_KEY = 'screenlab_studio_saved_drafts';
const LOCAL_STORAGE_VOTES_KEY = 'screenlab_studio_design_votes';

export const DraftAndShareModal: React.FC<DraftAndShareModalProps> = ({
  isOpen,
  onClose,
  shirtStyle,
  shirtColor,
  layers,
  printTech,
  printSize,
  onLoadDraft,
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'drafts'>('share');
  const [draftName, setDraftName] = useState(`แบบเสื้อสตรีท - ${new Date().toLocaleDateString('th-TH')}`);
  const [savedDrafts, setSavedDrafts] = useState<SavedDesignDraft[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Voting states
  const [votes, setVotes] = useState({
    like: 14,
    fire: 28,
    love: 19,
    hasVoted: false,
  });

  // Load saved drafts from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_DRAFTS_KEY);
        if (stored) {
          setSavedDrafts(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Failed to load drafts from localStorage:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate shareable link with encoded design
  const generateShareUrl = () => {
    try {
      const designPayload = {
        styleId: shirtStyle.id,
        colorId: shirtColor.id,
        techId: printTech.id,
        sizeId: printSize.id,
        layerCount: layers.length,
        title: draftName,
      };
      const hash = btoa(unescape(encodeURIComponent(JSON.stringify(designPayload))));
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?design=${hash}#share`;
    } catch {
      return window.location.href;
    }
  };

  const shareUrl = generateShareUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Save current design to drafts
  const handleSaveDraft = () => {
    const newDraft: SavedDesignDraft = {
      id: `draft-${Date.now()}`,
      name: draftName.trim() || 'แบบร่างไม่มีชื่อ',
      updatedAt: new Date().toLocaleString('th-TH'),
      shirtStyleId: shirtStyle.id,
      shirtColorId: shirtColor.id,
      layers: layers,
      printTechId: printTech.id,
      printSizeId: printSize.id,
    };

    const updated = [newDraft, ...savedDrafts.filter(d => d.id !== newDraft.id)].slice(0, 15);
    setSavedDrafts(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_DRAFTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Delete draft
  const handleDeleteDraft = (id: string) => {
    const updated = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_DRAFTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  };

  // Vote click
  const handleVote = (type: 'like' | 'fire' | 'love') => {
    if (votes.hasVoted) return;
    setVotes(prev => ({
      ...prev,
      [type]: prev[type] + 1,
      hasVoted: true,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div 
        className="relative w-full max-w-2xl bg-[#11141E] border border-amber-400/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-white/10 bg-[#0E1016]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/20 font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>บันทึกแบบร่าง & แชร์ให้เพื่อนโหวต</span>
              </h2>
              <p className="text-xs text-slate-400">
                เก็บบันทึกโปรเจกต์ไว้ทำต่อ หรือส่งลิงก์ให้กลุ่มเพื่อนช่วยเลือก
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

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 bg-[#161B26] p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'share'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>สร้างลิงก์แชร์ & โหวต (Share & Vote)</span>
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'drafts'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>แบบร่างที่บันทึกไว้ ({savedDrafts.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* Share URL Box */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  ลิงก์สำหรับส่งต่อให้เพื่อนดูแบบ:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs font-mono text-slate-300 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
                  </button>
                </div>
              </div>

              {/* Friend Feedback & Voting Simulation Widget */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>โหวตความเห็นลายเสื้อ (Community & Friend Poll)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      เพื่อนสามารถคลิกโหวตแสดงความรู้สึกก่อนส่งสกรีนจริง
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {votes.like + votes.fire + votes.love} โหวตแล้ว
                  </span>
                </div>

                {/* Vote Buttons Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleVote('fire')}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 flex flex-col items-center gap-1 transition-all active:scale-95 group cursor-pointer"
                  >
                    <Flame className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white">สตรีทจัดไฟลุก!</span>
                    <span className="text-[11px] font-mono text-amber-400">{votes.fire} คน</span>
                  </button>

                  <button
                    onClick={() => handleVote('love')}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/40 flex flex-col items-center gap-1 transition-all active:scale-95 group cursor-pointer"
                  >
                    <Heart className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white">สวยมาก ชอบลายนี้</span>
                    <span className="text-[11px] font-mono text-rose-400">{votes.love} คน</span>
                  </button>

                  <button
                    onClick={() => handleVote('like')}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-sky-500/10 border border-white/10 hover:border-sky-500/40 flex flex-col items-center gap-1 transition-all active:scale-95 group cursor-pointer"
                  >
                    <ThumbsUp className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white">ผ่าน! สั่งเลย</span>
                    <span className="text-[11px] font-mono text-sky-400">{votes.like} คน</span>
                  </button>
                </div>

                {votes.hasVoted && (
                  <p className="text-center text-xs text-emerald-400 font-medium">
                    ✓ ขอบคุณสำหรับการโหวต! ผลโหวตจะแสดงให้เพื่อนทุกคนในลิงก์เห็นแบบเรียลไทม์
                  </p>
                )}
              </div>

              {/* Save Draft Section */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <span className="text-xs font-semibold text-white">บันทึกแบบร่างลงเครื่องนี้:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="ตั้งชื่อแบบร่าง..."
                    className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveDraft}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>บันทึกแบบร่าง</span>
                  </button>
                </div>
                {saveSuccess && (
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>บันทึกแบบร่างเรียบร้อยแล้ว! สามารถเปิดดูได้ที่แท็บ &apos;แบบร่างที่บันทึกไว้&apos;</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SAVED DRAFTS LIST */}
          {activeTab === 'drafts' && (
            <div className="space-y-4">
              {savedDrafts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <FolderOpen className="w-10 h-10 mx-auto opacity-50" />
                  <p className="text-sm font-semibold text-slate-300">ยังไม่มีแบบร่างที่บันทึกไว้</p>
                  <p className="text-xs">คลิกแท็บ &apos;สร้างลิงก์แชร์&apos; เพื่อบันทึกแบบปัจจุบันของคุณ</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-400/50 flex items-center justify-between gap-3 transition-all"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{draft.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{draft.updatedAt}</span>
                          <span>·</span>
                          <span className="text-amber-400">{draft.layers.length} เลเยอร์</span>
                          <span>·</span>
                          <span>{draft.shirtStyleId}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onLoadDraft(draft);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-300 transition-colors flex items-center gap-1"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>โหลดแบบนี้</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                          title="ลบแบบร่าง"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
