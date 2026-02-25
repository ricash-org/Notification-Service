"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const rabbitmq_1 = require("../config/rabbitmq");
const data_source_1 = require("../data-source");
const router = express_1.default.Router();
// Configurable via env
const HEALTH_TIMEOUT_MS = parseInt(process.env.HEALTH_CHECK_TIMEOUT_MS || "1000", 10);
const HEALTH_CACHE_TTL_MS = parseInt(process.env.HEALTH_CACHE_TTL_MS || "5000", 10);
const EXPOSE_ERRORS = process.env.HEALTH_EXPOSE_ERRORS === "true";
// Read package.json for version fallback
let pkgVersion;
let pkgName;
try {
    const pkgPath = path_1.default.join(__dirname, "..", "..", "package.json");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pkg = JSON.parse(fs_1.default.readFileSync(pkgPath, "utf8"));
    pkgVersion = pkg.version;
    pkgName = pkg.name;
}
catch {
    // ignore
}
// Simple cache to avoid expensive repeated checks
let readinessCache = null;
function withTimeout(p, ms, name) {
    return Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout:${name || "op"}`)), ms)),
    ]);
}
// Simple liveness probe
router.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", uptime: process.uptime() });
});
// Readiness probe: checks PostgreSQL connection and RabbitMQ channel
router.get("/health/ready", async (req, res) => {
    const now = Date.now();
    if (readinessCache && now - readinessCache.ts < HEALTH_CACHE_TTL_MS) {
        return res.status(readinessCache.code).json(readinessCache.result);
    }
    const result = {
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: process.env.SERVICE_VERSION || pkgVersion,
        commit: process.env.COMMIT_SHA,
        components: {
            db: { status: "UNKNOWN" },
            rabbitmq: { status: "UNKNOWN" },
        },
    };
    // Check DB with timeout
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            throw new Error("DataSource not initialized");
        }
        // lightweight query with timeout
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await withTimeout(data_source_1.AppDataSource.query("SELECT 1"), HEALTH_TIMEOUT_MS, "db");
        result.components.db.status = "OK";
    }
    catch (err) {
        result.status = "NOT_OK";
        result.components.db.status = "DOWN";
        result.components.db.error = EXPOSE_ERRORS
            ? err instanceof Error
                ? err.message
                : String(err)
            : "unavailable";
    }
    // Check RabbitMQ with timeout
    try {
        await withTimeout(Promise.resolve((0, rabbitmq_1.getRabbitChannel)()), HEALTH_TIMEOUT_MS, "rabbitmq");
        result.components.rabbitmq.status = "OK";
    }
    catch (err) {
        result.status = "NOT_OK";
        result.components.rabbitmq.status = "DOWN";
        result.components.rabbitmq.error = EXPOSE_ERRORS
            ? err instanceof Error
                ? err.message
                : String(err)
            : "unavailable";
    }
    const code = result.status === "OK" ? 200 : 503;
    readinessCache = { ts: now, result, code };
    res.status(code).json(result);
});
exports.default = router;
