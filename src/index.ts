import { Router } from "express";
import { generateOtp, verifyOtp } from "./controllers/optController";
import { envoyerNotification } from "./controllers/notificationController";

const router = Router();

//  Notifications
router.post("/notifications/envoyer", envoyerNotification);

//  OTP
router.post("/otp/generate", generateOtp);
router.post("/otp/verify", verifyOtp);

export default router;
