import type { RequestConfig, InterceptorResponse, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from '../types/core';

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  useRequest(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  useResponse(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  useError(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  async processRequest(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    return processedConfig;
  }

  async processResponse(response: InterceptorResponse): Promise<InterceptorResponse> {
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    return processedResponse;
  }

  async processError(error: Error): Promise<Error> {
    let processedError = error;
    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError);
    }
    return processedError;
  }

  clear(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  getRequestInterceptors(): RequestInterceptor[] {
    return [...this.requestInterceptors];
  }

  getResponseInterceptors(): ResponseInterceptor[] {
    return [...this.responseInterceptors];
  }

  getErrorInterceptors(): ErrorInterceptor[] {
    return [...this.errorInterceptors];
  }
}
