# =============================
#  Stage 1 : Build
# =============================
FROM node:18-alpine AS builder
WORKDIR /app

# Copier package.json et lock file
COPY package*.json ./

# Installer toutes les dépendances
RUN npm install

# Copier tout le code source
COPY . .

# Compiler Typescript -> JavaScript
RUN npm run build

# =============================
#  Stage 2 : Runtime
# ============================
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copier uniquement ce qui sert à l'exécution
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000


# Lancer la version compilée
CMD ["node", "dist/server.js"]

