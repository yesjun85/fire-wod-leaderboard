// Web Audio API Sound Synthesizer for Fire-WOD Board
// Synthesizes all sounds without external audio files!

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenMod: OscillatorNode | null = null;
  private isSirenPlaying: boolean = false;
  private volume: number = 0.8;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.sirenGain && this.ctx) {
      this.sirenGain.gain.setValueAtTime(this.volume * 0.35, this.ctx.currentTime);
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.isSirenPlaying) {
      this.stopSiren();
    }
  }

  // 10-second countdown tick (단음 삐-)
  public playCountdownTick(isFinalThree: boolean = false) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinalThree ? 880 : 660, ctx.currentTime);

      const now = ctx.currentTime;
      const duration = isFinalThree ? 0.16 : 0.1;
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // Audio context might be restricted before first gesture
    }
  }

  // Workout Start Go! (장음 삐-익)
  public playStartLongBeep() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1250, ctx.currentTime);

      const now = ctx.currentTime;
      const duration = 0.85;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.02);
      gain.gain.setValueAtTime(this.volume * 0.7, now + duration - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // ignore
    }
  }

  // Finish / Time-cap Buzzer (종료 버저)
  public playFinishBuzzer() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.9);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      const now = ctx.currentTime;
      const duration = 0.95;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.8, now + 0.03);
      gain.gain.setValueAtTime(this.volume * 0.75, now + duration - 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // ignore
    }
  }

  // Tactical Emergency Siren (소방 출동/비상 사이렌)
  public startSiren() {
    if (!this.enabled || this.isSirenPlaying) return;
    try {
      const ctx = this.getContext();
      this.isSirenPlaying = true;

      // Main tone
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, ctx.currentTime);

      // Lowpass filter for analog emergency horn warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);

      // LFO for wailing pitch modulation (0.65 Hz)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.65, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(320, ctx.currentTime); // mod range 650 +- 320 Hz (330Hz ~ 970Hz)

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(this.volume * 0.35, ctx.currentTime + 0.3);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc.start();
      lfo.start();

      this.sirenOsc = osc;
      this.sirenMod = lfo;
      this.sirenGain = masterGain;
    } catch {
      this.isSirenPlaying = false;
    }
  }

  public stopSiren() {
    if (!this.isSirenPlaying) return;
    try {
      if (this.sirenGain && this.ctx) {
        this.sirenGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      }
      setTimeout(() => {
        try {
          this.sirenOsc?.stop();
          this.sirenMod?.stop();
          this.sirenOsc?.disconnect();
          this.sirenMod?.disconnect();
          this.sirenGain?.disconnect();
        } catch {
          // ignore
        }
        this.sirenOsc = null;
        this.sirenMod = null;
        this.sirenGain = null;
        this.isSirenPlaying = false;
      }, 300);
    } catch {
      this.isSirenPlaying = false;
    }
  }

  // Roulette tick sound for coffee roulette
  public playRouletteTick(pitch: number = 600) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // ignore
    }
  }

  // Coffee duty winner fanfare
  public playCoffeeFanfare() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const notes = [440, 554.37, 659.25, 880];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(this.volume * 0.5, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundEngine();
