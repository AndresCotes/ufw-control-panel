"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
const loginLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
router.post('/login', loginLimiter, auth_controller_1.AuthController.login);
router.get('/me', auth_middleware_1.authenticateJWT, (req, res) => res.json({ success: true, data: req.user }));
exports.default = router;
