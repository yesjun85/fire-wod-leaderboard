import React from 'react';
import { ViewMode } from '../types';
import { 
  Flame, 
  Tv, 
  Smartphone, 
  Settings, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Code2, 
  ShieldAlert,
  Radio
} from 'lucide-react';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  stationName: string;
  hasGeminiKey: boolean;
  soundEnabled: boolean;
  roomId?: string;
  isSyncConnected?: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenAIModal: () => void;
  onOpenExporter: () => void;
  onTriggerAlarmTest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  stationName,
  hasGeminiKey,
  soundEnabled,
  roomId = 'wod-119',
  isSyncConnected = true,
  onToggleSound,
  onOpenSettings,
  onOpenAIModal,
  onOpenExporter,
  onTriggerAlarmTest
}) => {
  return (
    <header className="bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/90 sticky top-0 z-40 px-3 sm:px-5 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Station */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-gradient-to-br from-orange-500 via-red-600 to-amber-600 flex items-center justify-center shadow-md shadow-orange-950/70 border border-orange-400/40">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-['Black_Han_Sans',sans-serif] tracking-wider text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-400">
                파이어 WOD
              </span>
              <span 
                className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  isSyncConnected 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' 
                    : 'bg-amber-950/60 text-amber-400 border-amber-500/40 animate-pulse'
                }`}
                title={`전국 스마트폰/PC 실시간 동기화 방: ${roomId}`}
              >
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>{roomId}</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-[140px] sm:max-w-[220px]">
              {stationName || '119 안전센터 체력단련실'}
            </p>
          </div>
        </div>

        {/* Center: Dual Mode Switch (Compact Segmented) */}
        <div className="flex items-center bg-[#090d16] p-0.5 rounded-lg border border-slate-800 shadow-inner">
          <button
            id="viewmode-tv-btn"
            onClick={() => setViewMode('tv')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-md text-xs font-bold transition-all ${
              viewMode === 'tv'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-sm shadow-orange-950 border border-orange-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="font-['Black_Han_Sans',sans-serif] tracking-wide">TV 전광판</span>
          </button>
          <button
            id="viewmode-mobile-btn"
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-md text-xs font-bold transition-all ${
              viewMode === 'mobile'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-sm shadow-orange-950 border border-orange-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="font-['Black_Han_Sans',sans-serif] tracking-wide">모바일 대원</span>
          </button>
          {viewMode === 'join' && (
            <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              QR 등록 중
            </span>
          )}
        </div>

        {/* Right Tools - High Density Toolbar */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* AI WOD Generator Button */}
          <button
            id="ai-wod-open-btn"
            onClick={onOpenAIModal}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold transition-all"
            title="AI 소방 전술 WOD 생성기"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline font-bold text-xs">AI WOD</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className={`p-1.5 rounded-md border transition-all ${
              soundEnabled
                ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
            title={soundEnabled ? '효과음 켜짐 (Web Audio)' : '효과음 음소거됨'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Emergency Alarm Siren Test Button */}
          <button
            id="alarm-test-btn"
            onClick={onTriggerAlarmTest}
            className="p-1.5 rounded-md bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/50 hover:text-red-300 transition-all"
            title="소방 경보 & 커피 당번 사이렌 테스트"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          {/* Standalone HTML Copy/Export */}
          <button
            id="html-export-btn"
            onClick={onOpenExporter}
            className="hidden sm:flex items-center p-1.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/70 hover:bg-slate-700 transition-all"
            title="단일 index.html 파일 내보내기"
          >
            <Code2 className="w-4 h-4 text-orange-400" />
          </button>

          {/* Settings Modal Button with Gemini Status indicator */}
          <button
            id="settings-modal-btn"
            onClick={onOpenSettings}
            className="relative p-1.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/70 hover:bg-slate-700 hover:text-white transition-all"
            title="설정 및 Gemini API 키 관리"
          >
            <Settings className="w-4 h-4" />
            {/* API Key Status Dot */}
            <span
              className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ring-1 ring-slate-900 ${
                hasGeminiKey
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse'
                  : 'bg-red-500 shadow-sm shadow-red-500'
              }`}
              title={hasGeminiKey ? 'Gemini API Key 등록됨 (초록불)' : 'Gemini API Key 미등록 (빨간불)'}
            />
          </button>

        </div>
      </div>
    </header>
  );
};
