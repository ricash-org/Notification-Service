import { Router } from "express";
import { generateOtp, verifyOtp } from "../controllers/optController";
import { envoyerNotification, getNotifications } from "../controllers/notificationController";


const router = Router();

router.post("/envoyer", envoyerNotification);
router.get("/", getNotifications);

// OTP
router.post("/otp/generate", generateOtp);
router.post("/otp/verify", verifyOtp);

export default router;
