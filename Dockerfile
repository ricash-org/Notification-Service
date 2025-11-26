FROM node:18-alpine

WORKDIR /app

COPY notification-service/package*.json ./
RUN npm install

COPY notification-service/. .

EXPOSE 3000

CMD ["npx", "ts-node", "src/server.ts"]
