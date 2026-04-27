// CommonJS 测试脚本
const { McpClientLoaderSdk } = require('../dist/index.cjs');

async function runExample() {
  try {
    const sdk = await McpClientLoaderSdk.init({
      configPath: './mcp.json',
      logLevel: 'info'
    });

    const amapResult = await sdk.execute('amap-maps-streamableHTTP', {
      jsonrpc: "2.0",
      method: "ping",
      id: 1
    });
    console.log('CommonJS: 高德 MCP ping 成功：', amapResult);

    await sdk.execute('ollama-http', {
      model: "qwen3-coder:480b-cloud",
      prompt: "Rust 深度知识总结，Rust Web 后端微服务架构或者说 Rust 前端的渲染引擎重构",
      stream: true
    }, {
      preExecute: () => {
        process.stdout.write("\nCommonJS: AI回答：");
      },
      onChunk: (chunk) => {
        if (chunk.response) {
          process.stdout.write(chunk.response);
        }
      },
      afterExecute: (full) => {
        console.log("\n\nCommonJS: 完整内容结束");
      }
    });
  } catch (error) {
    console.error('CommonJS: 错误：', error);
  }
}

runExample();
