import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Save, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  Building2, 
  Eye, 
  EyeOff, 
  Radio, 
  ShieldCheck 
} from 'lucide-react';
import { AppSettings } from '../types';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [stationName, setStationName] = useState(settings.stationName);
  const [soundVolume, setSoundVolume] = useState(settings.soundVolume);
  const [prepSeconds, setPrepSeconds] = useState(settings.prepCountdownSeconds);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      geminiApiKey: apiKey.trim(),
      stationName: stationName.trim() || '119 안전센터',
      soundVolume: soundVolume,
      prepCountdownSeconds: prepSeconds
    });
    sound.setVolume(soundVolume);
    onClose();
  };

  const handleClearKey = () => {
    setApiKey('');
    setTestStatus('idle');
  };

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('API 키를 먼저 입력해주세요.');
      setTestStatus('failed');
      return;
    }
    setTestStatus('testing');
    setErrorMessage('');

    try {
      // Light ping to Gemini API models endpoint
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `인증 실패 (HTTP ${res.status})`);
      }
      setTestStatus('success');
    } catch (e: unknown) {
      setTestStatus('failed');
      setErrorMessage(e instanceof Error ? e.message : 'API 키 유효성 검사에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-orange-400" />
            <h2 className="font-['Black_Han_Sans',sans-serif] text-xl text-slate-100 tracking-wide">
              파이어 WOD 시스템 설정
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* 1. Gemini API Key Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-200">
                  Google Gemini API Key
                </span>
                {/* Indicator */}
                <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border">
                  {apiKey.trim() ? (
                    <span className="flex items-center gap-1 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      등록됨
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 border-red-500/30 bg-red-500/10">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      미등록
                    </span>
                  )}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              AI 소방 WOD를 자동 생성하기 위해 필요합니다. 입력된 키는 브라우저의 <code className="text-orange-300">localStorage</code>에만 보관되며 외부 서버로 무단 전송되지 않습니다.
            </p>

            <div className="relative">
              <input
                id="gemini-api-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus('idle');
                }}
                placeholder="AIzaSy..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500 pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                  title={showKey ? '숨기기' : '보기'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="키 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={testApiKey}
                disabled={testStatus === 'testing' || !apiKey.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                {testStatus === 'testing' ? '검증 중...' : 'API 키 유효성 테스트'}
              </button>

              {testStatus === 'success' && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  정상 연결 완료!
                </span>
              )}

              {testStatus === 'failed' && (
                <span className="text-xs text-red-400 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorMessage || '연결 실패'}
                </span>
              )}
            </div>
          </div>

          {/* 2. Station Name */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-orange-400" />
              소방서 / 안전센터 명칭
            </label>
            <input
              type="text"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="예: 서울중부소방서 119안전센터"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* 3. Audio & Timer Settings */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-orange-400" />
                훈련 사운드 볼륨 (Web Audio API)
              </label>
              <span className="text-xs font-mono text-orange-400 font-bold">
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                setSoundVolume(vol);
                sound.setVolume(vol);
              }}
              className="w-full accent-orange-500 cursor-pointer"
            />

            {/* Test Beep buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => sound.playCountdownTick(false)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                단음 삐- 테스트
              </button>
              <button
                type="button"
                onClick={() => sound.playStartLongBeep()}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                장음 삐-익 테스트
              </button>
              <button
                type="button"
                onClick={() => sound.playFinishBuzzer()}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                종료 버저 테스트
              </button>
            </div>
          </div>

          {/* 4. Prep Countdown Seconds */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-200 block">
                훈련 개시 전 준비 카운트다운
              </span>
              <span className="text-xs text-slate-400">
                훈련 시작 버튼을 누른 후 호흡 및 자세 준비 시간
              </span>
            </div>
            <select
              value={prepSeconds}
              onChange={(e) => setPrepSeconds(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-orange-500 font-bold"
            >
              <option value="5">5초</option>
              <option value="10">10초 (권장)</option>
              <option value="15">15초</option>
              <option value="0">즉시 시작 (0초)</option>
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-sm font-bold"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-['Black_Han_Sans',sans-serif] text-sm shadow-lg shadow-orange-950 transition-all"
          >
            <Save className="w-4 h-4" />
            설정 저장
          </button>
        </div>

      </div>
    </div>
  );
};
