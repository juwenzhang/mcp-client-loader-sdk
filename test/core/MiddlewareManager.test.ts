import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MiddlewareManager } from '../../src/core/MiddlewareManager';

describe('MiddlewareManager', () => {
  let middlewareManager: MiddlewareManager;

  beforeEach(() => {
    middlewareManager = new MiddlewareManager();
  });

  it('should execute middleware in order', async () => {
    const order: number[] = [];

    middlewareManager.use(async (ctx, next) => {
      order.push(1);
      await next();
      order.push(4);
    });

    middlewareManager.use(async (ctx, next) => {
      order.push(2);
      await next();
      order.push(3);
    });

    const context = {
      clientId: 'test',
      payload: { data: 'test' },
      options: {}
    };

    const result = await middlewareManager.execute(context, async () => {
      order.push(5);
      return 'success';
    });

    expect(result).toBe('success');
    expect(order).toEqual([1, 2, 3, 4, 5]);
  });

  it('should pass context between middleware', async () => {
    middlewareManager.use(async (ctx, next) => {
      ctx.payload = { ...ctx.payload, middleware1: 'added' };
      await next();
      ctx.response = 'modified';
    });

    middlewareManager.use(async (ctx, next) => {
      ctx.payload = { ...ctx.payload, middleware2: 'added' };
      await next();
    });

    const context = {
      clientId: 'test',
      payload: { data: 'test' },
      options: {}
    };

    await middlewareManager.execute(context, async () => {
      return 'success';
    });

    expect(context.payload).toEqual({ data: 'test', middleware1: 'added', middleware2: 'added' });
    expect(context.response).toBe('modified');
  });

  it('should handle middleware errors', async () => {
    const errorMiddleware = vi.fn(async (ctx, next) => {
      throw new Error('Middleware error');
    });

    middlewareManager.use(errorMiddleware);

    const context = {
      clientId: 'test',
      payload: { data: 'test' },
      options: {}
    };

    await expect(middlewareManager.execute(context, async () => {
      return 'success';
    })).rejects.toThrow('Middleware error');
  });

  it('should clear all middleware', async () => {
    let called = false;

    middlewareManager.use(async (ctx, next) => {
      called = true;
      await next();
    });

    middlewareManager.clear();

    const context = {
      clientId: 'test',
      payload: { data: 'test' },
      options: {}
    };

    await middlewareManager.execute(context, async () => {
      return 'success';
    });

    expect(called).toBe(false);
  });

  it('should get all middleware', async () => {
    const middleware1 = async (ctx: any, next: any) => await next();
    const middleware2 = async (ctx: any, next: any) => await next();

    middlewareManager.use(middleware1);
    middlewareManager.use(middleware2);

    const middlewares = middlewareManager.getMiddlewares();
    expect(middlewares).toHaveLength(2);
  });

  it('should work with no middleware', async () => {
    const context = {
      clientId: 'test',
      payload: { data: 'test' },
      options: {}
    };

    const result = await middlewareManager.execute(context, async () => {
      return 'success';
    });

    expect(result).toBe('success');
  });

  it('should support async middleware with promises', async () => {
    let asyncValue = false;

    middlewareManager.use(async (ctx, next) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      asyncValue = true;
      await next();
    });

    const context = {
      clientId: 'test',
      payload: { data: 'test' },
      options: {}
    };

    const result = await middlewareManager.execute(context, async () => {
      return 'success';
    });

    expect(result).toBe('success');
    expect(asyncValue).toBe(true);
  });
});
