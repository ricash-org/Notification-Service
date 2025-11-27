import "reflect-metadata";
import { AppDataSource } from "./data-source";
import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  console.log("⏳ Initialisation du service de notifications...");

  try {
    await AppDataSource.initialize();
    console.log("🟢 Connexion PostgreSQL réussie.");

    app.listen(PORT, () => {
      console.log(`🚀 Notification-Service démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur lors de la connexion PostgreSQL :", error);
    console.log("🔁 Nouvelle tentative dans 5 secondes...");
    setTimeout(startServer, 5000);
  }
}

startServer();
