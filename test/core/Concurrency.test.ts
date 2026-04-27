import { describe, it, expect, beforeEach, vi } from 'vitest';
import { McpExecutor } from '../../src/core/McpExecutor';
import { McpRegistry } from '../../src/core/McpRegistry';
import { Logger } from '../../src/logger/Logger';
import { McpContext } from '../../src/core/McpContext';
import type { ConcurrencyOptions } from '../../src/types/concurrency';

describe('Concurrency Control', () => {
  let executor: McpExecutor;
  let registry: McpRegistry;
  let logger: Logger;
  let context: McpContext;

  beforeEach(() => {
    logger = new Logger('info');
    context = new McpContext();
    registry = new McpRegistry(logger, context.getConfigResolver(), context.getConfigValidator());
    executor = new McpExecutor(registry, logger);
  });

  it('should initialize with default concurrency options', () => {
    const stats = executor.concurrency.getStats();
    expect(stats.maxConcurrency).toBe(5);
    expect(stats.maxQueueLength).toBe(100);
  });

  it('should initialize with custom concurrency options', () => {
    const options: ConcurrencyOptions = {
      maxConcurrency: 3,
      maxQueueLength: 50,
      overflowStrategy: 'reject'
    };
    const customExecutor = new McpExecutor(registry, logger, undefined, undefined, undefined, undefined, options);
    const stats = customExecutor.concurrency.getStats();
    expect(stats.maxConcurrency).toBe(3);
    expect(stats.maxQueueLength).toBe(50);
  });

  it('should update concurrency options', () => {
    const options: ConcurrencyOptions = {
      maxConcurrency: 10,
      maxQueueLength: 200,
      overflowStrategy: 'wait'
    };
    executor.concurrency.updateOptions(options);
    const stats = executor.concurrency.getStats();
    expect(stats.maxConcurrency).toBe(10);
    expect(stats.maxQueueLength).toBe(200);
  });

  it('should process multiple requests concurrently', async () => {
    // Mock client
    const mockClient = {
      send: vi.fn(async (payload: any) => {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 10));
        return JSON.stringify({ success: true });
      })
    };

    // Register client
    await registry.registerClient('test', {
      transport: 'stdio',
      command: 'echo',
      enabled: true
    });

    // Override getClient to return mock client
    vi.spyOn(registry, 'getClient').mockReturnValue(mockClient);

    // Set max concurrency to 2
    executor.concurrency.updateOptions({ maxConcurrency: 2 });

    // Track start times
    const startTimes: number[] = [];
    const endTimes: number[] = [];

    // Execute multiple requests
    const requests = Array.from({ length: 5 }, async (_, i) => {
      startTimes[i] = Date.now();
      await executor.execute('test', { message: `Request ${i}` });
      endTimes[i] = Date.now();
    });

    // Wait for all requests to complete
    await Promise.all(requests);

    // Check that requests were processed in batches
    const stats = executor.concurrency.getStats();
    expect(stats.processedRequests).toBe(5);
    expect(stats.currentConcurrency).toBe(0);
  });

  it('should handle queue overflow with reject strategy', async () => {
    // Mock client
    const mockClient = {
      send: vi.fn(async (payload: any) => {
        // Simulate long delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return JSON.stringify({ success: true });
      })
    };

    // Register client
    await registry.registerClient('test', {
      transport: 'stdio',
      command: 'echo',
      enabled: true
    });

    // Override getClient to return mock client
    vi.spyOn(registry, 'getClient').mockReturnValue(mockClient);

    // Set max concurrency to 1 and max queue length to 1
    executor.concurrency.updateOptions({ maxConcurrency: 1, maxQueueLength: 1, overflowStrategy: 'reject' });

    // Start first request
    const firstRequest = executor.execute('test', { message: 'Request 1' });

    // Wait a bit for it to start
    await new Promise(resolve => setTimeout(resolve, 10));

    // Start second request (should go to queue)
    const secondRequest = executor.execute('test', { message: 'Request 2' });

    // Start third request (should be rejected)
    const thirdRequest = executor.execute('test', { message: 'Request 3' });

    // Check that third request is rejected
    await expect(thirdRequest).rejects.toThrow('Concurrency queue overflow');

    // Wait for first two requests to complete
    await firstRequest;
    await secondRequest;

    const stats = executor.concurrency.getStats();
    expect(stats.processedRequests).toBe(2);
    expect(stats.rejectedRequests).toBe(1);
  });

  it('should clear queue', () => {
    executor.concurrency.clearQueue();
    const stats = executor.concurrency.getStats();
    expect(stats.queueLength).toBe(0);
    expect(stats.currentConcurrency).toBe(0);
  });

  it('should get concurrency stats', () => {
    const stats = executor.concurrency.getStats();
    expect(stats).toHaveProperty('currentConcurrency');
    expect(stats).toHaveProperty('queueLength');
    expect(stats).toHaveProperty('maxConcurrency');
    expect(stats).toHaveProperty('maxQueueLength');
    expect(stats).toHaveProperty('rejectedRequests');
    expect(stats).toHaveProperty('processedRequests');
  });
});
