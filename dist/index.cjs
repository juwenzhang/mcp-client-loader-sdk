"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var __await = function(promise, isYieldStar) {
  this[0] = promise;
  this[1] = isYieldStar;
};
var __asyncGenerator = (__this, __arguments, generator) => {
  var resume = (k, v, yes, no) => {
    try {
      var x = generator[k](v), isAwait = (v = x.value) instanceof __await, done = x.done;
      Promise.resolve(isAwait ? v[0] : v).then((y) => isAwait ? resume(k === "return" ? k : "next", v[1] ? { done: y.done, value: y.value } : y, yes, no) : yes({ value: y, done })).catch((e) => resume("throw", e, yes, no));
    } catch (e) {
      no(e);
    }
  }, method = (k, call, wait, clear) => it[k] = (x) => (call = new Promise((yes, no, run) => (run = () => resume(k, x, yes, no), q ? q.then(run) : run())), clear = () => q === wait && (q = 0), q = wait = call.then(clear, clear), call), q, it = {};
  return generator = generator.apply(__this, __arguments), it[__knownSymbol("asyncIterator")] = () => it, method("next"), method("throw"), method("return"), it;
};

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AdapterFactory: () => AdapterFactory,
  CacheManager: () => CacheManager,
  ConfigLoader: () => ConfigLoader,
  ConfigResolver: () => ConfigResolver,
  ConfigValidator: () => ConfigValidator,
  EnvironmentDetector: () => EnvironmentDetector,
  EventManager: () => EventManager,
  HttpClient: () => HttpClient,
  InterceptorManager: () => InterceptorManager,
  Logger: () => Logger,
  McpClientLoaderSdk: () => McpClientLoaderSdk,
  McpContext: () => McpContext,
  McpExecutor: () => McpExecutor,
  McpRegistry: () => McpRegistry,
  MiddlewareManager: () => MiddlewareManager,
  PluginManager: () => PluginManager,
  RateLimiter: () => RateLimiter,
  RetryManager: () => RetryManager,
  StdioClient: () => StdioClient
});
module.exports = __toCommonJS(index_exports);
var import_dotenv = __toESM(require("dotenv"), 1);

// src/core/McpClient.ts
var McpClient = class {
  /**
   * 关闭客户端，清理资源
   */
  close() {
  }
};

// src/errors/McpError.ts
var McpError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "McpError";
  }
};
var McpTimeoutError = class extends McpError {
  constructor(message) {
    super(message);
    this.name = "McpTimeoutError";
  }
};

// src/adapters/EnvironmentDetector.ts
var EnvironmentDetector = class {
  constructor() {
    this.environmentChecks = [
      { check: () => typeof wx !== "undefined" && wx.request, environment: "wx-miniprogram" },
      { check: () => typeof navigator !== "undefined" && navigator.product === "ReactNative", environment: "react-native" },
      { check: () => typeof Deno !== "undefined", environment: "deno" },
      { check: () => typeof Bun !== "undefined", environment: "bun" },
      { check: () => {
        var _a;
        return typeof process !== "undefined" && !!((_a = process.versions) == null ? void 0 : _a.node);
      }, environment: "node" },
      { check: () => typeof window !== "undefined" && typeof window.fetch === "function", environment: "browser" }
    ];
  }
  detect() {
    for (const { check, environment } of this.environmentChecks) {
      try {
        if (check()) {
          return environment;
        }
      } catch (e) {
      }
    }
    return "unknown";
  }
  /**
   * 添加自定义环境检测
   * @param check 检测函数
   * @param environment 环境名称
   * @param index 插入位置，默认添加到末尾
   */
  addEnvironmentCheck(check, environment, index) {
    if (index !== void 0) {
      this.environmentChecks.splice(index, 0, { check, environment });
    } else {
      this.environmentChecks.push({ check, environment });
    }
  }
  /**
   * 移除环境检测
   * @param environment 环境名称
   */
  removeEnvironmentCheck(environment) {
    const index = this.environmentChecks.findIndex((item) => item.environment === environment);
    if (index > -1) {
      this.environmentChecks.splice(index, 1);
    }
  }
};

// src/adapters/NodeFetchAdapter.ts
var NodeFetchAdapter = class {
  constructor() {
    if (typeof globalThis.fetch === "function") {
      this.fetchImpl = globalThis.fetch;
    } else {
      throw new Error(
        "Node.js version < 18 detected. Please install node-fetch: npm install node-fetch"
      );
    }
  }
  fetch(url, options) {
    return __async(this, null, function* () {
      const controller = new AbortController();
      const timeout = options.timeout || 3e4;
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = yield this.fetchImpl(url, {
          method: options.method,
          headers: options.headers,
          body: options.body,
          signal: controller.signal
        });
        return response;
      } finally {
        clearTimeout(timer);
      }
    });
  }
  supportsStreaming() {
    return true;
  }
};

// src/adapters/BrowserAdapter.ts
var BrowserAdapter = class {
  fetch(url, options) {
    return __async(this, null, function* () {
      const controller = new AbortController();
      const timeout = options.timeout || 3e4;
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = yield fetch(url, {
          method: options.method,
          headers: options.headers,
          body: options.body,
          signal: controller.signal
        });
        return response;
      } finally {
        clearTimeout(timer);
      }
    });
  }
  supportsStreaming() {
    return true;
  }
};

// src/adapters/ReactNativeAdapter.ts
var ReactNativeAdapter = class {
  fetch(url, options) {
    return __async(this, null, function* () {
      const controller = new AbortController();
      const timeout = options.timeout || 3e4;
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = yield fetch(url, {
          method: options.method,
          headers: options.headers,
          body: options.body,
          signal: controller.signal
        });
        return response;
      } finally {
        clearTimeout(timer);
      }
    });
  }
  supportsStreaming() {
    return false;
  }
  fetchStreaming(url, options, chunkField = "response") {
    return __asyncGenerator(this, null, function* () {
      let lastLength = 0;
      while (true) {
        const response = yield new __await(this.fetch(url, options));
        const text = yield new __await(response.text());
        if (text.length > lastLength) {
          const newContent = text.slice(lastLength);
          lastLength = text.length;
          try {
            const lines = newContent.split("\n").filter((line) => line.trim());
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
        if (text.includes("[DONE]") || text.includes('"done":true')) {
          break;
        }
        yield new __await(this.delay(100));
      }
    });
  }
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/adapters/WxMiniProgramAdapter.ts
var WxMiniProgramAdapter = class {
  fetch(url, options) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        wx.request({
          url,
          method: options.method || "POST",
          header: options.headers,
          data: options.body,
          timeout: options.timeout || 3e4,
          success: (res) => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: "",
              text: () => Promise.resolve(
                typeof res.data === "string" ? res.data : JSON.stringify(res.data)
              ),
              json: () => Promise.resolve(
                typeof res.data === "string" ? JSON.parse(res.data) : res.data
              ),
              body: null
            });
          },
          fail: reject
        });
      });
    });
  }
  supportsStreaming() {
    return false;
  }
  fetchStreaming(url, options, chunkField = "response") {
    return __asyncGenerator(this, null, function* () {
      let lastLength = 0;
      while (true) {
        const response = yield new __await(this.fetch(url, options));
        const text = yield new __await(response.text());
        if (text.length > lastLength) {
          const newContent = text.slice(lastLength);
          lastLength = text.length;
          try {
            const lines = newContent.split("\n").filter((line) => line.trim());
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
        if (text.includes("[DONE]") || text.includes('"done":true')) {
          break;
        }
        yield new __await(this.delay(100));
      }
    });
  }
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/adapters/AdapterFactory.ts
var AdapterFactory = class {
  constructor() {
    // 适配器映射
    this.adapterMap = {
      node: () => new NodeFetchAdapter(),
      browser: () => new BrowserAdapter(),
      "react-native": () => new ReactNativeAdapter(),
      "wx-miniprogram": () => new WxMiniProgramAdapter(),
      deno: () => new BrowserAdapter(),
      bun: () => new NodeFetchAdapter(),
      unknown: () => new BrowserAdapter()
    };
    this.detector = new EnvironmentDetector();
  }
  createAdapter(env) {
    const environment = env || this.detector.detect();
    const adapterFactory = this.adapterMap[environment];
    if (adapterFactory) {
      return adapterFactory();
    } else {
      console.warn(`Unknown environment: ${environment}, falling back to browser adapter`);
      return new BrowserAdapter();
    }
  }
  /**
   * 添加自定义适配器
   * @param environment 环境名称
   * @param factory 适配器创建函数
   */
  addAdapter(environment, factory) {
    this.adapterMap[environment] = factory;
  }
  /**
   * 移除适配器
   * @param environment 环境名称
   */
  removeAdapter(environment) {
    delete this.adapterMap[environment];
  }
  detectEnvironment() {
    return this.detector.detect();
  }
};

// src/clients/HttpClient.ts
var HttpClient = class extends McpClient {
  constructor(options) {
    super();
    this.url = options.url;
    this.headers = options.headers || {};
    this.timeout = options.timeout || 3e4;
    if (options.adapter) {
      this.adapter = options.adapter;
    } else {
      const factory = new AdapterFactory();
      this.adapter = factory.createAdapter(options.environment);
    }
  }
  send(payload, onChunk) {
    return __async(this, null, function* () {
      const response = yield this.adapter.fetch(this.url, {
        method: "POST",
        headers: __spreadValues({
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream"
        }, this.headers),
        body: JSON.stringify(payload),
        timeout: this.timeout
      });
      if (!response.ok) {
        const bodyText = yield response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}
${bodyText}`);
      }
      if (this.adapter.supportsStreaming() && onChunk) {
        return this.handleStreaming(response, onChunk);
      } else if (onChunk) {
        return this.handlePolling(onChunk);
      } else {
        return response.text();
      }
    });
  }
  handleStreaming(response, onChunk) {
    return __async(this, null, function* () {
      var _a;
      const reader = (_a = response.body) == null ? void 0 : _a.getReader();
      if (!reader) {
        throw new Error("No response stream available");
      }
      const decoder = new TextDecoder("utf-8");
      let fullRaw = "";
      try {
        while (true) {
          const { done, value } = yield reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullRaw += chunk;
          const lines = chunk.split("\n").filter((line) => line.trim());
          for (const line of lines) {
            onChunk(line);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new McpTimeoutError("HttpClient timeout");
        }
        throw error;
      }
      return fullRaw;
    });
  }
  handlePolling(onChunk) {
    return __async(this, null, function* () {
      console.warn("Streaming not supported in this environment, using polling fallback");
      let fullText = "";
      let lastLength = 0;
      let isDone = false;
      while (!isDone) {
        try {
          const response = yield this.adapter.fetch(this.url, {
            method: "POST",
            headers: __spreadValues({
              "Content-Type": "application/json",
              "Accept": "application/json, text/event-stream"
            }, this.headers),
            body: JSON.stringify({}),
            timeout: this.timeout
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const text = yield response.text();
          fullText = text;
          if (text.length > lastLength) {
            const newContent = text.slice(lastLength);
            lastLength = text.length;
            const lines = newContent.split("\n").filter((line) => line.trim());
            for (const line of lines) {
              onChunk(line);
              if (line.includes("[DONE]") || line.includes('"done":true')) {
                isDone = true;
                break;
              }
            }
          }
          if (text.includes("[DONE]") || text.includes('"done":true')) {
            isDone = true;
          }
          yield this.delay(100);
        } catch (error) {
          console.error("Polling error:", error);
          break;
        }
      }
      return fullText;
    });
  }
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/clients/StdioClient.ts
var import_child_process = require("child_process");
var StdioClient = class extends McpClient {
  constructor(options) {
    super();
    this.options = options;
    this.process = null;
    this.restartCount = 0;
    this.isRestarting = false;
    this.options = __spreadValues({
      args: [],
      env: {},
      cwd: process.cwd(),
      timeout: 6e4,
      autoRestart: false,
      restartAttempts: 3,
      restartDelay: 1e3,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    }, options);
  }
  send(payload, onChunk) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        let output = "";
        let error = "";
        let isResolved = false;
        const startProcess = () => {
          var _a, _b;
          this.process = (0, import_child_process.spawn)(this.options.command, this.options.args || [], {
            cwd: this.options.cwd,
            env: __spreadValues(__spreadValues({}, process.env), this.options.env),
            stdio: this.options.stdio
          });
          const timer = setTimeout(() => {
            if (!isResolved) {
              this.killProcess();
              reject(new McpTimeoutError("StdioClient timeout"));
            }
          }, this.options.timeout);
          if (this.process) {
            (_a = this.process.stdout) == null ? void 0 : _a.on("data", (data) => {
              const dataStr = this.options.encoding === "utf8" ? data.toString("utf8") : data.toString("base64");
              output += dataStr;
              onChunk == null ? void 0 : onChunk(dataStr);
            });
            (_b = this.process.stderr) == null ? void 0 : _b.on("data", (data) => {
              const dataStr = this.options.encoding === "utf8" ? data.toString("utf8") : data.toString("base64");
              error += dataStr;
            });
            this.process.on("error", (err) => {
              clearTimeout(timer);
              if (!isResolved) {
                this.handleProcessError(err, reject);
              }
            });
            this.process.on("close", (code, signal) => {
              clearTimeout(timer);
              if (isResolved) return;
              if (code === 0) {
                isResolved = true;
                resolve(output.trim());
              } else {
                const errorMessage = signal ? `Process killed with signal: ${signal}` : `Process exit code: ${code}
${error}`;
                this.handleProcessError(new Error(errorMessage), reject);
              }
            });
            try {
              const input = typeof payload === "string" ? payload : JSON.stringify(payload);
              if (this.process.stdin) {
                this.process.stdin.write(input);
                this.process.stdin.write("\n");
                this.process.stdin.end();
              }
            } catch (err) {
              clearTimeout(timer);
              this.killProcess();
              reject(new Error(`Failed to write to process stdin: ${err.message}`));
            }
          } else {
            clearTimeout(timer);
            reject(new Error("Failed to create process"));
          }
        };
        startProcess();
      });
    });
  }
  handleProcessError(err, reject) {
    if (this.options.autoRestart && this.restartCount < (this.options.restartAttempts || 3)) {
      this.restartCount++;
      console.warn(`Process error (${this.restartCount}/${this.options.restartAttempts}):`, err.message);
      console.warn("Attempting to restart process...");
      setTimeout(() => {
        this.send({}, (chunk) => {
        }).catch(reject);
      }, this.options.restartDelay);
    } else {
      reject(err);
    }
  }
  killProcess() {
    if (this.process) {
      try {
        this.process.kill();
      } catch (err) {
        console.error("Error killing process:", err);
      }
      this.process = null;
    }
  }
  start() {
    if (!this.process || this.process.killed) {
      this.process = (0, import_child_process.spawn)(this.options.command, this.options.args || [], {
        cwd: this.options.cwd,
        env: __spreadValues(__spreadValues({}, process.env), this.options.env),
        stdio: this.options.stdio
      });
    }
  }
  stop() {
    this.killProcess();
  }
  isRunning() {
    return this.process !== null && !this.process.killed;
  }
  getProcess() {
    return this.process;
  }
};

// src/core/McpRegistry.ts
var McpRegistry = class {
  constructor(logger, resolver, validator) {
    this.logger = logger;
    this.clients = {};
    this.resolver = resolver;
    this.validator = validator;
  }
  registerFromConfig(config) {
    return __async(this, null, function* () {
      this.logger.info("Registering clients from config");
      for (const [id, cfg] of Object.entries(config.mcpServers)) {
        if (!cfg.enabled) {
          this.logger.debug(`Skipping disabled client: ${id}`);
          continue;
        }
        yield this.registerClient(id, cfg);
      }
    });
  }
  registerClient(id, cfg) {
    return __async(this, null, function* () {
      var _a, _b;
      this.logger.debug(`Registering client: ${id}`);
      let client;
      if (cfg.transport === "streamable-http") {
        if (!cfg.url) throw new Error(`[${id}] missing url`);
        const resolvedUrl = this.resolver.resolveValue(cfg.url);
        const resolvedHeaders = this.resolver.resolveHeaders(cfg.headers);
        client = new HttpClient({
          url: resolvedUrl,
          headers: resolvedHeaders,
          timeout: (_a = cfg.timeout) != null ? _a : 3e4
        });
      } else if (cfg.transport === "stdio") {
        if (!cfg.command) throw new Error(`[${id}] missing command`);
        const resolvedCommand = this.resolver.resolveValue(cfg.command);
        const resolvedArgs = this.resolver.resolveArgs(cfg.args);
        const resolvedEnv = this.resolver.resolveEnv(cfg.env);
        const resolvedCwd = cfg.cwd ? this.resolver.resolveValue(cfg.cwd) : process.cwd();
        client = new StdioClient({
          command: resolvedCommand,
          args: resolvedArgs,
          env: resolvedEnv,
          cwd: resolvedCwd,
          timeout: (_b = cfg.timeout) != null ? _b : 6e4
        });
      } else {
        throw new Error(`[${id}] unsupported transport: ${cfg.transport}`);
      }
      const defaultParams = this.resolver.resolveParams(cfg.defaultParams);
      this.clients[id] = { client, defaultParams };
      this.logger.info(`Client registered: ${id}`);
    });
  }
  getClient(id) {
    var _a;
    return (_a = this.clients[id]) == null ? void 0 : _a.client;
  }
  getDefaultParams(id) {
    var _a;
    return (_a = this.clients[id]) == null ? void 0 : _a.defaultParams;
  }
  removeClient(id) {
    if (this.clients[id]) {
      this.clients[id].client.close();
      delete this.clients[id];
      this.logger.info(`Client removed: ${id}`);
    }
  }
  getClientIds() {
    return Object.keys(this.clients);
  }
  clear() {
    for (const id of Object.keys(this.clients)) {
      this.removeClient(id);
    }
  }
};

// src/core/RetryManager.ts
var RetryManager = class {
  constructor(options = {}) {
    this.options = __spreadValues({
      maxAttempts: 3,
      delay: 1e3,
      backoff: "exponential",
      retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "ECONNREFUSED"],
      retryableStatusCodes: [408, 429, 500, 502, 503, 504]
    }, options);
  }
  execute(fn) {
    return __async(this, null, function* () {
      var _a, _b;
      let lastError;
      for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
        try {
          return yield fn();
        } catch (error) {
          lastError = error;
          if (attempt < this.options.maxAttempts && this.isRetryable(error)) {
            const delay = this.calculateDelay(attempt);
            (_b = (_a = this.options).onRetry) == null ? void 0 : _b.call(_a, attempt, lastError);
            yield this.sleep(delay);
          } else {
            throw lastError;
          }
        }
      }
      throw lastError;
    });
  }
  isRetryable(error) {
    var _a;
    if (error.code && this.options.retryableErrors.includes(error.code)) {
      return true;
    }
    if (((_a = error.response) == null ? void 0 : _a.status) && this.options.retryableStatusCodes.includes(error.response.status)) {
      return true;
    }
    return false;
  }
  calculateDelay(attempt) {
    switch (this.options.backoff) {
      case "fixed":
        return this.options.delay;
      case "linear":
        return this.options.delay * attempt;
      case "exponential":
        return this.options.delay * Math.pow(2, attempt - 1);
      default:
        return this.options.delay;
    }
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  getOptions() {
    return __spreadValues({}, this.options);
  }
  updateOptions(options) {
    this.options = __spreadValues(__spreadValues({}, this.options), options);
  }
};

// src/core/EventManager.ts
var EventManager = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(eventType, listener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, /* @__PURE__ */ new Set());
    }
    this.listeners.get(eventType).add(listener);
  }
  off(eventType, listener) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }
  once(eventType, listener) {
    const wrappedListener = (event) => {
      listener(event);
      this.off(eventType, wrappedListener);
    };
    this.on(eventType, wrappedListener);
  }
  emit(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data
    };
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }
  removeAllListeners(eventType) {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
  getListenerCount(eventType) {
    var _a;
    return ((_a = this.listeners.get(eventType)) == null ? void 0 : _a.size) || 0;
  }
  hasListener(eventType, listener) {
    const listeners = this.listeners.get(eventType);
    return listeners ? listeners.has(listener) : false;
  }
};

// src/core/InterceptorManager.ts
var InterceptorManager = class {
  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }
  useRequest(interceptor) {
    this.requestInterceptors.push(interceptor);
  }
  useResponse(interceptor) {
    this.responseInterceptors.push(interceptor);
  }
  useError(interceptor) {
    this.errorInterceptors.push(interceptor);
  }
  processRequest(config) {
    return __async(this, null, function* () {
      let processedConfig = config;
      for (const interceptor of this.requestInterceptors) {
        processedConfig = yield interceptor(processedConfig);
      }
      return processedConfig;
    });
  }
  processResponse(response) {
    return __async(this, null, function* () {
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = yield interceptor(processedResponse);
      }
      return processedResponse;
    });
  }
  processError(error) {
    return __async(this, null, function* () {
      let processedError = error;
      for (const interceptor of this.errorInterceptors) {
        processedError = yield interceptor(processedError);
      }
      return processedError;
    });
  }
  clear() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }
  getRequestInterceptors() {
    return [...this.requestInterceptors];
  }
  getResponseInterceptors() {
    return [...this.responseInterceptors];
  }
  getErrorInterceptors() {
    return [...this.errorInterceptors];
  }
};

// src/core/CacheManager.ts
var CacheManager = class {
  constructor(options = {}) {
    this.misses = 0;
    this.options = __spreadValues({
      ttl: 6e4,
      maxSize: 100,
      strategy: "lru",
      keyGenerator: (clientId, payload) => {
        return `${clientId}:${JSON.stringify(payload)}`;
      },
      shouldCache: () => true
    }, options);
    this.cache = /* @__PURE__ */ new Map();
    this.accessOrder = [];
  }
  get(key) {
    return __async(this, null, function* () {
      const entry = this.cache.get(key);
      if (!entry) {
        this.misses++;
        return null;
      }
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.updateAccessOrder(key, false);
        this.misses++;
        return null;
      }
      this.updateAccessOrder(key, true);
      entry.hits++;
      return entry.value;
    });
  }
  set(key, value) {
    return __async(this, null, function* () {
      if (this.cache.size >= this.options.maxSize) {
        this.evict();
      }
      const entry = {
        value,
        timestamp: Date.now(),
        ttl: this.options.ttl,
        hits: 0
      };
      this.cache.set(key, entry);
      this.updateAccessOrder(key, true);
    });
  }
  delete(key) {
    return __async(this, null, function* () {
      this.cache.delete(key);
      this.updateAccessOrder(key, false);
    });
  }
  clear() {
    return __async(this, null, function* () {
      this.cache.clear();
      this.accessOrder = [];
    });
  }
  generateKey(clientId, payload) {
    return this.options.keyGenerator(clientId, payload);
  }
  shouldCache(clientId, payload, response) {
    return this.options.shouldCache(clientId, payload, response);
  }
  evict() {
    switch (this.options.strategy) {
      case "lru":
        const lruKey = this.accessOrder[0];
        if (lruKey) {
          this.cache.delete(lruKey);
          this.accessOrder.shift();
        }
        break;
      case "fifo":
        const fifoKey = this.accessOrder[0];
        if (fifoKey) {
          this.cache.delete(fifoKey);
          this.accessOrder.shift();
        }
        break;
      case "lfu":
        let lfuKey = null;
        let minHits = Infinity;
        for (const [key, entry] of this.cache.entries()) {
          if (entry.hits < minHits) {
            minHits = entry.hits;
            lfuKey = key;
          }
        }
        if (lfuKey) {
          this.cache.delete(lfuKey);
          this.updateAccessOrder(lfuKey, false);
        }
        break;
    }
  }
  updateAccessOrder(key, isAccess) {
    if (isAccess) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      this.accessOrder.push(key);
    } else {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
    }
  }
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hits: Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0),
      misses: this.misses,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp
      }))
    };
  }
  updateOptions(options) {
    this.options = __spreadValues(__spreadValues({}, this.options), options);
  }
};

// src/core/RateLimiter.ts
var TokenBucket = class {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  tryConsume(tokens) {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return { allowed: true, waitTime: 0 };
    }
    const waitTime = (tokens - this.tokens) / this.refillRate;
    return { allowed: false, waitTime };
  }
  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
};
var SlidingWindow = class {
  constructor(maxRequests, windowSize) {
    this.maxRequests = maxRequests;
    this.windowSize = windowSize;
    this.requests = [];
  }
  tryRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(
      (time) => now - time < this.windowSize
    );
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return { allowed: true, waitTime: 0 };
    }
    const oldestRequest = this.requests[0];
    const waitTime = this.windowSize - (now - oldestRequest);
    return { allowed: false, waitTime };
  }
};
var RateLimiter = class {
  constructor(options) {
    this.requestQueue = [];
    this.isProcessing = false;
    this.options = __spreadValues({
      algorithm: "token-bucket",
      queueSize: 0,
      onLimit: () => {
      }
    }, options);
    this.initAlgorithm();
  }
  initAlgorithm() {
    switch (this.options.algorithm) {
      case "token-bucket":
        this.bucket = new TokenBucket(
          this.options.maxRequests,
          this.options.maxRequests / this.options.per
        );
        break;
      case "sliding-window":
        this.slidingWindow = new SlidingWindow(
          this.options.maxRequests,
          this.options.per
        );
        break;
      case "leaky-bucket":
        this.bucket = new TokenBucket(
          this.options.maxRequests,
          this.options.maxRequests / this.options.per
        );
        break;
    }
  }
  tryRequest() {
    return __async(this, null, function* () {
      let result;
      switch (this.options.algorithm) {
        case "token-bucket":
        case "leaky-bucket":
          result = this.bucket.tryConsume(1);
          break;
        case "sliding-window":
          result = this.slidingWindow.tryRequest();
          break;
        default:
          result = { allowed: true, waitTime: 0 };
      }
      if (!result.allowed) {
        this.options.onLimit(result.waitTime);
        if (this.options.queueSize > 0 && this.requestQueue.length < this.options.queueSize) {
          return new Promise((resolve) => {
            this.requestQueue.push(() => {
              resolve({ allowed: true, waitTime: 0 });
            });
          });
        }
      }
      return result;
    });
  }
  processQueue() {
    return __async(this, null, function* () {
      if (this.isProcessing || this.requestQueue.length === 0) {
        return;
      }
      this.isProcessing = true;
      while (this.requestQueue.length > 0) {
        const result = yield this.tryRequest();
        if (result.allowed) {
          const callback = this.requestQueue.shift();
          callback == null ? void 0 : callback();
        } else {
          yield this.sleep(result.waitTime);
        }
      }
      this.isProcessing = false;
    });
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  getStats() {
    return {
      algorithm: this.options.algorithm,
      maxRequests: this.options.maxRequests,
      per: this.options.per,
      queueSize: this.requestQueue.length,
      queueCapacity: this.options.queueSize
    };
  }
  updateOptions(options) {
    this.options = __spreadValues(__spreadValues({}, this.options), options);
    this.initAlgorithm();
  }
};

// src/core/MiddlewareManager.ts
var MiddlewareManager = class {
  constructor() {
    this.middlewares = [];
  }
  use(middleware) {
    this.middlewares.push(middleware);
  }
  execute(context, handler) {
    return __async(this, null, function* () {
      let index = 0;
      const next = () => __async(this, null, function* () {
        if (index < this.middlewares.length) {
          const middleware = this.middlewares[index++];
          yield middleware(context, next);
        }
      });
      yield next();
      return handler();
    });
  }
  clear() {
    this.middlewares = [];
  }
  getMiddlewares() {
    return [...this.middlewares];
  }
};

// src/config/ConfigResolver.ts
var ConfigResolver = class {
  constructor() {
    this.resolvers = {
      headers: (value) => this.resolveHeaders(value),
      params: (value) => this.resolveParams(value),
      args: (value) => this.resolveArgs(value),
      env: (value) => this.resolveEnv(value)
    };
  }
  resolveValue(v) {
    return v.replace(/\$\{([a-zA-Z0-9_]+)\}/g, (_, name) => {
      var _a;
      return (_a = process.env[name]) != null ? _a : "";
    });
  }
  resolveHeaders(headers = {}) {
    const res = {};
    for (const [k, v] of Object.entries(headers)) res[k] = this.resolveValue(v);
    return res;
  }
  resolveParams(params = {}) {
    const res = {};
    for (const [k, v] of Object.entries(params)) {
      res[k] = typeof v === "string" ? this.resolveValue(v) : v;
    }
    return res;
  }
  resolveArgs(args = []) {
    return args.map((arg) => this.resolveValue(arg));
  }
  resolveEnv(env = {}) {
    const res = {};
    for (const [k, v] of Object.entries(env)) res[k] = this.resolveValue(v);
    return res;
  }
  resolve(config) {
    if (!config || typeof config !== "object") return config;
    if (Array.isArray(config)) {
      return config.map((item) => this.resolve(item));
    }
    const resolved = {};
    for (const [key, value] of Object.entries(config)) {
      if (this.resolvers[key]) {
        resolved[key] = this.resolvers[key](value);
      } else if (typeof value === "string") {
        resolved[key] = this.resolveValue(value);
      } else if (typeof value === "object") {
        resolved[key] = this.resolve(value);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }
  /**
   * 添加自定义解析器
   * @param key 解析器键
   * @param resolver 解析器函数
   */
  addResolver(key, resolver) {
    this.resolvers[key] = resolver;
  }
  /**
   * 移除自定义解析器
   * @param key 解析器键
   */
  removeResolver(key) {
    delete this.resolvers[key];
  }
};

// src/config/ConfigValidator.ts
var ConfigValidator = class {
  constructor() {
    this.validationRules = {
      transport: {
        required: true,
        type: ["streamable-http", "stdio"]
      },
      url: {
        required: true,
        dependsOn: {
          field: "transport",
          value: "streamable-http"
        }
      },
      command: {
        required: true,
        dependsOn: {
          field: "transport",
          value: "stdio"
        }
      },
      headers: {
        type: "object"
      },
      args: {
        type: "array"
      },
      env: {
        type: "object"
      },
      defaultParams: {
        type: "object"
      }
    };
  }
  validate(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid config: must be an object");
    }
    if (!config.mcpServers || typeof config.mcpServers !== "object") {
      throw new Error("Invalid config: mcpServers must be an object");
    }
    for (const [id, serverConfig] of Object.entries(config.mcpServers)) {
      this.validateServerConfig(id, serverConfig);
    }
  }
  validateServerConfig(id, config) {
    if (!config || typeof config !== "object") {
      throw new Error(`Invalid server config for ${id}: must be an object`);
    }
    for (const [field, rule] of Object.entries(this.validationRules)) {
      const value = config[field];
      if (rule.dependsOn) {
        const dependencyValue = config[rule.dependsOn.field];
        if (dependencyValue !== rule.dependsOn.value) {
          continue;
        }
      }
      if (rule.required && value === void 0) {
        throw new Error(`Invalid server config for ${id}: ${field} is required`);
      }
      if (value !== void 0 && rule.type) {
        if (Array.isArray(rule.type)) {
          if (!rule.type.includes(value)) {
            throw new Error(
              `Invalid server config for ${id}: ${field} must be one of ${rule.type.join(", ")}`
            );
          }
        } else {
          if (rule.type === "array" && !Array.isArray(value)) {
            throw new Error(`Invalid server config for ${id}: ${field} must be an array`);
          } else if (rule.type === "object" && typeof value !== "object") {
            throw new Error(`Invalid server config for ${id}: ${field} must be an object`);
          }
        }
      }
    }
  }
  /**
   * 添加验证规则
   * @param field 字段名
   * @param rule 验证规则
   */
  addValidationRule(field, rule) {
    this.validationRules[field] = rule;
  }
  /**
   * 移除验证规则
   * @param field 字段名
   */
  removeValidationRule(field) {
    delete this.validationRules[field];
  }
};

// src/core/McpContext.ts
var McpContext = class {
  constructor() {
    this.environmentDetector = new EnvironmentDetector();
    this.adapterFactory = new AdapterFactory();
    this.configResolver = new ConfigResolver();
    this.configValidator = new ConfigValidator();
  }
  getEnvironmentDetector() {
    return this.environmentDetector;
  }
  getAdapterFactory() {
    return this.adapterFactory;
  }
  getConfigResolver() {
    return this.configResolver;
  }
  getConfigValidator() {
    return this.configValidator;
  }
};

// src/core/PluginManager.ts
var PluginManager = class {
  constructor(options = {}) {
    this.plugins = /* @__PURE__ */ new Map();
    this.context = new McpContext();
    if (options.plugins) {
      for (const plugin of options.plugins) {
        this.register(plugin);
      }
    }
  }
  register(plugin) {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }
    this.plugins.set(plugin.name, plugin);
    if (plugin.initialize) {
      const pluginContext = {
        context: this.context,
        options: {}
      };
      plugin.initialize(pluginContext);
    }
  }
  unregister(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    if (plugin.destroy) {
      plugin.destroy();
    }
    this.plugins.delete(name);
  }
  getPlugins() {
    return Array.from(this.plugins.values());
  }
  getPlugin(name) {
    return this.plugins.get(name);
  }
  configure(name, options) {
    return __async(this, null, function* () {
      const plugin = this.plugins.get(name);
      if (!plugin) {
        throw new Error(`Plugin ${name} not found`);
      }
      if (plugin.configure) {
        yield plugin.configure(options);
      }
    });
  }
  executeBeforeRequest(config) {
    return __async(this, null, function* () {
      let processedConfig = config;
      for (const plugin of this.plugins.values()) {
        if (plugin.beforeRequest) {
          processedConfig = yield plugin.beforeRequest(processedConfig);
        }
      }
      return processedConfig;
    });
  }
  executeAfterRequest(config) {
    return __async(this, null, function* () {
      let processedConfig = config;
      for (const plugin of this.plugins.values()) {
        if (plugin.afterRequest) {
          processedConfig = yield plugin.afterRequest(processedConfig);
        }
      }
      return processedConfig;
    });
  }
  executeBeforeResponse(response) {
    return __async(this, null, function* () {
      let processedResponse = response;
      for (const plugin of this.plugins.values()) {
        if (plugin.beforeResponse) {
          processedResponse = yield plugin.beforeResponse(processedResponse);
        }
      }
      return processedResponse;
    });
  }
  executeAfterResponse(response) {
    return __async(this, null, function* () {
      let processedResponse = response;
      for (const plugin of this.plugins.values()) {
        if (plugin.afterResponse) {
          processedResponse = yield plugin.afterResponse(processedResponse);
        }
      }
      return processedResponse;
    });
  }
  executeOnError(error) {
    return __async(this, null, function* () {
      let processedError = error;
      for (const plugin of this.plugins.values()) {
        if (plugin.onError) {
          processedError = yield plugin.onError(processedError);
        }
      }
      return processedError;
    });
  }
  destroy() {
    return __async(this, null, function* () {
      for (const plugin of this.plugins.values()) {
        if (plugin.destroy) {
          yield plugin.destroy();
        }
      }
      this.plugins.clear();
    });
  }
};

// src/core/McpExecutor.ts
var McpExecutor = class {
  constructor(registry, logger, retryOptions, cacheOptions, rateLimitOptions, plugins, concurrencyOptions) {
    this.registry = registry;
    this.logger = logger;
    this.executionQueue = Promise.resolve();
    // 并发控制相关属性
    this.concurrencyQueue = [];
    this.currentConcurrency = 0;
    this.maxConcurrency = 5;
    this.maxQueueLength = 100;
    this.overflowStrategy = "wait";
    this.rejectedRequests = 0;
    this.processedRequests = 0;
    this.retryManager = new RetryManager(retryOptions);
    this.eventManager = new EventManager();
    this.interceptorManager = new InterceptorManager();
    this.cacheManager = new CacheManager(cacheOptions);
    this.rateLimiter = new RateLimiter(rateLimitOptions || {
      maxRequests: 10,
      per: 6e4
    });
    this.middlewareManager = new MiddlewareManager();
    this.pluginManager = new PluginManager({ plugins });
    if (concurrencyOptions) {
      this.maxConcurrency = concurrencyOptions.maxConcurrency || 5;
      this.maxQueueLength = concurrencyOptions.maxQueueLength || 100;
      this.overflowStrategy = concurrencyOptions.overflowStrategy || "wait";
    }
  }
  execute(_0, _1) {
    return __async(this, arguments, function* (id, payload, options = {}) {
      const context = {
        clientId: id,
        payload,
        options
      };
      return this.middlewareManager.execute(context, () => {
        return new Promise((resolve, reject) => {
          if (this.concurrencyQueue.length >= this.maxQueueLength) {
            if (this.overflowStrategy === "reject") {
              this.rejectedRequests++;
              const error = new Error("Concurrency queue overflow");
              this.eventManager.emit("concurrency:overflow", { clientId: id, payload, error });
              reject(error);
              return;
            }
          }
          const queueItem = {
            priority: options.priority || 0,
            execute: () => __async(this, null, function* () {
              try {
                const {
                  preExecute,
                  onChunk,
                  afterExecute
                } = options;
                preExecute == null ? void 0 : preExecute();
                if (!options.skipRateLimit) {
                  const result2 = yield this.rateLimiter.tryRequest();
                  if (!result2.allowed) {
                    this.eventManager.emit("rateLimit:hit", {
                      clientId: id,
                      payload,
                      waitTime: result2.waitTime
                    });
                    if (result2.waitTime > 0) {
                      yield this.sleep(result2.waitTime);
                    }
                  }
                }
                const cacheKey = this.cacheManager.generateKey(id, payload);
                if (!options.noCache) {
                  const cached = yield this.cacheManager.get(cacheKey);
                  if (cached !== null) {
                    this.eventManager.emit("cache:hit", { clientId: id, payload, response: cached });
                    return cached;
                  }
                }
                let config = { clientId: id, payload, options };
                config = yield this.pluginManager.executeBeforeRequest(config);
                config = yield this.interceptorManager.processRequest(config);
                config = yield this.pluginManager.executeAfterRequest(config);
                this.eventManager.emit("request", {
                  clientId: config.clientId,
                  payload: config.payload,
                  options: config.options
                });
                const result = yield this.retryManager.execute(() => __async(this, null, function* () {
                  const client = this.registry.getClient(config.clientId);
                  if (!client) {
                    throw new Error(`Client ${config.clientId} not found`);
                  }
                  const defaultParams = this.registry.getDefaultParams(config.clientId) || {};
                  const finalPayload = __spreadProps(__spreadValues({}, config.payload), {
                    params: __spreadValues(__spreadValues({}, defaultParams), config.payload.params || {})
                  });
                  let fullText = "";
                  const chunkHandler = (line) => {
                    try {
                      const obj = JSON.parse(line);
                      if (obj.response) fullText += obj.response;
                      onChunk == null ? void 0 : onChunk(obj);
                    } catch (e) {
                    }
                  };
                  const response2 = yield client.send(finalPayload, chunkHandler);
                  fullText = typeof response2 === "string" ? response2 : JSON.stringify(response2);
                  return fullText;
                }));
                const response = { data: result };
                let processedResponse = yield this.pluginManager.executeBeforeResponse(response);
                processedResponse = yield this.interceptorManager.processResponse(processedResponse);
                processedResponse = yield this.pluginManager.executeAfterResponse(processedResponse);
                if (!options.noCache && this.cacheManager.shouldCache(id, payload, processedResponse.data)) {
                  yield this.cacheManager.set(cacheKey, processedResponse.data);
                  this.eventManager.emit("cache:miss", { clientId: id, payload, response: processedResponse.data });
                }
                this.eventManager.emit("response", {
                  clientId: config.clientId,
                  payload: config.payload,
                  response: processedResponse
                });
                afterExecute == null ? void 0 : afterExecute(processedResponse.data);
                return processedResponse.data;
              } catch (err) {
                const error = err;
                let processedError = error;
                processedError = yield this.pluginManager.executeOnError(processedError);
                processedError = yield this.interceptorManager.processError(processedError);
                this.eventManager.emit("error", {
                  clientId: id,
                  payload,
                  error: processedError
                });
                this.logger.error("Execution error", { clientId: id, error: processedError });
                return Promise.reject(processedError);
              } finally {
                this.processedRequests++;
                this.currentConcurrency--;
                this.processQueue();
              }
            }),
            resolve,
            reject
          };
          this.concurrencyQueue.push(queueItem);
          this.processQueue();
        });
      });
    });
  }
  // 处理队列
  processQueue() {
    while (this.currentConcurrency < this.maxConcurrency && this.concurrencyQueue.length > 0) {
      let highestPriorityIndex = 0;
      let highestPriority = this.concurrencyQueue[0].priority || 0;
      for (let i = 1; i < this.concurrencyQueue.length; i++) {
        const currentPriority = this.concurrencyQueue[i].priority || 0;
        if (currentPriority > highestPriority) {
          highestPriority = currentPriority;
          highestPriorityIndex = i;
        }
      }
      const queueItem = this.concurrencyQueue.splice(highestPriorityIndex, 1)[0];
      if (queueItem) {
        this.currentConcurrency++;
        queueItem.execute().then(queueItem.resolve).catch(queueItem.reject);
      }
    }
  }
  clearQueue() {
    this.executionQueue = Promise.resolve();
    this.concurrencyQueue = [];
    this.currentConcurrency = 0;
    this.logger.info("Execution queue cleared");
  }
  // 获取并发状态
  getConcurrencyStats() {
    return {
      currentConcurrency: this.currentConcurrency,
      queueLength: this.concurrencyQueue.length,
      maxConcurrency: this.maxConcurrency,
      maxQueueLength: this.maxQueueLength,
      rejectedRequests: this.rejectedRequests,
      processedRequests: this.processedRequests
    };
  }
  // 更新并发控制选项
  updateConcurrencyOptions(options) {
    if (options.maxConcurrency !== void 0) {
      this.maxConcurrency = options.maxConcurrency;
    }
    if (options.maxQueueLength !== void 0) {
      this.maxQueueLength = options.maxQueueLength;
    }
    if (options.overflowStrategy !== void 0) {
      this.overflowStrategy = options.overflowStrategy;
    }
    this.processQueue();
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  getRetryManager() {
    return this.retryManager;
  }
  getEventManager() {
    return this.eventManager;
  }
  get interceptors() {
    return {
      request: {
        use: (interceptor) => this.interceptorManager.useRequest(interceptor)
      },
      response: {
        use: (interceptor) => this.interceptorManager.useResponse(interceptor)
      },
      error: {
        use: (interceptor) => this.interceptorManager.useError(interceptor)
      },
      clear: () => this.interceptorManager.clear()
    };
  }
  get cache() {
    return {
      get: (key) => this.cacheManager.get(key),
      set: (key, value) => this.cacheManager.set(key, value),
      delete: (key) => this.cacheManager.delete(key),
      clear: () => this.cacheManager.clear(),
      getStats: () => this.cacheManager.getStats(),
      updateOptions: (options) => this.cacheManager.updateOptions(options)
    };
  }
  get rateLimit() {
    return {
      tryRequest: () => this.rateLimiter.tryRequest(),
      getStats: () => this.rateLimiter.getStats(),
      updateOptions: (options) => this.rateLimiter.updateOptions(options)
    };
  }
  get middleware() {
    return {
      use: (middleware) => this.middlewareManager.use(middleware),
      clear: () => this.middlewareManager.clear()
    };
  }
  get plugins() {
    return {
      register: (plugin) => this.pluginManager.register(plugin),
      unregister: (name) => this.pluginManager.unregister(name),
      get: (name) => this.pluginManager.getPlugin(name),
      getAll: () => this.pluginManager.getPlugins(),
      configure: (name, options) => this.pluginManager.configure(name, options),
      clear: () => this.pluginManager.destroy()
    };
  }
  get concurrency() {
    return {
      getStats: () => this.getConcurrencyStats(),
      updateOptions: (options) => this.updateConcurrencyOptions(options),
      clearQueue: () => this.clearQueue()
    };
  }
  getPluginManager() {
    return this.pluginManager;
  }
};

// src/config/ConfigLoader.ts
var import_node_fs = __toESM(require("fs"), 1);
var import_node_path = __toESM(require("path"), 1);
var ConfigLoader = class {
  constructor() {
    this.resolver = new ConfigResolver();
    this.validator = new ConfigValidator();
  }
  loadFromFile(configPath) {
    const absolutePath = import_node_path.default.resolve(configPath);
    if (!import_node_fs.default.existsSync(absolutePath)) {
      throw new Error(`Config file not found: ${absolutePath}`);
    }
    const content = import_node_fs.default.readFileSync(absolutePath, "utf-8");
    const config = JSON.parse(content);
    this.validator.validate(config);
    const resolvedConfig = this.resolver.resolve(config);
    return resolvedConfig;
  }
  loadFromObject(config) {
    this.validator.validate(config);
    const resolvedConfig = this.resolver.resolve(config);
    return resolvedConfig;
  }
};

// src/logger/Logger.ts
var Logger = class {
  constructor(level = "info", format = "text") {
    this.level = level;
    this.format = format;
  }
  shouldLog(level) {
    const levels = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
  log(level, message, data) {
    if (!this.shouldLog(level)) return;
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const logEntry = __spreadValues({
      timestamp,
      level,
      message
    }, data ? { data } : {});
    if (this.format === "json") {
      console.log(JSON.stringify(logEntry));
    } else {
      const dataStr = data ? ` ${JSON.stringify(data)}` : "";
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`);
    }
  }
  debug(message, data) {
    this.log("debug", message, data);
  }
  info(message, data) {
    this.log("info", message, data);
  }
  warn(message, data) {
    this.log("warn", message, data);
  }
  error(message, data) {
    this.log("error", message, data);
  }
};

// src/index.ts
import_dotenv.default.config();
var McpClientLoaderSdk = class _McpClientLoaderSdk {
  constructor(registry, executor, logger, context) {
    this.registry = registry;
    this.executor = executor;
    this.logger = logger;
    this.configLoader = new ConfigLoader();
    this.context = context;
  }
  static init() {
    return __async(this, arguments, function* (options = {}) {
      const logger = new Logger(options.logLevel || "info");
      const context = new McpContext();
      const registry = new McpRegistry(logger, context.getConfigResolver(), context.getConfigValidator());
      const executor = new McpExecutor(
        registry,
        logger,
        options.retryOptions,
        options.cacheOptions,
        options.rateLimitOptions,
        options.plugins,
        options.concurrencyOptions
      );
      const sdk = new _McpClientLoaderSdk(registry, executor, logger, context);
      if (options.configPath) {
        const config = sdk.configLoader.loadFromFile(options.configPath);
        yield registry.registerFromConfig(config);
      } else if (options.config) {
        const config = sdk.configLoader.loadFromObject(options.config);
        yield registry.registerFromConfig(config);
      }
      return sdk;
    });
  }
  getContext() {
    return this.context;
  }
  getEnvironmentDetector() {
    return this.context.getEnvironmentDetector();
  }
  getAdapterFactory() {
    return this.context.getAdapterFactory();
  }
  getConfigResolver() {
    return this.context.getConfigResolver();
  }
  getConfigValidator() {
    return this.context.getConfigValidator();
  }
  enableRetry(options) {
    this.executor.getRetryManager().updateOptions(options);
  }
  disableRetry() {
    this.executor.getRetryManager().updateOptions({ maxAttempts: 1 });
  }
  on(eventType, listener) {
    this.executor.getEventManager().on(eventType, listener);
  }
  off(eventType, listener) {
    this.executor.getEventManager().off(eventType, listener);
  }
  once(eventType, listener) {
    this.executor.getEventManager().once(eventType, listener);
  }
  removeAllListeners(eventType) {
    this.executor.getEventManager().removeAllListeners(eventType);
  }
  get interceptors() {
    return this.executor.interceptors;
  }
  get cache() {
    return this.executor.cache;
  }
  get rateLimit() {
    return this.executor.rateLimit;
  }
  get middleware() {
    return this.executor.middleware;
  }
  get plugins() {
    return this.executor.plugins;
  }
  get concurrency() {
    return this.executor.concurrency;
  }
  registerPlugin(plugin) {
    this.executor.plugins.register(plugin);
  }
  getPlugins() {
    return this.executor.plugins.getAll();
  }
  execute(_0, _1) {
    return __async(this, arguments, function* (id, payload, options = {}) {
      return this.executor.execute(id, payload, options);
    });
  }
  registerClient(id, config) {
    return __async(this, null, function* () {
      yield this.registry.registerClient(id, config);
    });
  }
  getClient(id) {
    return this.registry.getClient(id);
  }
  removeClient(id) {
    this.registry.removeClient(id);
  }
  getClientIds() {
    return this.registry.getClientIds();
  }
  clear() {
    this.registry.clear();
    this.executor.clearQueue();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AdapterFactory,
  CacheManager,
  ConfigLoader,
  ConfigResolver,
  ConfigValidator,
  EnvironmentDetector,
  EventManager,
  HttpClient,
  InterceptorManager,
  Logger,
  McpClientLoaderSdk,
  McpContext,
  McpExecutor,
  McpRegistry,
  MiddlewareManager,
  PluginManager,
  RateLimiter,
  RetryManager,
  StdioClient
});
