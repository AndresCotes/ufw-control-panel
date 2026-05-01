"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
exports.authorizeRoles = authorizeRoles;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        res.status(401).json({ success: false, message: 'Missing token' });
        return;
    }
    try {
        req.user = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
}
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        next();
    };
}
