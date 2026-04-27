import type { RetryOptions } from '../types/core';

export class RetryManager {
  private options: RetryOptions;

  constructor(options: Partial<RetryOptions> = {}) {
    this.options = {
      maxAttempts: 3,
      delay: 1000,
      backoff: 'exponential',
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'],
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      ...options
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.options.maxAttempts && this.isRetryable(error)) {
          const delay = this.calculateDelay(attempt);
          this.options.onRetry?.(attempt, lastError);
          await this.sleep(delay);
        } else {
          throw lastError;
        }
      }
    }

    throw lastError!;
  }

  private isRetryable(error: any): boolean {
    if (error.code && this.options.retryableErrors.includes(error.code)) {
      return true;
    }
    if (error.response?.status && this.options.retryableStatusCodes.includes(error.response.status)) {
      return true;
    }
    return false;
  }

  private calculateDelay(attempt: number): number {
    switch (this.options.backoff) {
      case 'fixed':
        return this.options.delay;
      case 'linear':
        return this.options.delay * attempt;
      case 'exponential':
        return this.options.delay * Math.pow(2, attempt - 1);
      default:
        return this.options.delay;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getOptions(): RetryOptions {
    return { ...this.options };
  }

  updateOptions(options: Partial<RetryOptions>): void {
    this.options = { ...this.options, ...options };
  }
}
