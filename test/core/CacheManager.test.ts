import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheManager } from '../../src/core/CacheManager';

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager({
      ttl: 1000,
      maxSize: 5,
      strategy: 'lru'
    });
  });

  it('should set and get value', async () => {
    const key = 'test-key';
    const value = 'test-value';

    await cacheManager.set(key, value);
    const result = await cacheManager.get<string>(key);

    expect(result).toBe(value);
  });

  it('should return null for non-existent key', async () => {
    const result = await cacheManager.get<string>('non-existent-key');
    expect(result).toBeNull();
  });

  it('should evict expired items', async () => {
    const key = 'test-key';
    const value = 'test-value';

    await cacheManager.set(key, value);
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    const result = await cacheManager.get<string>(key);
    expect(result).toBeNull();
  });

  it('should evict items when max size is reached', async () => {
    // Set 6 items (maxSize is 5)
    for (let i = 1; i <= 6; i++) {
      await cacheManager.set(`key-${i}`, `value-${i}`);
    }

    // The first item should be evicted
    const result = await cacheManager.get<string>('key-1');
    expect(result).toBeNull();

    // The last item should still exist
    const result6 = await cacheManager.get<string>('key-6');
    expect(result6).toBe('value-6');
  });

  it('should use custom key generator', async () => {
    const customCacheManager = new CacheManager({
      keyGenerator: (clientId, payload) => {
        return `${clientId}:${payload.id}`;
      }
    });

    const key = customCacheManager.generateKey('service', { id: 1, data: 'test' });
    await customCacheManager.set(key, 'test');
    const result = await customCacheManager.get<string>(key);
    expect(result).toBe('test');
  });

  it('should respect shouldCache function', async () => {
    const customCacheManager = new CacheManager({
      shouldCache: (clientId, payload, response) => {
        return payload.method === 'GET';
      }
    });

    // Test shouldCache function directly
    const shouldCacheGet = customCacheManager.shouldCache('service', { method: 'GET' }, 'response');
    expect(shouldCacheGet).toBe(true);

    const shouldCachePost = customCacheManager.shouldCache('service', { method: 'POST' }, 'response');
    expect(shouldCachePost).toBe(false);
  });

  it('should clear cache', async () => {
    await cacheManager.set('key1', 'value1');
    await cacheManager.set('key2', 'value2');

    await cacheManager.clear();

    const result1 = await cacheManager.get<string>('key1');
    const result2 = await cacheManager.get<string>('key2');

    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it('should get cache stats', async () => {
    await cacheManager.set('key1', 'value1');
    await cacheManager.get<string>('key1');
    await cacheManager.get<string>('key1');

    const stats = cacheManager.getStats();
    expect(stats.size).toBe(1);
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(0);
  });

  it('should update options', async () => {
    // Create cache with short TTL
    const shortCacheManager = new CacheManager({ ttl: 500 });
    await shortCacheManager.set('key1', 'value1');
    
    // Wait for it to expire
    await new Promise(resolve => setTimeout(resolve, 600));
    let result = await shortCacheManager.get<string>('key1');
    expect(result).toBeNull();
    
    // Create cache with longer TTL
    const longCacheManager = new CacheManager({ ttl: 2000 });
    await longCacheManager.set('key1', 'value1');
    
    // Wait but not long enough to expire
    await new Promise(resolve => setTimeout(resolve, 600));
    result = await longCacheManager.get<string>('key1');
    expect(result).toBe('value1');
  });
});
