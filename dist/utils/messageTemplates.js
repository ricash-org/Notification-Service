"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMessage = void 0;
const Notification_1 = require("../entities/Notification");
const generateMessage = (type, context) => {
    switch (type) {
        case Notification_1.TypeNotification.CONFIRMATION_TRANSFERT:
            return `Votre transfert de ${context.montant} ${context.currency ?? "FCFA"} vers ${context.destinataire} a été confirmé. Nouveau solde: ${context.balance ?? context.solde} ${context.currency ?? "FCFA"}. Référence: ${context.transactionId}.`;
        case Notification_1.TypeNotification.CONFIRMATION_RETRAIT:
            return `Votre demande de retrait de ${context.montant} ${context.currency ?? "FCFA"} est en cours de traitement. Référence: ${context.transactionId}.`;
        case Notification_1.TypeNotification.RETRAIT_REUSSI:
            return `Votre retrait de ${context.montant} ${context.currency ?? "FCFA"} a été effectué avec succès. Nouveau solde: ${context.solde} ${context.currency ?? "FCFA"}. Référence: ${context.transactionId}.`;
        case Notification_1.TypeNotification.DEPOT_REUSSI:
            return `Vous avez reçu un dépôt de ${context.montant} ${context.currency ?? "FCFA"} sur votre compte. Nouveau solde: ${context.solde} ${context.currency ?? "FCFA"}. Référence: ${context.transactionId}.`;
        case Notification_1.TypeNotification.ALERT_SECURITE:
            return `Alerte sécurité : connexion suspecte depuis un nouvel appareil.`;
        case Notification_1.TypeNotification.VERIFICATION_KYC:
            return `Votre vérification d’identité (KYC) est ${context.status === "valide" ? "validée " : "en attente "}.`;
        case Notification_1.TypeNotification.VERIFICATION_EMAIL:
            return `Votre code de vérification email est : ${context.code}. Ce code est valable 5 minutes. Ne le partagez jamais avec un tiers.`;
        case Notification_1.TypeNotification.VERIFICATION_TELEPHONE:
            return `Votre code OTP de vérification téléphone est : ${context.code}. Ce code est valable 5 minutes. Ne le partagez jamais avec un tiers.`;
        default:
            return `Notification générique`;
    }
};
exports.generateMessage = generateMessage;
