/// <reference types="miniprogram-api-typings" />

import type { FetchAdapter, RequestOptions, Response } from './types';

declare const wx: {
  request: (options: {
    url: string;
    method?: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT';
    data?: string | object | ArrayBuffer;
    header?: Record<string, string>;
    timeout?: number;
    success?: (res: {
      data: string | object | ArrayBuffer;
      statusCode: number;
      header: Record<string, string>;
    }) => void;
    fail?: (err: any) => void;
    complete?: () => void;
  }) => void;
};

export class WxMiniProgramAdapter implements FetchAdapter {
  async fetch(url: string, options: RequestOptions): Promise<Response> {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: (options.method as any) || 'POST',
        header: options.headers,
        data: options.body,
        timeout: options.timeout || 30000,
        success: (res) => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: '',
            text: () => Promise.resolve(
              typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
            ),
            json: () => Promise.resolve(
              typeof res.data === 'string' ? JSON.parse(res.data) : res.data
            ),
            body: null,
          });
        },
        fail: reject,
      });
    });
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
