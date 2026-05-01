"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UfwCommandService = void 0;
const child_process_1 = require("child_process");
const env_1 = require("../config/env");
function runCommand(bin, args) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
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
class UfwCommandService {
    static async run(args) {
        if (env_1.env.ufwContainerName) {
            return runCommand('docker', ['exec', env_1.env.ufwContainerName, '/usr/sbin/ufw', ...args]).catch(() => ({
                stdout: '',
                stderr: `docker exec failed for container ${env_1.env.ufwContainerName}`,
                code: 1
            }));
        }
        const direct = await runCommand('/usr/sbin/ufw', args).catch(() => ({ stdout: '', stderr: 'ufw binary execution failed', code: 1 }));
        if (direct.code === 0)
            return direct;
        const sudoRes = await runCommand('sudo', ['-n', '/usr/sbin/ufw', ...args]).catch(() => ({ stdout: '', stderr: 'sudo ufw execution failed', code: 1 }));
        return {
            stdout: sudoRes.stdout || direct.stdout,
            stderr: `${direct.stderr}\n${sudoRes.stderr}`.trim(),
            code: sudoRes.code
        };
    }
}
exports.UfwCommandService = UfwCommandService;
