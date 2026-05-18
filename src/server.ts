import dotenv from "dotenv";
import express from "express";
import "reflect-metadata";
import app from "./app";
import { ensureChannel } from "./config/rabbitmq";
import { describeDatabaseTarget } from "./config/database";
import { AppDataSource } from "./data-source";
import { startExternalNotificationConsumer } from "./messaging/externalConsumer";
import healthRoute from "./routes/health";

dotenv.config();

const PORT = Number(
  process.env.SERVICE_PORT || process.env.PORT || "8005",
);
const DB_INIT_RETRIES = Number(process.env.DB_INIT_RETRIES || "30");
const DB_INIT_DELAY_MS = Number(process.env.DB_INIT_DELAY_MS || "5000");

async function initRabbitWithRetry(delayMs = 3000): Promise<void> {
  let attempt = 1;

  // Boucle de retry infinie mais espacée : on réessaie tant que RabbitMQ n'est pas prêt.
  // Cela évite d'abandonner définitivement si le broker démarre après le service.
  // Dès que la connexion réussit, on démarre les consumers une seule fois.
  // En cas d'erreur de config (mauvaise URL), les logs permettront de diagnostiquer.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      console.log(`Initialisation RabbitMQ (tentative ${attempt})...`);

      await ensureChannel();
      await startExternalNotificationConsumer();
      console.log("RabbitMQ initialisé, consumers démarrés");
      return;
    } catch (err) {
      console.error(
        `Échec de l'initialisation RabbitMQ (tentative ${attempt}) :`,
        err,
      );

      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// Middleware JSON + route de santé configurés immédiatement
app.use(express.json());
app.use("/", healthRoute);

async function initDatabase(): Promise<void> {
  console.log(`Cible PostgreSQL: ${describeDatabaseTarget()}`);

  for (let attempt = 1; attempt <= DB_INIT_RETRIES; attempt += 1) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      console.log("Connexion à la base PostgreSQL réussie");
      return;
    } catch (err) {
      console.error(
        `Échec connexion PostgreSQL (tentative ${attempt}/${DB_INIT_RETRIES}) :`,
        err,
      );
      if (attempt >= DB_INIT_RETRIES) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, DB_INIT_DELAY_MS));
    }
  }
}

async function startServer(): Promise<void> {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`Notification-Service démarré sur le port ${PORT}`);
    });

    void initRabbitWithRetry();
  } catch (err) {
    console.error("Arrêt du service: impossible de se connecter à PostgreSQL", err);
    process.exit(1);
  }
}

void startServer();
