import {getRabbitChannel, QUEUE,EXCHANGE,RK_RETRY, RK_DLQ } from "../config/rabbitmq";
import { NotificationService } from "../services/notificationService";

const notifService = new NotificationService();

export async function startConsumer() {
  const channel = getRabbitChannel();

  console.log(`Consumer interne prêt sur ${QUEUE}`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    const payload = JSON.parse(msg.content.toString());

    try {
      await notifService.envoyerNotification(payload);
      channel.ack(msg);
    } catch (error) {
      const retryCount = Number(msg.properties.headers?.["x-retries"] ?? 0);

      if (retryCount < 3) {
        channel.publish(
          EXCHANGE,
          RK_RETRY,
          msg.content,
          {
            headers: { "x-retries": retryCount + 1 },
            persistent: true,
          }
        );
      } else {
        channel.publish(
          EXCHANGE,
          RK_DLQ,
          msg.content,
          {
            headers: {
              "x-final-error":
                error instanceof Error ? error.message : String(error),
            },
            persistent: true,
          }
        );
      }

      channel.ack(msg);
    }
  });
}
