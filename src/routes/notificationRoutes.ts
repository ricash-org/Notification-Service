import { Router } from "express";
import { generateOtp, verifyOtp } from "../controllers/optController";
import { envoyerNotification, getNotifications, testRabbitMQ } from "../controllers/notificationController";


const router = Router();

router.post("/envoyer", envoyerNotification);
router.get("/", getNotifications);

router.post("/rabbitmq", testRabbitMQ);

// OTP
router.post("/otp/generate", generateOtp);
router.post("/otp/verify", verifyOtp);

export default router;
