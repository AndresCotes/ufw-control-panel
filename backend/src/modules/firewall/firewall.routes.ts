import { Router } from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { authenticateJWT, authorizeRoles, AuthRequest } from '../../core/middleware/auth.middleware';
import { UfwCommandService } from '../../services/ufw-command.service';
import { AuditService } from '../../services/audit.service';
import { env } from '../../config/env';

const router = Router();

function getInterfaces(): Promise<string[]> {
  return new Promise((resolve) => {
    if (env.ufwContainerName) {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ufw-ifaces-'));
      const listFile = path.join(tmpDir, 'net');
      const cp = spawn('docker', ['cp', `${env.ufwContainerName}:/sys/class/net`, listFile], { stdio: ['ignore', 'pipe', 'pipe'] });
      cp.on('close', () => {
        try {
          const names = fs
            .readdirSync(listFile, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
            .filter((x) => x !== 'lo');
          if (names.length > 0) {
            resolve([...new Set(names)]);
            return;
          }
        } catch {}
        resolve(['eth0']);
      });
      cp.on('error', () => resolve(['eth0']));
      return;
    }

    const command = env.ufwContainerName
      ? { bin: 'docker', args: ['exec', env.ufwContainerName, 'ip', '-o', 'link', 'show'] }
      : { bin: 'ip', args: ['-o', 'link', 'show'] };
    const child = spawn(command.bin, command.args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (d) => (out += d.toString()));
    child.on('close', () => {
      const names = out
        .split('\n')
        .map((line) => line.match(/^\d+:\s+([^:]+):/)?.[1]?.trim())
        .filter((x): x is string => Boolean(x))
        .map((x) => x.split('@')[0])
        .filter((x) => x !== 'lo');
      resolve([...new Set(names)]);
    });
    child.on('error', () => resolve([]));
  });
}

router.get('/interfaces', authenticateJWT, authorizeRoles('admin', 'operator', 'viewer'), async (_req, res) => {
  const interfaces = await getInterfaces();
  res.json({ success: true, data: interfaces });
});

router.get('/status', authenticateJWT, authorizeRoles('admin', 'operator', 'viewer'), async (_req, res) => {
  const result = await UfwCommandService.run(['status', 'verbose']);
  res.json({ success: result.code === 0, data: result });
});

router.post('/enable', authenticateJWT, authorizeRoles('admin', 'operator'), async (req: AuthRequest, res) => {
  const result = await UfwCommandService.run(['--force', 'enable']);
  AuditService.log({ userId: req.user?.id, action: 'UFW_ENABLE', module: 'firewall', commandExecuted: 'ufw --force enable', ipAddress: req.ip, success: result.code === 0 });
  res.json({ success: result.code === 0, data: result });
});

router.post('/disable', authenticateJWT, authorizeRoles('admin'), async (req: AuthRequest, res) => {
  const result = await UfwCommandService.run(['disable']);
  AuditService.log({ userId: req.user?.id, action: 'UFW_DISABLE', module: 'firewall', commandExecuted: 'ufw disable', ipAddress: req.ip, success: result.code === 0 });
  res.json({ success: result.code === 0, data: result });
});

router.post('/reload', authenticateJWT, authorizeRoles('admin', 'operator'), async (req: AuthRequest, res) => {
  const result = await UfwCommandService.run(['reload']);
  AuditService.log({ userId: req.user?.id, action: 'UFW_RELOAD', module: 'firewall', commandExecuted: 'ufw reload', ipAddress: req.ip, success: result.code === 0 });
  res.json({ success: result.code === 0, data: result });
});

export default router;
