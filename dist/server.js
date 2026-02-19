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
const data_source_1 = require("./data-source");
const externalConsumer_1 = require("./messaging/externalConsumer");
const health_1 = __importDefault(require("./routes/health"));
dotenv_1.default.config();
const PORT = process.env.SERVICE_PORT ? Number(process.env.SERVICE_PORT) : 8000;
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
data_source_1.AppDataSource.initialize()
    .then(async () => {
    console.log("Connexion à la base PostgreSQL réussie");
    app_1.default.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
    });
    // Initialisation RabbitMQ en arrière-plan avec retry infini
    void initRabbitWithRetry();
})
    .catch((err) => console.error("Erreur de connexion :", err));
/*
async function startServer() {
  console.log("⏳ Initialisation du service de notifications...");

  try {
    await AppDataSource.initialize();
    console.log("Connexion PostgreSQL réussie.");

    app.listen(PORT, () => {
      console.log(`Notification-Service démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur lors de la connexion PostgreSQL :", error);
    console.log("Nouvelle tentative dans 5 secondes...");
    setTimeout(startServer, 5000);
  }
}

startServer();*/
