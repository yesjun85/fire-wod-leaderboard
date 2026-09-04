import React from 'react';
import { Athlete, AthleteRecord, TimerStatus, WODDetails } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Trophy, 
  Coffee, 
  UserPlus, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Timer,
  Clock,
  Zap,
  QrCode,
  Smartphone
} from 'lucide-react';

interface TVDashboardProps {
  wod: WODDetails;
  timerStatus: TimerStatus;
  elapsedSeconds: number;
  prepCountdown: number;
  athletes: Athlete[];
  records: Record<string, AthleteRecord>;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onAthleteComplete: (athleteId: string) => void;
  onAthleteReset: (athleteId: string) => void;
  onOpenAddAthlete: () => void;
  onOpenAIModal: () => void;
  onTriggerAlarm: () => void;
}

export const TVDashboard: React.FC<TVDashboardProps> = ({
  wod,
  timerStatus,
  elapsedSeconds,
  prepCountdown,
  athletes,
  records,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onAthleteComplete,
  onAthleteReset,
  onOpenAddAthlete,
  onOpenAIModal,
  onTriggerAlarm
}) => {
  // Format Time Display
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(Math.abs(totalSecs) / 60);
    const secs = Math.floor(Math.abs(totalSecs) % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Sort Leaderboard
  const sortedAthletes = [...athletes].sort((a, b) => {
    const recA = records[a.id];
    const recB = records[b.id];

    if (!recA?.completed && !recB?.completed) {
      if (wod.format === 'AMRAP') {
        const scoreA = (recA?.rounds || 0) * 100 + (recA?.extraReps || 0);
        const scoreB = (recB?.rounds || 0) * 100 + (recB?.extraReps || 0);
        return scoreB - scoreA;
      }
      return 0;
    }
    if (recA?.completed && !recB?.completed) return -1;
    if (!recA?.completed && recB?.completed) return 1;

    // Both completed
    if (wod.format === 'FOR_TIME') {
      return (recA.timeSeconds || 9999) - (recB.timeSeconds || 9999);
    } else {
      const scoreA = (recA.rounds || 0) * 100 + (recA.extraReps || 0);
      const scoreB = (recB.rounds || 0) * 100 + (recB.extraReps || 0);
      return scoreB - scoreA;
    }
  });

  const allCompleted = athletes.length > 0 && athletes.every(a => records[a.id]?.completed);
  const lowestAthlete = sortedAthletes.length > 0 ? sortedAthletes[sortedAthletes.length - 1] : null;

  return (
    <div className="space-y-3 sm:space-y-4">
      
      {/* GIANT TV TIMER JUMBOTRON - HIGH DENSITY HUD */}
      <div className="relative overflow-hidden rounded-xl bg-[#0a0f19] border border-slate-700/80 shadow-2xl p-4 sm:p-6 bg-tactical-grid">
        {/* Tactical Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500" />

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Status and Mode Pill Bar */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              <span className={`w-2 h-2 rounded-full ${
                timerStatus === 'running' ? 'bg-emerald-400 animate-ping' :
                timerStatus === 'countdown' ? 'bg-amber-400 animate-pulse' :
                timerStatus === 'paused' ? 'bg-amber-500' : 'bg-slate-500'
              }`} />
              {timerStatus === 'countdown' && '🚨 10초 준비 카운트다운'}
              {timerStatus === 'running' && '🔥 전술 훈련 진행 중 (LIVE)'}
              {timerStatus === 'paused' && '⏸ 일시 정지 (PAUSED)'}
              {timerStatus === 'finished' && '🏁 훈련 종료 (FINISHED)'}
              {timerStatus === 'idle' && '대기 상태 (READY)'}
            </div>

            <div className="px-2.5 sm:px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-300 text-[11px] sm:text-xs font-mono font-bold tracking-wider">
              {wod.format === 'FOR_TIME' ? `⚡ FOR TIME · CAP ${wod.timeCapMinutes}M` : `⏱ AMRAP · ${wod.timeCapMinutes}M`}
            </div>

            {/* Micro Stats in Header */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span>운동완료:</span>
              <span className="font-bold text-emerald-400 tabular-nums">
                {athletes.filter(a => records[a.id]?.completed).length}/{athletes.length}명
              </span>
            </div>
          </div>

          {/* GIANT TIME DIGITS (5m Distance Visibility, High Density Tabular) */}
          <div className="my-1 sm:my-3">
            {timerStatus === 'countdown' ? (
              <div className="flex flex-col items-center">
                <span className="text-amber-400 font-['Black_Han_Sans',sans-serif] text-xl sm:text-3xl tracking-widest animate-pulse">
                  훈련 개시까지
                </span>
                <span className="font-['Orbitron',sans-serif] font-black text-8xl sm:text-9xl md:text-[12rem] tabular-nums leading-none text-amber-300 drop-shadow-[0_0_40px_rgba(251,191,36,0.45)]">
                  {prepCountdown}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-['Orbitron',sans-serif] font-black text-6xl sm:text-8xl md:text-[10rem] tabular-nums tracking-tight leading-none text-white drop-shadow-[0_0_35px_rgba(255,87,34,0.3)] select-none">
                  {formatTime(elapsedSeconds)}
                </span>
                <span className="text-[10px] sm:text-xs tracking-widest text-slate-400 font-mono mt-1">
                  MINUTES : SECONDS
                </span>
              </div>
            )}
          </div>

          {/* TIMER CONTROL BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-4">
            {timerStatus !== 'running' && timerStatus !== 'countdown' ? (
              <button
                id="tv-start-timer-btn"
                onClick={onStartTimer}
                className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-['Black_Han_Sans',sans-serif] text-base sm:text-xl shadow-lg shadow-orange-950/70 border border-orange-400/40 hover:scale-102 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                운동 시작 (START)
              </button>
            ) : (
              <button
                id="tv-pause-timer-btn"
                onClick={onPauseTimer}
                className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-['Black_Han_Sans',sans-serif] text-base sm:text-xl shadow-lg shadow-amber-950/70 border border-amber-400/40 hover:scale-102 active:scale-95 transition-all"
              >
                <Pause className="w-5 h-5 fill-current" />
                일시 정지 (PAUSE)
              </button>
            )}

            <button
              id="tv-reset-timer-btn"
              onClick={onResetTimer}
              className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-['Black_Han_Sans',sans-serif] text-sm sm:text-lg border border-slate-700/80 active:scale-95 transition-all"
              title="타이머 및 기록 리셋"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              리셋
            </button>

            <button
              id="tv-finish-alarm-btn"
              onClick={onTriggerAlarm}
              className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-lg bg-red-950/60 hover:bg-red-900/70 text-red-200 font-['Black_Han_Sans',sans-serif] text-sm sm:text-lg border border-red-700/60 shadow-md active:scale-95 transition-all"
            >
              <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-bounce" />
              🚨 커피 당번 판정
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: LEFT WOD SPEC | RIGHT REALTIME LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        
        {/* LEFT: WOD SPECIFICATION (5 Cols) - HIGH DENSITY */}
        <div className="lg:col-span-5 bg-[#0c121e] rounded-xl border border-slate-800/90 shadow-lg p-3.5 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Header with tactical badge */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-3">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                    전술 WOD 작전도
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {wod.format} · {wod.timeCapMinutes}M CAP
                  </span>
                </div>
                <h2 className="font-['Black_Han_Sans',sans-serif] text-lg sm:text-xl text-slate-100 leading-tight">
                  {wod.title}
                </h2>
              </div>
              <button
                id="wod-change-btn"
                onClick={onOpenAIModal}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md bg-orange-600/15 hover:bg-orange-600/25 text-orange-300 border border-orange-500/30 text-xs font-bold transition-all shrink-0"
              >
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span>WOD 변경</span>
              </button>
            </div>

            {/* Tactical Objective Alert */}
            <div className="p-2.5 rounded-lg bg-[#080c14] border border-slate-800/90 mb-3 flex items-start gap-2">
              <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider block">
                  소방 전술 목표
                </span>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {wod.tacticalObjective}
                </p>
              </div>
            </div>

            {/* Movement Circuit Items */}
            <div className="space-y-1.5 sm:space-y-2 mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                훈련 서킷 종목 ({wod.movements.length}개)
              </span>
              {wod.movements.map((move, idx) => (
                <div 
                  key={move.id || idx}
                  className="p-2 sm:p-2.5 rounded-lg bg-[#080c14]/80 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2 sm:gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded bg-slate-800 text-orange-400 font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {move.name}
                      </p>
                      {move.tacticalNote && (
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          💡 {move.tacticalNote}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 font-mono font-bold text-xs border border-orange-500/20 whitespace-nowrap tabular-nums">
                    {move.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Footer */}
          <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-mono text-slate-500">소요 기구:</span>
            {wod.equipmentNeeded.map((eq, i) => (
              <span key={i} className="px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300 text-[10px] font-mono">
                {eq}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: REALTIME LEADERBOARD (7 Cols) - HIGH DENSITY */}
        <div className="lg:col-span-7 bg-[#0c121e] rounded-xl border border-slate-800/90 shadow-lg p-3.5 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="font-['Black_Han_Sans',sans-serif] text-lg sm:text-xl text-slate-100">
                실시간 골든타임 순위표
              </h2>
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
                {athletes.length}명 참전
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                id="add-athlete-tv-btn"
                onClick={onOpenAddAthlete}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 hover:text-orange-200 text-xs font-bold border border-orange-500/40 shadow-sm transition-all cursor-pointer"
                title="스마트폰으로 QR 코드를 스캔하여 대원을 등록하거나 직접 추가합니다"
              >
                <QrCode className="w-3.5 h-3.5 text-orange-400" />
                <UserPlus className="w-3.5 h-3.5" />
                <span>대원 추가 (QR)</span>
              </button>
            </div>
          </div>

          {/* Athletes List */}
          <div className="space-y-1.5 sm:space-y-2">
            {sortedAthletes.map((athlete, index) => {
              const record = records[athlete.id];
              const isFirst = index === 0 && record?.completed;
              const isSecond = index === 1 && record?.completed;
              const isThird = index === 2 && record?.completed;
              const isLowest = index === sortedAthletes.length - 1 && sortedAthletes.length > 1;

              return (
                <div
                  key={athlete.id}
                  className={`p-2.5 sm:p-3 rounded-lg border transition-all flex items-center justify-between gap-2.5 ${
                    record?.completed
                      ? 'bg-[#080c14] border-slate-800'
                      : 'bg-[#080c14]/50 border-slate-800/50 opacity-85'
                  } ${
                    isFirst ? 'border-amber-500/50 bg-amber-950/15 ring-1 ring-amber-500/20' : ''
                  } ${
                    isLowest && record?.completed ? 'border-red-500/50 bg-red-950/20 ring-1 ring-red-500/20' : ''
                  }`}
                >
                  {/* Left: Rank badge and Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank Badge */}
                    <div className="w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {isFirst ? (
                        <span className="w-7 h-7 rounded bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black shadow-sm">
                          1
                        </span>
                      ) : isSecond ? (
                        <span className="w-7 h-7 rounded bg-slate-300 text-slate-950 flex items-center justify-center font-black">
                          2
                        </span>
                      ) : isThird ? (
                        <span className="w-7 h-7 rounded bg-amber-700 text-white flex items-center justify-center font-black">
                          3
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded bg-slate-800 text-slate-400 flex items-center justify-center">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Athlete Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-['Black_Han_Sans',sans-serif] text-sm sm:text-base text-slate-100 truncate">
                          {athlete.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700/50">
                          {athlete.rank}
                        </span>
                      </div>
                      
                      {/* Subtitle / Coffee danger indicator */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isLowest && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 animate-pulse">
                            <Coffee className="w-3 h-3" />
                            커피 당번 경보권 🚨
                          </span>
                        )}
                        {!isLowest && record?.completed && (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            운동 완료
                          </span>
                        )}
                        {!record?.completed && (
                          <span className="text-[10px] font-mono text-amber-400/80 flex items-center gap-1">
                            <Zap className="w-3 h-3 animate-pulse" />
                            운동 중...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Record Display & Quick TV Operator Toggle */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Score / Time */}
                    <div className="text-right">
                      {wod.format === 'FOR_TIME' ? (
                        record?.completed ? (
                          <span className="font-mono font-black text-sm sm:text-lg text-emerald-400 tabular-nums">
                            {formatTime(record.timeSeconds || 0)}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-slate-500">
                            진행 중
                          </span>
                        )
                      ) : (
                        // AMRAP
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono font-black text-sm sm:text-lg text-amber-400 tabular-nums">
                            {record?.rounds || 0}R
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                            +{record?.extraReps || 0}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Trigger Button for TV Operator */}
                    {record?.completed ? (
                      <button
                        onClick={() => onAthleteReset(athlete.id)}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all text-xs font-semibold border border-slate-700/60"
                        title="기록 취소 / 재도전"
                      >
                        취소
                      </button>
                    ) : (
                      <button
                        onClick={() => onAthleteComplete(athlete.id)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-['Black_Han_Sans',sans-serif] text-xs transition-all shadow-sm shadow-emerald-950"
                        title="완료 기록 저장"
                      >
                        완료
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {athletes.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs">
                등록된 대원이 없습니다. 상단의 [+ 대원 추가] 버튼을 눌러주세요.
              </div>
            )}
          </div>

          {/* Bottom Alarm Hint */}
          <div className="mt-3 p-2 sm:p-2.5 rounded-lg bg-red-950/25 border border-red-900/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <p className="text-[11px] text-red-300">
                훈련 종료 후 최하위 대원에게 <strong className="underline text-red-200">커피 당번 경보 사이렌</strong>이 작동합니다!
              </p>
            </div>
            <button
              onClick={onTriggerAlarm}
              className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shrink-0"
            >
              사이렌 발동
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
