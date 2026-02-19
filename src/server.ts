import dotenv from "dotenv";
import express from "express";
import "reflect-metadata";
import app from "./app";
import { ensureChannel } from "./config/rabbitmq";
import { AppDataSource } from "./data-source";
import { startExternalNotificationConsumer } from "./messaging/externalConsumer";
import healthRoute from "./routes/health";

dotenv.config();

const PORT = process.env.SERVICE_PORT ? Number(process.env.SERVICE_PORT) : 8000;

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

AppDataSource.initialize()
  .then(async () => {
    console.log("Connexion à la base PostgreSQL réussie");

    app.listen(PORT, () => {
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
