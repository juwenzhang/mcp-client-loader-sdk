import type { FetchAdapter, RequestOptions, Response } from './types';

export class BrowserAdapter implements FetchAdapter {
  async fetch(url: string, options: RequestOptions): Promise<Response> {
    const controller = new AbortController();
    const timeout = options.timeout || 30000;
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
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
