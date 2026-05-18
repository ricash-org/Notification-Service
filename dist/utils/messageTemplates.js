"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMessage = void 0;
const Notification_1 = require("../entities/Notification");
const readString = (context, key, fallback) => {
    const value = context[key];
    if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
    }
    if (typeof value === "number") {
        return String(value);
    }
    return fallback;
};
const readAmount = (context) => {
    const amount = context.montant ?? context.amount;
    if (typeof amount === "number") {
        return amount.toString();
    }
    if (typeof amount === "string" && amount.trim().length > 0) {
        return amount.trim();
    }
    return "0";
};
const readCurrency = (context) => readString(context, "currency", "FCFA");
const readReference = (context) => readString(context, "transactionId", "N/A");
const readBalance = (context) => {
    const balance = context.balance ?? context.solde;
    if (typeof balance === "number") {
        return balance.toString();
    }
    if (typeof balance === "string" && balance.trim().length > 0) {
        return balance.trim();
    }
    return "non disponible";
};
const readCode = (context) => readString(context, "code", "N/A");
const resolveStatusLabel = (context) => {
    const status = readString(context, "status", "en attente").toLowerCase();
    switch (status) {
        case "valide":
        case "valid":
        case "approved":
            return "validée";
        case "rejete":
        case "rejetee":
        case "rejected":
            return "rejetée";
        default:
            return "en attente";
    }
};
const generateMessage = (type, context) => {
    const amount = readAmount(context);
    const currency = readCurrency(context);
    const reference = readReference(context);
    const balance = readBalance(context);
    switch (type) {
        case Notification_1.TypeNotification.CONFIRMATION_TRANSFERT:
            if (context.direction === "credit") {
                return `Vous avez reçu un transfert de ${amount} ${currency} de ${readString(context, "destinataire", "un utilisateur")}. Nouveau solde: ${balance} ${currency}. Référence: ${reference}.`;
            }
            return `Votre transfert de ${amount} ${currency} vers ${readString(context, "destinataire", "le bénéficiaire")} a été confirmé. Nouveau solde: ${balance} ${currency}. Référence: ${reference}.`;
        case Notification_1.TypeNotification.CONFIRMATION_DEPOT:
            return `Votre dépôt de ${amount} ${currency} a été confirmé. Référence: ${reference}.`;
        case Notification_1.TypeNotification.CONFIRMATION_RETRAIT:
            return `Votre demande de retrait de ${amount} ${currency} est en cours de traitement. Référence: ${reference}.`;
        case Notification_1.TypeNotification.RETRAIT_REUSSI:
            return `Votre retrait de ${amount} ${currency} a été effectué avec succès. Nouveau solde: ${balance} ${currency}. Référence: ${reference}.`;
        case Notification_1.TypeNotification.DEPOT_REUSSI:
            return `Vous avez reçu un dépôt de ${amount} ${currency} sur votre compte. Nouveau solde: ${balance} ${currency}. Référence: ${reference}.`;
        case Notification_1.TypeNotification.ADMIN_CREE:
            return `Un nouvel administrateur (${readString(context, "adminName", "non renseigné")}) a été créé sur la plateforme.`;
        case Notification_1.TypeNotification.ADMIN_MIS_A_JOUR:
            return `Le profil administrateur (${readString(context, "adminName", "non renseigné")}) a été mis à jour.`;
        case Notification_1.TypeNotification.ADMIN_SUPPRIME:
            return `Le compte administrateur (${readString(context, "adminName", "non renseigné")}) a été supprimé.`;
        case Notification_1.TypeNotification.AGENT_INSCRIPTION:
            return `Votre inscription en tant qu'agent a bien été enregistrée. Nous procéderons à sa vérification sous peu.`;
        case Notification_1.TypeNotification.AGENT_EN_ATTENTE_VALIDATION:
            return `Votre dossier agent est en attente de validation par l'équipe conformité.`;
        case Notification_1.TypeNotification.AGENT_VALIDE:
            return `Votre compte agent a été validé. Vous pouvez désormais accéder à l'ensemble des services.`;
        case Notification_1.TypeNotification.AGENT_REJETE:
            return `Votre demande d'inscription agent a été rejetée. Veuillez vérifier vos informations et réessayer.`;
        case Notification_1.TypeNotification.CLIENT_INSCRIPTION:
            return `Bienvenue. Votre inscription client est finalisée avec succès.`;
        case Notification_1.TypeNotification.CLIENT_COMPTE_ACTIF:
            return `Votre compte client est désormais actif.`;
        case Notification_1.TypeNotification.CONNEXION_REUSSIE:
            return `Connexion réussie sur votre compte${readString(context, "appareil", "").length > 0
                ? ` depuis ${readString(context, "appareil", "")}`
                : ""}.`;
        case Notification_1.TypeNotification.ECHEC_CONNEXION:
            return `Échec de tentative de connexion détecté sur votre compte. Si ce n'était pas vous, changez votre mot de passe immédiatement.`;
        case Notification_1.TypeNotification.DECONNEXION:
            return `Vous avez été déconnecté de votre session.`;
        case Notification_1.TypeNotification.NOUVEL_APPAREIL:
            return `Nouvel appareil détecté sur votre compte: ${readString(context, "appareil", "appareil non identifié")}.`;
        case Notification_1.TypeNotification.CHANGEMENT_MOT_DE_PASSE:
            return `Votre mot de passe a été modifié avec succès.`;
        case Notification_1.TypeNotification.CHANGEMENT_EMAIL:
            return `Votre adresse email a été modifiée${readString(context, "nouvelEmail", "").length > 0
                ? `: ${readString(context, "nouvelEmail", "")}`
                : ""}.`;
        case Notification_1.TypeNotification.CHANGEMENT_TELEPHONE:
            return `Votre numéro de téléphone a été modifié${readString(context, "nouveauTelephone", "").length > 0
                ? `: ${readString(context, "nouveauTelephone", "")}`
                : ""}.`;
        case Notification_1.TypeNotification.COMPTE_BLOQUE:
            return `Votre compte a été temporairement bloqué pour des raisons de sécurité.`;
        case Notification_1.TypeNotification.COMPTE_DEBLOQUE:
            return `Votre compte a été débloqué. Vous pouvez reprendre vos opérations.`;
        case Notification_1.TypeNotification.TRANSFERT_ENVOYE:
            return `Votre transfert de ${amount} ${currency} a bien été envoyé. Référence: ${reference}.`;
        case Notification_1.TypeNotification.TRANSFERT_RECU:
            return `Vous avez reçu un transfert de ${amount} ${currency}. Référence: ${reference}.`;
        case Notification_1.TypeNotification.ECHEC_TRANSFERT:
            return `Le transfert de ${amount} ${currency} a échoué. Référence: ${reference}.`;
        case Notification_1.TypeNotification.DEPOT_EN_COURS:
            return `Votre dépôt de ${amount} ${currency} est en cours de traitement. Référence: ${reference}.`;
        case Notification_1.TypeNotification.ECHEC_DEPOT:
            return `Votre dépôt de ${amount} ${currency} a échoué. Référence: ${reference}.`;
        case Notification_1.TypeNotification.RETRAIT_EN_COURS:
            return `Votre retrait de ${amount} ${currency} est en cours de traitement. Référence: ${reference}.`;
        case Notification_1.TypeNotification.ECHEC_RETRAIT:
            return `Votre retrait de ${amount} ${currency} a échoué. Référence: ${reference}.`;
        case Notification_1.TypeNotification.OTP_ENVOYE:
            return `Votre code OTP est: ${readCode(context)}. Ce code est valable 5 minutes. Ne le partagez jamais avec un tiers.`;
        case Notification_1.TypeNotification.OTP_VALIDE:
            return `Votre code OTP a été validé avec succès.`;
        case Notification_1.TypeNotification.OTP_EXPIRE:
            return `Votre code OTP a expiré. Veuillez demander un nouveau code.`;
        case Notification_1.TypeNotification.OTP_INVALIDE:
            return `Le code OTP saisi est invalide. Veuillez réessayer.`;
        case Notification_1.TypeNotification.KYC_EN_COURS:
            return `Votre dossier KYC est en cours d'analyse.`;
        case Notification_1.TypeNotification.KYC_VALIDE:
            return `Votre vérification KYC a été validée.`;
        case Notification_1.TypeNotification.KYC_REJETE:
            return `Votre vérification KYC a été rejetée. Veuillez mettre à jour vos informations.`;
        case Notification_1.TypeNotification.PAIEMENT_REUSSI:
            return `Votre paiement de ${amount} ${currency} a été effectué avec succès. Référence: ${reference}.`;
        case Notification_1.TypeNotification.PAIEMENT_ECHOUE:
            return `Votre paiement de ${amount} ${currency} a échoué. Référence: ${reference}.`;
        case Notification_1.TypeNotification.FACTURE_GENEREE:
            return `Une nouvelle facture a été générée${readString(context, "factureId", "").length > 0
                ? ` (ID: ${readString(context, "factureId", "")})`
                : ""}.`;
        case Notification_1.TypeNotification.FACTURE_PAYEE:
            return `Votre facture a été payée avec succès${readString(context, "factureId", "").length > 0
                ? ` (ID: ${readString(context, "factureId", "")})`
                : ""}.`;
        case Notification_1.TypeNotification.TENTATIVE_FRAUDE:
            return `Une tentative de fraude a été détectée sur votre compte. Nos équipes ont été alertées.`;
        case Notification_1.TypeNotification.TRANSACTION_SUSPECTE:
            return `Une transaction suspecte a été détectée. Montant: ${amount} ${currency}. Référence: ${reference}.`;
        case Notification_1.TypeNotification.ACTIVITE_INHABITUELLE:
            return `Une activité inhabituelle a été détectée sur votre compte. Merci de vérifier vos opérations récentes.`;
        case Notification_1.TypeNotification.MAINTENANCE:
            return `Une opération de maintenance est programmée${readString(context, "window", "").length > 0
                ? `: ${readString(context, "window", "")}`
                : " prochainement"}.`;
        case Notification_1.TypeNotification.MISE_A_JOUR_SYSTEME:
            return `Une mise à jour système a été déployée. ${readString(context, "details", "Merci de relancer votre application si nécessaire.")}`;
        case Notification_1.TypeNotification.ANNONCE:
            return readString(context, "message", "Nouvelle annonce: consultez votre application pour plus de détails.");
        case Notification_1.TypeNotification.RECHARGE_MOBILE:
            return `Recharge mobile de ${amount} ${currency} pour le ${readString(context, "beneficiaire", "numéro")} confirmée. Référence: ${reference}.`;
        case Notification_1.TypeNotification.ALERT_SECURITE:
            return `Alerte sécurité : connexion suspecte depuis un nouvel appareil.`;
        case Notification_1.TypeNotification.VERIFICATION_KYC:
            return `Votre vérification d'identité (KYC) est ${resolveStatusLabel(context)}.`;
        case Notification_1.TypeNotification.VERIFICATION_EMAIL:
            return `Votre code de vérification email est: ${readCode(context)}. Ce code est valable 5 minutes. Ne le partagez jamais avec un tiers.`;
        case Notification_1.TypeNotification.VERIFICATION_TELEPHONE:
            return `Votre code OTP de vérification téléphone est: ${readCode(context)}. Ce code est valable 5 minutes. Ne le partagez jamais avec un tiers.`;
        default:
            return `Vous avez reçu une nouvelle notification (${type}). Consultez votre application pour plus de détails.`;
    }
};
exports.generateMessage = generateMessage;
