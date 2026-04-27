import { EnvironmentDetector, AdapterFactory } from '../adapters';
import { ConfigResolver } from '../config/ConfigResolver';
import { ConfigValidator } from '../config/ConfigValidator';

export class McpContext {
  private environmentDetector: EnvironmentDetector;
  private adapterFactory: AdapterFactory;
  private configResolver: ConfigResolver;
  private configValidator: ConfigValidator;

  constructor() {
    this.environmentDetector = new EnvironmentDetector();
    this.adapterFactory = new AdapterFactory();
    this.configResolver = new ConfigResolver();
    this.configValidator = new ConfigValidator();
  }

  getEnvironmentDetector(): EnvironmentDetector {
    return this.environmentDetector;
  }

  getAdapterFactory(): AdapterFactory {
    return this.adapterFactory;
  }

  getConfigResolver(): ConfigResolver {
    return this.configResolver;
  }

  getConfigValidator(): ConfigValidator {
    return this.configValidator;
  }
}
