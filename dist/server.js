"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const app_1 = __importDefault(require("./app"));
const rabbitmq_1 = require("./config/rabbitmq");
const database_1 = require("./config/database");
const data_source_1 = require("./data-source");
const externalConsumer_1 = require("./messaging/externalConsumer");
const health_1 = __importDefault(require("./routes/health"));
dotenv_1.default.config();
const PORT = Number(process.env.SERVICE_PORT || process.env.PORT || "8005");
const DB_INIT_RETRIES = Number(process.env.DB_INIT_RETRIES || "30");
const DB_INIT_DELAY_MS = Number(process.env.DB_INIT_DELAY_MS || "5000");
async function initRabbitWithRetry(delayMs = 3000) {
    let attempt = 1;
    // Boucle de retry infinie mais espacée : on réessaie tant que RabbitMQ n'est pas prêt.
    // Cela évite d'abandonner définitivement si le broker démarre après le service.
    // Dès que la connexion réussit, on démarre les consumers une seule fois.
    // En cas d'erreur de config (mauvaise URL), les logs permettront de diagnostiquer.
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            console.log(`Initialisation RabbitMQ (tentative ${attempt})...`);
            await (0, rabbitmq_1.ensureChannel)();
            await (0, externalConsumer_1.startExternalNotificationConsumer)();
            console.log("RabbitMQ initialisé, consumers démarrés");
            return;
        }
        catch (err) {
            console.error(`Échec de l'initialisation RabbitMQ (tentative ${attempt}) :`, err);
            attempt += 1;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
}
// Middleware JSON + route de santé configurés immédiatement
app_1.default.use(express_1.default.json());
app_1.default.use("/", health_1.default);
async function initDatabase() {
    console.log(`Cible PostgreSQL: ${(0, database_1.describeDatabaseTarget)()}`);
    for (let attempt = 1; attempt <= DB_INIT_RETRIES; attempt += 1) {
        try {
            if (!data_source_1.AppDataSource.isInitialized) {
                await data_source_1.AppDataSource.initialize();
            }
            console.log("Connexion à la base PostgreSQL réussie");
            return;
        }
        catch (err) {
            console.error(`Échec connexion PostgreSQL (tentative ${attempt}/${DB_INIT_RETRIES}) :`, err);
            if (attempt >= DB_INIT_RETRIES) {
                throw err;
            }
            await new Promise((resolve) => setTimeout(resolve, DB_INIT_DELAY_MS));
        }
    }
}
async function startServer() {
    try {
        await initDatabase();
        app_1.default.listen(PORT, () => {
            console.log(`Notification-Service démarré sur le port ${PORT}`);
        });
        void initRabbitWithRetry();
    }
    catch (err) {
        console.error("Arrêt du service: impossible de se connecter à PostgreSQL", err);
        process.exit(1);
    }
}
void startServer();
