import type { CacheOptions, CacheEntry } from '../types/cache';

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private options: Required<CacheOptions>;
  private accessOrder: string[];
  private misses: number = 0;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 60000,
      maxSize: 100,
      strategy: 'lru',
      keyGenerator: (clientId, payload) => {
        return `${clientId}:${JSON.stringify(payload)}`;
      },
      shouldCache: () => true,
      ...options
    };
    this.cache = new Map();
    this.accessOrder = [];
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.updateAccessOrder(key, false);
      this.misses++;
      return null;
    }

    this.updateAccessOrder(key, true);
    entry.hits++;

    return entry.value;
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (this.cache.size >= this.options.maxSize) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: this.options.ttl,
      hits: 0
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key, true);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.updateAccessOrder(key, false);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder = [];
  }

  generateKey(clientId: string, payload: any): string {
    return this.options.keyGenerator(clientId, payload);
  }

  shouldCache(clientId: string, payload: any, response: string): boolean {
    return this.options.shouldCache(clientId, payload, response);
  }

  private evict(): void {
    switch (this.options.strategy) {
      case 'lru':
        const lruKey = this.accessOrder[0];
        if (lruKey) {
          this.cache.delete(lruKey);
          this.accessOrder.shift();
        }
        break;
      case 'fifo':
        const fifoKey = this.accessOrder[0];
        if (fifoKey) {
          this.cache.delete(fifoKey);
          this.accessOrder.shift();
        }
        break;
      case 'lfu':
        let lfuKey: string | null = null;
        let minHits = Infinity;
        for (const [key, entry] of this.cache.entries()) {
          if (entry.hits < minHits) {
            minHits = entry.hits;
            lfuKey = key;
          }
        }
        if (lfuKey) {
          this.cache.delete(lfuKey);
          this.updateAccessOrder(lfuKey, false);
        }
        break;
    }
  }

  private updateAccessOrder(key: string, isAccess: boolean): void {
    if (isAccess) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      this.accessOrder.push(key);
    } else {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hits: Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0),
      misses: this.misses,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp
      }))
    };
  }

  updateOptions(options: Partial<CacheOptions>): void {
    this.options = { ...this.options, ...options };
  }
}
