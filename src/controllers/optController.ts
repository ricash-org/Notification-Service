import { Request, Response } from "express";
import { OtpService } from "../services/otpService";

const otpService = new OtpService();

export const generateOtp = async (req: Request, res: Response) => {
  try {
    const { utilisateurId, canalNotification } = req.body;
    const result = await otpService.createOtp(utilisateurId, canalNotification);
    res.json(result);
  } catch (error : any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { utilisateurId, code } = req.body;
    const result = await otpService.verifyOtp(utilisateurId, code);
    res.json(result);
  } catch (error : any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
