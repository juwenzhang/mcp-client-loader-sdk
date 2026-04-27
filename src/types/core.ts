export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff: 'fixed' | 'exponential' | 'linear';
  retryableErrors: string[];
  retryableStatusCodes: number[];
  onRetry?: (attempt: number, error: Error) => void;
}

export type EventType =
  | 'request'
  | 'response'
  | 'error'
  | 'retry'
  | 'client:register'
  | 'client:remove'
  | 'rateLimit:hit'
  | 'cache:hit'
  | 'cache:miss'
  | 'concurrency:overflow';

export interface Event {
  type: EventType;
  timestamp: number;
  data: any;
}

export type EventListener = (event: Event) => void;

export interface RequestConfig {
  clientId: string;
  payload: any;
  options: any;
}

export interface InterceptorResponse {
  data: string;
  status?: number;
  headers?: Record<string, string>;
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor = (response: InterceptorResponse) => InterceptorResponse | Promise<InterceptorResponse>;
export type ErrorInterceptor = (error: Error) => Error | Promise<Error>;

export interface ExecutorResponse {
  data: string;
}
