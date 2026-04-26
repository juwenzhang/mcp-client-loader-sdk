import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { HttpClient, StdioClient } from './mcp-client.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../mcp.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const servers = config.mcpServers;
const clients = {};
// 变量解析
function resolveValue(v) {
    return v.replace(/\$\{([a-zA-Z0-9_]+)\}/g, (_, name) => process.env[name] ?? '');
}
function resolveHeaders(headers = {}) {
    const res = {};
    for (const [k, v] of Object.entries(headers))
        res[k] = resolveValue(v);
    return res;
}
function resolveParams(params = {}) {
    const res = {};
    for (const [k, v] of Object.entries(params)) {
        res[k] = typeof v === 'string' ? resolveValue(v) : v;
    }
    return res;
}
function resolveArgs(args = []) {
    return args.map(arg => resolveValue(arg));
}
function resolveEnv(env = {}) {
    const res = {};
    for (const [k, v] of Object.entries(env))
        res[k] = resolveValue(v);
    return res;
}
function registerClients() {
    for (const [id, cfg] of Object.entries(servers)) {
        if (!cfg.enabled)
            continue;
        if (cfg.transport === 'streamable-http') {
            if (!cfg.url)
                throw new Error(`[${id}] missing url`);
            const resolvedUrl = resolveValue(cfg.url);
            const client = new HttpClient(resolvedUrl, resolveHeaders(cfg.headers), cfg.timeout ?? 30000);
            client.defaultParams = resolveParams(cfg.defaultParams);
            clients[id] = client;
        }
        if (cfg.transport === 'stdio') {
            if (!cfg.command)
                throw new Error(`[${id}] missing command`);
            const resolvedCommand = resolveValue(cfg.command);
            const resolvedArgs = resolveArgs(cfg.args);
            const resolvedEnv = resolveEnv(cfg.env);
            const resolvedCwd = cfg.cwd ? resolveValue(cfg.cwd) : process.cwd();
            const client = new StdioClient(resolvedCommand, resolvedArgs, resolvedEnv, resolvedCwd, cfg.timeout ?? 60000);
            client.defaultParams = resolveParams(cfg.defaultParams);
            clients[id] = client;
        }
    }
}
let executionQueue = Promise.resolve();
async function execute(id, payload, extra = {}) {
    return new Promise((resolve, reject) => {
        executionQueue = executionQueue.then(async () => {
            try {
                const { isRegisterClients = true, preExecute, onChunk, afterExecute } = extra;
                preExecute?.();
                if (isRegisterClients) {
                    registerClients();
                }
                const client = clients[id];
                if (!client)
                    throw new Error(`Client ${id} not found`);
                const defaultParams = client.defaultParams || {};
                const finalPayload = {
                    ...payload,
                    params: { ...defaultParams, ...(payload.params || {}) },
                };
                let fullText = "";
                if (client instanceof HttpClient) {
                    await client.send(finalPayload, (line) => {
                        try {
                            const obj = JSON.parse(line);
                            if (obj.response)
                                fullText += obj.response;
                            onChunk?.(obj);
                        }
                        catch (e) { }
                    });
                }
                else {
                    const res = await client.send(finalPayload);
                    fullText = typeof res === "string" ? res : JSON.stringify(res);
                }
                afterExecute?.(fullText);
                resolve(fullText);
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
registerClients();
execute('amap-maps-streamableHTTP', {
    jsonrpc: "2.0",
    method: "ping",
    id: 1
})
    .then(res => console.log('高德 MCP ping 成功：', res))
    .catch(err => console.error('高德 MCP 错误：', err));
execute('ollama-http', {
    model: "qwen2.5:1.5b",
    prompt: "Hello, who are you?",
    stream: true
}, {
    preExecute: () => {
        process.stdout.write("\nAI回答：");
    },
    onChunk: (chunk) => {
        if (chunk.response) {
            process.stdout.write(chunk.response);
        }
    },
    afterExecute: (full) => {
        console.log("\n\n完整内容结束");
    }
})
    .catch(err => console.error('\n【Ollama】错误：', err));
