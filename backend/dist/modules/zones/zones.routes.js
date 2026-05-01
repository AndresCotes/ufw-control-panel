"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const database_1 = require("../../db/database");
const router = (0, express_1.Router)();
const zoneSchema = zod_1.z.object({ name: zod_1.z.string().min(2), description: zod_1.z.string().optional(), color: zod_1.z.string().optional(), icon: zod_1.z.string().optional() });
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator', 'viewer'), (_req, res) => {
    const rows = database_1.db.prepare('SELECT * FROM zones ORDER BY name').all();
    res.json({ success: true, data: rows });
});
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin', 'operator'), (req, res) => {
    const parsed = zoneSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, details: parsed.error.flatten() });
        return;
    }
    const result = database_1.db.prepare('INSERT INTO zones (name, description, color, icon) VALUES (?, ?, ?, ?)').run(parsed.data.name, parsed.data.description ?? null, parsed.data.color ?? null, parsed.data.icon ?? null);
    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});
exports.default = router;
