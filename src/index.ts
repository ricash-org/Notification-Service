import { Router } from "express";
import { generateOtp, verifyOtp } from "./controllers/optController";
import { envoyerNotification, testRabbitMQ } from "./controllers/notificationController";

const router = Router();

//  Notifications
router.post("/notifications/envoyer", envoyerNotification);
router.post("/rabbitmq", testRabbitMQ);

//  OTP
router.post("/otp/generate", generateOtp);
router.post("/otp/verify", verifyOtp);

export default router;
