import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InterceptorManager } from '../../src/core/InterceptorManager';

describe('InterceptorManager', () => {
  let interceptorManager: InterceptorManager;

  beforeEach(() => {
    interceptorManager = new InterceptorManager();
  });

  it('should add and execute request interceptors', async () => {
    const interceptor = vi.fn((config) => {
      return { ...config, intercepted: true };
    });

    interceptorManager.useRequest(interceptor);

    const config = { url: 'http://example.com', method: 'GET' };
    const result = await interceptorManager.processRequest(config);

    expect(interceptor).toHaveBeenCalledWith(config);
    expect(result).toEqual({ url: 'http://example.com', method: 'GET', intercepted: true });
  });

  it('should add and execute response interceptors', async () => {
    const interceptor = vi.fn((response) => {
      return { ...response, intercepted: true };
    });

    interceptorManager.useResponse(interceptor);

    const response = { data: 'test', status: 200 };
    const result = await interceptorManager.processResponse(response);

    expect(interceptor).toHaveBeenCalledWith(response);
    expect(result).toEqual({ data: 'test', status: 200, intercepted: true });

  });

  it('should handle interceptor errors', async () => {
    const errorInterceptor = vi.fn(() => {
      throw new Error('Interceptor error');
    });

    interceptorManager.useRequest(errorInterceptor);

    const config = { url: 'http://example.com', method: 'GET' };
    await expect(interceptorManager.processRequest(config)).rejects.toThrow('Interceptor error');
  });

  it('should clear all interceptors', async () => {
    const interceptor = vi.fn((config) => config);

    interceptorManager.useRequest(interceptor);
    interceptorManager.useResponse(interceptor);
    interceptorManager.clear();

    const config = { url: 'http://example.com', method: 'GET' };
    const result = await interceptorManager.processRequest(config);
    expect(result).toEqual(config);
    expect(interceptor).not.toHaveBeenCalled();
  });

  it('should work with multiple interceptors', async () => {
    const interceptor1 = vi.fn((config) => {
      return { ...config, interceptor1: true };
    });

    const interceptor2 = vi.fn((config) => {
      return { ...config, interceptor2: true };
    });

    interceptorManager.useRequest(interceptor1);
    interceptorManager.useRequest(interceptor2);

    const config = { url: 'http://example.com', method: 'GET' };
    const result = await interceptorManager.processRequest(config);

    expect(interceptor1).toHaveBeenCalledWith(config);
    expect(interceptor2).toHaveBeenCalledWith({ ...config, interceptor1: true });
    expect(result).toEqual({ url: 'http://example.com', method: 'GET', interceptor1: true, interceptor2: true });
  });

  it('should handle empty interceptors', async () => {
    const config = { url: 'http://example.com', method: 'GET' };
    const result = await interceptorManager.processRequest(config);
    expect(result).toEqual(config);

    const response = { data: 'test', status: 200 };
    const responseResult = await interceptorManager.processResponse(response);
    expect(responseResult).toEqual(response);
  });

  it('should get interceptors', async () => {
    const interceptor1 = vi.fn((config) => config);
    const interceptor2 = vi.fn((response) => response);
    const interceptor3 = vi.fn((error) => error);

    interceptorManager.useRequest(interceptor1);
    interceptorManager.useResponse(interceptor2);
    interceptorManager.useError(interceptor3);

    expect(interceptorManager.getRequestInterceptors()).toHaveLength(1);
    expect(interceptorManager.getResponseInterceptors()).toHaveLength(1);
    expect(interceptorManager.getErrorInterceptors()).toHaveLength(1);
  });

  it('should handle error interceptors', async () => {
    const errorInterceptor = vi.fn((error) => {
      return new Error('Processed error');
    });

    interceptorManager.useError(errorInterceptor);

    const error = new Error('Original error');
    const result = await interceptorManager.processError(error);

    expect(errorInterceptor).toHaveBeenCalledWith(error);
    expect(result.message).toBe('Processed error');
  });
});
