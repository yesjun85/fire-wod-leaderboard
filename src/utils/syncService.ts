import { Athlete, AthleteRecord } from '../types';

export type SyncMessageType = 
  | 'ADD_ATHLETE'
  | 'REMOVE_ATHLETE'
  | 'UPDATE_RECORD'
  | 'RESET_RECORD'
  | 'RESET_ALL'
  | 'REQUEST_SYNC'
  | 'SYNC_STATE';

export interface SyncPayload {
  type: SyncMessageType;
  senderId: string;
  timestamp: number;
  athlete?: Athlete;
  athleteId?: string;
  record?: AthleteRecord;
  records?: Record<string, AthleteRecord>;
  athletes?: Athlete[];
}

export class SyncService {
  private roomId: string = 'wod-119';
  private senderId: string = 'client-' + Math.random().toString(36).substring(2, 9);
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private onMessageCallback: ((payload: SyncPayload) => void) | null = null;
  private onStatusChangeCallback: ((connected: boolean) => void) | null = null;
  private reconnectTimer: any = null;
  private isConnected: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('fire_wod_channel');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.senderId !== this.senderId) {
          this.notifyMessage(event.data);
        }
      };
    }
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public getSenderId(): string {
    return this.senderId;
  }

  public init(
    roomId: string,
    onMessage: (payload: SyncPayload) => void,
    onStatusChange?: (connected: boolean) => void
  ) {
    this.roomId = roomId.trim() || 'wod-119';
    this.onMessageCallback = onMessage;
    this.onStatusChangeCallback = onStatusChange || null;

    this.connect();
    this.fetchRecentHistory();
  }

  private setConnected(status: boolean) {
    this.isConnected = status;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  private connect() {
    if (typeof window === 'undefined') return;

    this.cleanup();

    const topic = `firewod-${this.roomId}`;
    const wsUrl = `wss://ntfy.sh/${topic}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setConnected(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'message' && data.message) {
            const payload: SyncPayload = typeof data.message === 'string' 
              ? JSON.parse(data.message) 
              : data.message;
            if (payload && payload.senderId !== this.senderId) {
              this.notifyMessage(payload);
            }
          }
        } catch {
          // ignore malformed
        }
      };

      this.ws.onerror = () => {
        this.fallbackToEventSource();
      };

      this.ws.onclose = () => {
        this.setConnected(false);
        this.scheduleReconnect();
      };
    } catch {
      this.fallbackToEventSource();
    }
  }

  private fallbackToEventSource() {
    if (this.eventSource || typeof window === 'undefined') return;
    const topic = `firewod-${this.roomId}`;
    try {
      this.eventSource = new EventSource(`https://ntfy.sh/${topic}/sse`);
      this.eventSource.onopen = () => {
        this.setConnected(true);
      };
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.message) {
            const payload: SyncPayload = typeof data.message === 'string'
              ? JSON.parse(data.message)
              : data.message;
            if (payload && payload.senderId !== this.senderId) {
              this.notifyMessage(payload);
            }
          }
        } catch {}
      };
      this.eventSource.onerror = () => {
        this.setConnected(false);
      };
    } catch {}
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 4000);
  }

  private async fetchRecentHistory() {
    try {
      const topic = `firewod-${this.roomId}`;
      const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=2h`);
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.trim().split('\n');
      for (const line of lines) {
        if (!line) continue;
        try {
          const item = JSON.parse(line);
          if (item.event === 'message' && item.message) {
            const payload: SyncPayload = typeof item.message === 'string'
              ? JSON.parse(item.message)
              : item.message;
            if (payload && payload.type === 'ADD_ATHLETE' && payload.athlete) {
              this.notifyMessage(payload);
            }
          }
        } catch {}
      }
    } catch {}
  }

  private notifyMessage(payload: SyncPayload) {
    if (this.onMessageCallback) {
      this.onMessageCallback(payload);
    }
  }

  public async broadcast(type: SyncMessageType, data: Partial<SyncPayload>) {
    const payload: SyncPayload = {
      type,
      senderId: this.senderId,
      timestamp: Date.now(),
      ...data
    };

    // 1. Broadcast locally
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(payload);
      }
    } catch {}

    // 2. Publish to ntfy cloud topic for other devices
    try {
      const topic = `firewod-${this.roomId}`;
      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Title': `FireWOD: ${type}`
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Sync broadcast error', err);
    }
  }

  public cleanup() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export const syncService = new SyncService();
