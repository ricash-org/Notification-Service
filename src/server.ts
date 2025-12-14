import "reflect-metadata";
import { AppDataSource } from "./data-source";
import app from "./app";
import dotenv from "dotenv";
import { startConsumer  } from "./messaging/consumer";
import { ensureChannel } from "./config/rabbitmq";
import { startExternalNotificationConsumer } from "./messaging/externalConsumer";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;


AppDataSource.initialize()
  .then(async () => {
    console.log(" Connexion à la base PostgreSQL réussie");
     await ensureChannel();
  await startConsumer();
    app.listen(PORT, () => console.log(` Serveur démarré sur le port ${PORT}`));
    //await startExternalNotificationConsumer();
    await startExternalNotificationConsumer();

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

