import type { McpPlugin, PluginContext, PluginOptions, PluginManagerOptions } from '../types/plugin';
import type { RequestConfig, InterceptorResponse } from '../types/core';
import { McpContext } from './McpContext';

export class PluginManager {
  private plugins: Map<string, McpPlugin> = new Map();
  private context: McpContext;

  constructor(options: PluginManagerOptions = {}) {
    this.context = new McpContext();
    
    if (options.plugins) {
      for (const plugin of options.plugins) {
        this.register(plugin);
      }
    }
  }

  register(plugin: McpPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }

    this.plugins.set(plugin.name, plugin);
    
    if (plugin.initialize) {
      const pluginContext: PluginContext = {
        context: this.context,
        options: {}
      };
      plugin.initialize(pluginContext);
    }
  }

  unregister(name: string): void {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (plugin.destroy) {
      plugin.destroy();
    }

    this.plugins.delete(name);
  }

  getPlugins(): McpPlugin[] {
    return Array.from(this.plugins.values());
  }

  getPlugin(name: string): McpPlugin | undefined {
    return this.plugins.get(name);
  }

  async configure(name: string, options: PluginOptions): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (plugin.configure) {
      await plugin.configure(options);
    }
  }

  async executeBeforeRequest(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;
    
    for (const plugin of this.plugins.values()) {
      if (plugin.beforeRequest) {
        processedConfig = await plugin.beforeRequest(processedConfig);
      }
    }

    return processedConfig;
  }

  async executeAfterRequest(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;
    
    for (const plugin of this.plugins.values()) {
      if (plugin.afterRequest) {
        processedConfig = await plugin.afterRequest(processedConfig);
      }
    }

    return processedConfig;
  }

  async executeBeforeResponse(response: InterceptorResponse): Promise<InterceptorResponse> {
    let processedResponse = response;
    
    for (const plugin of this.plugins.values()) {
      if (plugin.beforeResponse) {
        processedResponse = await plugin.beforeResponse(processedResponse);
      }
    }

    return processedResponse;
  }

  async executeAfterResponse(response: InterceptorResponse): Promise<InterceptorResponse> {
    let processedResponse = response;
    
    for (const plugin of this.plugins.values()) {
      if (plugin.afterResponse) {
        processedResponse = await plugin.afterResponse(processedResponse);
      }
    }

    return processedResponse;
  }

  async executeOnError(error: Error): Promise<Error> {
    let processedError = error;
    
    for (const plugin of this.plugins.values()) {
      if (plugin.onError) {
        processedError = await plugin.onError(processedError);
      }
    }

    return processedError;
  }

  async destroy(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.destroy) {
        await plugin.destroy();
      }
    }
    this.plugins.clear();
  }
}
