"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../db/database");
const env_1 = require("../../config/env");
class AuthService {
    static login(payload) {
        const user = database_1.db
            .prepare('SELECT id, name, email, password_hash, role, active FROM users WHERE email = ?')
            .get(payload.email);
        if (!user || !user.active || !bcryptjs_1.default.compareSync(payload.password, user.password_hash)) {
            return null;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.env.jwtSecret, {
            expiresIn: env_1.env.jwtExpiresIn
        });
        return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }
}
exports.AuthService = AuthService;
