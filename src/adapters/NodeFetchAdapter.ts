import type { FetchAdapter, RequestOptions, Response } from './types';

export class NodeFetchAdapter implements FetchAdapter {
  private fetchImpl: typeof fetch;

  constructor() {
    if (typeof globalThis.fetch === 'function') {
      this.fetchImpl = globalThis.fetch;
    } else {
      throw new Error(
        'Node.js version < 18 detected. Please install node-fetch: npm install node-fetch'
      );
    }
  }

  async fetch(url: string, options: RequestOptions): Promise<Response> {
    const controller = new AbortController();
    const timeout = options.timeout || 30000;
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await this.fetchImpl(url, {
        method: options.method,
        headers: options.headers,
        body: options.body,
        signal: controller.signal,
      });

      return response as Response;
    } finally {
      clearTimeout(timer);
    }
  }

  supportsStreaming(): boolean {
    return true;
  }
}
