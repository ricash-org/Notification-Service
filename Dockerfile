# =============================
#  Stage 1 : Build (TypeScript → JS)
# =============================
FROM node:18-alpine AS builder
WORKDIR /app

# Copier package.json + lock file
COPY package*.json ./

# Installer dépendances (dev + prod)
RUN npm install

# Copier tout le projet
COPY . .

# Compiler TypeScript en JavaScript
RUN npm run build

# =============================
#  Stage 2 : Runtime
# =============================
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copier uniquement ce qui sert en production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Lancer l'app compilée
CMD ["npm", "start"]
