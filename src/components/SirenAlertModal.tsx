import React, { useEffect, useState } from 'react';
import { Athlete, AthleteRecord, WODDetails } from '../types';
import { sound } from '../utils/audio';
import { 
  ShieldAlert, 
  Coffee, 
  Dices, 
  VolumeX, 
  CheckCircle, 
  X, 
  Flame, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface SirenAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  wod: WODDetails;
  athletes: Athlete[];
  records: Record<string, AthleteRecord>;
}

export const SirenAlertModal: React.FC<SirenAlertModalProps> = ({
  isOpen,
  onClose,
  wod,
  athletes,
  records
}) => {
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false);
  const [rouletteCandidate, setRouletteCandidate] = useState<Athlete | null>(null);
  const [rouletteWinner, setRouletteWinner] = useState<Athlete | null>(null);
  const [hasSpunRoulette, setHasSpunRoulette] = useState(false);

  // Determine initial lowest athlete
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

  const lowestAthlete = sortedAthletes.length > 0 ? sortedAthletes[sortedAthletes.length - 1] : null;
  const currentVictim = rouletteWinner || lowestAthlete;

  useEffect(() => {
    if (isOpen) {
      sound.startSiren();
      setHasSpunRoulette(false);
      setRouletteWinner(null);
    } else {
      sound.stopSiren();
    }
    return () => {
      sound.stopSiren();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Spin Roulette Handler
  const spinCoffeeRoulette = () => {
    if (isRouletteSpinning || athletes.length <= 1) return;
    setIsRouletteSpinning(true);
    setHasSpunRoulette(true);

    let speed = 60;
    let iterations = 0;
    const maxIterations = 35 + Math.floor(Math.random() * 15);

    const spinInterval = () => {
      const randomIndex = Math.floor(Math.random() * athletes.length);
      const chosen = athletes[randomIndex];
      setRouletteCandidate(chosen);
      sound.playRouletteTick(400 + (iterations % 5) * 80);

      iterations++;
      if (iterations < maxIterations) {
        if (iterations > maxIterations - 12) {
          speed += 30; // decelerate smoothly
        }
        setTimeout(spinInterval, speed);
      } else {
        // Winner determined!
        setIsRouletteSpinning(false);
        setRouletteWinner(chosen);
        sound.playCoffeeFanfare();
      }
    };

    spinInterval();
  };

  const handleDismiss = () => {
    sound.stopSiren();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      
      {/* RED EMERGENCY FLASHING STROBE BACKGROUND */}
      <div className="absolute inset-0 bg-red-600/30 animate-pulse pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-red-600/40 via-slate-950/90 to-slate-950 backdrop-blur-md" />

      {/* Main Alert Modal Container */}
      <div className="relative z-10 w-full max-w-xl bg-slate-900 border-4 border-red-500 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.6)] p-6 sm:p-8 text-center overflow-hidden animate-bounce-short">
        
        {/* Top Siren Warning Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white font-['Black_Han_Sans',sans-serif] text-sm sm:text-base tracking-widest shadow-lg shadow-red-950 uppercase mb-4 animate-pulse">
          <ShieldAlert className="w-5 h-5 animate-spin" />
          <span>CODE RED · 긴급 커피 경보 발령</span>
          <ShieldAlert className="w-5 h-5 animate-spin" />
        </div>

        {/* Siren Icon Badge */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-red-500 via-rose-600 to-amber-600 p-1 shadow-2xl shadow-red-600/60 border-2 border-red-300 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Coffee className="w-12 h-12 text-amber-400 animate-bounce" />
          </div>
        </div>

        {/* Giant Headline */}
        <h2 className="font-['Black_Han_Sans',sans-serif] text-2xl sm:text-4xl text-white tracking-wide drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] mb-2">
          🚨 오늘의 커피 지원 당번 확정! 🚨
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          오늘 체력단련 고생 많으셨습니다! 가장 끈기 있게 끝까지 훈련에 임한 대원에게 영광의 커피 주문권을 수여합니다.
        </p>

        {/* VICTIM HIGHLIGHT CARD */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-red-950/80 to-slate-950 border-2 border-red-500/80 shadow-inner mb-6 relative">
          
          {isRouletteSpinning ? (
            <div className="py-4 space-y-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest animate-pulse">
                🎲 커피 룰렛 추첨 중...
              </span>
              <div className="font-['Black_Han_Sans',sans-serif] text-4xl sm:text-5xl text-amber-400 tracking-wider">
                {rouletteCandidate?.name || '추첨 중...'}
              </div>
              <span className="text-xs text-slate-400">
                {rouletteCandidate?.rank}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-red-400 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/40 inline-block">
                {hasSpunRoulette ? '🎉 룰렛 재추첨 최종 당번' : '🔥 오늘의 명예 커피 당번'}
              </span>

              <div className="font-['Black_Han_Sans',sans-serif] text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 drop-shadow">
                {currentVictim?.name || '대원 없음'}
              </div>

              <div className="text-sm sm:text-base font-bold text-slate-200">
                {currentVictim?.rank} 대원님
              </div>

              <div className="pt-2 text-xs text-amber-200/90 font-medium">
                "대원님! 시원한 아이스 아메리카노 5잔 부탁드립니다! ☕️🚒💨"
              </div>
            </div>
          )}

        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3">
          
          {/* COFFEE ROULETTE BUTTON (꼴찌 탈출 찬스!) */}
          <button
            id="coffee-roulette-btn"
            onClick={spinCoffeeRoulette}
            disabled={isRouletteSpinning || athletes.length <= 1}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-['Black_Han_Sans',sans-serif] text-lg sm:text-xl shadow-xl shadow-amber-950 border border-amber-300 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Dices className="w-6 h-6 text-slate-950 animate-spin-slow" />
            <span>
              {isRouletteSpinning ? '룰렛 회전 중...' : '🎲 꼴찌 탈출용 커피 룰렛 돌리기!'}
            </span>
          </button>

          {/* DISMISS SIREN & RETURN */}
          <button
            id="dismiss-siren-btn"
            onClick={handleDismiss}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-['Black_Han_Sans',sans-serif] text-base border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <VolumeX className="w-5 h-5 text-red-400" />
            <span>🚨 경보 해제 & 훈련 완료</span>
          </button>

        </div>

      </div>

    </div>
  );
};
