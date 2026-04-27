import { McpClient } from '../core/McpClient';
import { McpTimeoutError } from '../errors/McpError';
import { AdapterFactory } from '../adapters';
import type { FetchAdapter, Environment } from '../adapters';

export type HttpHeaders = Record<string, string>;

export interface HttpClientOptions {
  url: string;
  headers?: HttpHeaders;
  timeout?: number;
  adapter?: FetchAdapter;
  environment?: Environment;
}

export class HttpClient extends McpClient {
  private adapter: FetchAdapter;
  private url: string;
  private headers: HttpHeaders;
  private timeout: number;

  constructor(options: HttpClientOptions) {
    super();
    this.url = options.url;
    this.headers = options.headers || {};
    this.timeout = options.timeout || 30000;

    if (options.adapter) {
      this.adapter = options.adapter;
    } else {
      const factory = new AdapterFactory();
      this.adapter = factory.createAdapter(options.environment);
    }
  }

  async send(
    payload: unknown,
    onChunk?: (line: string) => void
  ): Promise<string> {
    const response = await this.adapter.fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        ...this.headers,
      },
      body: JSON.stringify(payload),
      timeout: this.timeout,
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}\n${bodyText}`);
    }

    if (this.adapter.supportsStreaming() && onChunk) {
      return this.handleStreaming(response, onChunk);
    } else if (onChunk) {
      return this.handlePolling(onChunk);
    } else {
      return response.text();
    }
  }

  private async handleStreaming(
    response: any,
    onChunk: (line: string) => void
  ): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    const decoder = new TextDecoder('utf-8');
    let fullRaw = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullRaw += chunk;

        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          onChunk(line);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new McpTimeoutError('HttpClient timeout');
      }
      throw error;
    }

    return fullRaw;
  }

  private async handlePolling(onChunk: (line: string) => void): Promise<string> {
    console.warn('Streaming not supported in this environment, using polling fallback');
    
    let fullText = '';
    let lastLength = 0;
    let isDone = false;
    
    while (!isDone) {
      try {
        const response = await this.adapter.fetch(this.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            ...this.headers,
          },
          body: JSON.stringify({}),
          timeout: this.timeout,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        fullText = text;
        
        if (text.length > lastLength) {
          const newContent = text.slice(lastLength);
          lastLength = text.length;
          
          const lines = newContent.split('\n').filter(line => line.trim());
          for (const line of lines) {
            onChunk(line);

            if (line.includes('[DONE]') || line.includes('"done":true')) {
              isDone = true;
              break;
            }
          }
        }

        if (text.includes('[DONE]') || text.includes('"done":true')) {
          isDone = true;
        }
        
        await this.delay(100);
        
      } catch (error) {
        console.error('Polling error:', error);
        break;
      }
    }
    
    return fullText;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

