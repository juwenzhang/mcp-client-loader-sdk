import { spawn } from 'child_process';

export class StdioClient {
  constructor(
    public command: string,
    public args: string[] = [],
    public env: Record<string, string> = {},
    public cwd: string = process.cwd(),
    public timeout = 60000
  ) {}

  async send(payload: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.command, this.args, {
        cwd: this.cwd,
        env: { ...process.env, ...this.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let error = '';

      const timer = setTimeout(() => {
        proc.kill();
        reject(new Error('StdioClient timeout'));
      }, this.timeout);

      proc.stdout?.on('data', (data) => {
        output += data.toString('utf8');
      });

      proc.stderr?.on('data', (data) => {
        error += data.toString('utf8');
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          return reject(new Error(`Process exit code: ${code}\n${error}`));
        }
        resolve(output.trim());
      });

      const input = typeof payload === 'string' 
        ? payload 
        : JSON.stringify(payload);

      proc.stdin.write(input);
      proc.stdin.write('\n');
      proc.stdin.end();
    });
  }
}