import type { Environment, FetchAdapter } from './types';
import { EnvironmentDetector } from './EnvironmentDetector';
import { NodeFetchAdapter } from './NodeFetchAdapter';
import { BrowserAdapter } from './BrowserAdapter';
import { ReactNativeAdapter } from './ReactNativeAdapter';
import { WxMiniProgramAdapter } from './WxMiniProgramAdapter';

export class AdapterFactory {
  private detector: EnvironmentDetector;

  constructor() {
    this.detector = new EnvironmentDetector();
  }

  // 适配器映射
  private readonly adapterMap: Record<Environment, () => FetchAdapter> = {
    node: () => new NodeFetchAdapter(),
    browser: () => new BrowserAdapter(),
    'react-native': () => new ReactNativeAdapter(),
    'wx-miniprogram': () => new WxMiniProgramAdapter(),
    deno: () => new BrowserAdapter(),
    bun: () => new NodeFetchAdapter(),
    unknown: () => new BrowserAdapter(),
  };

  createAdapter(env?: Environment): FetchAdapter {
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
  addAdapter(environment: Environment, factory: () => FetchAdapter): void {
    this.adapterMap[environment] = factory;
  }

  /**
   * 移除适配器
   * @param environment 环境名称
   */
  removeAdapter(environment: Environment): void {
    delete this.adapterMap[environment];
  }

  detectEnvironment(): Environment {
    return this.detector.detect();
  }
}
