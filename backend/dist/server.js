"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./db/database");
(0, database_1.runMigrations)();
app_1.default.listen(env_1.env.port, env_1.env.host, () => {
    console.log(`Backend listening on http://${env_1.env.host}:${env_1.env.port}`);
});
