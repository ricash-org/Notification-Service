"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const data_source_1 = require("../data-source");
const Notification_1 = require("../entities/Notification");
const Otp_1 = require("../entities/Otp");
const publisher_1 = require("../messaging/publisher");
class OtpService {
    constructor() {
        this.otpRepo = data_source_1.AppDataSource.getRepository(Otp_1.Otp);
        this.expirationDelay = 5 * 60 * 1000; // 5 minutes
    }
    generateCode() {
        return Math.floor(1000 + Math.random() * 9000).toString(); // 4chiffres
    }
    async createOtp(utilisateurId, canalNotification, email, phone) {
        const code = this.generateCode();
        const expiration = new Date(Date.now() + this.expirationDelay);
        const destinationEmail = email;
        const destinationPhone = phone;
        const otp = this.otpRepo.create({
            utilisateurId, // identifiant métier
            canal: canalNotification,
            code,
            expiration,
            destinationEmail,
            destinationPhone,
        });
        await this.otpRepo.save(otp);
        //  Détermination automatique du type de notification
        const notifType = canalNotification === "EMAIL"
            ? Notification_1.TypeNotification.VERIFICATION_EMAIL
            : Notification_1.TypeNotification.VERIFICATION_TELEPHONE;
        // message standard inter-services (aligné sur InterServices / NotificationEvent)
        const message = {
            utilisateurId,
            typeNotification: notifType,
            canal: canalNotification,
            context: { code },
            email: destinationEmail,
            phone: destinationPhone,
            metadata: {
                service: "notification-service:otp",
                correlationId: `otp-${otp.id}`,
            },
        };
        // Publication d'un événement OTP sur l'exchange partagé (ex: ricash.events)
        // Routing key dédiée : otp.verification (captée via le binding "otp.*")
        await (0, publisher_1.publishNotification)("otp.verification", message);
        return { success: true, message: "OTP envoyé", expiration };
    }
    async verifyOtp(utilisateurId, code) {
        const otp = await this.otpRepo.findOne({
            where: { utilisateurId, code },
        });
        if (!otp) {
            return { success: false, message: "Code invalide " };
        }
        if (otp.utilise) {
            return { success: false, message: "Ce code a déjà été utilisé " };
        }
        if (otp.expiration < new Date()) {
            return { success: false, message: "Code expiré " };
        }
        otp.utilise = true;
        await this.otpRepo.save(otp);
        return { success: true, message: "OTP validé " };
    }
    async cleanExpiredOtps() {
        const now = new Date();
        await this.otpRepo
            .createQueryBuilder()
            .delete()
            .where("expiration < :now", { now }).execute;
    }
}
exports.OtpService = OtpService;
