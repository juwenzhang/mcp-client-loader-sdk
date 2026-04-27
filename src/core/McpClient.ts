import type { McpClient as McpClientInterface } from '../types';

export abstract class McpClient implements McpClientInterface {
  abstract send(payload: unknown, onChunk?: (line: string) => void): Promise<string>;
  
  /**
   * 关闭客户端，清理资源
   */
  close(): void {}
}
