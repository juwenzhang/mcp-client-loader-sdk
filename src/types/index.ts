export interface McpServerConfig {
  url?: string;
  transport: 'streamable-http' | 'stdio';
  headers?: Record<string, string>;
  timeout?: number;
  retry?: number;
  enabled?: boolean;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  defaultParams?: Record<string, any>;
}

export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}

export interface ExecuteOptions {
  isRegisterClients?: boolean;
  preExecute?: () => void;
  onChunk?: (chunkObj: Record<string, any>) => void;
  afterExecute?: (fullText: string) => void;
  skipRateLimit?: boolean;
  noCache?: boolean;
  priority?: number;
}

export interface McpClient {
  send(payload: unknown, onChunk?: (line: string) => void): Promise<string>;
  /**
   * 关闭客户端，清理资源
   * 可选实现
   */
  close?(): void;
}

export * from './cache';
export * from './rateLimit';
export * from './middleware';
export * from './core';
export * from './plugin';
export * from './concurrency';
