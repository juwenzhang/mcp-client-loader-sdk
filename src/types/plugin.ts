import type { McpContext } from '../core/McpContext';
import type { RequestConfig, InterceptorResponse } from './core';

export type PluginLifecycleEvent = 'initialize' | 'configure' | 'destroy';

export type PluginHookEvent = 'beforeRequest' | 'afterRequest' | 'beforeResponse' | 'afterResponse' | 'onError';

export interface PluginOptions {
  [key: string]: any;
}

export interface PluginContext {
  context: McpContext;
  options: PluginOptions;
}

export interface McpPlugin {
  name: string;
  version: string;
  initialize?(context: PluginContext): Promise<void> | void;
  configure?(options: PluginOptions): Promise<void> | void;
  destroy?(): Promise<void> | void;
  beforeRequest?(config: RequestConfig): Promise<RequestConfig> | RequestConfig;
  afterRequest?(config: RequestConfig): Promise<RequestConfig> | RequestConfig;
  beforeResponse?(response: InterceptorResponse): Promise<InterceptorResponse> | InterceptorResponse;
  afterResponse?(response: InterceptorResponse): Promise<InterceptorResponse> | InterceptorResponse;
  onError?(error: Error): Promise<Error> | Error;
}

export interface PluginManagerOptions {
  plugins?: McpPlugin[];
}
