"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = exports.envoyerNotification = void 0;
exports.testRabbitMQ = testRabbitMQ;
const zod_1 = require("zod");
const publisher_1 = require("../messaging/publisher");
const notificationService_1 = require("../services/notificationService");
const service = new notificationService_1.NotificationService();
const ContactSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(8),
});
const TransferNotificationSchema = zod_1.z.object({
    type: zod_1.z.literal("transfer"),
    sender: ContactSchema,
    receiver: ContactSchema,
    amount: zod_1.z.number().positive(),
    content: zod_1.z.string().min(1),
});
const SimpleNotificationSchema = zod_1.z.object({
    type: zod_1.z
        .string()
        .min(1)
        .refine((value) => value !== "transfer", {
        message: 'Utiliser le schéma "transfer" lorsque type = "transfer".',
    }),
    user: ContactSchema,
    content: zod_1.z.string().min(1),
});
const NotificationBodySchema = zod_1.z.union([
    TransferNotificationSchema,
    SimpleNotificationSchema,
]);
const envoyerNotification = async (req, res) => {
    try {
        const parsed = NotificationBodySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Corps de requête invalide",
                errors: parsed.error.flatten(),
            });
        }
        const notif = await service.envoyerNotificationFromHttp(parsed.data);
        res.status(201).json({ success: true, data: notif });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.envoyerNotification = envoyerNotification;
const getNotifications = async (req, res) => {
    const list = await service.getAll();
    res.json(list);
};
exports.getNotifications = getNotifications;
async function testRabbitMQ(req, res) {
    const { routingKey, message } = req.body;
    await (0, publisher_1.publishNotification)(routingKey || "notification.process", message ?? { test: true });
    res.json({ success: true });
}
