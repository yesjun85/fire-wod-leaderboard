import React, { useState } from 'react';
import { WODDetails, WODFormat } from '../types';
import { 
  X, 
  Sparkles, 
  Flame, 
  Dumbbell, 
  Clock, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  Key,
  ShieldAlert
} from 'lucide-react';
import { generateFireWODWithGemini, PRESET_WODS, WODGenerationParams } from '../utils/gemini';

interface WODGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSelectWOD: (wod: WODDetails) => void;
  onOpenSettings: () => void;
}

export const WODGeneratorModal: React.FC<WODGeneratorModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSelectWOD,
  onOpenSettings
}) => {
  const [fatigueLevel, setFatigueLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [format, setFormat] = useState<WODFormat>('FOR_TIME');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([
    '케틀벨',
    '덤벨',
    '박스'
  ]);
  const [focusArea, setFocusArea] = useState<string>('호스 끌기 및 수관 전개 악력');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const equipmentOptions = [
    '케틀벨',
    '덤벨',
    '소방호스/로프',
    '박스/스텝',
    '바벨',
    '맨몸/철봉',
    '샌드백'
  ];

  const focusPresets = [
    '호스 끌기 및 수관 전개 악력',
    '방화복 중량 계단 등반 및 심폐',
    '방화문 강제개방 해머 슬램 & 폭발적 코어',
    '요구조자/동료 소방관 구출(RIT) 파워',
    '출동 후 관절 회복 및 기능성 모빌리티'
  ];

  const toggleEquipment = (item: string) => {
    if (selectedEquipment.includes(item)) {
      setSelectedEquipment(selectedEquipment.filter(e => e !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError('Gemini API 키가 등록되지 않았습니다. 우측 상단 설정에서 API 키를 등록하거나 아래 전술 프리셋을 선택하세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: WODGenerationParams = {
        fatigueLevel,
        format,
        durationMinutes,
        equipment: selectedEquipment,
        focusArea
      };

      const newWod = await generateFireWODWithGemini(apiKey, params);
      onSelectWOD(newWod);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'WOD 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: WODDetails) => {
    onSelectWOD(preset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Black_Han_Sans',sans-serif] text-xl text-slate-100 tracking-wide">
                AI 소방 전술 WOD 생성기
              </h2>
              <p className="text-xs text-slate-400">
                출동 피로도와 현장 작전에 최적화된 맞춤형 크로스핏 루틴 생성
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* API Key Missing Banner */}
          {!apiKey.trim() && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    Gemini API Key가 등록되지 않았습니다
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    키를 입력하면 나만의 전술 훈련을 무제한 AI 생성할 수 있습니다. 키가 없어도 아래 검증된 4종 전술 프리셋을 즉시 사용할 수 있습니다.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenSettings}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 flex items-center gap-1"
              >
                <Key className="w-3.5 h-3.5" />
                키 등록
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Generator Controls */}
          <div className="space-y-4">
            
            {/* Fatigue Level */}
            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">
                1. 당일 대원 출동 피로도
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'low', label: '최정예 고강도', desc: '체력 만전 (특수구조)' },
                  { key: 'medium', label: '보통 당직', desc: '표준 전술 서킷' },
                  { key: 'high', label: '출동 직후 피로', desc: '회복 & 저중량' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFatigueLevel(item.key as 'low' | 'medium' | 'high')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      fatigueLevel === item.key
                        ? 'bg-orange-600/20 border-orange-500 text-white shadow-md shadow-orange-950'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-['Black_Han_Sans',sans-serif] text-sm block">
                      {item.label}
                    </span>
                    <span className="text-[11px] opacity-75">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* WOD Format & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">
                  2. 훈련 포맷
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('FOR_TIME')}
                    className={`p-2.5 rounded-xl border font-['Black_Han_Sans',sans-serif] text-sm text-center transition-all ${
                      format === 'FOR_TIME'
                        ? 'bg-orange-600 text-white border-orange-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    FOR TIME (기록형)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('AMRAP')}
                    className={`p-2.5 rounded-xl border font-['Black_Han_Sans',sans-serif] text-sm text-center transition-all ${
                      format === 'AMRAP'
                        ? 'bg-orange-600 text-white border-orange-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    AMRAP (최대 라운드)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">
                  3. 목표 시간 (Time Cap)
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value={10}>10분 (초단기 돌파)</option>
                  <option value={15}>15분 (스탠다드 전술)</option>
                  <option value={20}>20분 (골든타임 심폐)</option>
                  <option value={25}>25분 (특수구조 장기전)</option>
                </select>
              </div>
            </div>

            {/* Equipment Chips */}
            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">
                4. 체력단련실 보유 기구
              </label>
              <div className="flex flex-wrap gap-1.5">
                {equipmentOptions.map((eq) => {
                  const isChecked = selectedEquipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-orange-400" />}
                      <span>{eq}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tactical Focus Dropdown/Input */}
            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">
                5. 현장 집중 훈련 영역
              </label>
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="예: 호스 끌기, 계단 등반, 방화문 개방 악력..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
                <div className="flex flex-wrap gap-1">
                  {focusPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFocusArea(preset)}
                      className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hover:text-orange-300 hover:border-orange-500/30 transition-all"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Generate Button */}
            <button
              id="generate-ai-wod-btn"
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || !apiKey.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-['Black_Han_Sans',sans-serif] text-base shadow-xl shadow-orange-950 border border-orange-400/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gemini AI 소방 WOD 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
                  <span>소방 전술 WOD 생성 (Gemini AI)</span>
                </>
              )}
            </button>
          </div>

          {/* OR Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
              또는 검증된 실전 소방 프리셋 4종 즉시 선택
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* PRESET WODS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_WODS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/60 hover:bg-slate-900/80 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {preset.format} · {preset.timeCapMinutes}MIN
                    </span>
                    <Flame className="w-3.5 h-3.5 text-slate-600 group-hover:text-orange-400 transition-all" />
                  </div>
                  <h4 className="font-['Black_Han_Sans',sans-serif] text-base text-slate-200 group-hover:text-orange-300 leading-snug">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                  <span>동작 {preset.movements.length}가지</span>
                  <span className="text-orange-400 font-bold group-hover:translate-x-1 transition-all flex items-center">
                    선택 <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
