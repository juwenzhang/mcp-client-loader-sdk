import type { FetchAdapter, RequestOptions, Response } from './types';

export class ReactNativeAdapter implements FetchAdapter {
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
    return false;
  }

  async *fetchStreaming(
    url: string,
    options: RequestOptions,
    chunkField: string = 'response'
  ): AsyncGenerator<string> {
    let lastLength = 0;

    while (true) {
      const response = await this.fetch(url, options);
      const text = await response.text();

      if (text.length > lastLength) {
        const newContent = text.slice(lastLength);
        lastLength = text.length;

        try {
          const lines = newContent.split('\n').filter(line => line.trim());
          for (const line of lines) {
            const obj = JSON.parse(line);
            if (obj[chunkField]) {
              yield obj[chunkField];
            }
            if (obj.done || obj.finished) {
              return;
            }
          }
        } catch (e) {
          yield newContent;
        }
      }

      if (text.includes('[DONE]') || text.includes('"done":true')) {
        break;
      }

      await this.delay(100);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
