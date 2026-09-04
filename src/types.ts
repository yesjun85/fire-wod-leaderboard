export type ViewMode = 'tv' | 'mobile' | 'join';

export type WODFormat = 'FOR_TIME' | 'AMRAP';

export interface WODMovement {
  id: string;
  name: string;
  reps: string;
  tacticalNote?: string;
  category?: 'stamina' | 'strength' | 'core' | 'grip';
}

export interface WODDetails {
  id: string;
  title: string;
  format: WODFormat;
  timeCapMinutes: number;
  description: string;
  movements: WODMovement[];
  tacticalObjective: string; // e.g., "호흡기 고갈 상황 심폐 지구력 및 호스 전개 악력 강화"
  equipmentNeeded: string[];
}

export interface Athlete {
  id: string;
  name: string;
  rank: string; // 소방사, 소방교, 소방장, 소방위, 소방경
  color: string;
  callsign?: string;
}

export interface AthleteRecord {
  athleteId: string;
  completed: boolean;
  timeSeconds?: number; // For Time mode (lower is better)
  rounds?: number; // AMRAP mode (higher is better)
  extraReps?: number; // AMRAP extra reps
  submittedAt?: number;
}

export type TimerStatus = 'idle' | 'countdown' | 'running' | 'paused' | 'finished';

export interface AppSettings {
  geminiApiKey: string;
  stationName: string;
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  prepCountdownSeconds: number; // default 10s
}
