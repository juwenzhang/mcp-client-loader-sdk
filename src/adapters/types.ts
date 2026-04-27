export type Environment =
  | 'node'
  | 'browser'
  | 'react-native'
  | 'wx-miniprogram'
  | 'deno'
  | 'bun'
  | 'unknown';

export interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
  timeout?: number;
}

export interface Response {
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
  json(): Promise<any>;
  body?: ReadableStream<Uint8Array> | null;
}

export interface FetchAdapter {
  fetch(url: string, options: RequestOptions): Promise<Response>;
  supportsStreaming(): boolean;
}
