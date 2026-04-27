# MCP Client Loader SDK

一款强大的 MCP (Model Context Protocol) 客户端 SDK，专为 Node.js 设计，支持多种传输协议、高级特性如重试、缓存、限流和中间件系统。

## 特性

- **多种传输协议**
  - `streamable-http`: 基于网络的 MCP 服务器通信
  - `stdio`: 基于子进程的 MCP 服务器通信

- **高级特性**
  - 可配置的重试机制
  - 请求/响应缓存
  - 限流控制
  - 并发控制
  - 中间件系统
  - 插件架构
  - 事件系统

- **开发者体验**
  - 开箱即用的 TypeScript 支持
  - 同时支持 ESM 和 CJS 模块格式
  - 使用 Biome 进行代码检查和格式化
  - 使用 Vitest 进行测试

## 安装

```bash
pnpm install
```

## 快速开始

### 初始化 SDK

```typescript
import { McpClientLoaderSdk } from 'mcp-client-loader-sdk';

const sdk = await McpClientLoaderSdk.init({
  configPath: './mcp.json',
  logLevel: 'info'
});
```

### 执行 MCP 请求

```typescript
const result = await sdk.execute('amap-maps', {
  jsonrpc: "2.0",
  method: "ping",
  id: 1
});
```

### 支持流式响应

```typescript
await sdk.execute('ollama-http', {
  model: "qwen3",
  prompt: "你好世界",
  stream: true
}, {
  preExecute: () => {
    console.log("开始处理...");
  },
  onChunk: (chunk) => {
    if (chunk.response) {
      process.stdout.write(chunk.response);
    }
  },
  afterExecute: (full) => {
    console.log("\n处理完成！");
  }
});
```

## 配置

在 `mcp.json` 中配置 MCP 服务器：

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

## 可用脚本

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 运行测试
pnpm test

# 监听模式运行测试
pnpm test:watch

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix

# 测试 ESM 格式
pnpm test:esm

# 测试 CJS 格式
pnpm test:cjs

# 开发模式
pnpm dev
```

## 或使用 Makefile

```bash
make install    # 安装依赖
make build      # 构建项目
make test       # 运行测试
make lint       # 检查代码
make lint:fix   # 修复代码问题
make dev        # 开发模式
make esm-test   # 测试 ESM
make cjs-test   # 测试 CJS
```

## SDK API

### McpClientLoaderSdk.init(options)

使用配置初始化 SDK。

**选项：**
- `configPath`: mcp.json 配置文件的路径
- `config`: MCP 配置对象
- `logLevel`: 日志级别 ('debug' | 'info' | 'warn' | 'error')
- `retryOptions`: 重试配置
- `cacheOptions`: 缓存配置
- `rateLimitOptions`: 限流配置
- `plugins`: 插件数组
- `concurrencyOptions`: 并发控制配置

### 方法

- `execute(id, payload, options)`: 执行 MCP 请求
- `registerClient(id, config)`: 注册新的 MCP 客户端
- `getClient(id)`: 根据 ID 获取客户端
- `removeClient(id)`: 移除客户端
- `getClientIds()`: 获取所有已注册的客户端 ID
- `clear()`: 清除所有客户端

### 属性

- `interceptors`: 请求/响应拦截器
- `cache`: 缓存管理器
- `rateLimit`: 限流器
- `middleware`: 中间件管理器
- `plugins`: 插件管理器
- `concurrency`: 并发控制器

### 事件系统

```typescript
sdk.on('request', (event) => {
  console.log('请求已发送:', event.data);
});

sdk.once('response', (event) => {
  console.log('响应已接收:', event.data);
});
```

### 中间件

```typescript
sdk.middleware.use(async (ctx, next) => {
  console.log('请求之前');
  await next();
  console.log('响应之后');
});
```

## 架构

```
src/
├── adapters/         # 环境检测和适配器选择
├── clients/           # HTTP 和 STDIO 客户端实现
├── config/            # 配置加载和验证
├── core/              # 核心 SDK 功能
│   ├── McpRegistry.ts    # 客户端注册表
│   ├── McpExecutor.ts    # 请求执行引擎
│   ├── McpContext.ts     # SDK 上下文
│   ├── RetryManager.ts    # 重试逻辑
│   ├── CacheManager.ts    # 缓存管理
│   ├── RateLimiter.ts     # 限流器
│   ├── EventManager.ts    # 事件处理
│   ├── InterceptorManager.ts  # 拦截器
│   ├── MiddlewareManager.ts   # 中间件
│   └── PluginManager.ts       # 插件系统
├── errors/           # 自定义错误类
├── logger/           # 日志工具
└── types/            # TypeScript 类型定义
```

## License

MIT
