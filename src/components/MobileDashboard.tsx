import React, { useState, useRef, useEffect } from 'react';
import { Athlete, AthleteRecord, TimerStatus, WODDetails } from '../types';
import { 
  Flame, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  Minus, 
  Trophy, 
  Coffee, 
  User, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows3
} from 'lucide-react';

interface MobileDashboardProps {
  wod: WODDetails;
  timerStatus: TimerStatus;
  elapsedSeconds: number;
  athletes: Athlete[];
  records: Record<string, AthleteRecord>;
  selectedAthleteId: string;
  onSelectAthlete: (id: string) => void;
  onAthleteComplete: (athleteId: string, timeSecs?: number) => void;
  onAthleteReset: (athleteId: string) => void;
  onUpdateAmrapScore: (athleteId: string, deltaRounds: number, deltaReps: number) => void;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  wod,
  timerStatus,
  elapsedSeconds,
  athletes,
  records,
  selectedAthleteId,
  onSelectAthlete,
  onAthleteComplete,
  onAthleteReset,
  onUpdateAmrapScore,
}) => {
  const currentAthlete = athletes.find(a => a.id === selectedAthleteId) || athletes[0];
  const myRecord = currentAthlete ? records[currentAthlete.id] : undefined;
  const isCompleted = myRecord?.completed || false;
  
  const [isGridMode, setIsGridMode] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected athlete into view when selection changes
  useEffect(() => {
    if (selectedAthleteId && scrollContainerRef.current) {
      const el = document.getElementById(`athlete-pill-${selectedAthleteId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedAthleteId]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -160, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && !isGridMode) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(Math.abs(totalSecs) / 60);
    const secs = Math.floor(Math.abs(totalSecs) % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Rank calculation for selected athlete
  const sortedAthletes = [...athletes].sort((a, b) => {
    const recA = records[a.id];
    const recB = records[b.id];
    if (recA?.completed && !recB?.completed) return -1;
    if (!recA?.completed && recB?.completed) return 1;
    if (wod.format === 'FOR_TIME') {
      return (recA?.timeSeconds || 9999) - (recB?.timeSeconds || 9999);
    } else {
      const scoreA = (recA?.rounds || 0) * 100 + (recA?.extraReps || 0);
      const scoreB = (recB?.rounds || 0) * 100 + (recB?.extraReps || 0);
      return scoreB - scoreA;
    }
  });

  const myRank = currentAthlete ? sortedAthletes.findIndex(a => a.id === currentAthlete.id) + 1 : 0;
  const isLowest = myRank === sortedAthletes.length && sortedAthletes.length > 1;

  return (
    <div className="max-w-md mx-auto space-y-3 px-1 pb-10">
      
      {/* 1. ATHLETE SELECTOR - HIGH DENSITY SCROLLABLE RIBBON */}
      <div className="bg-[#0c121e] rounded-xl p-2.5 sm:p-3 border border-slate-800/90 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <User className="w-3 h-3 text-orange-400" />
            <span>내 프로필 선택</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-orange-300 text-[10px] font-mono">
              {athletes.length}명
            </span>
          </label>

          {/* Scrolling & View Mode Actions */}
          <div className="flex items-center gap-1">
            {!isGridMode && (
              <>
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
                  title="왼쪽 대원 보기"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
                  title="오른쪽 대원 보기"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsGridMode(!isGridMode)}
              className={`flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
                isGridMode
                  ? 'bg-orange-600/30 text-orange-300 border-orange-500/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/60'
              }`}
              title={isGridMode ? '한 줄 가로 스크롤로 전환' : '전체 대원 격자 스크롤로 보기'}
            >
              {isGridMode ? (
                <>
                  <Rows3 className="w-3 h-3 text-orange-400" />
                  <span>한 줄</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-3 h-3 text-slate-400" />
                  <span>펼치기</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Athlete Scroll / Pill List */}
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className={`transition-all ${
            isGridMode
              ? 'max-h-48 overflow-y-auto flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#080c14]/80 border border-slate-800/80 overscroll-contain'
              : 'flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth overscroll-contain'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {athletes.map((ath) => {
            const isSelected = ath.id === currentAthlete?.id;
            const hasCompleted = records[ath.id]?.completed;
            return (
              <button
                key={ath.id}
                id={`athlete-pill-${ath.id}`}
                onClick={() => onSelectAthlete(ath.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-orange-600 text-white border-orange-400/80 shadow-sm shadow-orange-950 scale-[1.02]'
                    : 'bg-[#080c14] text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span className="font-['Black_Han_Sans',sans-serif]">{ath.name}</span>
                <span className="text-[10px] font-mono opacity-80">({ath.rank})</span>
                {hasCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SYNCED TIMER & STATUS CARD - HIGH DENSITY HUD */}
      <div className="bg-[#0a0f19] rounded-xl p-3 sm:p-4 border border-slate-700/80 text-center relative overflow-hidden shadow-lg bg-tactical-grid">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-mono font-bold text-orange-400 uppercase text-[11px]">
            {wod.format === 'FOR_TIME' ? 'FOR TIME 훈련' : 'AMRAP 서킷'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            CAP: {wod.timeCapMinutes}MIN
          </span>
        </div>

        {/* Big Synced Clock */}
        <div className="py-1">
          <span className="font-['Orbitron',sans-serif] font-black text-5xl sm:text-6xl tabular-nums tracking-tight text-white select-none drop-shadow-[0_0_20px_rgba(255,87,34,0.3)]">
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        {/* Live Rank Pill */}
        {currentAthlete && (
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className={`px-2.5 py-0.5 rounded-md text-xs font-bold border flex items-center gap-1.5 ${
              isLowest
                ? 'bg-red-500/15 text-red-300 border-red-500/40 animate-pulse'
                : 'bg-slate-800/90 text-slate-200 border-slate-700'
            }`}>
              {isLowest ? (
                <>
                  <Coffee className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-mono">현재 {myRank}위 (커피 당번 위험!)</span>
                </>
              ) : (
                <>
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono">현재 {myRank}위 / {athletes.length}명</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. GIANT TOUCH CONTROLS (땀 흘리는 손을 위한 고대비 인터랙션) */}
      <div className="bg-[#0c121e] rounded-xl p-3 sm:p-4 border border-slate-800/90 shadow-lg space-y-3">
        
        {wod.format === 'FOR_TIME' ? (
          /* FOR TIME MODE: GIANT ONE-TOUCH FINISH BUTTON */
          <div className="space-y-2.5">
            <div className="text-center">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                {currentAthlete?.name} {currentAthlete?.rank} 대원 작전 기록
              </span>
            </div>

            {isCompleted ? (
              <div className="p-4 sm:p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-['Black_Han_Sans',sans-serif] text-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>운동 완료!</span>
                </div>
                <div className="font-['Orbitron',sans-serif] font-black text-4xl text-white tabular-nums">
                  {formatTime(myRecord?.timeSeconds || 0)}
                </div>
                <p className="text-[11px] text-slate-400">
                  기록이 본부 전광판 순위표에 실시간 등록되었습니다.
                </p>
                <button
                  onClick={() => currentAthlete && onAthleteReset(currentAthlete.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1 mx-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  기록 취소 후 재도전
                </button>
              </div>
            ) : (
              <button
                id="mobile-giant-finish-btn"
                onClick={() => currentAthlete && onAthleteComplete(currentAthlete.id, elapsedSeconds)}
                className="w-full py-7 sm:py-9 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 active:scale-95 transition-all text-white font-['Black_Han_Sans',sans-serif] text-2xl sm:text-3xl shadow-xl shadow-orange-950/70 border border-orange-400/60 flex flex-col items-center justify-center gap-1 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-7 h-7 animate-bounce" />
                  <span>운동 완료!</span>
                </div>
                <span className="text-[11px] font-mono tracking-widest text-orange-200 uppercase">
                  TAP TO SUBMIT TIME
                </span>
              </button>
            )}
          </div>
        ) : (
          /* AMRAP MODE: GIANT ROUND & REP COUNTERS */
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                {currentAthlete?.name} 대원 라운드 카운터
              </span>
            </div>

            {/* Current Score Display */}
            <div className="bg-[#080c14] p-3 rounded-lg border border-slate-800/80 flex items-center justify-around text-center">
              <div>
                <span className="text-[11px] text-slate-400 font-bold block">완료 라운드</span>
                <span className="font-['Orbitron',sans-serif] font-black text-4xl sm:text-5xl text-amber-400 tabular-nums">
                  {myRecord?.rounds || 0}
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold block">ROUNDS</span>
              </div>
              <div className="h-9 w-px bg-slate-800" />
              <div>
                <span className="text-[11px] text-slate-400 font-bold block">추가 횟수</span>
                <span className="font-['Orbitron',sans-serif] font-black text-4xl sm:text-5xl text-orange-400 tabular-nums">
                  {myRecord?.extraReps || 0}
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold block">REPS</span>
              </div>
            </div>

            {/* GIANT +1 ROUND BUTTON */}
            <button
              id="mobile-amrap-plus-round-btn"
              onClick={() => currentAthlete && onUpdateAmrapScore(currentAthlete.id, 1, 0)}
              className="w-full py-4 sm:py-5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 active:scale-95 transition-all text-white font-['Black_Han_Sans',sans-serif] text-xl sm:text-2xl shadow-lg shadow-orange-950 border border-orange-400/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-6 h-6" />
              <span>+1 ROUND 완료</span>
            </button>

            {/* REP CONTROLS */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="mobile-amrap-plus-rep-btn"
                onClick={() => currentAthlete && onUpdateAmrapScore(currentAthlete.id, 0, 1)}
                className="py-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-100 font-['Black_Han_Sans',sans-serif] text-base border border-slate-700/80 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+1 REP</span>
              </button>
              <button
                id="mobile-amrap-minus-rep-btn"
                onClick={() => currentAthlete && onUpdateAmrapScore(currentAthlete.id, 0, -1)}
                className="py-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-100 font-['Black_Han_Sans',sans-serif] text-base border border-slate-700/80 flex items-center justify-center gap-1.5"
              >
                <Minus className="w-4 h-4 text-red-400" />
                <span>-1 REP</span>
              </button>
            </div>

            {/* Final Submission Toggle */}
            <button
              onClick={() => currentAthlete && onAthleteComplete(currentAthlete.id)}
              className={`w-full py-2.5 rounded-lg font-['Black_Han_Sans',sans-serif] text-sm border transition-all ${
                isCompleted
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {isCompleted ? '✓ 최종 작전 제출 완료됨' : '최종 기록 확정 제출'}
            </button>
          </div>
        )}

      </div>

      {/* 4. CURRENT WOD EXERCISE CHECKLIST (모바일 참고용) */}
      <div className="bg-[#0c121e] rounded-xl p-3 border border-slate-800/90 shadow-md">
        <div className="flex items-center justify-between mb-2 border-b border-slate-800/80 pb-2">
          <span className="text-[10px] font-mono font-bold uppercase text-orange-400 tracking-wider">
            훈련 종목 리스트
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {wod.title}
          </span>
        </div>

        <div className="space-y-1.5">
          {wod.movements.map((move, i) => (
            <div key={move.id || i} className="p-2 rounded-lg bg-[#080c14] border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">
                {i + 1}. {move.name}
              </span>
              <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 tabular-nums">
                {move.reps}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
