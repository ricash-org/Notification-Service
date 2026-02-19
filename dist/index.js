"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const optController_1 = require("./controllers/optController");
const notificationController_1 = require("./controllers/notificationController");
const router = (0, express_1.Router)();
//  Notifications
router.post("/notifications/envoyer", notificationController_1.envoyerNotification);
router.post("/rabbitmq", notificationController_1.testRabbitMQ);
//  OTP
router.post("/otp/generate", optController_1.generateOtp);
router.post("/otp/verify", optController_1.verifyOtp);
exports.default = router;
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
