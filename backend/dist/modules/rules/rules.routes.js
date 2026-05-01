"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const ufw_command_service_1 = require("../../services/ufw-command.service");
const audit_service_1 = require("../../services/audit.service");
const ufw_1 = require("../../core/utils/ufw");
const database_1 = require("../../db/database");
const router = (0, express_1.Router)();
const createRuleSchema = zod_1.z.object({
    action: zod_1.z.enum(['allow', 'deny', 'reject', 'limit']),
    direction: zod_1.z.enum(['in', 'out', 'any']).optional(),
    interfaceName: zod_1.z.string().max(32).optional(),
    sourceIp: zod_1.z.string().optional(),
    destinationIp: zod_1.z.string().optional(),
    port: zod_1.z.string().min(1),
    protocol: zod_1.z.enum(['tcp', 'udp', 'any']).optional(),
    comment: zod_1.z.string().max(180).optional(),
    zoneId: zod_1.z.number().optional()
});
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator', 'viewer'), async (_req, res) => {
    const status = await ufw_command_service_1.UfwCommandService.run(['status', 'numbered']);
    const rules = status.code === 0 ? (0, ufw_1.parseUfwNumbered)(status.stdout) : [];
    res.json({ success: true, data: { rules, raw: status.stdout, stderr: status.stderr, ufwOk: status.code === 0 } });
});
router.post('/preview', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator'), (req, res) => {
    const parsed = createRuleSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Invalid payload', details: parsed.error.flatten() });
        return;
    }
    try {
        const built = (0, ufw_1.buildUfwRuleArgs)(parsed.data);
        res.json({ success: true, data: built });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Invalid rule input' });
    }
});
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator'), async (req, res) => {
    const parsed = createRuleSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Invalid payload', details: parsed.error.flatten() });
        return;
    }
    try {
        const built = (0, ufw_1.buildUfwRuleArgs)(parsed.data);
        const result = await ufw_command_service_1.UfwCommandService.run(built.args);
        audit_service_1.AuditService.log({
            userId: req.user?.id,
            action: 'RULE_CREATE',
            module: 'rules',
            description: `Created firewall rule action=${parsed.data.action} port=${parsed.data.port}`,
            commandExecuted: built.commandPreview,
            ipAddress: req.ip,
            success: result.code === 0
        });
        if (result.code !== 0) {
            res.status(400).json({ success: false, message: 'UFW command failed', data: result });
            return;
        }
        database_1.db.prepare(`
      INSERT INTO firewall_rules (action, protocol, port, source_ip, destination_ip, comment, zone_id, enabled, raw_command, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(parsed.data.action, parsed.data.protocol ?? 'any', parsed.data.port, parsed.data.sourceIp ?? 'any', parsed.data.destinationIp ?? 'any', parsed.data.comment ?? null, parsed.data.zoneId ?? null, built.commandPreview, req.user?.id ?? null);
        res.status(201).json({ success: true, message: 'Rule created', data: { command: built.commandPreview, ufw: result } });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Rule creation failed' });
    }
});
router.delete('/:ufwNumber', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator'), async (req, res) => {
    const ufwNumber = Number(req.params.ufwNumber);
    if (!Number.isInteger(ufwNumber) || ufwNumber <= 0) {
        res.status(400).json({ success: false, message: 'Invalid rule number' });
        return;
    }
    const result = await ufw_command_service_1.UfwCommandService.run(['--force', 'delete', String(ufwNumber)]);
    audit_service_1.AuditService.log({
        userId: req.user?.id,
        action: 'RULE_DELETE',
        module: 'rules',
        description: `Deleted firewall rule #${ufwNumber}`,
        commandExecuted: `ufw --force delete ${ufwNumber}`,
        ipAddress: req.ip,
        success: result.code === 0
    });
    if (result.code !== 0) {
        res.status(400).json({ success: false, message: 'Unable to delete rule', data: result });
        return;
    }
    database_1.db.prepare('UPDATE firewall_rules SET enabled = 0, updated_at = CURRENT_TIMESTAMP WHERE ufw_number = ?').run(ufwNumber);
    res.json({ success: true, message: `Rule ${ufwNumber} deleted`, data: result });
});
exports.default = router;
