import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginManager } from '../../src/core/PluginManager';
import type { McpPlugin, PluginOptions } from '../../src/types/plugin';
import type { RequestConfig, InterceptorResponse } from '../../src/types/core';

describe('PluginManager', () => {
  let pluginManager: PluginManager;
  let mockPlugin: McpPlugin;

  beforeEach(() => {
    pluginManager = new PluginManager();
    mockPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      initialize: vi.fn(),
      configure: vi.fn(),
      destroy: vi.fn(),
      beforeRequest: vi.fn((config: RequestConfig) => config),
      afterRequest: vi.fn((config: RequestConfig) => config),
      beforeResponse: vi.fn((response: InterceptorResponse) => response),
      afterResponse: vi.fn((response: InterceptorResponse) => response),
      onError: vi.fn((error: Error) => error)
    };
  });

  it('should register a plugin', () => {
    pluginManager.register(mockPlugin);
    expect(pluginManager.getPlugin('test-plugin')).toBe(mockPlugin);
    expect(mockPlugin.initialize).toHaveBeenCalled();
  });

  it('should throw error when registering a plugin with existing name', () => {
    pluginManager.register(mockPlugin);
    expect(() => pluginManager.register(mockPlugin)).toThrow('Plugin test-plugin already registered');
  });

  it('should unregister a plugin', () => {
    pluginManager.register(mockPlugin);
    pluginManager.unregister('test-plugin');
    expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
    expect(mockPlugin.destroy).toHaveBeenCalled();
  });

  it('should throw error when unregistering a non-existent plugin', () => {
    expect(() => pluginManager.unregister('non-existent')).toThrow('Plugin non-existent not found');
  });

  it('should get all plugins', () => {
    pluginManager.register(mockPlugin);
    const anotherPlugin: McpPlugin = {
      name: 'another-plugin',
      version: '1.0.0'
    };
    pluginManager.register(anotherPlugin);
    const plugins = pluginManager.getPlugins();
    expect(plugins).toHaveLength(2);
    expect(plugins).toContain(mockPlugin);
    expect(plugins).toContain(anotherPlugin);
  });

  it('should configure a plugin', async () => {
    pluginManager.register(mockPlugin);
    const options: PluginOptions = { key: 'value' };
    await pluginManager.configure('test-plugin', options);
    expect(mockPlugin.configure).toHaveBeenCalledWith(options);
  });

  it('should throw error when configuring a non-existent plugin', async () => {
    await expect(pluginManager.configure('non-existent', {})).rejects.toThrow('Plugin non-existent not found');
  });

  it('should execute beforeRequest hook', async () => {
    pluginManager.register(mockPlugin);
    const config: RequestConfig = { clientId: 'test', payload: {}, options: {} };
    const processedConfig = await pluginManager.executeBeforeRequest(config);
    expect(mockPlugin.beforeRequest).toHaveBeenCalledWith(config);
    expect(processedConfig).toBe(config);
  });

  it('should execute afterRequest hook', async () => {
    pluginManager.register(mockPlugin);
    const config: RequestConfig = { clientId: 'test', payload: {}, options: {} };
    const processedConfig = await pluginManager.executeAfterRequest(config);
    expect(mockPlugin.afterRequest).toHaveBeenCalledWith(config);
    expect(processedConfig).toBe(config);
  });

  it('should execute beforeResponse hook', async () => {
    pluginManager.register(mockPlugin);
    const response: InterceptorResponse = { data: 'test' };
    const processedResponse = await pluginManager.executeBeforeResponse(response);
    expect(mockPlugin.beforeResponse).toHaveBeenCalledWith(response);
    expect(processedResponse).toBe(response);
  });

  it('should execute afterResponse hook', async () => {
    pluginManager.register(mockPlugin);
    const response: InterceptorResponse = { data: 'test' };
    const processedResponse = await pluginManager.executeAfterResponse(response);
    expect(mockPlugin.afterResponse).toHaveBeenCalledWith(response);
    expect(processedResponse).toBe(response);
  });

  it('should execute onError hook', async () => {
    pluginManager.register(mockPlugin);
    const error = new Error('test error');
    const processedError = await pluginManager.executeOnError(error);
    expect(mockPlugin.onError).toHaveBeenCalledWith(error);
    expect(processedError).toBe(error);
  });

  it('should destroy all plugins', async () => {
    pluginManager.register(mockPlugin);
    await pluginManager.destroy();
    expect(mockPlugin.destroy).toHaveBeenCalled();
    expect(pluginManager.getPlugins()).toHaveLength(0);
  });

  it('should handle plugins without optional methods', async () => {
    const minimalPlugin: McpPlugin = {
      name: 'minimal-plugin',
      version: '1.0.0'
    };
    pluginManager.register(minimalPlugin);
    
    // Should not throw errors
    const config: RequestConfig = { clientId: 'test', payload: {}, options: {} };
    const response: InterceptorResponse = { data: 'test' };
    const error = new Error('test error');
    
    await expect(pluginManager.executeBeforeRequest(config)).resolves.toBe(config);
    await expect(pluginManager.executeAfterRequest(config)).resolves.toBe(config);
    await expect(pluginManager.executeBeforeResponse(response)).resolves.toBe(response);
    await expect(pluginManager.executeAfterResponse(response)).resolves.toBe(response);
    await expect(pluginManager.executeOnError(error)).resolves.toBe(error);
  });
});
