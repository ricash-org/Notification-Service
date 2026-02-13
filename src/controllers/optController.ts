import { Request, Response } from "express";
import { OtpService } from "../services/otpService";

const otpService = new OtpService();

export const generateOtp = async (req: Request, res: Response) => {
  try {
    const { utilisateurId, canalNotification, email, phone } = req.body;

    // Si l'appelant fournit explicitement les coordonnées, on valide
    if (email !== undefined || phone !== undefined) {
      const hasEmail = typeof email === "string" && email.trim().length > 0;
      const hasPhone = typeof phone === "string" && phone.trim().length > 0;

      if (!hasEmail && !hasPhone) {
        return res.status(400).json({
          success: false,
          message:
            "Au moins un des champs 'email' ou 'phone' doit être renseigné lorsque vous fournissez les coordonnées.",
        });
      }
    }

    const result = await otpService.createOtp(
      utilisateurId,
      canalNotification,
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
