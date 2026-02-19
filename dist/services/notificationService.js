"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const twilio_1 = __importDefault(require("twilio"));
const data_source_1 = require("../data-source");
const Notification_1 = require("../entities/Notification");
const mailService_1 = require("../utils/mailService");
const messageTemplates_1 = require("../utils/messageTemplates");
const userContactService_1 = require("./userContactService");
dotenv_1.default.config();
const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
class NotificationService {
    constructor() {
        this.notifRepo = data_source_1.AppDataSource.getRepository(Notification_1.Notification);
    }
    // async envoyerNotification(data: Partial<Notification>) {
    //   const notif = this.notifRepo.create({ ...data, statut: StatutNotification.EN_COURS });
    //   await this.notifRepo.save(notif);
    //   try {
    //     if (notif.canal === "SMS") {
    //       await client.messages.create({
    //         body: notif.message,
    //         from: process.env.TWILIO_PHONE_NUMBER,
    //         to: data.utilisateurId, // ⚠️ ici, utilisateurId = numéro tel pour simplifier
    //       });
    //     }
    //     notif.statut = StatutNotification.ENVOYEE;
    //     await this.notifRepo.save(notif);
    //     return notif;
    //   } catch (error) {
    //     notif.statut = StatutNotification.ECHEC;
    //     await this.notifRepo.save(notif);
    //     throw new Error("Erreur d'envoi : " + error);
    //   }
    // }
    mapStringToTypeNotification(type) {
        switch (type) {
            case "transfer":
                return Notification_1.TypeNotification.CONFIRMATION_TRANSFERT;
            case "retrait_reussi":
            case "RETRAIT_REUSSI":
                return Notification_1.TypeNotification.RETRAIT_REUSSI;
            case "depot_reussi":
            case "DEPOT_REUSSI":
                return Notification_1.TypeNotification.DEPOT_REUSSI;
            case "alert_securite":
            case "ALERT_SECURITE":
                return Notification_1.TypeNotification.ALERT_SECURITE;
            case "verification_email":
            case "VERIFICATION_EMAIL":
                return Notification_1.TypeNotification.VERIFICATION_EMAIL;
            case "verification_telephone":
            case "VERIFICATION_TELEPHONE":
                return Notification_1.TypeNotification.VERIFICATION_TELEPHONE;
            case "verification_kyc":
            case "VERIFICATION_KYC":
                return Notification_1.TypeNotification.VERIFICATION_KYC;
            default:
                return Notification_1.TypeNotification.ALERT_SECURITE;
        }
    }
    async sendMultiChannelToContact(contact, content, type, role, extraContext) {
        const context = { ...(extraContext || {}), role };
        // SMS
        const notifSms = this.notifRepo.create({
            utilisateurId: contact.phone,
            typeNotification: type,
            canal: Notification_1.CanalNotification.SMS,
            context,
            message: content,
            destinationPhone: contact.phone,
            statut: Notification_1.StatutNotification.EN_COURS,
        });
        await this.notifRepo.save(notifSms);
        try {
            await client.messages.create({
                body: content,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: contact.phone,
            });
            notifSms.statut = Notification_1.StatutNotification.ENVOYEE;
        }
        catch (error) {
            notifSms.statut = Notification_1.StatutNotification.ECHEC;
            console.error("Erreur d'envoi SMS :", error);
        }
        await this.notifRepo.save(notifSms);
        // EMAIL
        const notifEmail = this.notifRepo.create({
            utilisateurId: contact.email,
            typeNotification: type,
            canal: Notification_1.CanalNotification.EMAIL,
            context,
            message: content,
            destinationEmail: contact.email,
            statut: Notification_1.StatutNotification.EN_COURS,
        });
        await this.notifRepo.save(notifEmail);
        try {
            await (0, mailService_1.sendEmail)(contact.email, "Notification", content);
            notifEmail.statut = Notification_1.StatutNotification.ENVOYEE;
        }
        catch (error) {
            notifEmail.statut = Notification_1.StatutNotification.ECHEC;
            console.error("Erreur d'envoi email :", error);
        }
        await this.notifRepo.save(notifEmail);
        return {
            sms: notifSms,
            email: notifEmail,
        };
    }
    /**
     * Endpoint HTTP (Postman) :
     *  - dépend UNIQUEMENT des coordonnées fournies dans le JSON
     *  - envoie systématiquement sur email ET SMS quand fournis
     *  - gère le cas spécifique type = "transfer" (sender / receiver)
     */
    async envoyerNotificationFromHttp(payload) {
        if (payload.type === "transfer") {
            const transferPayload = payload;
            const type = this.mapStringToTypeNotification(payload.type);
            const senderResult = await this.sendMultiChannelToContact(transferPayload.sender, transferPayload.content, type, "SENDER", { montant: transferPayload.amount });
            const receiverResult = await this.sendMultiChannelToContact(transferPayload.receiver, transferPayload.content, type, "RECEIVER", { montant: transferPayload.amount });
            return {
                sender: senderResult,
                receiver: receiverResult,
            };
        }
        const simplePayload = payload;
        const type = this.mapStringToTypeNotification(simplePayload.type);
        const userResult = await this.sendMultiChannelToContact(simplePayload.user, simplePayload.content, type, "USER");
        return {
            user: userResult,
        };
    }
    async envoyerNotification(data) {
        // Génération automatique du message personnalisé
        const message = (0, messageTemplates_1.generateMessage)(data.typeNotification, data.context || {});
        // 1. On part des coordonnées explicitement fournies dans la requête / l'événement
        let destinationEmail = data.email ?? undefined;
        let destinationPhone = data.phone ?? undefined;
        // 2. Si au moins une coordonnée manque, on essaie de la compléter via le service de contact
        if (!destinationEmail || !destinationPhone) {
            const contact = await userContactService_1.userContactService.getContact(data.utilisateurId);
            if (!destinationEmail && contact.email) {
                destinationEmail = contact.email;
            }
            if (!destinationPhone && contact.phone) {
                destinationPhone = contact.phone;
            }
        }
        // 3. Validation générale : au moins un des deux doit être présent
        if (!destinationEmail && !destinationPhone) {
            throw new Error(`Aucun contact (email ou téléphone) disponible pour l'utilisateur ${data.utilisateurId}`);
        }
        // 4. Validation spécifique au canal demandé
        if (data.canal === Notification_1.CanalNotification.EMAIL && !destinationEmail) {
            throw new Error(`Canal EMAIL demandé mais aucune adresse email valide pour l'utilisateur ${data.utilisateurId}`);
        }
        if (data.canal === Notification_1.CanalNotification.SMS && !destinationPhone) {
            throw new Error(`Canal SMS demandé mais aucun numéro de téléphone valide pour l'utilisateur ${data.utilisateurId}`);
        }
        const notif = this.notifRepo.create({
            utilisateurId: data.utilisateurId,
            typeNotification: data.typeNotification,
            canal: data.canal,
            context: data.context,
            message,
            destinationEmail,
            destinationPhone,
            statut: Notification_1.StatutNotification.EN_COURS,
        });
        await this.notifRepo.save(notif);
        try {
            if (notif.canal === Notification_1.CanalNotification.SMS && destinationPhone) {
                await client.messages.create({
                    body: message,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: destinationPhone,
                });
            }
            if (notif.canal === Notification_1.CanalNotification.EMAIL && destinationEmail) {
                await (0, mailService_1.sendEmail)(destinationEmail, "HELLO", message);
            }
            notif.statut = Notification_1.StatutNotification.ENVOYEE;
            await this.notifRepo.save(notif);
            return notif;
        }
        catch (error) {
            notif.statut = Notification_1.StatutNotification.ECHEC;
            await this.notifRepo.save(notif);
            console.error("Erreur d'envoi :", error);
            throw new Error("Erreur d'envoi : " + error);
        }
    }
    async getAll() {
        return this.notifRepo.find();
    }
}
exports.NotificationService = NotificationService;
