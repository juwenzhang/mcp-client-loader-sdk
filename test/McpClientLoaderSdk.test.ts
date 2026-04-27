import { describe, it, expect, beforeEach, vi } from 'vitest';
import { McpClientLoaderSdk } from '../src/index';

vi.mock('../src/clients/HttpClient', () => {
  return {
    HttpClient: class MockHttpClient {
      constructor() {}
      send(payload: any) {
        return Promise.resolve(JSON.stringify({ response: 'mock response' }));
      }
      close() {}
    }
  };
});

describe('McpClientLoaderSdk', () => {
  let sdk: McpClientLoaderSdk;

  beforeEach(async () => {
    sdk = await McpClientLoaderSdk.init({
      config: {
        mcpServers: {
          test: {
            enabled: true,
            transport: 'streamable-http',
            url: 'http://localhost:8080'
          }
        }
      }
    });
  });

  it('should initialize successfully', async () => {
    expect(sdk).toBeInstanceOf(McpClientLoaderSdk);
  });

  it('should execute request', async () => {
    const result = await sdk.execute('test', { method: 'test' });
    expect(result).toBe('{"response":"mock response"}');
  });

  it('should register client', async () => {
    await sdk.registerClient('new-client', {
      transport: 'streamable-http',
      url: 'http://localhost:8081'
    });

    const client = sdk.getClient('new-client');
    expect(client).toBeDefined();
  });

  it('should remove client', async () => {
    await sdk.registerClient('temp-client', {
      transport: 'streamable-http',
      url: 'http://localhost:8082'
    });

    sdk.removeClient('temp-client');
    const client = sdk.getClient('temp-client');
    expect(client).toBeUndefined();
  });

  it('should get client IDs', async () => {
    const clientIds = sdk.getClientIds();
    expect(Array.isArray(clientIds)).toBe(true);
    expect(clientIds).toContain('test');
  });

  it('should clear all clients', async () => {
    await sdk.registerClient('temp-client', {
      transport: 'streamable-http',
      url: 'http://localhost:8082'
    });

    sdk.clear();
    const clientIds = sdk.getClientIds();
    expect(clientIds).toEqual([]);
  });

  it('should use cache', async () => {
    const result1 = await sdk.execute('test', { method: 'GET', id: 1 });
    expect(result1).toBe('{"response":"mock response"}');

    const result2 = await sdk.execute('test', { method: 'GET', id: 1 });
    expect(result2).toBe('{"response":"mock response"}');
  });

  it('should skip cache when noCache is true', async () => {
    const result = await sdk.execute('test', { method: 'GET', id: 1 }, { noCache: true });
    expect(result).toBe('{"response":"mock response"}');
  });

  it('should use middleware', async () => {
    let middlewareCalled = false;

    sdk.middleware.use(async (ctx, next) => {
      middlewareCalled = true;
      await next();
    });

    const result = await sdk.execute('test', { method: 'test' });
    expect(result).toBe('{"response":"mock response"}');
    expect(middlewareCalled).toBe(true);
  });

  it('should use event listeners', async () => {
    let requestEventCalled = false;

    sdk.on('request', (event) => {
      requestEventCalled = true;
      expect(event.data.clientId).toBe('test');
    });

    const result = await sdk.execute('test', { method: 'test' });
    expect(result).toBe('{"response":"mock response"}');
    expect(requestEventCalled).toBe(true);
  });

  it('should use interceptors', async () => {
    let requestIntercepted = false;

    sdk.interceptors.request.use((config) => {
      requestIntercepted = true;
      return config;
    });

    const result = await sdk.execute('test', { method: 'test' });
    expect(result).toBe('{"response":"mock response"}');
    expect(requestIntercepted).toBe(true);
  });
});
