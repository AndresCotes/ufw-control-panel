"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
const database_1 = require("../db/database");
(0, database_1.runMigrations)();
const existing = database_1.db.prepare('SELECT id FROM users WHERE email = ?').get(env_1.env.adminEmail);
if (existing) {
    console.log(`Admin user already exists with email ${env_1.env.adminEmail}`);
    process.exit(0);
}
const hash = bcryptjs_1.default.hashSync(env_1.env.adminPassword, 10);
const result = database_1.db.prepare('INSERT INTO users (name, email, password_hash, role, active) VALUES (?, ?, ?, ?, 1)').run('System Admin', env_1.env.adminEmail, hash, 'admin');
console.log(`Admin created with id ${result.lastInsertRowid} and email ${env_1.env.adminEmail}`);
