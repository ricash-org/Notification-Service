"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExternalNotificationConsumer = startExternalNotificationConsumer;
const rabbitmq_1 = require("../config/rabbitmq");
const notificationService_1 = require("../services/notificationService");
const notification_mapper_1 = require("./mappers/notification.mapper");
async function startExternalNotificationConsumer() {
    const channel = await (0, rabbitmq_1.ensureChannel)();
    console.log("Consumer externe prêt");
    channel.consume(rabbitmq_1.QUEUE, async (msg) => {
        if (!msg)
            return;
        const payload = JSON.parse(msg.content.toString());
        try {
            console.log("[ExternalConsumer] Message reçu sur", rabbitmq_1.QUEUE, "payload:", payload);
            const service = new notificationService_1.NotificationService();
            const notification = (0, notification_mapper_1.mapInterServiceToNotification)(payload);
            await service.envoyerNotification(notification);
            console.log("[ExternalConsumer] Notification traitée pour utilisateurId=", notification.utilisateurId);
            channel.ack(msg);
        }
        catch (error) {
            console.error("Erreur consumer externe", error);
            channel.nack(msg, false, false);
        }
    });
}
