import { AppDataSource } from "./data-source";
import app from "./app";
import dotenv from "dotenv";
import { startConsumer  } from "./messaging/consumer";
import { ensureChannel } from "./config/rabbitmq";
import { startExternalNotificationConsumer } from "./messaging/externalConsumer";

dotenv.config();

const PORT = process.env.PORT || 4000;

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
