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

require("dotenv").config();
const express = require("express");
const healthRoute = require("../routes/health");

const app = express();
const PORT = process.env.SERVICE_PORT || 8000;

app.use(express.json());
app.use("/", healthRoute);

app.listen(PORT, () => {
  console.log(`🚀 Service running on port ${PORT}`);
});