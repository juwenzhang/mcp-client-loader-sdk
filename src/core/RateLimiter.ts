import type { RateLimitOptions, RateLimitResult } from '../types/rateLimit';

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  tryConsume(tokens: number): { allowed: boolean; waitTime: number } {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return { allowed: true, waitTime: 0 };
    }

    const waitTime = ((tokens - this.tokens) / this.refillRate);
    return { allowed: false, waitTime };
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

class SlidingWindow {
  private requests: number[] = [];

  constructor(
    private maxRequests: number,
    private windowSize: number
  ) {}

  tryRequest(): { allowed: boolean; waitTime: number } {
    const now = Date.now();

    this.requests = this.requests.filter(
      time => now - time < this.windowSize
    );

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return { allowed: true, waitTime: 0 };
    }

    const oldestRequest = this.requests[0];
    const waitTime = this.windowSize - (now - oldestRequest);

    return { allowed: false, waitTime };
  }
}

export class RateLimiter {
  private options: Required<RateLimitOptions>;
  private bucket?: TokenBucket;
  private slidingWindow?: SlidingWindow;
  private requestQueue: Array<() => void> = [];
  private isProcessing = false;

  constructor(options: RateLimitOptions) {
    this.options = {
      algorithm: 'token-bucket',
      queueSize: 0,
      onLimit: () => {},
      ...options
    };

    this.initAlgorithm();
  }

  private initAlgorithm(): void {
    switch (this.options.algorithm) {
      case 'token-bucket':
        this.bucket = new TokenBucket(
          this.options.maxRequests,
          this.options.maxRequests / this.options.per
        );
        break;
      case 'sliding-window':
        this.slidingWindow = new SlidingWindow(
          this.options.maxRequests,
          this.options.per
        );
        break;
      case 'leaky-bucket':
        this.bucket = new TokenBucket(
          this.options.maxRequests,
          this.options.maxRequests / this.options.per
        );
        break;
    }
  }

  async tryRequest(): Promise<RateLimitResult> {
    let result: RateLimitResult;

    switch (this.options.algorithm) {
      case 'token-bucket':
      case 'leaky-bucket':
        result = this.bucket!.tryConsume(1);
        break;
      case 'sliding-window':
        result = this.slidingWindow!.tryRequest();
        break;
      default:
        result = { allowed: true, waitTime: 0 };
    }

    if (!result.allowed) {
      this.options.onLimit(result.waitTime);

      if (this.options.queueSize > 0 && this.requestQueue.length < this.options.queueSize) {
        return new Promise((resolve) => {
          this.requestQueue.push(() => {
            resolve({ allowed: true, waitTime: 0 });
          });
        });
      }
    }

    return result;
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const result = await this.tryRequest();

      if (result.allowed) {
        const callback = this.requestQueue.shift();
        callback?.();
      } else {
        await this.sleep(result.waitTime);
      }
    }

    this.isProcessing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      algorithm: this.options.algorithm,
      maxRequests: this.options.maxRequests,
      per: this.options.per,
      queueSize: this.requestQueue.length,
      queueCapacity: this.options.queueSize
    };
  }

  updateOptions(options: Partial<RateLimitOptions>): void {
    this.options = { ...this.options, ...options };
    this.initAlgorithm();
  }
}
