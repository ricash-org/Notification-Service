import { ensureChannel, QUEUE } from "../config/rabbitmq";
import { NotificationService } from "../services/notificationService";
import { InterServices } from "./contracts/interServices";
import { mapInterServiceToNotification } from "./mappers/notification.mapper";

export async function startExternalNotificationConsumer() {
  const channel = await ensureChannel();

  console.log("Consumer externe prêt");

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    const payload: InterServices = JSON.parse(msg.content.toString());

    try {
      const service = new NotificationService();
      const notification = mapInterServiceToNotification(payload);

      await service.envoyerNotification(notification);

      channel.ack(msg);
    } catch (error) {
      console.error("Erreur consumer externe", error);
      channel.nack(msg, false, false);
    }
  });
}
