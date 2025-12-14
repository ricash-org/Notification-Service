
// import { getChannel } from "../config/rabbitmq";
// import { NotificationService } from "../services/notificationService";

// export const startConsumer = async () => {
//   const channel = getChannel();
//   const queue = "notifications_queue";
//   const exchange = "notifications_exchange";

//   await channel.assertExchange(exchange, "direct", { durable: true });
//   await channel.assertQueue(queue, { durable: true });
//   await channel.bindQueue(queue, exchange, "send-notification");

//   console.log("📥 En attente de messages...");

//   channel.consume(queue, async (msg) => {
//     if (msg) {
//       const data = JSON.parse(msg.content.toString());
//       console.log("📩 Message reçu :", data);

//       const service = new NotificationService();
//       await service.envoyerNotification(data);

//       channel.ack(msg);
//     }
//   });
// };



import { getRabbitChannel, QUEUE_MAIN, QUEUE_RETRY, QUEUE_DLQ } from "../config/rabbitmq";
import { NotificationService } from "../services/notificationService";

const notifService = new NotificationService();

export async function startConsumer() {
  const channel = getRabbitChannel();

  console.log("Consumer prêt. En attente de messages...");

  channel.consume(QUEUE_MAIN, async (msg) => {
    if (!msg) return;

    const content = JSON.parse(msg.content.toString());
    console.log("Message reçu :", content);

    try {
      // Envoi de la vraie notification
      await notifService.envoyerNotification(content);

      channel.ack(msg);
      console.log("Notification envoyée avec succès !");
    } catch (error) {
      console.error("Erreur lors du traitement :", error);

      const retryCount = Number(msg.properties.headers?.["x-retries"] ?? 0);

      if (retryCount < 3) {
        console.log(`Retry ${retryCount + 1}/3...`);

        channel.sendToQueue(QUEUE_RETRY, msg.content, {
          headers: { "x-retries": retryCount + 1 },
        });
      } else {
        console.log("Trop d'erreurs → envoi en DLQ");

        const errorMessage = error instanceof Error ? error.message : String(error);

        channel.sendToQueue(QUEUE_DLQ, msg.content, {
          headers: { "x-final-error": errorMessage },
        });
      }

      channel.ack(msg);
    }
  });
}
