import type { RailEvents, RailEventHandler } from '../types';

/**
 * Type-safe event emitter for Rail lifecycle events. Manages listener
 * registration, removal, and emission across all carousel event types.
 */
export class EventEmitter {
  private listeners = new Map<string, Set<RailEventHandler>>();

  on<K extends keyof RailEvents>(event: K, handler: RailEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as RailEventHandler);
  }

  off<K extends keyof RailEvents>(event: K, handler: RailEvents[K]): void {
    this.listeners.get(event)?.delete(handler as RailEventHandler);
  }

  emit<K extends keyof RailEvents>(event: K, ...args: Parameters<RailEvents[K]>): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        (handler as (...a: unknown[]) => void)(...args);
      } catch (err) {
        console.error(`[Rail] Error in "${event}" handler:`, err);
      }
    });
  }

  removeAll(): void {
    this.listeners.clear();
  }
}
