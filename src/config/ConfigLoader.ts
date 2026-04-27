import fs from 'node:fs';
import path from 'node:path';
import type { McpConfig } from '../types';
import { ConfigResolver } from './ConfigResolver';
import { ConfigValidator } from './ConfigValidator';

export class ConfigLoader {
  private resolver: ConfigResolver;
  private validator: ConfigValidator;

  constructor() {
    this.resolver = new ConfigResolver();
    this.validator = new ConfigValidator();
  }

  loadFromFile(configPath: string): McpConfig {
    const absolutePath = path.resolve(configPath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Config file not found: ${absolutePath}`);
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    const config = JSON.parse(content);
    
    this.validator.validate(config);
    const resolvedConfig = this.resolver.resolve(config);
    
    return resolvedConfig;
  }

  loadFromObject(config: McpConfig): McpConfig {
    this.validator.validate(config);
    const resolvedConfig = this.resolver.resolve(config);
    return resolvedConfig;
  }
}
