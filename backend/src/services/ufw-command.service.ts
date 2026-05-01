import { spawn } from 'child_process';
import { env } from '../config/env';

function runCommand(bin: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      resolve({ stdout, stderr: `${stderr}\nTimed out executing ufw command`, code: 124 });
    }, 15000);

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, code: code ?? 1 });
    });
  });
}

export class UfwCommandService {
  static async run(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
    if (env.ufwContainerName) {
      return runCommand('docker', ['exec', env.ufwContainerName, '/usr/sbin/ufw', ...args]).catch(() => ({
        stdout: '',
        stderr: `docker exec failed for container ${env.ufwContainerName}`,
        code: 1
      }));
    }

    const direct = await runCommand('/usr/sbin/ufw', args).catch(() => ({ stdout: '', stderr: 'ufw binary execution failed', code: 1 }));
    if (direct.code === 0) return direct;

    const sudoRes = await runCommand('sudo', ['-n', '/usr/sbin/ufw', ...args]).catch(() => ({ stdout: '', stderr: 'sudo ufw execution failed', code: 1 }));
    return {
      stdout: sudoRes.stdout || direct.stdout,
      stderr: `${direct.stderr}\n${sudoRes.stderr}`.trim(),
      code: sudoRes.code
    };
  }
}
