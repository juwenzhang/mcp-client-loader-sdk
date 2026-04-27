import { describe, it, expect, beforeEach, vi } from 'vitest';
import { McpExecutor } from '../../src/core/McpExecutor';
import { McpRegistry } from '../../src/core/McpRegistry';
import { Logger } from '../../src/logger/Logger';
import { McpContext } from '../../src/core/McpContext';

describe('Request Priority', () => {
  let logger: Logger;
  let context: McpContext;

  beforeEach(() => {
    logger = new Logger('info');
    context = new McpContext();
  });

  it('should sort queue by priority when adding items', async () => {
    const registry = new McpRegistry(logger, context.getConfigResolver(), context.getConfigValidator());
    
    const executor = new McpExecutor(registry, logger);
    executor.concurrency.updateOptions({ maxConcurrency: 1, maxQueueLength: 10 });

    // Set up mock to track order but without delay
    const executionOrder: number[] = [];
    const mockSend = vi.fn(async (payload: any) => {
      executionOrder.push(payload.requestId);
      return JSON.stringify({ success: true });
    });
    
    const mockClient = { send: mockSend };
    vi.spyOn(registry, 'getClient').mockReturnValue(mockClient as any);
    
    await registry.registerClient('test', {
      transport: 'stdio',
      command: 'echo',
      enabled: true
    });

    // Submit all requests before any execute
    // Set concurrency to 0 to prevent immediate execution
    executor.concurrency.updateOptions({ maxConcurrency: 0 });
    
    // Now submit requests
    const promises = [
      executor.execute('test', { requestId: 1 }, { priority: 1 }),
      executor.execute('test', { requestId: 2 }, { priority: 10 }),
      executor.execute('test', { requestId: 3 }, { priority: 5 })
    ];

    // Wait for queue items to be added
    await new Promise(resolve => setTimeout(resolve, 10));

    // Check that queue is sorted by priority (highest first)
    const stats = executor.getConcurrencyStats();
    expect(stats.queueLength).toBe(3);
    
    // Now enable concurrency and let them run
    executor.concurrency.updateOptions({ maxConcurrency: 1 });
    
    await Promise.all(promises);

    // The order should be: 2 (priority 10), 3 (priority 5), 1 (priority 1)
    expect(executionOrder).toEqual([2, 3, 1]);
  });

  it('should handle requests without priority (default to 0)', async () => {
    const registry = new McpRegistry(logger, context.getConfigResolver(), context.getConfigValidator());
    
    const executor = new McpExecutor(registry, logger);
    executor.concurrency.updateOptions({ maxConcurrency: 0 });

    const executionOrder: number[] = [];
    const mockSend = vi.fn(async (payload: any) => {
      executionOrder.push(payload.requestId);
      return JSON.stringify({ success: true });
    });
    
    const mockClient = { send: mockSend };
    vi.spyOn(registry, 'getClient').mockReturnValue(mockClient as any);
    
    await registry.registerClient('test', {
      transport: 'stdio',
      command: 'echo',
      enabled: true
    });

    // Submit requests with different priorities
    const promises = [
      executor.execute('test', { requestId: 1 }, { priority: 5 }),
      executor.execute('test', { requestId: 2 }), // priority 0
      executor.execute('test', { requestId: 3 }, { priority: 10 }),
      executor.execute('test', { requestId: 4 }) // priority 0
    ];

    executor.concurrency.updateOptions({ maxConcurrency: 1 });
    await Promise.all(promises);

    expect(executionOrder[0]).toBe(3); // Highest priority first
    expect(executionOrder[1]).toBe(1); // Second highest
    expect(executionOrder.length).toBe(4);
  });

  it('should handle mixed priority and non-priority requests', async () => {
    const registry = new McpRegistry(logger, context.getConfigResolver(), context.getConfigValidator());
    
    const executor = new McpExecutor(registry, logger);
    executor.concurrency.updateOptions({ maxConcurrency: 0 });

    const executionOrder: number[] = [];
    const mockSend = vi.fn(async (payload: any) => {
      executionOrder.push(payload.requestId);
      return JSON.stringify({ success: true });
    });
    
    const mockClient = { send: mockSend };
    vi.spyOn(registry, 'getClient').mockReturnValue(mockClient as any);
    
    await registry.registerClient('test', {
      transport: 'stdio',
      command: 'echo',
      enabled: true
    });

    const promises = [
      executor.execute('test', { requestId: 1 }), // priority 0
      executor.execute('test', { requestId: 2 }, { priority: 5 }),
      executor.execute('test', { requestId: 3 }, { priority: 10 })
    ];

    executor.concurrency.updateOptions({ maxConcurrency: 1 });
    await Promise.all(promises);

    expect(executionOrder[0]).toBe(3); // priority 10
    expect(executionOrder[1]).toBe(2); // priority 5
    expect(executionOrder[2]).toBe(1); // priority 0
  });
});
