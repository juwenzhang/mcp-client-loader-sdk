import type { EventType, Event, EventListener } from '../types/core';

export class EventManager {
  private listeners: Map<EventType, Set<EventListener>> = new Map();

  on(eventType: EventType, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  off(eventType: EventType, listener: EventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  once(eventType: EventType, listener: EventListener): void {
    const wrappedListener = (event: Event) => {
      listener(event);
      this.off(eventType, wrappedListener);
    };
    this.on(eventType, wrappedListener);
  }

  emit(eventType: EventType, data: any): void {
    const event: Event = {
      type: eventType,
      timestamp: Date.now(),
      data
    };

    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  removeAllListeners(eventType?: EventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  getListenerCount(eventType: EventType): number {
    return this.listeners.get(eventType)?.size || 0;
  }

  hasListener(eventType: EventType, listener: EventListener): boolean {
    const listeners = this.listeners.get(eventType);
    return listeners ? listeners.has(listener) : false;
  }
}
