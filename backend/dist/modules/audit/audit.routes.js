"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const database_1 = require("../../db/database");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator', 'viewer'), (_req, res) => {
    const logs = database_1.db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200').all();
    res.json({ success: true, data: logs });
});
exports.default = router;
