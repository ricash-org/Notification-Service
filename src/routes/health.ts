import express, { type Request, type Response } from "express";

import fs from "fs";
import path from "path";
import { getRabbitChannel } from "../config/rabbitmq";
import { AppDataSource } from "../data-source";

const router = express.Router();

interface ComponentStatus {
  status: string;
  error?: string;
}

interface ReadyResponse {
  status: string;
  uptime: number;
  timestamp: string;
  version?: string;
  commit?: string;
  components: {
    db: ComponentStatus;
    rabbitmq: ComponentStatus;
  };
}

// Configurable via env
const HEALTH_TIMEOUT_MS = parseInt(
  process.env.HEALTH_CHECK_TIMEOUT_MS || "1000",
  10,
);
const HEALTH_CACHE_TTL_MS = parseInt(
  process.env.HEALTH_CACHE_TTL_MS || "5000",
  10,
);
const EXPOSE_ERRORS = process.env.HEALTH_EXPOSE_ERRORS === "true";

// Read package.json for version fallback
let pkgVersion: string | undefined;
let pkgName: string | undefined;
try {
  const pkgPath = path.join(__dirname, "..", "..", "package.json");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkgVersion = pkg.version;
  pkgName = pkg.name;
} catch {
  // ignore
}

// Simple cache to avoid expensive repeated checks
let readinessCache: { ts: number; result: ReadyResponse; code: number } | null =
  null;

function withTimeout<T>(p: Promise<T>, ms: number, name?: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error(`timeout:${name || "op"}`)), ms),
    ),
  ]);
}

// Simple liveness probe
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

// Readiness probe: checks PostgreSQL connection and RabbitMQ channel
router.get(
  "/health/ready",
  async (req: Request, res: Response<ReadyResponse>) => {
    const now = Date.now();
    if (readinessCache && now - readinessCache.ts < HEALTH_CACHE_TTL_MS) {
      return res.status(readinessCache.code).json(readinessCache.result);
    }

    const result: ReadyResponse = {
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
      if (!AppDataSource.isInitialized) {
        throw new Error("DataSource not initialized");
      }
      // lightweight query with timeout
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await withTimeout(
        AppDataSource.query("SELECT 1"),
        HEALTH_TIMEOUT_MS,
        "db",
      );
      result.components.db.status = "OK";
    } catch (err: unknown) {
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
      await withTimeout(
        Promise.resolve(getRabbitChannel()),
        HEALTH_TIMEOUT_MS,
        "rabbitmq",
      );
      result.components.rabbitmq.status = "OK";
    } catch (err: unknown) {
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
  },
);
export default router;
