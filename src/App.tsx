import React, { useState, useEffect, useRef } from 'react';
import { Athlete, AthleteRecord, AppSettings, TimerStatus, ViewMode, WODDetails } from './types';
import { Navbar } from './components/Navbar';
import { TVDashboard } from './components/TVDashboard';
import { MobileDashboard } from './components/MobileDashboard';
import { SettingsModal } from './components/SettingsModal';
import { WODGeneratorModal } from './components/WODGeneratorModal';
import { SirenAlertModal } from './components/SirenAlertModal';
import { AddAthleteModal } from './components/AddAthleteModal';
import { StandaloneExporterModal } from './components/StandaloneExporterModal';
import { MobileJoinView } from './components/MobileJoinView';
import { PRESET_WODS } from './utils/gemini';
import { sound } from './utils/audio';
import { syncService, SyncPayload } from './utils/syncService';

const INITIAL_ATHLETES: Athlete[] = [
  { id: 'ath-1', name: '김반장', rank: '소방위', color: '#f97316' },
  { id: 'ath-2', name: '박대원', rank: '소방장', color: '#ef4444' },
  { id: 'ath-3', name: '이진압', rank: '소방교', color: '#eab308' },
  { id: 'ath-4', name: '최구급', rank: '소방사', color: '#10b981' },
  { id: 'ath-5', name: '정기관', rank: '소방장', color: '#3b82f6' }
];

export default function App() {
  // 0. Real-time Room ID (shared across all devices via QR code)
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom && urlRoom.trim()) {
        localStorage.setItem('fire_wod_room_id', urlRoom.trim());
        return urlRoom.trim();
      }
      const savedRoom = localStorage.getItem('fire_wod_room_id');
      if (savedRoom && savedRoom.trim()) return savedRoom.trim();
    }
    return 'wod-119';
  });

  const [isSyncConnected, setIsSyncConnected] = useState<boolean>(true);

  // 1. Settings state with localStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedKey = localStorage.getItem('fire_wod_gemini_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    const savedStation = localStorage.getItem('fire_wod_station_name') || '119 안전센터 체력단련실';
    const savedSound = localStorage.getItem('fire_wod_sound_enabled') !== 'false';
    const savedVol = parseFloat(localStorage.getItem('fire_wod_sound_volume') || '0.8');
    const savedPrep = parseInt(localStorage.getItem('fire_wod_prep_sec') || '10', 10);
    return {
      geminiApiKey: savedKey,
      stationName: savedStation,
      soundEnabled: savedSound,
      soundVolume: savedVol,
      prepCountdownSeconds: savedPrep,
      roomId
    };
  });

  // Apply sound settings to audio engine
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
    sound.setVolume(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  // 2. View Mode (TV, Mobile, or Join via QR)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'join' || window.location.hash === '#join') {
        return 'join';
      }
      if (params.get('mode') === 'mobile' || window.location.hash === '#mobile') {
        return 'mobile';
      }
    }
    return 'tv';
  });

  // 3. Current WOD
  const [currentWOD, setCurrentWOD] = useState<WODDetails>(PRESET_WODS[0]);

  // 4. Athletes and Records
  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    const saved = localStorage.getItem('fire_wod_athletes');
    return saved ? JSON.parse(saved) : INITIAL_ATHLETES;
  });

  const [records, setRecords] = useState<Record<string, AthleteRecord>>({});
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(INITIAL_ATHLETES[0].id);

  // 5. Timer state (synchronized across all devices via timestamp)
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [prepCountdown, setPrepCountdown] = useState<number>(10);
  const timerIntervalRef = useRef<number | null>(null);
  const targetStartTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);
  const lastTickSecRef = useRef<number>(-1);

  // 6. Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSirenOpen, setIsSirenOpen] = useState(false);
  const [isAddAthleteOpen, setIsAddAthleteOpen] = useState(false);
  const [isExporterOpen, setIsExporterOpen] = useState(false);

  // Persist athletes locally
  useEffect(() => {
    localStorage.setItem('fire_wod_athletes', JSON.stringify(athletes));
  }, [athletes]);

  // High-precision synced timer loop
  const runSyncedTimerLoop = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = window.setInterval(() => {
      const targetStart = targetStartTimeRef.current;
      if (!targetStart) return;

      const now = Date.now();

      if (now < targetStart) {
        // Preparation countdown phase
        const remainSec = Math.max(1, Math.ceil((targetStart - now) / 1000));
        setTimerStatus('countdown');
        setPrepCountdown(remainSec);

        if (lastTickSecRef.current !== remainSec) {
          lastTickSecRef.current = remainSec;
          sound.playCountdownTick(remainSec <= 3);
        }
      } else {
        // Main workout phase
        const currSec = Math.floor((now - targetStart) / 1000) + pausedElapsedRef.current;
        
        // Play start buzzer on transition
        if (lastTickSecRef.current !== 0) {
          lastTickSecRef.current = 0;
          setTimerStatus('running');
          sound.playStartLongBeep();
        }

        setElapsedSeconds(currSec);

        // Check time cap
        if (currSec >= currentWOD.timeCapMinutes * 60) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimerStatus('finished');
          sound.playFinishBuzzer();
          setIsSirenOpen(true);
        }
      }
    }, 200);
  };

  // Cross-device Real-Time Sync (WebSocket / Cloud PubSub via syncService)
  useEffect(() => {
    syncService.init(
      roomId,
      (payload: SyncPayload) => {
        if (payload.type === 'ADD_ATHLETE' && payload.athlete) {
          const newAth = payload.athlete;
          setAthletes((prev) => {
            if (prev.some((a) => a.id === newAth.id || (a.name === newAth.name && a.rank === newAth.rank))) {
              return prev;
            }
            return [...prev, newAth];
          });
          sound.playCountdownTick(false);
        } else if (payload.type === 'REMOVE_ATHLETE' && payload.athleteId) {
          setAthletes((prev) => prev.filter((a) => a.id !== payload.athleteId));
          setRecords((prev) => {
            const next = { ...prev };
            delete next[payload.athleteId!];
            return next;
          });
        } else if (payload.type === 'UPDATE_RECORD' && payload.record) {
          const rec = payload.record;
          setRecords((prev) => ({
            ...prev,
            [rec.athleteId]: rec
          }));
        } else if (payload.type === 'RESET_RECORD' && payload.athleteId) {
          setRecords((prev) => {
            const next = { ...prev };
            delete next[payload.athleteId!];
            return next;
          });
        } else if (payload.type === 'TIMER_START') {
          // Synchronized timer start triggered by any device
          if (payload.targetStartTime) {
            targetStartTimeRef.current = payload.targetStartTime;
            pausedElapsedRef.current = payload.elapsedSeconds || 0;
            lastTickSecRef.current = -1;
            const isCountdown = Date.now() < payload.targetStartTime;
            setTimerStatus(isCountdown ? 'countdown' : 'running');
            if (payload.prepSeconds) {
              setPrepCountdown(payload.prepSeconds);
            }
            runSyncedTimerLoop();
          }
        } else if (payload.type === 'TIMER_PAUSE') {
          // Synchronized timer pause
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setTimerStatus('paused');
          if (payload.elapsedSeconds !== undefined) {
            setElapsedSeconds(payload.elapsedSeconds);
            pausedElapsedRef.current = payload.elapsedSeconds;
          }
        } else if (payload.type === 'TIMER_RESET') {
          // Synchronized timer reset
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          targetStartTimeRef.current = null;
          pausedElapsedRef.current = 0;
          lastTickSecRef.current = -1;
          setTimerStatus('idle');
          setElapsedSeconds(0);
          setPrepCountdown(settings.prepCountdownSeconds);
          setRecords({});
        } else if (payload.type === 'REQUEST_SYNC') {
          // Send current state and timer timestamp to newly joined devices
          setAthletes((currentAthletes) => {
            setRecords((currentRecords) => {
              syncService.broadcast('SYNC_STATE', {
                athletes: currentAthletes,
                records: currentRecords,
                targetStartTime: targetStartTimeRef.current || undefined,
                elapsedSeconds,
                prepSeconds: prepCountdown
              });
              return currentRecords;
            });
            return currentAthletes;
          });
        } else if (payload.type === 'SYNC_STATE') {
          if (payload.athletes && payload.athletes.length > 0) {
            setAthletes((prev) => {
              const map = new Map(prev.map((a) => [a.id, a]));
              payload.athletes!.forEach((a) => map.set(a.id, a));
              return Array.from(map.values());
            });
          }
          if (payload.records && Object.keys(payload.records).length > 0) {
            setRecords((prev) => ({
              ...prev,
              ...payload.records
            }));
          }
          // Catch up to active timer
          if (payload.targetStartTime && timerStatus === 'idle') {
            targetStartTimeRef.current = payload.targetStartTime;
            pausedElapsedRef.current = payload.elapsedSeconds || 0;
            runSyncedTimerLoop();
          }
        }
      },
      (connected) => {
        setIsSyncConnected(connected);
      }
    );

    // Initial broadcast to request state from any active screen in this room
    syncService.broadcast('REQUEST_SYNC', {});

    return () => {
      syncService.cleanup();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [roomId]);

  // Save Settings handler
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('fire_wod_gemini_key', newSettings.geminiApiKey);
    localStorage.setItem('fire_wod_station_name', newSettings.stationName);
    localStorage.setItem('fire_wod_sound_enabled', String(newSettings.soundEnabled));
    localStorage.setItem('fire_wod_sound_volume', String(newSettings.soundVolume));
    localStorage.setItem('fire_wod_prep_sec', String(newSettings.prepCountdownSeconds));
  };

  const handleToggleSound = () => {
    const updated = !settings.soundEnabled;
    handleSaveSettings({ ...settings, soundEnabled: updated });
  };

  // Synchronized Timer controls (broadcasts to all participants)
  const startTimer = (broadcast: boolean = true) => {
    if (timerStatus === 'running') return;

    if (timerStatus === 'idle') {
      const prepSec = settings.prepCountdownSeconds;
      const targetStartTime = Date.now() + (prepSec * 1000);
      targetStartTimeRef.current = targetStartTime;
      pausedElapsedRef.current = 0;
      lastTickSecRef.current = -1;

      setTimerStatus(prepSec > 0 ? 'countdown' : 'running');
      setPrepCountdown(prepSec);

      if (broadcast) {
        syncService.broadcast('TIMER_START', {
          targetStartTime,
          prepSeconds: prepSec,
          elapsedSeconds: 0
        });
      }

      runSyncedTimerLoop();
    } else if (timerStatus === 'paused') {
      const targetStartTime = Date.now();
      targetStartTimeRef.current = targetStartTime;
      lastTickSecRef.current = 0;
      setTimerStatus('running');

      if (broadcast) {
        syncService.broadcast('TIMER_START', {
          targetStartTime,
          prepSeconds: 0,
          elapsedSeconds: pausedElapsedRef.current
        });
      }

      runSyncedTimerLoop();
    }
  };

  const pauseTimer = (broadcast: boolean = true) => {
    setTimerStatus('paused');
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    pausedElapsedRef.current = elapsedSeconds;

    if (broadcast) {
      syncService.broadcast('TIMER_PAUSE', { elapsedSeconds });
    }
  };

  const resetTimer = (broadcast: boolean = true) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    targetStartTimeRef.current = null;
    pausedElapsedRef.current = 0;
    lastTickSecRef.current = -1;
    setTimerStatus('idle');
    setElapsedSeconds(0);
    setPrepCountdown(settings.prepCountdownSeconds);
    setRecords({});

    if (broadcast) {
      syncService.broadcast('TIMER_RESET', {});
    }
  };

  // Athlete record update & complete
  const handleAthleteComplete = (athleteId: string, timeSecs?: number) => {
    const finalTime = timeSecs !== undefined ? timeSecs : elapsedSeconds;
    const newRecord: AthleteRecord = {
      athleteId,
      completed: true,
      timeSeconds: finalTime,
      rounds: records[athleteId]?.rounds || 1,
      extraReps: records[athleteId]?.extraReps || 0,
      submittedAt: Date.now()
    };

    setRecords((prev) => {
      const updated = {
        ...prev,
        [athleteId]: newRecord
      };

      // Check if all athletes finished
      const allDone = athletes.length > 0 && athletes.every((a) => a.id === athleteId || updated[a.id]?.completed);
      if (allDone) {
        pauseTimer();
        setTimerStatus('finished');
        sound.playFinishBuzzer();
        setTimeout(() => {
          setIsSirenOpen(true);
        }, 500);
      }

      return updated;
    });

    // Real-time broadcast to TV and all other smartphones
    syncService.broadcast('UPDATE_RECORD', { record: newRecord });
  };

  const handleAthleteReset = (athleteId: string) => {
    setRecords((prev) => {
      const next = { ...prev };
      delete next[athleteId];
      return next;
    });
    syncService.broadcast('RESET_RECORD', { athleteId });
  };

  const handleUpdateAmrapScore = (athleteId: string, deltaRounds: number, deltaReps: number) => {
    setRecords((prev) => {
      const current = prev[athleteId] || { athleteId, completed: false, rounds: 0, extraReps: 0 };
      const newRounds = Math.max(0, (current.rounds || 0) + deltaRounds);
      const newReps = Math.max(0, (current.extraReps || 0) + deltaReps);
      const updatedRec: AthleteRecord = {
        ...current,
        rounds: newRounds,
        extraReps: newReps,
        submittedAt: Date.now()
      };

      // Broadcast AMRAP score update
      syncService.broadcast('UPDATE_RECORD', { record: updatedRec });

      return {
        ...prev,
        [athleteId]: updatedRec
      };
    });
  };

  // Athlete roster management with cross-tab and cross-device sync
  const handleAddAthlete = (newAth: Athlete) => {
    setAthletes((prev) => {
      if (prev.some((a) => a.id === newAth.id || (a.name === newAth.name && a.rank === newAth.rank))) {
        return prev;
      }
      return [...prev, newAth];
    });

    // 1. Broadcast across all smartphones, tablets, and PC screens via cloud sync
    syncService.broadcast('ADD_ATHLETE', { athlete: newAth });

    // 2. Local fallback
    try {
      fetch('/api/athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAth)
      }).catch(() => {});
    } catch {}
  };

  const handleRemoveAthlete = (athleteId: string) => {
    setAthletes((prev) => prev.filter((a) => a.id !== athleteId));
    setRecords((prev) => {
      const copy = { ...prev };
      delete copy[athleteId];
      return copy;
    });

    // Broadcast removal across all devices
    syncService.broadcast('REMOVE_ATHLETE', { athleteId });

    try {
      fetch(`/api/athletes?id=${encodeURIComponent(athleteId)}`, {
        method: 'DELETE'
      }).catch(() => {});
    } catch {}
  };

  // Select new WOD
  const handleSelectWOD = (newWod: WODDetails) => {
    setCurrentWOD(newWod);
    resetTimer();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-orange-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        stationName={settings.stationName}
        hasGeminiKey={Boolean(settings.geminiApiKey.trim())}
        soundEnabled={settings.soundEnabled}
        roomId={roomId}
        isSyncConnected={isSyncConnected}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenExporter={() => setIsExporterOpen(true)}
        onTriggerAlarmTest={() => setIsSirenOpen(true)}
      />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 flex-1">
        {viewMode === 'join' ? (
          <MobileJoinView
            wod={currentWOD}
            stationName={settings.stationName}
            athletes={athletes}
            roomId={roomId}
            onAddAthlete={handleAddAthlete}
            onRemoveAthlete={handleRemoveAthlete}
            onSelectAthlete={(id) => {
              setSelectedAthleteId(id);
              setViewMode('mobile');
            }}
            onGoToMobile={() => setViewMode('mobile')}
            onGoToTV={() => setViewMode('tv')}
          />
        ) : viewMode === 'tv' ? (
          <TVDashboard
            wod={currentWOD}
            timerStatus={timerStatus}
            elapsedSeconds={elapsedSeconds}
            prepCountdown={prepCountdown}
            athletes={athletes}
            records={records}
            onStartTimer={startTimer}
            onPauseTimer={pauseTimer}
            onResetTimer={resetTimer}
            onAthleteComplete={handleAthleteComplete}
            onAthleteReset={handleAthleteReset}
            onRemoveAthlete={handleRemoveAthlete}
            onOpenAddAthlete={() => setIsAddAthleteOpen(true)}
            onOpenAIModal={() => setIsAIModalOpen(true)}
            onTriggerAlarm={() => setIsSirenOpen(true)}
          />
        ) : (
          <MobileDashboard
            wod={currentWOD}
            timerStatus={timerStatus}
            elapsedSeconds={elapsedSeconds}
            prepCountdown={prepCountdown}
            athletes={athletes}
            records={records}
            selectedAthleteId={selectedAthleteId}
            onSelectAthlete={setSelectedAthleteId}
            onAthleteComplete={handleAthleteComplete}
            onAthleteReset={handleAthleteReset}
            onRemoveAthlete={handleRemoveAthlete}
            onUpdateAmrapScore={handleUpdateAmrapScore}
            onStartTimer={startTimer}
            onPauseTimer={pauseTimer}
            onResetTimer={resetTimer}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            🚒 대한민국 소방관 체력단련 & 전술 WOD 보드 · 골든타임 사수
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <button 
              onClick={() => setIsExporterOpen(true)}
              className="text-orange-400 hover:underline"
            >
              단일 index.html 내보내기
            </button>
            <span>·</span>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-slate-200"
            >
              설정
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <WODGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        apiKey={settings.geminiApiKey}
        onSelectWOD={handleSelectWOD}
        onOpenSettings={() => {
          setIsAIModalOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <SirenAlertModal
        isOpen={isSirenOpen}
        onClose={() => setIsSirenOpen(false)}
        wod={currentWOD}
        athletes={athletes}
        records={records}
      />

      <AddAthleteModal
        isOpen={isAddAthleteOpen}
        onClose={() => setIsAddAthleteOpen(false)}
        athletes={athletes}
        roomId={roomId}
        onAddAthlete={handleAddAthlete}
        onRemoveAthlete={handleRemoveAthlete}
      />

      <StandaloneExporterModal
        isOpen={isExporterOpen}
        onClose={() => setIsExporterOpen(false)}
      />

    </div>
  );
}
