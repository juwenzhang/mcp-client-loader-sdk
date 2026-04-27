import type { McpConfig, McpServerConfig } from '../types';
import { HttpClient } from '../clients/HttpClient';
import { StdioClient } from '../clients/StdioClient';
import { Logger } from '../logger/Logger';
import { ConfigResolver } from '../config/ConfigResolver';
import { ConfigValidator } from '../config/ConfigValidator';

export class McpRegistry {
  private clients: Record<string, { client: any; defaultParams?: any }> = {};
  private resolver: ConfigResolver;
  private validator: ConfigValidator;

  constructor(private logger: Logger, resolver: ConfigResolver, validator: ConfigValidator) {
    this.resolver = resolver;
    this.validator = validator;
  }

  async registerFromConfig(config: McpConfig): Promise<void> {
    this.logger.info('Registering clients from config');
    
    for (const [id, cfg] of Object.entries(config.mcpServers)) {
      if (!cfg.enabled) {
        this.logger.debug(`Skipping disabled client: ${id}`);
        continue;
      }

      await this.registerClient(id, cfg);
    }
  }

  async registerClient(id: string, cfg: McpServerConfig): Promise<void> {
    this.logger.debug(`Registering client: ${id}`);

    let client: any;
    if (cfg.transport === 'streamable-http') {
      if (!cfg.url) throw new Error(`[${id}] missing url`);
      const resolvedUrl = this.resolver.resolveValue(cfg.url);
      const resolvedHeaders = this.resolver.resolveHeaders(cfg.headers);
      client = new HttpClient({
        url: resolvedUrl,
        headers: resolvedHeaders,
        timeout: cfg.timeout ?? 30000
      });
    } else if (cfg.transport === 'stdio') {
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
        timeout: cfg.timeout ?? 60000
      });
    } else {
      throw new Error(`[${id}] unsupported transport: ${cfg.transport}`);
    }

    const defaultParams = this.resolver.resolveParams(cfg.defaultParams);
    this.clients[id] = { client, defaultParams };
    this.logger.info(`Client registered: ${id}`);
  }

  getClient(id: string): any {
    return this.clients[id]?.client;
  }

  getDefaultParams(id: string): any {
    return this.clients[id]?.defaultParams;
  }

  removeClient(id: string): void {
    if (this.clients[id]) {
      this.clients[id].client.close();
      delete this.clients[id];
      this.logger.info(`Client removed: ${id}`);
    }
  }

  getClientIds(): string[] {
    return Object.keys(this.clients);
  }

  clear(): void {
    for (const id of Object.keys(this.clients)) {
      this.removeClient(id);
    }
  }
}
