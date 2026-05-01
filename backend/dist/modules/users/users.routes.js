"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const database_1 = require("../../db/database");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({ name: zod_1.z.string().min(2), email: zod_1.z.string().min(3), password: zod_1.z.string().min(8), role: zod_1.z.enum(['admin', 'operator', 'viewer']) });
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin'), (_req, res) => {
    const rows = database_1.db.prepare('SELECT id, name, email, role, active, created_at FROM users ORDER BY id DESC').all();
    res.json({ success: true, data: rows });
});
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('admin'), (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, details: parsed.error.flatten() });
        return;
    }
    const hash = bcryptjs_1.default.hashSync(parsed.data.password, 10);
    const result = database_1.db.prepare('INSERT INTO users (name, email, password_hash, role, active) VALUES (?, ?, ?, ?, 1)').run(parsed.data.name, parsed.data.email, hash, parsed.data.role);
    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});
exports.default = router;
