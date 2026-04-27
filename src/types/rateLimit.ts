export interface RateLimitOptions {
  maxRequests: number;
  per: number;
  algorithm?: 'token-bucket' | 'leaky-bucket' | 'sliding-window';
  queueSize?: number;
  onLimit?: (waitTime: number) => void;
}

export interface RateLimitResult {
  allowed: boolean;
  waitTime: number;
  queuePosition?: number;
}
