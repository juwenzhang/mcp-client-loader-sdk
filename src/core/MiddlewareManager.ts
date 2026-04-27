import type { MiddlewareContext, MiddlewareFunction } from '../types/middleware';

export class MiddlewareManager {
  private middlewares: MiddlewareFunction[] = [];

  use(middleware: MiddlewareFunction): void {
    this.middlewares.push(middleware);
  }

  async execute(context: MiddlewareContext, handler: () => Promise<string>): Promise<string> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(context, next);
      }
    };

    await next();

    return handler();
  }

  clear(): void {
    this.middlewares = [];
  }

  getMiddlewares(): MiddlewareFunction[] {
    return [...this.middlewares];
  }
}
