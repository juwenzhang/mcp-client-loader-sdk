import type { McpConfig, McpServerConfig } from '../types';

export class ConfigValidator {
  private readonly validationRules: Record<string, {
    type?: string | string[];
    required?: boolean;
    dependsOn?: {
      field: string;
      value: any;
    };
  }> = {
    transport: {
      required: true,
      type: ['streamable-http', 'stdio'],
    },
    url: {
      required: true,
      dependsOn: {
        field: 'transport',
        value: 'streamable-http',
      },
    },
    command: {
      required: true,
      dependsOn: {
        field: 'transport',
        value: 'stdio',
      },
    },
    headers: {
      type: 'object',
    },
    args: {
      type: 'array',
    },
    env: {
      type: 'object',
    },
    defaultParams: {
      type: 'object',
    },
  };

  validate(config: any): asserts config is McpConfig {
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid config: must be an object');
    }

    if (!config.mcpServers || typeof config.mcpServers !== 'object') {
      throw new Error('Invalid config: mcpServers must be an object');
    }

    for (const [id, serverConfig] of Object.entries(config.mcpServers)) {
      this.validateServerConfig(id, serverConfig);
    }
  }

  validateServerConfig(id: string, config: any): asserts config is McpServerConfig {
    if (!config || typeof config !== 'object') {
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

      if (rule.required && value === undefined) {
        throw new Error(`Invalid server config for ${id}: ${field} is required`);
      }

      if (value !== undefined && rule.type) {
        if (Array.isArray(rule.type)) {
          if (!rule.type.includes(value)) {
            throw new Error(
              `Invalid server config for ${id}: ${field} must be one of ${rule.type.join(', ')}`
            );
          }
        } else {
          if (rule.type === 'array' && !Array.isArray(value)) {
            throw new Error(`Invalid server config for ${id}: ${field} must be an array`);
          } else if (rule.type === 'object' && typeof value !== 'object') {
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
  addValidationRule(field: string, rule: {
    type?: string | string[];
    required?: boolean;
    dependsOn?: {
      field: string;
      value: any;
    };
  }): void {
    this.validationRules[field] = rule;
  }

  /**
   * 移除验证规则
   * @param field 字段名
   */
  removeValidationRule(field: string): void {
    delete this.validationRules[field];
  }
}
