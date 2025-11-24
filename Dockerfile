FROM node:18-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY notification-service/package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le projet
COPY notification-service/. .

# Exposer le port
EXPOSE 3000

# Lancer le service en TypeScript
CMD ["npx", "ts-node", "src/server.ts"]
