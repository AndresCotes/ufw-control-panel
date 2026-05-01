"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const database_1 = require("../../db/database");
const ufw_command_service_1 = require("../../services/ufw-command.service");
const ufw_1 = require("../../core/utils/ufw");
const router = (0, express_1.Router)();
router.get('/summary', auth_middleware_1.authenticateJWT, async (_req, res) => {
    const users = database_1.db.prepare('SELECT COUNT(*) as total FROM users').get();
    const audits = database_1.db.prepare('SELECT COUNT(*) as total FROM audit_logs').get();
    const latest = database_1.db.prepare('SELECT action, module, created_at, success FROM audit_logs ORDER BY id DESC LIMIT 8').all();
    const numbered = await ufw_command_service_1.UfwCommandService.run(['status', 'numbered']);
    const verbose = await ufw_command_service_1.UfwCommandService.run(['status', 'verbose']);
    const parsedRules = numbered.code === 0 ? (0, ufw_1.parseUfwNumbered)(numbered.stdout) : [];
    const countBy = (key) => parsedRules.filter((r) => r.action.toUpperCase().includes(key)).length;
    const ufwActive = /Status:\s+active/i.test(verbose.stdout);
    res.json({
        success: true,
        data: {
            ufwActive,
            totalRules: parsedRules.length,
            allowRules: countBy('ALLOW'),
            denyRules: countBy('DENY'),
            rejectRules: countBy('REJECT'),
            limitRules: countBy('LIMIT'),
            users: users.total,
            audits: audits.total,
            latestActions: latest,
            ufwVerboseRaw: verbose.stdout
        }
    });
});
exports.default = router;
