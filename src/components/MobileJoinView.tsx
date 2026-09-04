import React, { useState } from 'react';
import { Athlete, WODDetails } from '../types';
import { 
  Flame, 
  Shield, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Tv, 
  Smartphone,
  Sparkles,
  Trash2
} from 'lucide-react';

interface MobileJoinViewProps {
  wod: WODDetails;
  stationName: string;
  athletes: Athlete[];
  roomId?: string;
  onAddAthlete: (athlete: Athlete) => void;
  onSelectAthlete: (athleteId: string) => void;
  onRemoveAthlete?: (athleteId: string) => void;
  onGoToMobile: () => void;
  onGoToTV: () => void;
}

export const MobileJoinView: React.FC<MobileJoinViewProps> = ({
  wod,
  stationName,
  athletes,
  roomId = 'wod-119',
  onAddAthlete,
  onSelectAthlete,
  onRemoveAthlete,
  onGoToMobile,
  onGoToTV
}) => {
  const [name, setName] = useState('');
  const [rank, setRank] = useState('소방교');
  const [selectedColor, setSelectedColor] = useState('#f97316');
  const [isSuccess, setIsSuccess] = useState(false);
  const [newlyAddedName, setNewlyAddedName] = useState('');

  const ranks = ['소방사', '소방교', '소방장', '소방위', '소방경', '의용소방대'];
  const colors = [
    { name: '오렌지', hex: '#f97316' },
    { name: '레드', hex: '#ef4444' },
    { name: '앰버', hex: '#f59e0b' },
    { name: '에메랄드', hex: '#10b981' },
    { name: '스카이블루', hex: '#0284c7' },
    { name: '퍼플', hex: '#a855f7' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmedName = name.trim();
    const newAthlete: Athlete = {
      id: 'ath-' + Date.now(),
      name: trimmedName,
      rank,
      color: selectedColor
    };

    onAddAthlete(newAthlete);
    onSelectAthlete(newAthlete.id);
    setNewlyAddedName(trimmedName);
    setIsSuccess(true);

    // After a brief celebratory moment, auto-navigate to the mobile workout screen
    setTimeout(() => {
      onGoToMobile();
    }, 1800);
  };

  return (
    <div className="max-w-md mx-auto py-2 px-2 pb-12 space-y-4">
      
      {/* Station Tactical Banner */}
      <div className="bg-[#0c121e] rounded-xl p-3 border border-slate-800/90 shadow-md text-center relative overflow-hidden bg-tactical-grid">
        <div className="flex items-center justify-center gap-2 text-orange-400 font-mono text-[11px] uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4 text-orange-400" />
          <span>{stationName}</span>
          <span className="bg-orange-600/30 text-orange-300 px-2 py-0.5 rounded border border-orange-500/40 text-[10px]">
            📡 동기화 방: {roomId}
          </span>
        </div>
        <h1 className="font-['Black_Han_Sans',sans-serif] text-2xl text-slate-100 tracking-wide">
          119 대원 출동 참가 등록
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          휴대폰에서 등록하면 체력단련실 TV 전광판 및 다른 참가자의 화면에 <strong className="text-emerald-400">즉시 실시간 반영</strong>됩니다.
        </p>

        {/* Current WOD Badge */}
        <div className="mt-3 p-2 rounded-lg bg-[#080c14] border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-left">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block text-xs">{wod.title}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {wod.format === 'FOR_TIME' ? 'FOR TIME 작전' : 'AMRAP 서킷'}
              </span>
            </div>
          </div>
          <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 text-[11px]">
            CAP: {wod.timeCapMinutes}MIN
          </span>
        </div>
      </div>

      {/* Success Modal/Card State */}
      {isSuccess ? (
        <div className="bg-emerald-950/40 rounded-xl p-6 border-2 border-emerald-500/60 shadow-xl text-center space-y-3 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-['Black_Han_Sans',sans-serif] text-2xl text-white">
            {newlyAddedName} {rank} 등록 완료!
          </h2>
          <p className="text-xs text-slate-300">
            TV 전광판 순위표에 실시간 등록되었습니다.<br />
            개인 모바일 타이머 화면으로 이동 중입니다...
          </p>
          <div className="pt-2">
            <button
              onClick={onGoToMobile}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-['Black_Han_Sans',sans-serif] text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
            >
              <span>바로 모바일 타이머 시작하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <form onSubmit={handleSubmit} className="bg-[#0c121e] rounded-xl p-4 border border-slate-800/90 shadow-lg space-y-4">
          
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800/80">
            <UserCheck className="w-4 h-4 text-orange-400" />
            <span className="font-mono text-xs font-bold uppercase text-slate-300">
              대원 프로필 설정
            </span>
          </div>

          {/* Name Field */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
              성명 (이름) <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              autoFocus
              className="w-full bg-[#080c14] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 font-bold focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Rank Field */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
              계급 선택
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {ranks.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRank(r)}
                  className={`py-2 rounded-md text-xs font-bold transition-all border ${
                    rank === r
                      ? 'bg-orange-600 text-white border-orange-400 shadow-sm'
                      : 'bg-[#080c14] text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Color */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
              대원 식별 컬러
            </label>
            <div className="flex items-center gap-2">
              {colors.map((col) => (
                <button
                  type="button"
                  key={col.hex}
                  onClick={() => setSelectedColor(col.hex)}
                  className={`w-7 h-7 rounded-full transition-transform border-2 flex items-center justify-center ${
                    selectedColor === col.hex ? 'scale-110 border-white ring-2 ring-orange-500/50' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="join-submit-btn"
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-98 text-white font-['Black_Han_Sans',sans-serif] text-lg sm:text-xl shadow-lg shadow-orange-950/70 border border-orange-400/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Flame className="w-5 h-5 animate-pulse" />
              <span>훈련 참가 등록 완료</span>
            </button>
          </div>
        </form>
      )}

      {/* Already Registered? Quick Select */}
      {athletes.length > 0 && !isSuccess && (
        <div className="bg-[#0c121e] rounded-xl p-3 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-mono mb-2">
            <Users className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-bold">이미 전광판에 등록된 대원이신가요?</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            아래에서 본인 이름을 누르면 바로 개인 모바일 타이머가 시작됩니다.
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 rounded-lg bg-[#080c14] border border-slate-800">
            {athletes.map((ath) => (
              <div
                key={ath.id}
                className="inline-flex items-center rounded-md bg-slate-900 border border-slate-700 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectAthlete(ath.id);
                    onGoToMobile();
                  }}
                  className="px-2.5 py-1 text-slate-200 hover:bg-slate-800 font-mono text-xs flex items-center gap-1 transition-all"
                >
                  <span className="font-bold">{ath.name}</span>
                  <span className="text-[10px] text-slate-400">({ath.rank})</span>
                </button>
                {onRemoveAthlete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`'${ath.name}' 대원을 참가 명단에서 삭제하시겠습니까?`)) {
                        onRemoveAthlete(ath.id);
                      }
                    }}
                    className="px-1.5 py-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 border-l border-slate-800 transition-colors cursor-pointer"
                    title={`${ath.name} 대원 삭제`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Navigation Footer */}
      <div className="flex items-center justify-center gap-3 pt-2 text-xs text-slate-400 font-mono">
        <button
          onClick={onGoToTV}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Tv className="w-3.5 h-3.5" />
          <span>전광판 화면 보기</span>
        </button>
        <span>·</span>
        <button
          onClick={onGoToMobile}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>모바일 타이머 모드</span>
        </button>
      </div>

    </div>
  );
};
