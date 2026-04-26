import { spawn } from 'child_process';
export class StdioClient {
    command;
    args;
    env;
    cwd;
    timeout;
    constructor(command, args = [], env = {}, cwd = process.cwd(), timeout = 60000) {
        this.command = command;
        this.args = args;
        this.env = env;
        this.cwd = cwd;
        this.timeout = timeout;
    }
    async send(payload) {
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
