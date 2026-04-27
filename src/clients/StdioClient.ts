import { spawn, ChildProcess, StdioOptions } from 'child_process';
import { McpClient } from '../core/McpClient';
import { McpTimeoutError } from '../errors/McpError';

export interface StdioClientOptions {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  timeout?: number;
  autoRestart?: boolean;
  restartAttempts?: number;
  restartDelay?: number;
  encoding?: 'utf8' | 'buffer';
  stdio?: StdioOptions;
}

export class StdioClient extends McpClient {
  private process: ChildProcess | null = null;
  private restartCount = 0;
  private isRestarting = false;

  constructor(private options: StdioClientOptions) {
    super();
    this.options = {
      args: [],
      env: {},
      cwd: process.cwd(),
      timeout: 60000,
      autoRestart: false,
      restartAttempts: 3,
      restartDelay: 1000,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options,
    };
  }

  async send(
    payload: unknown,
    onChunk?: (line: string) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';
      let error = '';
      let isResolved = false;

      const startProcess = () => {
        this.process = spawn(this.options.command, this.options.args || [], {
          cwd: this.options.cwd,
          env: { ...process.env, ...this.options.env },
          stdio: this.options.stdio,
        });

        const timer = setTimeout(() => {
          if (!isResolved) {
            this.killProcess();
            reject(new McpTimeoutError('StdioClient timeout'));
          }
        }, this.options.timeout);

        if (this.process) {
          this.process.stdout?.on('data', (data) => {
            const dataStr = this.options.encoding === 'utf8' 
              ? data.toString('utf8') 
              : data.toString('base64');
            output += dataStr;
            onChunk?.(dataStr);
          });

          this.process.stderr?.on('data', (data) => {
            const dataStr = this.options.encoding === 'utf8' 
              ? data.toString('utf8') 
              : data.toString('base64');
            error += dataStr;
          });

          this.process.on('error', (err) => {
            clearTimeout(timer);
            if (!isResolved) {
              this.handleProcessError(err, reject);
            }
          });

          this.process.on('close', (code, signal) => {
            clearTimeout(timer);
            
            if (isResolved) return;

            if (code === 0) {
              isResolved = true;
              resolve(output.trim());
            } else {
              const errorMessage = signal 
                ? `Process killed with signal: ${signal}`
                : `Process exit code: ${code}\n${error}`;
              
              this.handleProcessError(new Error(errorMessage), reject);
            }
          });

          try {
            const input = typeof payload === 'string' 
              ? payload 
              : JSON.stringify(payload);

            if (this.process.stdin) {
              this.process.stdin.write(input);
              this.process.stdin.write('\n');
              this.process.stdin.end();
            }
          } catch (err) {
            clearTimeout(timer);
            this.killProcess();
            reject(new Error(`Failed to write to process stdin: ${(err as Error).message}`));
          }
        } else {
          clearTimeout(timer);
          reject(new Error('Failed to create process'));
        }
      };

      startProcess();
    });
  }

  private handleProcessError(err: Error, reject: (reason?: any) => void): void {
    if (this.options.autoRestart && this.restartCount < (this.options.restartAttempts || 3)) {
      this.restartCount++;
      console.warn(`Process error (${this.restartCount}/${this.options.restartAttempts}):`, err.message);
      console.warn('Attempting to restart process...');

      setTimeout(() => {
        this.send({}, (chunk) => {}).catch(reject);
      }, this.options.restartDelay);
    } else {
      reject(err);
    }
  }

  private killProcess(): void {
    if (this.process) {
      try {
        this.process.kill();
      } catch (err) {
        console.error('Error killing process:', err);
      }
      this.process = null;
    }
  }

  start(): void {
    if (!this.process || this.process.killed) {
      this.process = spawn(this.options.command, this.options.args || [], {
        cwd: this.options.cwd,
        env: { ...process.env, ...this.options.env },
        stdio: this.options.stdio,
      });
    }
  }

  stop(): void {
    this.killProcess();
  }

  isRunning(): boolean {
    return this.process !== null && !this.process.killed;
  }

  getProcess(): ChildProcess | null {
    return this.process;
  }
}


