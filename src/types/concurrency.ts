export interface ConcurrencyOptions {
  maxConcurrency?: number;
  maxQueueLength?: number;
  overflowStrategy?: 'reject' | 'wait';
}

export interface ConcurrencyStats {
  currentConcurrency: number;
  queueLength: number;
  maxConcurrency: number;
  maxQueueLength: number;
  rejectedRequests: number;
  processedRequests: number;
}

export interface QueueItem {
  execute: () => Promise<any>;
  priority?: number;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}
