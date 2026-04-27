# MCP Client Loader SDK

A powerful MCP (Model Context Protocol) Client SDK for Node.js with support for multiple transport protocols, advanced features like retry, cache, rate limiting, and middleware system.

## Features

- **Multiple Transport Protocols**
  - `streamable-http`: Network-based MCP server communication
  - `stdio`: Subprocess-based MCP server communication

- **Advanced Features**
  - Automatic retry with configurable options
  - Request/response caching
  - Rate limiting
  - Concurrency control
  - Middleware system
  - Plugin architecture
  - Event system

- **Developer Experience**
  - TypeScript support out of the box
  - Both ESM and CJS module formats
  - Biome for code linting and formatting
  - Vitest for testing

## Installation

```bash
pnpm install
```

## Quick Start

### Initialize SDK

```typescript
import { McpClientLoaderSdk } from 'mcp-client-loader-sdk';

const sdk = await McpClientLoaderSdk.init({
  configPath: './mcp.json',
  logLevel: 'info'
});
```

### Execute MCP Request

```typescript
const result = await sdk.execute('amap-maps', {
  jsonrpc: "2.0",
  method: "ping",
  id: 1
});
```

### With Streaming Support

```typescript
await sdk.execute('ollama-http', {
  model: "qwen3",
  prompt: "Hello world",
  stream: true
}, {
  preExecute: () => {
    console.log("Starting...");
  },
  onChunk: (chunk) => {
    if (chunk.response) {
      process.stdout.write(chunk.response);
    }
  },
  afterExecute: (full) => {
    console.log("\nDone!");
  }
});
```

## Configuration

Configure MCP servers in `mcp.json`:

```json
{
  "mcpServers": {
    "amap-maps": {
      "url": "https://mcp.amap.com/mcp?key=${AMAP_MCP_KEY}",
      "transport": "streamable-http",
      "timeout": 30000,
      "enabled": true
    },
    "ollama-llm": {
      "transport": "stdio",
      "command": "docker",
      "args": ["exec", "-i", "${OLLAMA_CONTAINER}", "ollama", "run", "qwen"],
      "env": {
        "OLLAMA_HOST": "${OLLAMA_HOST}"
      },
      "timeout": 60000,
      "enabled": true
    }
  },
  "executor": {
    "logLevel": "debug",
    "maxConcurrent": 5
  }
}
```

## Available Scripts

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Test ESM format
pnpm test:esm

# Test CJS format
pnpm test:cjs

# Development mode
pnpm dev
```

## Or use Makefile

```bash
make install    # Install dependencies
make build      # Build project
make test       # Run tests
make lint       # Check code
make lint:fix   # Fix code issues
make dev        # Development mode
make esm-test   # Test ESM
make cjs-test   # Test CJS
```

## SDK API

### McpClientLoaderSdk.init(options)

Initialize the SDK with configuration.

**Options:**
- `configPath`: Path to mcp.json configuration file
- `config`: MCP configuration object
- `logLevel`: Log level ('debug' | 'info' | 'warn' | 'error')
- `retryOptions`: Retry configuration
- `cacheOptions`: Cache configuration
- `rateLimitOptions`: Rate limiting configuration
- `plugins`: Array of plugins
- `concurrencyOptions`: Concurrency control configuration

### Methods

- `execute(id, payload, options)`: Execute MCP request
- `registerClient(id, config)`: Register a new MCP client
- `getClient(id)`: Get client by ID
- `removeClient(id)`: Remove client
- `getClientIds()`: Get all registered client IDs
- `clear()`: Clear all clients

### Properties

- `interceptors`: Request/response interceptors
- `cache`: Cache manager
- `rateLimit`: Rate limiter
- `middleware`: Middleware manager
- `plugins`: Plugin manager
- `concurrency`: Concurrency controller

### Event System

```typescript
sdk.on('request', (event) => {
  console.log('Request made:', event.data);
});

sdk.once('response', (event) => {
  console.log('Response received:', event.data);
});
```

### Middleware

```typescript
sdk.middleware.use(async (ctx, next) => {
  console.log('Before request');
  await next();
  console.log('After response');
});
```

## Architecture

```
src/
├── adapters/         # Environment detection and adapter selection
├── clients/           # HTTP and STDIO client implementations
├── config/            # Configuration loading and validation
├── core/              # Core SDK functionality
│   ├── McpRegistry.ts    # Client registry
│   ├── McpExecutor.ts    # Request execution engine
│   ├── McpContext.ts     # SDK context
│   ├── RetryManager.ts    # Retry logic
│   ├── CacheManager.ts    # Caching
│   ├── RateLimiter.ts     # Rate limiting
│   ├── EventManager.ts    # Event handling
│   ├── InterceptorManager.ts  # Interceptors
│   ├── MiddlewareManager.ts   # Middleware
│   └── PluginManager.ts       # Plugin system
├── errors/           # Custom error classes
├── logger/           # Logging utility
└── types/            # TypeScript type definitions
```

## License

MIT
