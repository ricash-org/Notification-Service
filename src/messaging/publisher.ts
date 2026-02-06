import { ensureChannel, EXCHANGE } from "../config/rabbitmq";

export async function publishNotification(routingKey: string, message: any) {
  const channel = await ensureChannel();

  channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log(`Notification publiée sur ${EXCHANGE} avec RK="${routingKey}"`);
}
