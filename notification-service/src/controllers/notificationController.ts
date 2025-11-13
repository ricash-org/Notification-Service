import { Request, Response } from "express";
import { NotificationService } from "../services/notificationService";

const service = new NotificationService();

export const envoyerNotification = async (req: Request, res: Response) => {
  try {
    const notif = await service.envoyerNotification(req.body);
    res.status(201).json({ success: true, data: notif });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  const list = await service.getAll();
  res.json(list);
};
