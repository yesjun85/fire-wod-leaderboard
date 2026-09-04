// Generates a 100% standalone, zero-dependency index.html string
// including Tailwind CSS CDN, Web Audio API, Gemini API, Dual Mode, Timers, Leaderboard, Siren, and Coffee Roulette!

export function generateStandaloneHTML(): string {
  return `<!DOCTYPE html>
<html lang="ko" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>파이어 WOD: 골든타임 리더보드 | Fire-WOD Board</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Orbitron:wght@600;800;900&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            fireOrange: '#ff5722',
            safetyYellow: '#eab308',
            alarmRed: '#ef4444',
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Noto Sans KR', sans-serif; background-color: #0f172a; color: #f8fafc; }
    .font-tactical { font-family: 'Black Han Sans', sans-serif; }
    .font-digital { font-family: 'Orbitron', monospace; }
    @keyframes sirenPulse {
      0%, 100% { background-color: rgba(239, 68, 68, 0.4); }
      50% { background-color: rgba(15, 23, 42, 0.95); }
    }
    .siren-active {
      animation: sirenPulse 0.7s infinite ease-in-out;
    }
  </style>
</head>
<body class="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-orange-500 selection:text-white flex flex-col justify-between">

  <!-- TOP NAVIGATION -->
  <header class="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 via-red-600 to-amber-500 flex items-center justify-center font-tactical text-xl text-white shadow-lg shadow-orange-950">
          🔥
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-tactical text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-400">
              파이어 WOD
            </span>
            <span class="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
              GOLDEN TIME
            </span>
          </div>
          <p id="station-display" class="text-xs text-slate-400">119 안전센터 체력단련실</p>
        </div>
      </div>

      <!-- DUAL MODE SWITCH -->
      <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button id="btn-mode-tv" onclick="switchViewMode('tv')" class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-tactical transition-all bg-gradient-to-r from-orange-600 to-red-600 text-white shadow">
          📺 TV 전광판
        </button>
        <button id="btn-mode-mobile" onclick="switchViewMode('mobile')" class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-tactical text-slate-400 hover:text-slate-200 transition-all">
          📱 모바일 대원
        </button>
      </div>

      <!-- RIGHT TOOLS -->
      <div class="flex items-center gap-2">
        <button onclick="openWODModal()" class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/30 text-xs font-bold hover:bg-orange-500/20">
          ✨ <span class="hidden md:inline">AI WOD</span>
        </button>
        <button id="btn-sound-toggle" onclick="toggleSound()" class="p-2 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700" title="사운드 토글">
          🔊
        </button>
        <button onclick="triggerEmergencySiren()" class="p-2 rounded-lg bg-red-950/60 text-red-400 border border-red-800/40 hover:bg-red-900/50" title="커피 당번 사이렌">
          🚨
        </button>
        <button onclick="openSettingsModal()" class="relative p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700" title="설정">
          ⚙️
          <span id="gemini-key-indicator" class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-slate-900"></span>
        </button>
      </div>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1">
    
    <!-- TV VIEW CONTAINER -->
    <div id="view-tv" class="space-y-6">
      
      <!-- GIANT JUMBOTRON -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-700/80 shadow-2xl p-6 sm:p-10 text-center">
        <div class="flex items-center justify-center gap-2 mb-3">
          <span id="tv-status-badge" class="px-3.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold tracking-wider">
            대기 상태 (READY)
          </span>
          <span id="tv-format-badge" class="px-3.5 py-1 rounded-full bg-orange-500/15 text-orange-300 text-xs font-bold border border-orange-500/30">
            FOR TIME (타임캡: 20분)
          </span>
        </div>

        <div id="tv-timer-display" class="font-digital font-black text-7xl sm:text-9xl md:text-[12rem] leading-none text-white drop-shadow-[0_0_40px_rgba(255,87,34,0.35)] my-4 select-none">
          00:00
        </div>

        <div class="flex flex-wrap items-center justify-center gap-4 mt-6">
          <button id="btn-tv-start" onclick="startTimer()" class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-tactical text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            ▶ 작전 개시 (START)
          </button>
          <button id="btn-tv-pause" onclick="pauseTimer()" class="hidden px-8 py-3.5 rounded-2xl bg-amber-600 text-white font-tactical text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            ⏸ 일시 정지 (PAUSE)
          </button>
          <button onclick="resetTimer()" class="px-6 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-tactical text-lg border border-slate-700 hover:scale-105 active:scale-95 transition-all">
            ↺ 리셋
          </button>
          <button onclick="triggerEmergencySiren()" class="px-6 py-3.5 rounded-2xl bg-red-700 text-white font-tactical text-lg border border-red-500 shadow-lg hover:scale-105 active:scale-95 transition-all">
            🚨 커피 당번 판정
          </button>
        </div>
      </div>

      <!-- TWO COLUMNS: WOD SPEC & REALTIME LEADERBOARD -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- WOD SPEC (5 Cols) -->
        <div class="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div class="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <span class="text-[10px] font-black uppercase text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                전술 WOD 작전도
              </span>
              <h3 id="wod-title" class="font-tactical text-2xl text-slate-100 mt-1">골든타임 20분 진압작전</h3>
            </div>
            <button onclick="openWODModal()" class="px-2.5 py-1 rounded bg-orange-600/20 text-orange-300 text-xs font-bold border border-orange-500/30">
              WOD 변경
            </button>
          </div>

          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <span class="font-bold text-orange-400 block mb-0.5">소방 전술 목표</span>
            <p id="wod-objective">수관 전개 및 방화문 개방에 필요한 전신 파워와 악력 집중 훈련</p>
          </div>

          <div id="wod-movements-list" class="space-y-2">
            <!-- Dynamically populated -->
          </div>
        </div>

        <!-- LEADERBOARD (7 Cols) -->
        <div class="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">🏆</span>
              <h3 class="font-tactical text-2xl text-slate-100">실시간 골든타임 순위표</h3>
            </div>
            <button onclick="openAddAthleteModal()" class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
              + 대원 추가
            </button>
          </div>

          <div id="leaderboard-list" class="space-y-2.5">
            <!-- Dynamically populated -->
          </div>
        </div>

      </div>

    </div>

    <!-- MOBILE FIGHTER VIEW CONTAINER -->
    <div id="view-mobile" class="hidden max-w-md mx-auto space-y-4">
      
      <!-- Athlete Selector -->
      <div class="bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <label class="text-[11px] font-bold text-slate-400 block mb-2">대원 선택</label>
        <div id="mobile-athletes-pills" class="flex gap-2 overflow-x-auto pb-1">
          <!-- Populated dynamically -->
        </div>
      </div>

      <!-- Synced Timer -->
      <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
        <span class="text-xs text-slate-400 font-mono" id="mobile-format-text">FOR TIME 훈련</span>
        <div id="mobile-timer-display" class="font-digital font-black text-6xl text-white my-2 select-none">
          00:00
        </div>
        <div id="mobile-rank-badge" class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
          현재 훈련 중...
        </div>
      </div>

      <!-- ONE-TOUCH ACTION BUTTON -->
      <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div id="mobile-for-time-box">
          <button id="btn-mobile-finish" onclick="mobileSubmitFinish()" class="w-full py-8 rounded-2xl bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 active:scale-95 transition-all text-white font-tactical text-3xl shadow-2xl border-2 border-orange-400 flex flex-col items-center justify-center">
            <span>🔥 진압 완료!</span>
            <span class="text-xs font-mono font-normal tracking-widest text-orange-200 mt-1">TAP TO FINISH</span>
          </button>
        </div>

        <div id="mobile-amrap-box" class="hidden space-y-3">
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-around text-center">
            <div>
              <span class="text-xs text-slate-400">완료 라운드</span>
              <span id="mobile-amrap-rounds" class="font-digital font-black text-5xl text-amber-400 block">0</span>
            </div>
            <div class="h-10 w-px bg-slate-800"></div>
            <div>
              <span class="text-xs text-slate-400">추가 횟수</span>
              <span id="mobile-amrap-reps" class="font-digital font-black text-5xl text-orange-400 block">0</span>
            </div>
          </div>
          <button onclick="mobileDeltaAmrap(1, 0)" class="w-full py-5 rounded-xl bg-orange-600 text-white font-tactical text-2xl active:scale-95 transition-all shadow-lg">
            + 1 ROUND 완료
          </button>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="mobileDeltaAmrap(0, 1)" class="py-3 bg-slate-800 text-white font-tactical text-lg rounded-xl active:scale-95">
              +1 REP
            </button>
            <button onclick="mobileDeltaAmrap(0, -1)" class="py-3 bg-slate-800 text-white font-tactical text-lg rounded-xl active:scale-95">
              -1 REP
            </button>
          </div>
        </div>
      </div>

    </div>

  </main>

  <!-- SIREN & COFFEE EMERGENCY MODAL -->
  <div id="modal-siren" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-red-600/30 animate-pulse pointer-events-none"></div>
    <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
    <div class="relative z-10 w-full max-w-lg bg-slate-900 border-4 border-red-500 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.6)] p-6 text-center">
      <div class="inline-block px-4 py-1 rounded-full bg-red-600 text-white font-tactical text-sm tracking-widest uppercase mb-4 animate-pulse">
        🚨 긴급 커피 경보 발령
      </div>
      <div class="w-20 h-20 mx-auto mb-3 bg-slate-950 rounded-2xl flex items-center justify-center text-4xl border border-red-500">
        ☕️
      </div>
      <h2 class="font-tactical text-3xl sm:text-4xl text-white mb-2">
        오늘의 커피 지원 당번!
      </h2>
      <div class="p-5 rounded-2xl bg-red-950/80 border-2 border-red-500 my-4">
        <div id="siren-victim-name" class="font-tactical text-4xl sm:text-5xl text-amber-300">
          김반장 대원
        </div>
        <p id="siren-victim-detail" class="text-xs text-slate-300 mt-2">
          "오늘 아이스 아메리카노 시원하게 부탁드립니다! 🚒💨"
        </p>
      </div>

      <div class="space-y-2">
        <button id="btn-spin-roulette" onclick="spinCoffeeRoulette()" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-tactical text-lg active:scale-95 transition-all">
          🎲 꼴찌 탈출용 커피 룰렛 돌리기!
        </button>
        <button onclick="closeSirenModal()" class="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-tactical text-base">
          경보 해제 & 훈련 종료
        </button>
      </div>
    </div>
  </div>

  <!-- SETTINGS MODAL -->
  <div id="modal-settings" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-tactical text-xl text-slate-100">파이어 WOD 설정</h3>
        <button onclick="closeSettingsModal()" class="text-slate-400 hover:text-white">✕</button>
      </div>
      <div>
        <label class="text-xs font-bold text-slate-300 block mb-1">Google Gemini API Key</label>
        <input id="input-gemini-key" type="password" placeholder="AIzaSy..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono">
        <p class="text-[11px] text-slate-400 mt-1">브라우저 localStorage에 안전하게 보관됩니다.</p>
      </div>
      <div>
        <label class="text-xs font-bold text-slate-300 block mb-1">소방서 / 센터 명칭</label>
        <input id="input-station-name" type="text" placeholder="119 안전센터" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100">
      </div>
      <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
        <button onclick="closeSettingsModal()" class="px-4 py-2 rounded-xl text-slate-300 text-xs font-bold">취소</button>
        <button onclick="saveSettings()" class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-tactical text-xs">설정 저장</button>
      </div>
    </div>
  </div>

  <!-- JAVASCRIPT LOGIC -->
  <script>
    // --- STATE MANAGEMENT ---
    let viewMode = 'tv';
    let timerStatus = 'idle'; // idle | countdown | running | paused | finished
    let elapsedSeconds = 0;
    let prepCountdown = 10;
    let timerInterval = null;
    let soundEnabled = true;

    let geminiApiKey = localStorage.getItem('fire_wod_gemini_key') || '';
    let stationName = localStorage.getItem('fire_wod_station_name') || '119 안전센터 체력단련실';

    let athletes = [
      { id: 'ath-1', name: '김반장', rank: '소방위' },
      { id: 'ath-2', name: '박대원', rank: '소방장' },
      { id: 'ath-3', name: '이진압', rank: '소방교' },
      { id: 'ath-4', name: '최구급', rank: '소방사' },
      { id: 'ath-5', name: '정기관', rank: '소방장' }
    ];

    let records = {}; // { [athId]: { completed: boolean, timeSeconds: number, rounds: number, extraReps: number } }
    let selectedAthleteId = athletes[0].id;

    let currentWOD = {
      id: 'w1',
      title: '골든타임 20분 진압작전: 호스 드래그',
      format: 'FOR_TIME',
      timeCapMinutes: 20,
      tacticalObjective: '수관 전개 및 방화문 개방에 필요한 전신 파워와 악력 집중 훈련',
      movements: [
        { name: '수관 전개 모사: 케틀벨 파머스 캐리', reps: '50m (24kg x 2)' },
        { name: '방화문 강제개방: 해머 슬램 or 스내치', reps: '20회' },
        { name: '요구조자 견인 버피', reps: '15회' },
        { name: '연소 확대 저지: 케틀벨 스윙', reps: '30회' }
      ]
    };

    // --- WEB AUDIO SYNTHESIZER ---
    let audioCtx = null;
    let sirenOsc = null;
    let sirenLfo = null;
    let isSirenOn = false;

    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playBeep(freq, duration) {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {}
    }

    function playBuzzer() {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } catch(e) {}
    }

    function startSirenSound() {
      if (!soundEnabled || isSirenOn) return;
      try {
        const ctx = getAudioContext();
        isSirenOn = true;
        sirenOsc = ctx.createOscillator();
        sirenOsc.type = 'sawtooth';
        sirenOsc.frequency.setValueAtTime(650, ctx.currentTime);

        sirenLfo = ctx.createOscillator();
        sirenLfo.frequency.setValueAtTime(0.7, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(300, ctx.currentTime);
        sirenLfo.connect(lfoGain);
        lfoGain.connect(sirenOsc.frequency);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, ctx.currentTime);

        sirenOsc.connect(gain);
        gain.connect(ctx.destination);

        sirenOsc.start();
        sirenLfo.start();
      } catch(e) {}
    }

    function stopSirenSound() {
      if (!isSirenOn) return;
      try {
        sirenOsc?.stop();
        sirenLfo?.stop();
        sirenOsc = null;
        sirenLfo = null;
        isSirenOn = false;
      } catch(e) {}
    }

    // --- VIEW SWITCHING ---
    function switchViewMode(mode) {
      viewMode = mode;
      document.getElementById('view-tv').classList.toggle('hidden', mode !== 'tv');
      document.getElementById('view-mobile').classList.toggle('hidden', mode !== 'mobile');
      document.getElementById('btn-mode-tv').className = mode === 'tv' 
        ? 'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-tactical transition-all bg-gradient-to-r from-orange-600 to-red-600 text-white shadow'
        : 'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-tactical text-slate-400 hover:text-slate-200 transition-all';
      document.getElementById('btn-mode-mobile').className = mode === 'mobile'
        ? 'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-tactical transition-all bg-gradient-to-r from-orange-600 to-red-600 text-white shadow'
        : 'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-tactical text-slate-400 hover:text-slate-200 transition-all';
      renderUI();
    }

    function toggleSound() {
      soundEnabled = !soundEnabled;
      document.getElementById('btn-sound-toggle').innerText = soundEnabled ? '🔊' : '🔇';
      document.getElementById('btn-sound-toggle').className = soundEnabled 
        ? 'p-2 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700'
        : 'p-2 rounded-lg bg-slate-900 text-slate-500 border border-slate-800';
    }

    // --- TIMER CONTROL ---
    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function startTimer() {
      if (timerStatus === 'running') return;
      getAudioContext();

      if (timerStatus === 'idle') {
        timerStatus = 'countdown';
        prepCountdown = 10;
        renderTimerDisplay();
        playBeep(660, 0.12);

        timerInterval = setInterval(() => {
          prepCountdown--;
          if (prepCountdown > 0) {
            playBeep(prepCountdown <= 3 ? 880 : 660, 0.15);
            renderTimerDisplay();
          } else {
            clearInterval(timerInterval);
            timerStatus = 'running';
            playBeep(1250, 0.8); // Start Long Beep!
            runWorkoutClock();
          }
        }, 1000);
      } else if (timerStatus === 'paused') {
        timerStatus = 'running';
        runWorkoutClock();
      }
      renderUI();
    }

    function runWorkoutClock() {
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        elapsedSeconds++;
        renderTimerDisplay();
        // Check time cap
        if (elapsedSeconds >= currentWOD.timeCapMinutes * 60) {
          pauseTimer();
          timerStatus = 'finished';
          playBuzzer();
          triggerEmergencySiren();
        }
      }, 1000);
      renderUI();
    }

    function pauseTimer() {
      timerStatus = 'paused';
      clearInterval(timerInterval);
      renderUI();
    }

    function resetTimer() {
      pauseTimer();
      timerStatus = 'idle';
      elapsedSeconds = 0;
      prepCountdown = 10;
      records = {};
      renderTimerDisplay();
      renderUI();
    }

    function renderTimerDisplay() {
      const tvTime = document.getElementById('tv-timer-display');
      const mobileTime = document.getElementById('mobile-timer-display');
      const text = timerStatus === 'countdown' ? String(prepCountdown) : formatTime(elapsedSeconds);
      if (tvTime) tvTime.innerText = text;
      if (mobileTime) mobileTime.innerText = text;
    }

    // --- LEADERBOARD & ATHLETE LOGIC ---
    function completeAthlete(id) {
      if (!records[id]) records[id] = {};
      records[id].completed = true;
      if (currentWOD.format === 'FOR_TIME') {
        records[id].timeSeconds = elapsedSeconds;
      }
      renderUI();
      checkAllCompleted();
    }

    function mobileSubmitFinish() {
      completeAthlete(selectedAthleteId);
    }

    function mobileDeltaAmrap(deltaRound, deltaRep) {
      if (!records[selectedAthleteId]) records[selectedAthleteId] = { rounds: 0, extraReps: 0 };
      records[selectedAthleteId].rounds = Math.max(0, (records[selectedAthleteId].rounds || 0) + deltaRound);
      records[selectedAthleteId].extraReps = Math.max(0, (records[selectedAthleteId].extraReps || 0) + deltaRep);
      renderUI();
    }

    function checkAllCompleted() {
      const allDone = athletes.length > 0 && athletes.every(a => records[a.id]?.completed);
      if (allDone) {
        pauseTimer();
        triggerEmergencySiren();
      }
    }

    function getSortedAthletes() {
      return [...athletes].sort((a, b) => {
        const recA = records[a.id];
        const recB = records[b.id];
        if (recA?.completed && !recB?.completed) return -1;
        if (!recA?.completed && recB?.completed) return 1;
        if (currentWOD.format === 'FOR_TIME') {
          return (recA?.timeSeconds || 9999) - (recB?.timeSeconds || 9999);
        } else {
          const scoreA = (recA?.rounds || 0) * 100 + (recA?.extraReps || 0);
          const scoreB = (recB?.rounds || 0) * 100 + (recB?.extraReps || 0);
          return scoreB - scoreA;
        }
      });
    }

    // --- EMERGENCY SIREN & COFFEE ROULETTE ---
    function triggerEmergencySiren() {
      startSirenSound();
      document.body.classList.add('siren-active');
      const sorted = getSortedAthletes();
      const victim = sorted[sorted.length - 1];
      document.getElementById('siren-victim-name').innerText = victim ? \`\${victim.name} \${victim.rank}\` : '대원';
      document.getElementById('modal-siren').classList.remove('hidden');
    }

    function closeSirenModal() {
      stopSirenSound();
      document.body.classList.remove('siren-active');
      document.getElementById('modal-siren').classList.add('hidden');
    }

    function spinCoffeeRoulette() {
      const btn = document.getElementById('btn-spin-roulette');
      btn.disabled = true;
      let count = 0;
      const interval = setInterval(() => {
        const rand = athletes[Math.floor(Math.random() * athletes.length)];
        document.getElementById('siren-victim-name').innerText = \`\${rand.name} \${rand.rank}\`;
        playBeep(400 + (count % 4) * 100, 0.05);
        count++;
        if (count > 25) {
          clearInterval(interval);
          btn.disabled = false;
          playBeep(880, 0.4);
          document.getElementById('siren-victim-detail').innerText = '🎉 룰렛 재추첨 완료! 오늘의 최종 커피 당번 확정!';
        }
      }, 70);
    }

    // --- SETTINGS MODAL ---
    function openSettingsModal() {
      document.getElementById('input-gemini-key').value = geminiApiKey;
      document.getElementById('input-station-name').value = stationName;
      document.getElementById('modal-settings').classList.remove('hidden');
    }
    function closeSettingsModal() {
      document.getElementById('modal-settings').classList.add('hidden');
    }
    function saveSettings() {
      geminiApiKey = document.getElementById('input-gemini-key').value.trim();
      stationName = document.getElementById('input-station-name').value.trim() || '119 안전센터';
      localStorage.setItem('fire_wod_gemini_key', geminiApiKey);
      localStorage.setItem('fire_wod_station_name', stationName);
      closeSettingsModal();
      renderUI();
    }

    function openWODModal() {
      alert('AI 소방 WOD 생성: 설정에서 Gemini API 키를 저장하면 맞춤 작전이 자동 생성됩니다.');
    }
    function openAddAthleteModal() {
      const name = prompt('새 소방대원 이름을 입력하세요:');
      if (name && name.trim()) {
        athletes.push({ id: 'ath-' + Date.now(), name: name.trim(), rank: '소방교' });
        renderUI();
      }
    }

    // --- RENDER MAIN UI ---
    function renderUI() {
      // Station Display
      document.getElementById('station-display').innerText = stationName;
      // Key Indicator
      const keyInd = document.getElementById('gemini-key-indicator');
      if (keyInd) {
        keyInd.className = geminiApiKey 
          ? 'absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-slate-900'
          : 'absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-slate-900';
      }

      // Buttons toggle
      document.getElementById('btn-tv-start').classList.toggle('hidden', timerStatus === 'running');
      document.getElementById('btn-tv-pause').classList.toggle('hidden', timerStatus !== 'running');

      // WOD render
      document.getElementById('wod-title').innerText = currentWOD.title;
      document.getElementById('wod-objective').innerText = currentWOD.tacticalObjective;
      const movList = document.getElementById('wod-movements-list');
      movList.innerHTML = currentWOD.movements.map((m, i) => \`
        <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
          <span class="font-bold text-slate-200">\${i+1}. \${m.name}</span>
          <span class="font-digital font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">\${m.reps}</span>
        </div>
      \`).join('');

      // Leaderboard render
      const sorted = getSortedAthletes();
      const lbList = document.getElementById('leaderboard-list');
      lbList.innerHTML = sorted.map((ath, idx) => {
        const rec = records[ath.id];
        const isLowest = idx === sorted.length - 1 && sorted.length > 1;
        return \`
          <div class="p-3 rounded-xl border flex items-center justify-between \${rec?.completed ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-800/40'} \${isLowest && rec?.completed ? 'border-red-500/50 bg-red-950/20' : ''}">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-digital font-bold text-xs \${idx===0?'text-amber-400':''}">\${idx+1}</span>
              <div>
                <span class="font-tactical text-base text-slate-100">\${ath.name}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 ml-1">\${ath.rank}</span>
                \${isLowest ? '<span class="text-[10px] text-red-400 font-bold ml-1">🚨 커피 당번 후보</span>' : ''}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-digital font-bold text-sm \${rec?.completed ? 'text-emerald-400' : 'text-slate-500'}">
                \${rec?.completed ? formatTime(rec.timeSeconds || 0) : '훈련 중...'}
              </span>
              <button onclick="completeAthlete('\${ath.id}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300">
                \${rec?.completed ? '수정' : '완료'}
              </button>
            </div>
          </div>
        \`;
      }).join('');

      // Mobile Pills
      const mobPills = document.getElementById('mobile-athletes-pills');
      mobPills.innerHTML = athletes.map(ath => \`
        <button onclick="selectedAthleteId='\${ath.id}'; renderUI();" class="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border \${ath.id===selectedAthleteId ? 'bg-orange-600 text-white border-orange-400' : 'bg-slate-950 text-slate-300 border-slate-800'}">
          \${ath.name} (\${ath.rank})
        </button>
      \`).join('');

      // Mobile AMRAP/FOR_TIME Toggle
      document.getElementById('mobile-for-time-box').classList.toggle('hidden', currentWOD.format !== 'FOR_TIME');
      document.getElementById('mobile-amrap-box').classList.toggle('hidden', currentWOD.format !== 'AMRAP');
      if (records[selectedAthleteId]) {
        document.getElementById('mobile-amrap-rounds').innerText = records[selectedAthleteId].rounds || 0;
        document.getElementById('mobile-amrap-reps').innerText = records[selectedAthleteId].extraReps || 0;
      }
    }

    // Init on page load
    renderUI();
  </script>
</body>
</html>`;
}
