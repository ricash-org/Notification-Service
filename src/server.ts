import dotenv from "dotenv";
import express from "express";
import "reflect-metadata";
import app from "./app";
import { ensureChannel } from "./config/rabbitmq";
import { AppDataSource } from "./data-source";
import { startConsumer } from "./messaging/consumer";
import { startExternalNotificationConsumer } from "./messaging/externalConsumer";
import healthRoute from "./routes/health";

dotenv.config();

const PORT = process.env.SERVICE_PORT ? Number(process.env.SERVICE_PORT) : 8000;

async function initRabbitWithRetry(maxRetries = 10, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      console.log(`Initialisation RabbitMQ (tentative ${attempt}/${maxRetries})...`);
      await ensureChannel();
      await startConsumer();
      await startExternalNotificationConsumer();
      console.log("RabbitMQ initialisé, consumers démarrés");
      return;
    } catch (err) {
      console.error(`Échec de l'initialisation RabbitMQ (tentative ${attempt}/${maxRetries}) :`, err);
      if (attempt === maxRetries) {
        console.error("Abandon des tentatives d'initialisation RabbitMQ.");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

AppDataSource.initialize()
  .then(async () => {
    console.log("Connexion à la base PostgreSQL réussie");
    app.use(express.json());
    app.use("/", healthRoute);

    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

    // Initialisation RabbitMQ en arrière-plan avec retry
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
