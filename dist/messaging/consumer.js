"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startConsumer = startConsumer;
const rabbitmq_1 = require("../config/rabbitmq");
const notificationService_1 = require("../services/notificationService");
const notifService = new notificationService_1.NotificationService();
async function startConsumer() {
    const channel = (0, rabbitmq_1.getRabbitChannel)();
    console.log(`Consumer interne prêt sur ${rabbitmq_1.QUEUE}`);
    channel.consume(rabbitmq_1.QUEUE, async (msg) => {
        if (!msg)
            return;
        const payload = JSON.parse(msg.content.toString());
        try {
            await notifService.envoyerNotification(payload);
            channel.ack(msg);
        }
        catch (error) {
            const retryCount = Number(msg.properties.headers?.["x-retries"] ?? 0);
            if (retryCount < 3) {
                channel.publish(rabbitmq_1.EXCHANGE, rabbitmq_1.RK_RETRY, msg.content, {
                    headers: { "x-retries": retryCount + 1 },
                    persistent: true,
                });
            }
            else {
                channel.publish(rabbitmq_1.EXCHANGE, rabbitmq_1.RK_DLQ, msg.content, {
                    headers: {
                        "x-final-error": error instanceof Error ? error.message : String(error),
                    },
                    persistent: true,
                });
            }
            channel.ack(msg);
        }
    });
}
