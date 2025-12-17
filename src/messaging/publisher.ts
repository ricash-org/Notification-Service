import { ensureChannel, EXCHANGE, RK_MAIN } from "../config/rabbitmq";

export async function publishNotification(message: any) {
  const channel = await ensureChannel();

  channel.publish(
    EXCHANGE,
    RK_MAIN,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );

  console.log("Notification publiée via exchange");
}



