"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT || 4000),
    jwtSecret: process.env.JWT_SECRET || 'unsafe-dev-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    dbClient: process.env.DB_CLIENT || 'sqlite',
    sqlitePath: process.env.SQLITE_PATH || './data/ufw-control-panel.db',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@local',
    adminPassword: process.env.ADMIN_PASSWORD || 'Admin123!',
    ufwContainerName: process.env.UFW_CONTAINER_NAME || ''
};
