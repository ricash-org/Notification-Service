FROM node:18-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (nodemailer, twilio, typeorm, ts-node…)
RUN npm install

# Copier tout le code du projet
COPY . .

# Exposer le port  
EXPOSE 3000

# Démarrer le service en TypeScript
CMD ["npx", "ts-node", "src/server.ts"]
