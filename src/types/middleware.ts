import type { ExecuteOptions } from './index';

export interface MiddlewareContext {
  clientId: string;
  payload: any;
  options: ExecuteOptions;
  response?: string;
  error?: Error;
}

export type MiddlewareFunction = (
  context: MiddlewareContext,
  next: () => Promise<void>
) => Promise<void>;
