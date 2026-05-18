"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDatabaseOptions = exports.describeDatabaseTarget = void 0;
const Notification_1 = require("../entities/Notification");
const Otp_1 = require("../entities/Otp");
const ENTITIES = [Notification_1.RicashNotification, Otp_1.Otp];
const pickEnv = (...keys) => {
    for (const key of keys) {
        const value = process.env[key]?.trim();
        if (value) {
            return value;
        }
    }
    return undefined;
};
const resolveDatabaseUrl = () => {
    const url = pickEnv("DATABASE_URL", "POSTGRES_URL", "DB_URL");
    if (!url) {
        return undefined;
    }
    // Secrets Manager / ECS peuvent fournir une URL JDBC Spring.
    if (url.startsWith("jdbc:postgresql://")) {
        return url.replace(/^jdbc:/, "");
    }
    return url;
};
const resolveSsl = (databaseUrl) => {
    const sslFlag = pickEnv("DB_SSL", "DATABASE_SSL", "PGSSLMODE")?.toLowerCase();
    if (sslFlag === "false" || sslFlag === "0" || sslFlag === "disable") {
        return undefined;
    }
    if (sslFlag === "true" ||
        sslFlag === "1" ||
        sslFlag === "require" ||
        sslFlag === "prefer") {
        return { rejectUnauthorized: false };
    }
    if (databaseUrl && /sslmode=(require|verify-full|prefer)/i.test(databaseUrl)) {
        return { rejectUnauthorized: false };
    }
    // RDS sur ECS exige en général TLS.
    if (process.env.AWS_EXECUTION_ENV) {
        return { rejectUnauthorized: false };
    }
    return undefined;
};
const describeDatabaseTarget = () => {
    const url = resolveDatabaseUrl();
    if (url) {
        try {
            const parsed = new URL(url);
            return `postgresql://${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`;
        }
        catch {
            return "postgresql://(DATABASE_URL)";
        }
    }
    const host = pickEnv("DB_HOST", "POSTGRES_HOST", "PGHOST") ?? "?";
    const port = pickEnv("DB_PORT", "POSTGRES_PORT", "PGPORT") ?? "5432";
    const database = pickEnv("DB_NAME", "POSTGRES_DB", "PGDATABASE") ?? "?";
    return `postgresql://${host}:${port}/${database}`;
};
exports.describeDatabaseTarget = describeDatabaseTarget;
const buildDatabaseOptions = () => {
    const logging = process.env.DB_LOGGING !== "false";
    const synchronize = process.env.DB_SYNCHRONIZE !== "false";
    const databaseUrl = resolveDatabaseUrl();
    const ssl = resolveSsl(databaseUrl);
    if (databaseUrl) {
        return {
            type: "postgres",
            url: databaseUrl,
            ssl,
            entities: ENTITIES,
            synchronize,
            logging,
        };
    }
    const host = pickEnv("DB_HOST", "POSTGRES_HOST", "PGHOST");
    const port = parseInt(pickEnv("DB_PORT", "POSTGRES_PORT", "PGPORT") || "5432", 10);
    const username = pickEnv("DB_USER", "POSTGRES_USER", "PGUSER");
    const password = pickEnv("DB_PASSWORD", "POSTGRES_PASSWORD", "PGPASSWORD");
    const database = pickEnv("DB_NAME", "POSTGRES_DB", "PGDATABASE");
    const missing = [];
    if (!host)
        missing.push("DB_HOST");
    if (!username)
        missing.push("DB_USER");
    if (!password)
        missing.push("DB_PASSWORD");
    if (!database)
        missing.push("DB_NAME");
    if (missing.length > 0) {
        throw new Error(`Configuration PostgreSQL manquante (${missing.join(", ")}). ` +
            "Définissez DATABASE_URL ou les variables DB_* / POSTGRES_*.");
    }
    return {
        type: "postgres",
        host,
        port,
        username,
        password,
        database,
        ssl,
        entities: ENTITIES,
        synchronize,
        logging,
    };
};
exports.buildDatabaseOptions = buildDatabaseOptions;
