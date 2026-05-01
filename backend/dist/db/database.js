"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const env_1 = require("../config/env");
const dbFile = path_1.default.resolve(process.cwd(), env_1.env.sqlitePath);
fs_1.default.mkdirSync(path_1.default.dirname(dbFile), { recursive: true });
exports.db = new better_sqlite3_1.default(dbFile);
exports.db.pragma('journal_mode = WAL');
function runMigrations() {
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','operator','viewer')),
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT,
      icon TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS firewall_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ufw_number INTEGER,
      action TEXT NOT NULL,
      direction TEXT,
      protocol TEXT,
      port TEXT,
      port_range TEXT,
      source_ip TEXT,
      destination_ip TEXT,
      interface_name TEXT,
      comment TEXT,
      zone_id INTEGER,
      enabled INTEGER NOT NULL DEFAULT 1,
      raw_command TEXT,
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (zone_id) REFERENCES zones(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      description TEXT,
      command_executed TEXT,
      ip_address TEXT,
      success INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT
    );
  `);
}
