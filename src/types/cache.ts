export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'lfu';
  keyGenerator?: (clientId: string, payload: any) => string;
  shouldCache?: (clientId: string, payload: any, response: string) => boolean;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}
