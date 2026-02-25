import { Request, Response } from "express";
import { z } from "zod";
import { publishNotification } from "../messaging/publisher";
import { NotificationService } from "../services/notificationService";

const service = new NotificationService();

const ContactSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(8),
});

const TransferNotificationSchema = z.object({
  type: z.literal("transfer"),
  sender: ContactSchema,
  receiver: ContactSchema,
  amount: z.number().positive(),
  content: z.string().min(1),
});

const SimpleNotificationSchema = z.object({
  type: z
    .string()
    .min(1)
    .refine((value) => value !== "transfer", {
      message: 'Utiliser le schéma "transfer" lorsque type = "transfer".',
    }),
  user: ContactSchema,
  content: z.string().min(1),
});

const NotificationBodySchema = z.union([
  TransferNotificationSchema,
  SimpleNotificationSchema,
]);

export const envoyerNotification = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  const list = await service.getAll();
  res.json(list);
};

export async function testRabbitMQ(req: Request, res: Response) {
  const { routingKey, message } = req.body;

  await publishNotification(
    routingKey || "notification.process",
    message ?? { test: true },
  );

  res.json({ success: true });
}
