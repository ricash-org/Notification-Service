import { TypeNotification } from "../entities/Notification";

export const generateMessage = (type: TypeNotification, context: any) => {
  switch (type) {
    case TypeNotification.CONFIRMATION_TRANSFERT:
      return `Votre transfert de ${context.montant} FCFA vers ${context.destinataire} a été confirmé.`;

    case TypeNotification.CONFIRMATION_RETRAIT:
      return `Votre demande de retrait de ${context.montant} FCFA est en cours de traitement.`;

    case TypeNotification.RETRAIT_REUSSI:
      return `Votre retrait de ${context.montant} FCFA a été effectué avec succès.`;

    case TypeNotification.DEPOT_REUSSI:
      return `Vous avez reçu un dépôt de ${context.montant} FCFA sur votre compte.`;

    case TypeNotification.ALERT_SECURITE:
      return `Alerte sécurité : connexion suspecte depuis un nouvel appareil.`;

    case TypeNotification.VERIFICATION_KYC:
      return `Votre vérification d’identité (KYC) est ${context.status === "valide" ? "validée " : "en attente "}.`;

    case TypeNotification.VERIFICATION_EMAIL:
      return `Votre code de vérification email est : ${context.code}`;

    case TypeNotification.VERIFICATION_TELEPHONE:
      return `Votre code OTP de vérification téléphone est : ${context.code}`;

    default:
      return `Notification générique`;
  }
};
