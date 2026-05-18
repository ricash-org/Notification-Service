"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_1 = require("typeorm");
const database_1 = require("./config/database");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource((0, database_1.buildDatabaseOptions)());
