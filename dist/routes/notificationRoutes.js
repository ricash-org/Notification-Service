"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const optController_1 = require("../controllers/optController");
const notificationController_1 = require("../controllers/notificationController");
const router = (0, express_1.Router)();
router.post("/envoyer", notificationController_1.envoyerNotification);
router.get("/", notificationController_1.getNotifications);
router.post("/rabbitmq", notificationController_1.testRabbitMQ);
// OTP
router.post("/otp/generate", optController_1.generateOtp);
router.post("/otp/verify", optController_1.verifyOtp);
exports.default = router;
