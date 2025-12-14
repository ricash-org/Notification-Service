


// import { getChannel } from "../config/rabbitmq";

// export const publishNotification = async (exchange: string, routingKey: string, message: any) => {
//   const channel = getChannel();
//   await channel.assertExchange(exchange, "direct", { durable: true });

//   channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
//   console.log(" Message publié :", message);
// };


// src/messaging/publisher.ts
/**
 * publishNotification(queueName, message)
 * - sérialise en JSON et publie en mode persistent
 * - assure que le channel est disponible via ensureChannel()
 *
 * Usage:
 *  await publishNotification("notifications.main", { ...payload });
 */

import { ensureChannel } from "../config/rabbitmq";

export async function publishNotification(queueName: string, message: any) {
  const channel = await ensureChannel();

  if (!channel) {
    throw new Error("RabbitMQ channel unavailable");
  }

  // assure la queue (idempotent) — utile si le consumer n'a pas créé la queue
  await channel.assertQueue(queueName, { durable: true });

  const buffer = Buffer.from(JSON.stringify(message));

  // persistent: true => message survive à un restart du broker si stocké sur disque
  const ok = channel.sendToQueue(queueName, buffer, { persistent: true });

  if (!ok) {
    // sendToQueue peut retourner false si le buffer interne est plein — loggons
    console.warn("sendToQueue returned false, buffer might be full");
  }

  console.log(`Message published to ${queueName}`, message);
}
