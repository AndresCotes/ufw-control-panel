"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const child_process_1 = require("child_process");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const ufw_command_service_1 = require("../../services/ufw-command.service");
const audit_service_1 = require("../../services/audit.service");
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
function getInterfaces() {
    return new Promise((resolve) => {
        const command = env_1.env.ufwContainerName
            ? { bin: 'docker', args: ['exec', env_1.env.ufwContainerName, 'ip', '-o', 'link', 'show'] }
            : { bin: 'ip', args: ['-o', 'link', 'show'] };
        const child = (0, child_process_1.spawn)(command.bin, command.args, { stdio: ['ignore', 'pipe', 'pipe'] });
        let out = '';
        child.stdout.on('data', (d) => (out += d.toString()));
        child.on('close', () => {
            const names = out
                .split('\n')
                .map((line) => line.match(/^\d+:\s+([^:]+):/)?.[1]?.trim())
                .filter((x) => Boolean(x))
                .filter((x) => x !== 'lo');
            resolve([...new Set(names)]);
        });
        child.on('error', () => resolve([]));
    });
}
router.get('/interfaces', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator', 'viewer'), async (_req, res) => {
    const interfaces = await getInterfaces();
    res.json({ success: true, data: interfaces });
});
router.get('/status', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator', 'viewer'), async (_req, res) => {
    const result = await ufw_command_service_1.UfwCommandService.run(['status', 'verbose']);
    res.json({ success: result.code === 0, data: result });
});
router.post('/enable', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator'), async (req, res) => {
    const result = await ufw_command_service_1.UfwCommandService.run(['--force', 'enable']);
    audit_service_1.AuditService.log({ userId: req.user?.id, action: 'UFW_ENABLE', module: 'firewall', commandExecuted: 'ufw --force enable', ipAddress: req.ip, success: result.code === 0 });
    res.json({ success: result.code === 0, data: result });
});
router.post('/disable', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin'), async (req, res) => {
    const result = await ufw_command_service_1.UfwCommandService.run(['disable']);
    audit_service_1.AuditService.log({ userId: req.user?.id, action: 'UFW_DISABLE', module: 'firewall', commandExecuted: 'ufw disable', ipAddress: req.ip, success: result.code === 0 });
    res.json({ success: result.code === 0, data: result });
});
router.post('/reload', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator'), async (req, res) => {
    const result = await ufw_command_service_1.UfwCommandService.run(['reload']);
    audit_service_1.AuditService.log({ userId: req.user?.id, action: 'UFW_RELOAD', module: 'firewall', commandExecuted: 'ufw reload', ipAddress: req.ip, success: result.code === 0 });
    res.json({ success: result.code === 0, data: result });
});
exports.default = router;
