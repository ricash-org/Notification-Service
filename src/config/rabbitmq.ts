// import amqp from "amqplib";

// let channel: amqp.Channel;

// export const connectRabbitMQ = async () => {
//   try {
//     const connection = await amqp.connect("amqp://admin:admin@rabbitmq:5672");
//     channel = await connection.createChannel();
//     console.log("RabbitMQ connecté");
//   } catch (error) {
//     console.error("Erreur RabbitMQ:", error);
//   }
// };

// export const getChannel = () => channel;

// src/messaging/rabbitmq.ts
/**
 * Connexion RabbitMQ partagée pour otp-service
 * - garde la même connexion/channel pendant tout le runtime
 * - gère reconnect automatique en cas de fermeture/erreur
 *
 * Variables d'environnement :
 * - RABBITMQ_URL (ex: amqp://admin:admin@rabbitmq:5672)
 */

// src/messaging/rabbitmq.ts
import * as amqp from "amqplib";
import type { Connection, Channel } from "amqplib";

let connection: amqp.Connection | null = null;
let channel: Channel | null = null;

// Nom des files
export const QUEUE_MAIN = "notifications.main";
export const QUEUE_RETRY = "notifications.retry";
export const QUEUE_DLQ = "notifications.dlq";

// Fonction de connexion + reconnexion automatique
export async function ensureChannel() {
  try {
    console.log("Tentative de connexion à RabbitMQ...");

   let connection = await amqp.connect(process.env.RABBITMQ_URL!);

    // garder une référence locale non-nulle pour satisfaire TypeScript
    const conn = connection!;

    conn.on("error", (err) => {
      console.error("⚠️ Erreur RabbitMQ :", err);
     // connection = null;
    });

    conn.on("close", () => {
      console.error("Connexion RabbitMQ fermée. Reconnexion...");
      //connection = null;
      setTimeout(ensureChannel, 3000);
    });

    channel = await conn.createChannel();
    const ch = channel!;

    console.log(" Connecté à RabbitMQ !");

    // ---- Déclaration des files ----

    // File principale
    await ch.assertQueue(QUEUE_MAIN, { durable: true });

    // File de retry avec TTL de 5s
    await ch.assertQueue(QUEUE_RETRY, {
      durable: true,
      arguments: {
        "x-message-ttl": 5000,
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": QUEUE_MAIN,
      },
    });

    // Dead-Letter Queue
    await ch.assertQueue(QUEUE_DLQ, { durable: true });

    return ch;
  } catch (err) {
    console.error("Erreur de connexion à RabbitMQ :", err);
    setTimeout(ensureChannel, 3000);
  }
}

export function getRabbitChannel(): Channel {
  if (!channel) {
    throw new Error("RabbitMQ non connecté !");
  }
  return channel;
}
