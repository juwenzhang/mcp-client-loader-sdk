export class McpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpError';
  }
}

export class McpConfigError extends McpError {
  constructor(message: string) {
    super(message);
    this.name = 'McpConfigError';
  }
}

export class McpConnectionError extends McpError {
  constructor(message: string) {
    super(message);
    this.name = 'McpConnectionError';
  }
}

export class McpExecutionError extends McpError {
  constructor(message: string) {
    super(message);
    this.name = 'McpExecutionError';
  }
}

export class McpTimeoutError extends McpError {
  constructor(message: string) {
    super(message);
    this.name = 'McpTimeoutError';
  }
}
