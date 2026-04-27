import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '../../src/core/RateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequests: 5,
      per: 1000,
      algorithm: 'token-bucket'
    });
  });

  it('should allow requests under limit', async () => {
    for (let i = 0; i < 5; i++) {
      const result = await rateLimiter.tryRequest();
      expect(result.allowed).toBe(true);
    }
  });

  it('should limit requests over limit', async () => {
    // Consume all tokens
    for (let i = 0; i < 5; i++) {
      await rateLimiter.tryRequest();
    }

    // This should be limited
    const result = await rateLimiter.tryRequest();
    expect(result.allowed).toBe(false);
    expect(result.waitTime).toBeGreaterThan(0);
  });

  it('should use token-bucket algorithm', async () => {
    const tokenBucketLimiter = new RateLimiter({
      maxRequests: 2,
      per: 1000,
      algorithm: 'token-bucket'
    });

    // Consume all tokens
    await tokenBucketLimiter.tryRequest();
    await tokenBucketLimiter.tryRequest();

    // This should be limited
    const result1 = await tokenBucketLimiter.tryRequest();
    expect(result1.allowed).toBe(false);

    // Wait for tokens to refill
    await new Promise(resolve => setTimeout(resolve, 500));

    // This should be allowed now
    const result2 = await tokenBucketLimiter.tryRequest();
    expect(result2.allowed).toBe(true);
  });

  it('should use sliding-window algorithm', async () => {
    const slidingWindowLimiter = new RateLimiter({
      maxRequests: 2,
      per: 1000,
      algorithm: 'sliding-window'
    });

    // Consume all slots
    await slidingWindowLimiter.tryRequest();
    await slidingWindowLimiter.tryRequest();

    // This should be limited
    const result1 = await slidingWindowLimiter.tryRequest();
    expect(result1.allowed).toBe(false);

    // Wait for window to slide
    await new Promise(resolve => setTimeout(resolve, 1000));

    // This should be allowed now
    const result2 = await slidingWindowLimiter.tryRequest();
    expect(result2.allowed).toBe(true);
  });

  it('should use leaky-bucket algorithm', async () => {
    const leakyBucketLimiter = new RateLimiter({
      maxRequests: 2,
      per: 1000,
      algorithm: 'leaky-bucket'
    });

    // Consume all slots
    await leakyBucketLimiter.tryRequest();
    await leakyBucketLimiter.tryRequest();

    // This should be limited
    const result1 = await leakyBucketLimiter.tryRequest();
    expect(result1.allowed).toBe(false);

    // Wait for bucket to leak
    await new Promise(resolve => setTimeout(resolve, 500));

    // This should be allowed now
    const result2 = await leakyBucketLimiter.tryRequest();
    expect(result2.allowed).toBe(true);
  });

  it('should call onLimit callback when limited', async () => {
    const onLimitSpy = vi.fn();
    const limiter = new RateLimiter({
      maxRequests: 1,
      per: 1000,
      onLimit: onLimitSpy
    });

    // Consume the only token
    await limiter.tryRequest();

    // This should trigger onLimit
    await limiter.tryRequest();
    expect(onLimitSpy).toHaveBeenCalled();
  });

  it('should handle queueing when queue is enabled', async () => {
    const limiter = new RateLimiter({
      maxRequests: 1,
      per: 100,
      queueSize: 1
    });

    // Consume the only token
    await limiter.tryRequest();

    // This should go to queue and eventually resolve
    const resultPromise = limiter.tryRequest();

    // Wait for queue to process
    await new Promise(resolve => setTimeout(resolve, 150));

    // Process queue
    await limiter.processQueue();

    // Get the result
    const result = await resultPromise;
    expect(result.allowed).toBe(true);
  });

  it('should get rate limit stats', async () => {
    await rateLimiter.tryRequest();
    await rateLimiter.tryRequest();

    const stats = rateLimiter.getStats();
    expect(stats.maxRequests).toBe(5);
    expect(stats.per).toBe(1000);
    expect(stats.algorithm).toBe('token-bucket');
  });

  it('should update options', async () => {
    // Initial limit is 5
    for (let i = 0; i < 5; i++) {
      await rateLimiter.tryRequest();
    }

    // This should be limited
    let result = await rateLimiter.tryRequest();
    expect(result.allowed).toBe(false);

    // Update to higher limit
    rateLimiter.updateOptions({ maxRequests: 10 });

    // This should be allowed now
    result = await rateLimiter.tryRequest();
    expect(result.allowed).toBe(true);
  });
});
