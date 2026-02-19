import { Request, Response } from "express";
import { z } from "zod";
import { CanalNotification } from "../entities/Notification";
import { OtpService } from "../services/otpService";

const otpService = new OtpService();

const GenerateOtpSchema = z.object({
  utilisateurId: z.string().min(1),
  canalNotification: z.enum(["SMS", "EMAIL"]),
  email: z.string().email(),
  phone: z.string().min(8),
});

export const generateOtp = async (req: Request, res: Response) => {
  try {
    const parsed = GenerateOtpSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Corps de requête invalide",
        errors: parsed.error.flatten(),
      });
    }

    const { utilisateurId, canalNotification, email, phone } = parsed.data;

    const canalEnum =
      canalNotification === "SMS"
        ? CanalNotification.SMS
        : CanalNotification.EMAIL;

    const result = await otpService.createOtp(
      utilisateurId,
      canalEnum,
      email,
      phone,
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { utilisateurId, code } = req.body;
    const result = await otpService.verifyOtp(utilisateurId, code);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
