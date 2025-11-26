# =============================
#  Stage 1 : Build
# =============================
FROM node:18-alpine AS builder
WORKDIR /app

# Copier package.json + lock file
COPY notification-service/package*.json ./

# Installer les dépendances + devDependencies (pour ts-node, typescript…)
RUN npm install

# Copier TOUT le code source
COPY notification-service/. .

# Compiler Typescript -> JavaScript
RUN npm run build

# =============================
#  Stage 2 : Runtime
# =============================
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copier uniquement ce qui sert à l'exécution
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Démarrer la version compilée
CMD ["node", "dist/server.js"]
