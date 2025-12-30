import * as amqp from "amqplib";
import type { Connection, Channel } from "amqplib";


//let connection: amqp.Connection | null = null;
let channel: Channel | null= null;

/** Variables standardisées */
export const EXCHANGE = process.env.RABBITMQ_EXCHANGE!;
export const QUEUE = process.env.RABBITMQ_QUEUE!;

/** Routing keys internes */
export const RK_MAIN  = "notification.process";
export const RK_RETRY = "notification.retry";
export const RK_DLQ   = "notification.dlq";

/** Queues dérivées (privées au service) */
export const QUEUE_RETRY = `${QUEUE}.retry`;
export const QUEUE_DLQ   = `${QUEUE}.dlq`;

export async function ensureChannel(): Promise<Channel> {
  if (channel) return channel;

  try {
    console.log("Tentative de connexion à RabbitMQ...");
    let connection = await amqp.connect(process.env.RABBITMQ_URL!);
    // garder une référence locale non-nulle pour satisfaire TypeScript
    const conn = connection!;

    conn.on("close", () => {
      console.error("RabbitMQ fermé – reconnexion...");
      // channel = null;
       //connection = null;
      setTimeout(ensureChannel, 3000);
    });

    conn.on("error", (err) => {
      console.error("Erreur RabbitMQ:", err);
    });

    channel = await conn.createChannel();
    const ch = channel!;

    // Exchange partagé
    await ch.assertExchange(EXCHANGE, "topic", { durable: true });

    // Queue principale
    await ch.assertQueue(QUEUE, { durable: true });
    await ch.bindQueue(QUEUE, EXCHANGE, RK_MAIN);

    // Queue retry
    await ch.assertQueue(QUEUE_RETRY, {
      durable: true,
      arguments: {
        "x-message-ttl": 5000,
        "x-dead-letter-exchange": EXCHANGE,
        "x-dead-letter-routing-key": RK_MAIN,
      },
    });
    await ch.bindQueue(QUEUE_RETRY, EXCHANGE, RK_RETRY);

    // DLQ
    await ch.assertQueue(QUEUE_DLQ, { durable: true });
    await ch.bindQueue(QUEUE_DLQ, EXCHANGE, RK_DLQ);

    console.log(`RabbitMQ prêt pour la queue ${QUEUE}`);
    return ch;
  } catch (err) {
    console.error("Erreur de connexion RabbitMQ:", err);
    throw err;
  }
}

export function getRabbitChannel(): Channel {
  if (!channel) {
    throw new Error("RabbitMQ non initialisé !");
  }
  return channel;
}
