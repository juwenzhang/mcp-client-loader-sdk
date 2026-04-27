import { McpRegistry } from './McpRegistry';
import { RetryManager } from './RetryManager';
import { EventManager } from './EventManager';
import { InterceptorManager } from './InterceptorManager';
import { CacheManager } from './CacheManager';
import { RateLimiter } from './RateLimiter';
import { MiddlewareManager } from './MiddlewareManager';
import { PluginManager } from './PluginManager';
import type { RetryOptions, EventType, RequestConfig, InterceptorResponse } from '../types/core';
import type { CacheOptions } from '../types/cache';
import type { RateLimitOptions } from '../types/rateLimit';
import type { MiddlewareContext } from '../types/middleware';
import type { McpPlugin, PluginOptions } from '../types/plugin';
import type { ConcurrencyOptions, QueueItem, ConcurrencyStats } from '../types/concurrency';
import type { ExecuteOptions } from '../types';
import { Logger } from '../logger/Logger';

export class McpExecutor {
  private executionQueue = Promise.resolve();
  private retryManager: RetryManager;
  private eventManager: EventManager;
  private interceptorManager: InterceptorManager;
  private cacheManager: CacheManager;
  private rateLimiter: RateLimiter;
  private middlewareManager: MiddlewareManager;
  private pluginManager: PluginManager;
  
  // 并发控制相关属性
  private concurrencyQueue: QueueItem[] = [];
  private currentConcurrency = 0;
  private maxConcurrency = 5;
  private maxQueueLength = 100;
  private overflowStrategy: 'reject' | 'wait' = 'wait';
  private rejectedRequests = 0;
  private processedRequests = 0;

  constructor(
    private registry: McpRegistry,
    private logger: Logger,
    retryOptions?: Partial<RetryOptions>,
    cacheOptions?: CacheOptions,
    rateLimitOptions?: RateLimitOptions,
    plugins?: McpPlugin[],
    concurrencyOptions?: ConcurrencyOptions
  ) {
    this.retryManager = new RetryManager(retryOptions);
    this.eventManager = new EventManager();
    this.interceptorManager = new InterceptorManager();
    this.cacheManager = new CacheManager(cacheOptions);
    this.rateLimiter = new RateLimiter(rateLimitOptions || {
      maxRequests: 10,
      per: 60000
    });
    this.middlewareManager = new MiddlewareManager();
    this.pluginManager = new PluginManager({ plugins });
    
    // 初始化并发控制选项
    if (concurrencyOptions) {
      this.maxConcurrency = concurrencyOptions.maxConcurrency || 5;
      this.maxQueueLength = concurrencyOptions.maxQueueLength || 100;
      this.overflowStrategy = concurrencyOptions.overflowStrategy || 'wait';
    }
  }

  async execute(
    id: string,
    payload: any,
    options: ExecuteOptions = {}
  ): Promise<string> {
    const context: MiddlewareContext = {
      clientId: id,
      payload,
      options
    };

    return this.middlewareManager.execute(context, () => {
      return new Promise((resolve, reject) => {
        // 检查队列长度
        if (this.concurrencyQueue.length >= this.maxQueueLength) {
          if (this.overflowStrategy === 'reject') {
            this.rejectedRequests++;
            const error = new Error('Concurrency queue overflow');
            this.eventManager.emit('concurrency:overflow', { clientId: id, payload, error });
            reject(error);
            return;
          }
        }

        // 创建队列项
        const queueItem: QueueItem = {
          priority: options.priority || 0,
          execute: async () => {
            try {
              const {
                preExecute,
                onChunk,
                afterExecute
              } = options;

              preExecute?.();

              if (!options.skipRateLimit) {
                const result = await this.rateLimiter.tryRequest();
                
                if (!result.allowed) {
                  this.eventManager.emit('rateLimit:hit', {
                    clientId: id,
                    payload,
                    waitTime: result.waitTime
                  });

                  if (result.waitTime > 0) {
                    await this.sleep(result.waitTime);
                  }
                }
              }

              const cacheKey = this.cacheManager.generateKey(id, payload);

              if (!options.noCache) {
                const cached = await this.cacheManager.get<string>(cacheKey);
                if (cached !== null) {
                  this.eventManager.emit('cache:hit', { clientId: id, payload, response: cached });
                  return cached;
                }
              }

              let config: RequestConfig = { clientId: id, payload, options };

              // 执行插件的请求前钩子
              config = await this.pluginManager.executeBeforeRequest(config);
              
              config = await this.interceptorManager.processRequest(config);
              
              // 执行插件的请求后钩子
              config = await this.pluginManager.executeAfterRequest(config);

              this.eventManager.emit('request', {
                clientId: config.clientId,
                payload: config.payload,
                options: config.options
              });

              const result = await this.retryManager.execute(async () => {
                const client = this.registry.getClient(config.clientId);
                if (!client) {
                  throw new Error(`Client ${config.clientId} not found`);
                }

                const defaultParams = this.registry.getDefaultParams(config.clientId) || {};
                const finalPayload = {
                  ...config.payload,
                  params: { ...defaultParams, ...(config.payload.params || {}) },
                };

                let fullText = "";

                const chunkHandler = (line: string) => {
                  try {
                    const obj = JSON.parse(line);
                    if (obj.response) fullText += obj.response;
                    onChunk?.(obj);
                  } catch (e) {}
                };

                const response = await client.send(finalPayload, chunkHandler);
                fullText = typeof response === "string" ? response : JSON.stringify(response);

                return fullText;
              });

              const response: InterceptorResponse = { data: result };
              
              // 执行插件的响应前钩子
              let processedResponse = await this.pluginManager.executeBeforeResponse(response);
              
              processedResponse = await this.interceptorManager.processResponse(processedResponse);
              
              // 执行插件的响应后钩子
              processedResponse = await this.pluginManager.executeAfterResponse(processedResponse);

              if (!options.noCache && this.cacheManager.shouldCache(id, payload, processedResponse.data)) {
                await this.cacheManager.set(cacheKey, processedResponse.data);
                this.eventManager.emit('cache:miss', { clientId: id, payload, response: processedResponse.data });
              }

              this.eventManager.emit('response', {
                clientId: config.clientId,
                payload: config.payload,
                response: processedResponse
              });

              afterExecute?.(processedResponse.data);
              return processedResponse.data;
            } catch (err) {
              const error = err as Error;
              
              let processedError = error;
              
              // 执行插件的错误处理钩子
              processedError = await this.pluginManager.executeOnError(processedError);
              
              processedError = await this.interceptorManager.processError(processedError);

              this.eventManager.emit('error', {
                clientId: id,
                payload,
                error: processedError
              });

              this.logger.error('Execution error', { clientId: id, error: processedError });
              return Promise.reject(processedError);
            } finally {
              this.processedRequests++;
              this.currentConcurrency--;
              this.processQueue();
            }
          },
          resolve,
          reject
        };

        // 将队列项添加到队列中
        this.concurrencyQueue.push(queueItem);

        // 处理队列
        this.processQueue();
      });
    });
  }

  // 处理队列
  private processQueue(): void {
    while (this.currentConcurrency < this.maxConcurrency && this.concurrencyQueue.length > 0) {
      // 找到优先级最高的队列项（优先级越高，值越大）
      let highestPriorityIndex = 0;
      let highestPriority = this.concurrencyQueue[0].priority || 0;
      
      for (let i = 1; i < this.concurrencyQueue.length; i++) {
        const currentPriority = this.concurrencyQueue[i].priority || 0;
        if (currentPriority > highestPriority) {
          highestPriority = currentPriority;
          highestPriorityIndex = i;
        }
      }
      
      // 移除并执行优先级最高的队列项
      const queueItem = this.concurrencyQueue.splice(highestPriorityIndex, 1)[0];
      if (queueItem) {
        this.currentConcurrency++;
        queueItem.execute()
          .then(queueItem.resolve)
          .catch(queueItem.reject);
      }
    }
  }

  clearQueue(): void {
    this.executionQueue = Promise.resolve();
    this.concurrencyQueue = [];
    this.currentConcurrency = 0;
    this.logger.info('Execution queue cleared');
  }

  // 获取并发状态
  getConcurrencyStats(): ConcurrencyStats {
    return {
      currentConcurrency: this.currentConcurrency,
      queueLength: this.concurrencyQueue.length,
      maxConcurrency: this.maxConcurrency,
      maxQueueLength: this.maxQueueLength,
      rejectedRequests: this.rejectedRequests,
      processedRequests: this.processedRequests
    };
  }

  // 更新并发控制选项
  updateConcurrencyOptions(options: ConcurrencyOptions): void {
    if (options.maxConcurrency !== undefined) {
      this.maxConcurrency = options.maxConcurrency;
    }
    if (options.maxQueueLength !== undefined) {
      this.maxQueueLength = options.maxQueueLength;
    }
    if (options.overflowStrategy !== undefined) {
      this.overflowStrategy = options.overflowStrategy;
    }
    
    // 处理队列
    this.processQueue();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRetryManager(): RetryManager {
    return this.retryManager;
  }

  getEventManager(): EventManager {
    return this.eventManager;
  }

  get interceptors() {
    return {
      request: {
        use: (interceptor: any) => this.interceptorManager.useRequest(interceptor)
      },
      response: {
        use: (interceptor: any) => this.interceptorManager.useResponse(interceptor)
      },
      error: {
        use: (interceptor: any) => this.interceptorManager.useError(interceptor)
      },
      clear: () => this.interceptorManager.clear()
    };
  }

  get cache() {
    return {
      get: <T>(key: string) => this.cacheManager.get<T>(key),
      set: <T>(key: string, value: T) => this.cacheManager.set(key, value),
      delete: (key: string) => this.cacheManager.delete(key),
      clear: () => this.cacheManager.clear(),
      getStats: () => this.cacheManager.getStats(),
      updateOptions: (options: Partial<CacheOptions>) => this.cacheManager.updateOptions(options)
    };
  }

  get rateLimit() {
    return {
      tryRequest: () => this.rateLimiter.tryRequest(),
      getStats: () => this.rateLimiter.getStats(),
      updateOptions: (options: Partial<RateLimitOptions>) => this.rateLimiter.updateOptions(options)
    };
  }

  get middleware() {
    return {
      use: (middleware: any) => this.middlewareManager.use(middleware),
      clear: () => this.middlewareManager.clear()
    };
  }

  get plugins() {
    return {
      register: (plugin: McpPlugin) => this.pluginManager.register(plugin),
      unregister: (name: string) => this.pluginManager.unregister(name),
      get: (name: string) => this.pluginManager.getPlugin(name),
      getAll: () => this.pluginManager.getPlugins(),
      configure: (name: string, options: PluginOptions) => this.pluginManager.configure(name, options),
      clear: () => this.pluginManager.destroy()
    };
  }

  get concurrency() {
    return {
      getStats: () => this.getConcurrencyStats(),
      updateOptions: (options: ConcurrencyOptions) => this.updateConcurrencyOptions(options),
      clearQueue: () => this.clearQueue()
    };
  }

  getPluginManager(): PluginManager {
    return this.pluginManager;
  }
}
