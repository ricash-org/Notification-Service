import * as amqp from "amqplib";
import { NotificationService } from "../services/notificationService";
import { InterServices } from "./contracts/interServices";


const QUEUE = "notifications.in";

export async function startExternalNotificationConsumer() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, { durable: true });
  channel.prefetch(10);

  console.log("External notification consumer ready");

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    const payload: InterServices =
      JSON.parse(msg.content.toString());

    try {
      const service = new NotificationService();

      await service.envoyerNotification({
        utilisateurId: payload.utilisateurId,
        typeNotification: payload.typeNotification as any,
        canal: payload.canal as any,
        context: payload.context,
      });

      channel.ack(msg);
    } catch (err) {
      console.error("External notification failed", err);
      channel.nack(msg, false, false); // DLQ plus tard
    }
  });
}
