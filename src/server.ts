import { AppDataSource } from "./data-source";
import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
  .then(() => {
    console.log(" Connexion à la base PostgreSQL réussie");
    app.listen(PORT, () => console.log(` Serveur démarré sur le port ${PORT}`));
  })
  .catch((err) => console.error("Erreur de connexion :", err));
