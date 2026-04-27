export class ConfigResolver {
  private readonly resolvers: Record<string, (value: any) => any> = {
    headers: (value: any) => this.resolveHeaders(value),
    params: (value: any) => this.resolveParams(value),
    args: (value: any) => this.resolveArgs(value),
    env: (value: any) => this.resolveEnv(value),
  };

  resolveValue(v: string): string {
    return v.replace(/\$\{([a-zA-Z0-9_]+)\}/g, (_, name) => process.env[name] ?? '');
  }

  resolveHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const res: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) res[k] = this.resolveValue(v);
    return res;
  }

  resolveParams(params: Record<string, any> = {}): Record<string, any> {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(params)) {
      res[k] = typeof v === 'string' ? this.resolveValue(v) : v;
    }
    return res;
  }

  resolveArgs(args: string[] = []): string[] {
    return args.map(arg => this.resolveValue(arg));
  }

  resolveEnv(env: Record<string, string> = {}): Record<string, string> {
    const res: Record<string, string> = {};
    for (const [k, v] of Object.entries(env)) res[k] = this.resolveValue(v);
    return res;
  }

  resolve(config: any): any {
    if (!config || typeof config !== 'object') return config;

    if (Array.isArray(config)) {
      return config.map(item => this.resolve(item));
    }

    const resolved: Record<string, any> = {};
    for (const [key, value] of Object.entries(config)) {
      if (this.resolvers[key]) {
        resolved[key] = this.resolvers[key](value);
      } else if (typeof value === 'string') {
        resolved[key] = this.resolveValue(value);
      } else if (typeof value === 'object') {
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
  addResolver(key: string, resolver: (value: any) => any): void {
    this.resolvers[key] = resolver;
  }

  /**
   * 移除自定义解析器
   * @param key 解析器键
   */
  removeResolver(key: string): void {
    delete this.resolvers[key];
  }
}
