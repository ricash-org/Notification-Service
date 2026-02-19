"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishNotification = publishNotification;
const rabbitmq_1 = require("../config/rabbitmq");
async function publishNotification(routingKey, message) {
    const channel = await (0, rabbitmq_1.ensureChannel)();
    channel.publish(rabbitmq_1.EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
    console.log(`Notification publiée sur ${rabbitmq_1.EXCHANGE} avec RK="${routingKey}"`);
}
