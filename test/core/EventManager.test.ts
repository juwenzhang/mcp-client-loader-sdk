import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventManager } from '../../src/core/EventManager';

describe('EventManager', () => {
  let eventManager: EventManager;

  beforeEach(() => {
    eventManager = new EventManager();
  });

  it('should emit and listen to events', async () => {
    const listener = vi.fn();
    eventManager.on('test', listener);

    eventManager.emit('test', { data: 'test' });

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      type: 'test',
      data: { data: 'test' }
    }));
  });

  it('should support multiple listeners', async () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventManager.on('test', listener1);
    eventManager.on('test', listener2);

    eventManager.emit('test', { data: 'test' });

    expect(listener1).toHaveBeenCalledWith(expect.objectContaining({
      type: 'test',
      data: { data: 'test' }
    }));
    expect(listener2).toHaveBeenCalledWith(expect.objectContaining({
      type: 'test',
      data: { data: 'test' }
    }));
  });

  it('should remove listeners', async () => {
    const listener = vi.fn();
    eventManager.on('test', listener);
    eventManager.off('test', listener);

    eventManager.emit('test', { data: 'test' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should remove all listeners for an event', async () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventManager.on('test', listener1);
    eventManager.on('test', listener2);
    eventManager.removeAllListeners('test');

    eventManager.emit('test', { data: 'test' });

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });

  it('should clear all listeners', async () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventManager.on('test1', listener1);
    eventManager.on('test2', listener2);
    eventManager.removeAllListeners();

    eventManager.emit('test1', { data: 'test1' });
    eventManager.emit('test2', { data: 'test2' });

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });

  it('should get listener count for an event', async () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventManager.on('test', listener1);
    eventManager.on('test', listener2);

    const count = eventManager.getListenerCount('test');
    expect(count).toBe(2);
  });

  it('should handle non-existent events gracefully', async () => {
    expect(() => {
      eventManager.emit('non-existent', { data: 'test' });
    }).not.toThrow();

    expect(() => {
      eventManager.off('non-existent', vi.fn());
    }).not.toThrow();

    expect(eventManager.getListenerCount('non-existent')).toBe(0);
  });

  it('should support once listeners', async () => {
    const listener = vi.fn();
    eventManager.once('test', listener);

    eventManager.emit('test', { data: 'test' });
    eventManager.emit('test', { data: 'test' });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should check if listener exists', async () => {
    const listener = vi.fn();
    eventManager.on('test', listener);

    expect(eventManager.hasListener('test', listener)).toBe(true);
    expect(eventManager.hasListener('test', vi.fn())).toBe(false);
  });
});
