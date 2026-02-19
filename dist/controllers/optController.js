"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.generateOtp = void 0;
const zod_1 = require("zod");
const Notification_1 = require("../entities/Notification");
const otpService_1 = require("../services/otpService");
const otpService = new otpService_1.OtpService();
const GenerateOtpSchema = zod_1.z.object({
    utilisateurId: zod_1.z.string().min(1),
    canalNotification: zod_1.z.enum(["SMS", "EMAIL"]),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(8),
});
const generateOtp = async (req, res) => {
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
        const canalEnum = canalNotification === "SMS"
            ? Notification_1.CanalNotification.SMS
            : Notification_1.CanalNotification.EMAIL;
        const result = await otpService.createOtp(utilisateurId, canalEnum, email, phone);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.generateOtp = generateOtp;
const verifyOtp = async (req, res) => {
    try {
        const { utilisateurId, code } = req.body;
        const result = await otpService.verifyOtp(utilisateurId, code);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.verifyOtp = verifyOtp;
