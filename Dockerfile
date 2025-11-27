# =============================
#  Stage 1 : Build (TypeScript → JS)
# =============================
FROM node:18-alpine AS builder
WORKDIR /app

# Copier package.json + lock
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm install

# Copier tout le code
COPY . .

# Compiler en JavaScript dans /dist
RUN npm run build

# =============================
#  Stage 2 : Runtime
# =============================
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copier seulement ce qui sert en production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Démarrer l’application compilée
CMD ["node", "dist/server.js"]
