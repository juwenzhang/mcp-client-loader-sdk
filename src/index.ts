import dotenv from 'dotenv';
import { McpRegistry } from './core/McpRegistry';
import { McpExecutor } from './core/McpExecutor';
import { McpContext } from './core/McpContext';
import { RetryManager } from './core/RetryManager';
import { EventManager } from './core/EventManager';
import { InterceptorManager } from './core/InterceptorManager';
import { CacheManager } from './core/CacheManager';
import { RateLimiter } from './core/RateLimiter';
import { MiddlewareManager } from './core/MiddlewareManager';
import { PluginManager } from './core/PluginManager';
import type { RetryOptions } from './types/core';
import type { EventType, EventListener } from './types/core';
import type { CacheOptions } from './types/cache';
import type { RateLimitOptions } from './types/rateLimit';
import type { MiddlewareFunction } from './types/middleware';
import type { McpPlugin } from './types/plugin';
import type { ConcurrencyOptions } from './types/concurrency';
import { ConfigLoader } from './config/ConfigLoader';
import { Logger } from './logger/Logger';
import { EnvironmentDetector, AdapterFactory } from './adapters';
import { ConfigResolver } from './config/ConfigResolver';
import { ConfigValidator } from './config/ConfigValidator';
import { HttpClient, StdioClient } from './clients';
import type { McpConfig, ExecuteOptions } from './types';

dotenv.config();

export class McpClientLoaderSdk {
  private registry: McpRegistry;
  private executor: McpExecutor;
  private logger: Logger;
  private configLoader: ConfigLoader;
  private context: McpContext;

  private constructor(registry: McpRegistry, executor: McpExecutor, logger: Logger, context: McpContext) {
    this.registry = registry;
    this.executor = executor;
    this.logger = logger;
    this.configLoader = new ConfigLoader();
    this.context = context;
  }

  static async init(options: {
    configPath?: string;
    config?: McpConfig;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    retryOptions?: Partial<RetryOptions>;
    cacheOptions?: CacheOptions;
    rateLimitOptions?: RateLimitOptions;
    plugins?: McpPlugin[];
    concurrencyOptions?: ConcurrencyOptions;
  } = {}): Promise<McpClientLoaderSdk> {
    const logger = new Logger(options.logLevel || 'info');
    const context = new McpContext();
    const registry = new McpRegistry(logger, context.getConfigResolver(), context.getConfigValidator());
    const executor = new McpExecutor(
      registry,
      logger,
      options.retryOptions,
      options.cacheOptions,
      options.rateLimitOptions,
      options.plugins,
      options.concurrencyOptions
    );
    const sdk = new McpClientLoaderSdk(registry, executor, logger, context);

    if (options.configPath) {
      const config = sdk.configLoader.loadFromFile(options.configPath);
      await registry.registerFromConfig(config);
    } else if (options.config) {
      const config = sdk.configLoader.loadFromObject(options.config);
      await registry.registerFromConfig(config);
    }

    return sdk;
  }

  getContext(): McpContext {
    return this.context;
  }

  getEnvironmentDetector(): EnvironmentDetector {
    return this.context.getEnvironmentDetector();
  }

  getAdapterFactory(): AdapterFactory {
    return this.context.getAdapterFactory();
  }

  getConfigResolver(): ConfigResolver {
    return this.context.getConfigResolver();
  }

  getConfigValidator(): ConfigValidator {
    return this.context.getConfigValidator();
  }

  enableRetry(options: Partial<RetryOptions>): void {
    this.executor.getRetryManager().updateOptions(options);
  }

  disableRetry(): void {
    this.executor.getRetryManager().updateOptions({ maxAttempts: 1 });
  }

  on(eventType: EventType, listener: EventListener): void {
    this.executor.getEventManager().on(eventType, listener);
  }

  off(eventType: EventType, listener: EventListener): void {
    this.executor.getEventManager().off(eventType, listener);
  }

  once(eventType: EventType, listener: EventListener): void {
    this.executor.getEventManager().once(eventType, listener);
  }

  removeAllListeners(eventType?: EventType): void {
    this.executor.getEventManager().removeAllListeners(eventType);
  }

  get interceptors() {
    return this.executor.interceptors;
  }

  get cache() {
    return this.executor.cache;
  }

  get rateLimit() {
    return this.executor.rateLimit;
  }

  get middleware() {
    return this.executor.middleware;
  }

  get plugins() {
    return this.executor.plugins;
  }

  get concurrency() {
    return this.executor.concurrency;
  }

  registerPlugin(plugin: McpPlugin): void {
    this.executor.plugins.register(plugin);
  }

  getPlugins(): McpPlugin[] {
    return this.executor.plugins.getAll();
  }

  async execute<T = unknown>(
    id: string,
    payload: any,
    options: ExecuteOptions = {}
  ): Promise<string> {
    return this.executor.execute(id, payload, options);
  }

  async registerClient(id: string, config: any): Promise<void> {
    await this.registry.registerClient(id, config);
  }

  getClient(id: string): any {
    return this.registry.getClient(id);
  }

  removeClient(id: string): void {
    this.registry.removeClient(id);
  }

  getClientIds(): string[] {
    return this.registry.getClientIds();
  }

  clear(): void {
    this.registry.clear();
    this.executor.clearQueue();
  }
}

export {
  McpContext,
  EnvironmentDetector,
  AdapterFactory,
  ConfigResolver,
  ConfigValidator,
  HttpClient,
  StdioClient,
  McpRegistry,
  McpExecutor,
  RetryManager,
  EventManager,
  InterceptorManager,
  CacheManager,
  RateLimiter,
  MiddlewareManager,
  PluginManager,
  Logger,
  ConfigLoader
};

export * from './types';
export * from './adapters/types';
export * from './clients';
