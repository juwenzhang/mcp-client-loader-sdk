import { StdioOptions, ChildProcess } from 'child_process';

interface CacheOptions {
    ttl?: number;
    maxSize?: number;
    strategy?: 'lru' | 'fifo' | 'lfu';
    keyGenerator?: (clientId: string, payload: any) => string;
    shouldCache?: (clientId: string, payload: any, response: string) => boolean;
}
interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number;
    hits: number;
}

interface RateLimitOptions {
    maxRequests: number;
    per: number;
    algorithm?: 'token-bucket' | 'leaky-bucket' | 'sliding-window';
    queueSize?: number;
    onLimit?: (waitTime: number) => void;
}
interface RateLimitResult {
    allowed: boolean;
    waitTime: number;
    queuePosition?: number;
}

interface MiddlewareContext {
    clientId: string;
    payload: any;
    options: ExecuteOptions;
    response?: string;
    error?: Error;
}
type MiddlewareFunction = (context: MiddlewareContext, next: () => Promise<void>) => Promise<void>;

interface RetryOptions {
    maxAttempts: number;
    delay: number;
    backoff: 'fixed' | 'exponential' | 'linear';
    retryableErrors: string[];
    retryableStatusCodes: number[];
    onRetry?: (attempt: number, error: Error) => void;
}
type EventType = 'request' | 'response' | 'error' | 'retry' | 'client:register' | 'client:remove' | 'rateLimit:hit' | 'cache:hit' | 'cache:miss' | 'concurrency:overflow';
interface Event {
    type: EventType;
    timestamp: number;
    data: any;
}
type EventListener = (event: Event) => void;
interface RequestConfig {
    clientId: string;
    payload: any;
    options: any;
}
interface InterceptorResponse {
    data: string;
    status?: number;
    headers?: Record<string, string>;
}
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (response: InterceptorResponse) => InterceptorResponse | Promise<InterceptorResponse>;
type ErrorInterceptor = (error: Error) => Error | Promise<Error>;
interface ExecutorResponse {
    data: string;
}

type Environment = 'node' | 'browser' | 'react-native' | 'wx-miniprogram' | 'deno' | 'bun' | 'unknown';
interface RequestOptions {
    method: string;
    headers: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
    timeout?: number;
}
interface Response {
    ok: boolean;
    status: number;
    statusText: string;
    text(): Promise<string>;
    json(): Promise<any>;
    body?: ReadableStream<Uint8Array> | null;
}
interface FetchAdapter {
    fetch(url: string, options: RequestOptions): Promise<Response>;
    supportsStreaming(): boolean;
}

/**
 * 这一行主要是为了加载微信小程序的 API 类型定义，确保在小程序环境中可以正常运行类型检查
 */

declare class EnvironmentDetector {
    private readonly environmentChecks;
    detect(): Environment;
    /**
     * 添加自定义环境检测
     * @param check 检测函数
     * @param environment 环境名称
     * @param index 插入位置，默认添加到末尾
     */
    addEnvironmentCheck(check: () => boolean, environment: Environment, index?: number): void;
    /**
     * 移除环境检测
     * @param environment 环境名称
     */
    removeEnvironmentCheck(environment: Environment): void;
}

declare class AdapterFactory {
    private detector;
    constructor();
    private readonly adapterMap;
    createAdapter(env?: Environment): FetchAdapter;
    /**
     * 添加自定义适配器
     * @param environment 环境名称
     * @param factory 适配器创建函数
     */
    addAdapter(environment: Environment, factory: () => FetchAdapter): void;
    /**
     * 移除适配器
     * @param environment 环境名称
     */
    removeAdapter(environment: Environment): void;
    detectEnvironment(): Environment;
}

declare class ConfigResolver {
    private readonly resolvers;
    resolveValue(v: string): string;
    resolveHeaders(headers?: Record<string, string>): Record<string, string>;
    resolveParams(params?: Record<string, any>): Record<string, any>;
    resolveArgs(args?: string[]): string[];
    resolveEnv(env?: Record<string, string>): Record<string, string>;
    resolve(config: any): any;
    /**
     * 添加自定义解析器
     * @param key 解析器键
     * @param resolver 解析器函数
     */
    addResolver(key: string, resolver: (value: any) => any): void;
    /**
     * 移除自定义解析器
     * @param key 解析器键
     */
    removeResolver(key: string): void;
}

declare class ConfigValidator {
    private readonly validationRules;
    validate(config: any): asserts config is McpConfig;
    validateServerConfig(id: string, config: any): asserts config is McpServerConfig;
    /**
     * 添加验证规则
     * @param field 字段名
     * @param rule 验证规则
     */
    addValidationRule(field: string, rule: {
        type?: string | string[];
        required?: boolean;
        dependsOn?: {
            field: string;
            value: any;
        };
    }): void;
    /**
     * 移除验证规则
     * @param field 字段名
     */
    removeValidationRule(field: string): void;
}

declare class McpContext {
    private environmentDetector;
    private adapterFactory;
    private configResolver;
    private configValidator;
    constructor();
    getEnvironmentDetector(): EnvironmentDetector;
    getAdapterFactory(): AdapterFactory;
    getConfigResolver(): ConfigResolver;
    getConfigValidator(): ConfigValidator;
}

type PluginLifecycleEvent = 'initialize' | 'configure' | 'destroy';
type PluginHookEvent = 'beforeRequest' | 'afterRequest' | 'beforeResponse' | 'afterResponse' | 'onError';
interface PluginOptions {
    [key: string]: any;
}
interface PluginContext {
    context: McpContext;
    options: PluginOptions;
}
interface McpPlugin {
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
interface PluginManagerOptions {
    plugins?: McpPlugin[];
}

interface ConcurrencyOptions {
    maxConcurrency?: number;
    maxQueueLength?: number;
    overflowStrategy?: 'reject' | 'wait';
}
interface ConcurrencyStats {
    currentConcurrency: number;
    queueLength: number;
    maxConcurrency: number;
    maxQueueLength: number;
    rejectedRequests: number;
    processedRequests: number;
}
interface QueueItem {
    execute: () => Promise<any>;
    priority?: number;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

interface McpServerConfig {
    url?: string;
    transport: 'streamable-http' | 'stdio';
    headers?: Record<string, string>;
    timeout?: number;
    retry?: number;
    enabled?: boolean;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    cwd?: string;
    defaultParams?: Record<string, any>;
}
interface McpConfig {
    mcpServers: Record<string, McpServerConfig>;
}
interface ExecuteOptions {
    isRegisterClients?: boolean;
    preExecute?: () => void;
    onChunk?: (chunkObj: Record<string, any>) => void;
    afterExecute?: (fullText: string) => void;
    skipRateLimit?: boolean;
    noCache?: boolean;
    priority?: number;
}
interface McpClient$1 {
    send(payload: unknown, onChunk?: (line: string) => void): Promise<string>;
    /**
     * 关闭客户端，清理资源
     * 可选实现
     */
    close?(): void;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogFormat = 'json' | 'text';
declare class Logger {
    private level;
    private format;
    constructor(level?: LogLevel, format?: LogFormat);
    private shouldLog;
    private log;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
}

declare class McpRegistry {
    private logger;
    private clients;
    private resolver;
    private validator;
    constructor(logger: Logger, resolver: ConfigResolver, validator: ConfigValidator);
    registerFromConfig(config: McpConfig): Promise<void>;
    registerClient(id: string, cfg: McpServerConfig): Promise<void>;
    getClient(id: string): any;
    getDefaultParams(id: string): any;
    removeClient(id: string): void;
    getClientIds(): string[];
    clear(): void;
}

declare class RetryManager {
    private options;
    constructor(options?: Partial<RetryOptions>);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    private isRetryable;
    private calculateDelay;
    private sleep;
    getOptions(): RetryOptions;
    updateOptions(options: Partial<RetryOptions>): void;
}

declare class EventManager {
    private listeners;
    on(eventType: EventType, listener: EventListener): void;
    off(eventType: EventType, listener: EventListener): void;
    once(eventType: EventType, listener: EventListener): void;
    emit(eventType: EventType, data: any): void;
    removeAllListeners(eventType?: EventType): void;
    getListenerCount(eventType: EventType): number;
    hasListener(eventType: EventType, listener: EventListener): boolean;
}

declare class PluginManager {
    private plugins;
    private context;
    constructor(options?: PluginManagerOptions);
    register(plugin: McpPlugin): void;
    unregister(name: string): void;
    getPlugins(): McpPlugin[];
    getPlugin(name: string): McpPlugin | undefined;
    configure(name: string, options: PluginOptions): Promise<void>;
    executeBeforeRequest(config: RequestConfig): Promise<RequestConfig>;
    executeAfterRequest(config: RequestConfig): Promise<RequestConfig>;
    executeBeforeResponse(response: InterceptorResponse): Promise<InterceptorResponse>;
    executeAfterResponse(response: InterceptorResponse): Promise<InterceptorResponse>;
    executeOnError(error: Error): Promise<Error>;
    destroy(): Promise<void>;
}

declare class McpExecutor {
    private registry;
    private logger;
    private executionQueue;
    private retryManager;
    private eventManager;
    private interceptorManager;
    private cacheManager;
    private rateLimiter;
    private middlewareManager;
    private pluginManager;
    private concurrencyQueue;
    private currentConcurrency;
    private maxConcurrency;
    private maxQueueLength;
    private overflowStrategy;
    private rejectedRequests;
    private processedRequests;
    constructor(registry: McpRegistry, logger: Logger, retryOptions?: Partial<RetryOptions>, cacheOptions?: CacheOptions, rateLimitOptions?: RateLimitOptions, plugins?: McpPlugin[], concurrencyOptions?: ConcurrencyOptions);
    execute(id: string, payload: any, options?: ExecuteOptions): Promise<string>;
    private processQueue;
    clearQueue(): void;
    getConcurrencyStats(): ConcurrencyStats;
    updateConcurrencyOptions(options: ConcurrencyOptions): void;
    private sleep;
    getRetryManager(): RetryManager;
    getEventManager(): EventManager;
    get interceptors(): {
        request: {
            use: (interceptor: any) => void;
        };
        response: {
            use: (interceptor: any) => void;
        };
        error: {
            use: (interceptor: any) => void;
        };
        clear: () => void;
    };
    get cache(): {
        get: <T>(key: string) => Promise<T | null>;
        set: <T>(key: string, value: T) => Promise<void>;
        delete: (key: string) => Promise<void>;
        clear: () => Promise<void>;
        getStats: () => {
            size: number;
            maxSize: number;
            hits: number;
            misses: number;
            entries: {
                key: string;
                hits: number;
                age: number;
            }[];
        };
        updateOptions: (options: Partial<CacheOptions>) => void;
    };
    get rateLimit(): {
        tryRequest: () => Promise<RateLimitResult>;
        getStats: () => {
            algorithm: "token-bucket" | "leaky-bucket" | "sliding-window";
            maxRequests: number;
            per: number;
            queueSize: number;
            queueCapacity: number;
        };
        updateOptions: (options: Partial<RateLimitOptions>) => void;
    };
    get middleware(): {
        use: (middleware: any) => void;
        clear: () => void;
    };
    get plugins(): {
        register: (plugin: McpPlugin) => void;
        unregister: (name: string) => void;
        get: (name: string) => McpPlugin | undefined;
        getAll: () => McpPlugin[];
        configure: (name: string, options: PluginOptions) => Promise<void>;
        clear: () => Promise<void>;
    };
    get concurrency(): {
        getStats: () => ConcurrencyStats;
        updateOptions: (options: ConcurrencyOptions) => void;
        clearQueue: () => void;
    };
    getPluginManager(): PluginManager;
}

declare class InterceptorManager {
    private requestInterceptors;
    private responseInterceptors;
    private errorInterceptors;
    useRequest(interceptor: RequestInterceptor): void;
    useResponse(interceptor: ResponseInterceptor): void;
    useError(interceptor: ErrorInterceptor): void;
    processRequest(config: RequestConfig): Promise<RequestConfig>;
    processResponse(response: InterceptorResponse): Promise<InterceptorResponse>;
    processError(error: Error): Promise<Error>;
    clear(): void;
    getRequestInterceptors(): RequestInterceptor[];
    getResponseInterceptors(): ResponseInterceptor[];
    getErrorInterceptors(): ErrorInterceptor[];
}

declare class CacheManager {
    private cache;
    private options;
    private accessOrder;
    private misses;
    constructor(options?: CacheOptions);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    generateKey(clientId: string, payload: any): string;
    shouldCache(clientId: string, payload: any, response: string): boolean;
    private evict;
    private updateAccessOrder;
    getStats(): {
        size: number;
        maxSize: number;
        hits: number;
        misses: number;
        entries: {
            key: string;
            hits: number;
            age: number;
        }[];
    };
    updateOptions(options: Partial<CacheOptions>): void;
}

declare class RateLimiter {
    private options;
    private bucket?;
    private slidingWindow?;
    private requestQueue;
    private isProcessing;
    constructor(options: RateLimitOptions);
    private initAlgorithm;
    tryRequest(): Promise<RateLimitResult>;
    processQueue(): Promise<void>;
    private sleep;
    getStats(): {
        algorithm: "token-bucket" | "leaky-bucket" | "sliding-window";
        maxRequests: number;
        per: number;
        queueSize: number;
        queueCapacity: number;
    };
    updateOptions(options: Partial<RateLimitOptions>): void;
}

declare class MiddlewareManager {
    private middlewares;
    use(middleware: MiddlewareFunction): void;
    execute(context: MiddlewareContext, handler: () => Promise<string>): Promise<string>;
    clear(): void;
    getMiddlewares(): MiddlewareFunction[];
}

declare class ConfigLoader {
    private resolver;
    private validator;
    constructor();
    loadFromFile(configPath: string): McpConfig;
    loadFromObject(config: McpConfig): McpConfig;
}

declare abstract class McpClient implements McpClient$1 {
    abstract send(payload: unknown, onChunk?: (line: string) => void): Promise<string>;
    /**
     * 关闭客户端，清理资源
     */
    close(): void;
}

type HttpHeaders = Record<string, string>;
interface HttpClientOptions {
    url: string;
    headers?: HttpHeaders;
    timeout?: number;
    adapter?: FetchAdapter;
    environment?: Environment;
}
declare class HttpClient extends McpClient {
    private adapter;
    private url;
    private headers;
    private timeout;
    constructor(options: HttpClientOptions);
    send(payload: unknown, onChunk?: (line: string) => void): Promise<string>;
    private handleStreaming;
    private handlePolling;
    private delay;
}

interface StdioClientOptions {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    cwd?: string;
    timeout?: number;
    autoRestart?: boolean;
    restartAttempts?: number;
    restartDelay?: number;
    encoding?: 'utf8' | 'buffer';
    stdio?: StdioOptions;
}
declare class StdioClient extends McpClient {
    private options;
    private process;
    private restartCount;
    private isRestarting;
    constructor(options: StdioClientOptions);
    send(payload: unknown, onChunk?: (line: string) => void): Promise<string>;
    private handleProcessError;
    private killProcess;
    start(): void;
    stop(): void;
    isRunning(): boolean;
    getProcess(): ChildProcess | null;
}

declare class McpClientLoaderSdk {
    private registry;
    private executor;
    private logger;
    private configLoader;
    private context;
    private constructor();
    static init(options?: {
        configPath?: string;
        config?: McpConfig;
        logLevel?: 'debug' | 'info' | 'warn' | 'error';
        retryOptions?: Partial<RetryOptions>;
        cacheOptions?: CacheOptions;
        rateLimitOptions?: RateLimitOptions;
        plugins?: McpPlugin[];
        concurrencyOptions?: ConcurrencyOptions;
    }): Promise<McpClientLoaderSdk>;
    getContext(): McpContext;
    getEnvironmentDetector(): EnvironmentDetector;
    getAdapterFactory(): AdapterFactory;
    getConfigResolver(): ConfigResolver;
    getConfigValidator(): ConfigValidator;
    enableRetry(options: Partial<RetryOptions>): void;
    disableRetry(): void;
    on(eventType: EventType, listener: EventListener): void;
    off(eventType: EventType, listener: EventListener): void;
    once(eventType: EventType, listener: EventListener): void;
    removeAllListeners(eventType?: EventType): void;
    get interceptors(): {
        request: {
            use: (interceptor: any) => void;
        };
        response: {
            use: (interceptor: any) => void;
        };
        error: {
            use: (interceptor: any) => void;
        };
        clear: () => void;
    };
    get cache(): {
        get: <T>(key: string) => Promise<T | null>;
        set: <T>(key: string, value: T) => Promise<void>;
        delete: (key: string) => Promise<void>;
        clear: () => Promise<void>;
        getStats: () => {
            size: number;
            maxSize: number;
            hits: number;
            misses: number;
            entries: {
                key: string;
                hits: number;
                age: number;
            }[];
        };
        updateOptions: (options: Partial<CacheOptions>) => void;
    };
    get rateLimit(): {
        tryRequest: () => Promise<RateLimitResult>;
        getStats: () => {
            algorithm: "token-bucket" | "leaky-bucket" | "sliding-window";
            maxRequests: number;
            per: number;
            queueSize: number;
            queueCapacity: number;
        };
        updateOptions: (options: Partial<RateLimitOptions>) => void;
    };
    get middleware(): {
        use: (middleware: any) => void;
        clear: () => void;
    };
    get plugins(): {
        register: (plugin: McpPlugin) => void;
        unregister: (name: string) => void;
        get: (name: string) => McpPlugin | undefined;
        getAll: () => McpPlugin[];
        configure: (name: string, options: PluginOptions) => Promise<void>;
        clear: () => Promise<void>;
    };
    get concurrency(): {
        getStats: () => ConcurrencyStats;
        updateOptions: (options: ConcurrencyOptions) => void;
        clearQueue: () => void;
    };
    registerPlugin(plugin: McpPlugin): void;
    getPlugins(): McpPlugin[];
    execute<T = unknown>(id: string, payload: any, options?: ExecuteOptions): Promise<string>;
    registerClient(id: string, config: any): Promise<void>;
    getClient(id: string): any;
    removeClient(id: string): void;
    getClientIds(): string[];
    clear(): void;
}

export { AdapterFactory, type CacheEntry, CacheManager, type CacheOptions, type ConcurrencyOptions, type ConcurrencyStats, ConfigLoader, ConfigResolver, ConfigValidator, type Environment, EnvironmentDetector, type ErrorInterceptor, type Event, type EventListener, EventManager, type EventType, type ExecuteOptions, type ExecutorResponse, type FetchAdapter, HttpClient, InterceptorManager, type InterceptorResponse, Logger, type McpClient$1 as McpClient, McpClientLoaderSdk, type McpConfig, McpContext, McpExecutor, type McpPlugin, McpRegistry, type McpServerConfig, type MiddlewareContext, type MiddlewareFunction, MiddlewareManager, type PluginContext, type PluginHookEvent, type PluginLifecycleEvent, PluginManager, type PluginManagerOptions, type PluginOptions, type QueueItem, type RateLimitOptions, type RateLimitResult, RateLimiter, type RequestConfig, type RequestInterceptor, type RequestOptions, type Response, type ResponseInterceptor, RetryManager, type RetryOptions, StdioClient };
