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

const INITIAL_ATHLETES: Athlete[] = [
  { id: 'ath-1', name: '김반장', rank: '소방위', color: '#f97316' },
  { id: 'ath-2', name: '박대원', rank: '소방장', color: '#ef4444' },
  { id: 'ath-3', name: '이진압', rank: '소방교', color: '#eab308' },
  { id: 'ath-4', name: '최구급', rank: '소방사', color: '#10b981' },
  { id: 'ath-5', name: '정기관', rank: '소방장', color: '#3b82f6' }
];

export default function App() {
  // 1. Settings state with localStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedKey = localStorage.getItem('fire_wod_gemini_key') || '';
    const savedStation = localStorage.getItem('fire_wod_station_name') || '119 안전센터 체력단련실';
    const savedSound = localStorage.getItem('fire_wod_sound_enabled') !== 'false';
    const savedVol = parseFloat(localStorage.getItem('fire_wod_sound_volume') || '0.8');
    const savedPrep = parseInt(localStorage.getItem('fire_wod_prep_sec') || '10', 10);
    return {
      geminiApiKey: savedKey,
      stationName: savedStation,
      soundEnabled: savedSound,
      soundVolume: savedVol,
      prepCountdownSeconds: savedPrep
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

  // 5. Timer state
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [prepCountdown, setPrepCountdown] = useState<number>(10);
  const timerIntervalRef = useRef<number | null>(null);

  // 6. Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSirenOpen, setIsSirenOpen] = useState(false);
  const [isAddAthleteOpen, setIsAddAthleteOpen] = useState(false);
  const [isExporterOpen, setIsExporterOpen] = useState(false);

  // Persist athletes
  useEffect(() => {
    localStorage.setItem('fire_wod_athletes', JSON.stringify(athletes));
  }, [athletes]);

  // Real-time synchronization across browser tabs (BroadcastChannel)
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('fire_wod_channel');
    channel.onmessage = (event) => {
      if (event.data?.type === 'ADD_ATHLETE' && event.data.athlete) {
        setAthletes((prev) => {
          if (prev.some((a) => a.id === event.data.athlete.id)) return prev;
          return [...prev, event.data.athlete];
        });
      } else if (event.data?.type === 'REMOVE_ATHLETE' && event.data.athleteId) {
        setAthletes((prev) => prev.filter((a) => a.id !== event.data.athleteId));
      }
    };
    return () => {
      channel.close();
    };
  }, []);

  // Real-time synchronization across network devices via API polling
  useEffect(() => {
    let isMounted = true;
    const syncWithServer = async () => {
      try {
        const res = await fetch('/api/athletes');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && isMounted) {
          setAthletes((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const existingNames = new Set(prev.map((a) => `${a.rank}-${a.name}`));
            const toAdd: Athlete[] = [];
            for (const item of data) {
              if (!existingIds.has(item.id) && !existingNames.has(`${item.rank}-${item.name}`)) {
                toAdd.push(item);
              }
            }
            if (toAdd.length > 0) {
              return [...prev, ...toAdd];
            }
            return prev;
          });
        }
      } catch {
        // Fallback for static environments
      }
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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

  // Timer controls
  const startTimer = () => {
    if (timerStatus === 'running') return;

    if (timerStatus === 'idle') {
      const prepSec = settings.prepCountdownSeconds;
      if (prepSec > 0) {
        setTimerStatus('countdown');
        setPrepCountdown(prepSec);
        sound.playCountdownTick(false);

        let count = prepSec;
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        timerIntervalRef.current = window.setInterval(() => {
          count -= 1;
          if (count > 0) {
            setPrepCountdown(count);
            sound.playCountdownTick(count <= 3);
          } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTimerStatus('running');
            sound.playStartLongBeep();
            runWorkoutClock();
          }
        }, 1000);
      } else {
        setTimerStatus('running');
        sound.playStartLongBeep();
        runWorkoutClock();
      }
    } else if (timerStatus === 'paused') {
      setTimerStatus('running');
      runWorkoutClock();
    }
  };

  const runWorkoutClock = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        // Check Time Cap
        if (next >= currentWOD.timeCapMinutes * 60) {
          pauseTimer();
          setTimerStatus('finished');
          sound.playFinishBuzzer();
          setIsSirenOpen(true);
        }
        return next;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setTimerStatus('paused');
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const resetTimer = () => {
    pauseTimer();
    setTimerStatus('idle');
    setElapsedSeconds(0);
    setPrepCountdown(settings.prepCountdownSeconds);
    setRecords({});
  };

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Athlete record update & complete
  const handleAthleteComplete = (athleteId: string, timeSecs?: number) => {
    const finalTime = timeSecs !== undefined ? timeSecs : elapsedSeconds;
    setRecords((prev) => {
      const updated = {
        ...prev,
        [athleteId]: {
          athleteId,
          completed: true,
          timeSeconds: finalTime,
          rounds: prev[athleteId]?.rounds || 1,
          extraReps: prev[athleteId]?.extraReps || 0,
          submittedAt: Date.now()
        }
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
  };

  const handleAthleteReset = (athleteId: string) => {
    setRecords((prev) => {
      const next = { ...prev };
      delete next[athleteId];
      return next;
    });
  };

  const handleUpdateAmrapScore = (athleteId: string, deltaRounds: number, deltaReps: number) => {
    setRecords((prev) => {
      const current = prev[athleteId] || { athleteId, completed: false, rounds: 0, extraReps: 0 };
      const newRounds = Math.max(0, (current.rounds || 0) + deltaRounds);
      const newReps = Math.max(0, (current.extraReps || 0) + deltaReps);
      return {
        ...prev,
        [athleteId]: {
          ...current,
          rounds: newRounds,
          extraReps: newReps,
          submittedAt: Date.now()
        }
      };
    });
  };

  // Athlete roster management with cross-tab and cross-device sync
  const handleAddAthlete = (newAth: Athlete) => {
    setAthletes((prev) => {
      if (prev.some((a) => a.id === newAth.id)) return prev;
      return [...prev, newAth];
    });

    // Broadcast across tabs
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('fire_wod_channel');
        channel.postMessage({ type: 'ADD_ATHLETE', athlete: newAth });
        channel.close();
      }
    } catch {}

    // Synchronize to server API for cross-device phones
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

    // Broadcast across tabs
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('fire_wod_channel');
        channel.postMessage({ type: 'REMOVE_ATHLETE', athleteId });
        channel.close();
      }
    } catch {}

    // Remove from server API
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
            onAddAthlete={handleAddAthlete}
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
            onOpenAddAthlete={() => setIsAddAthleteOpen(true)}
            onOpenAIModal={() => setIsAIModalOpen(true)}
            onTriggerAlarm={() => setIsSirenOpen(true)}
          />
        ) : (
          <MobileDashboard
            wod={currentWOD}
            timerStatus={timerStatus}
            elapsedSeconds={elapsedSeconds}
            athletes={athletes}
            records={records}
            selectedAthleteId={selectedAthleteId}
            onSelectAthlete={setSelectedAthleteId}
            onAthleteComplete={handleAthleteComplete}
            onAthleteReset={handleAthleteReset}
            onUpdateAmrapScore={handleUpdateAmrapScore}
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
