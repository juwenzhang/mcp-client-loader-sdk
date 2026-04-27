/**
 * 这一行主要是为了加载微信小程序的 API 类型定义，确保在小程序环境中可以正常运行类型检查
 */
/// <reference types="miniprogram-api-typings" />

import type { Environment } from './types';

declare const wx: any;
declare const Deno: any;
declare const Bun: any;

export class EnvironmentDetector {
  private readonly environmentChecks: Array<{
    check: () => boolean;
    environment: Environment;
  }> = [
    { check: () => typeof wx !== 'undefined' && wx.request, environment: 'wx-miniprogram' },
    { check: () => typeof navigator !== 'undefined' && navigator.product === 'ReactNative', environment: 'react-native' },
    { check: () => typeof Deno !== 'undefined', environment: 'deno' },
    { check: () => typeof Bun !== 'undefined', environment: 'bun' },
    { check: () => typeof process !== 'undefined' && !!process.versions?.node, environment: 'node' },
    { check: () => typeof window !== 'undefined' && typeof window.fetch === 'function', environment: 'browser' },
  ];

  detect(): Environment {
    for (const { check, environment } of this.environmentChecks) {
      try {
        if (check()) {
          return environment;
        }
      } catch (e) {}
    }
    return 'unknown';
  }

  /**
   * 添加自定义环境检测
   * @param check 检测函数
   * @param environment 环境名称
   * @param index 插入位置，默认添加到末尾
   */
  addEnvironmentCheck(check: () => boolean, environment: Environment, index?: number): void {
    if (index !== undefined) {
      this.environmentChecks.splice(index, 0, { check, environment });
    } else {
      this.environmentChecks.push({ check, environment });
    }
  }

  /**
   * 移除环境检测
   * @param environment 环境名称
   */
  removeEnvironmentCheck(environment: Environment): void {
    const index = this.environmentChecks.findIndex(item => item.environment === environment);
    if (index > -1) {
      this.environmentChecks.splice(index, 1);
    }
  }
}
