import { TypeNotification } from "../entities/Notification";

export const generateMessage = (type: TypeNotification, context: any) => {
  switch (type) {
    case TypeNotification.CONFIRMATION_TRANSFERT:
      // Pour les transferts, on distingue l'expéditeur (direction="debit") et le destinataire (direction="credit").
      if (context?.direction === "credit") {
        // Message pour le bénéficiaire qui reçoit un transfert
        return `Vous avez reçu un transfert de ${context.destinataire} de ${context.montant} ${context.currency ?? "FCFA"}. Nouveau solde: ${context.balance ?? context.solde} ${context.currency ?? "FCFA"}. Référence: ${context.transactionId}.`;
      }

      // Par défaut (et pour direction="debit"), message pour l'expéditeur
      return `Votre transfert de ${context.montant} ${context.currency ?? "FCFA"} vers ${context.destinataire} a été confirmé. Nouveau solde: ${context.balance ?? context.solde} ${context.currency ?? "FCFA"}. Référence: ${context.transactionId}.`;

    case TypeNotification.CONFIRMATION_RETRAIT:
      return `Votre demande de retrait de ${context.montant} ${context.currency ?? "FCFA"} est en cours de traitement. Référence: ${context.transactionId}.`;

    case TypeNotification.RETRAIT_REUSSI:
      return `Votre retrait de ${context.montant} ${context.currency ?? "FCFA"} a été effectué avec succès. Nouveau solde: ${context.solde} ${context.currency ?? "FCFA"}. Référence: ${context.transactionId}.`;

    case TypeNotification.DEPOT_REUSSI:
      return `Vous avez reçu un dépôt de ${context.montant} ${context.currency ?? "FCFA"} sur votre compte. Nouveau solde: ${context.solde} ${context.currency ?? "FCFA"}. Référence: ${context.transactionId}.`;

    case TypeNotification.ALERT_SECURITE:
      return `Alerte sécurité : connexion suspecte depuis un nouvel appareil.`;

    case TypeNotification.VERIFICATION_KYC:
      return `Votre vérification d’identité (KYC) est ${context.status === "valide" ? "validée " : "en attente "}.`;

    case TypeNotification.VERIFICATION_EMAIL:
      return `Votre code de vérification email est : ${context.code}. Ce code est valable 5 minutes. Ne le partagez jamais avec un tiers.`;

    case TypeNotification.VERIFICATION_TELEPHONE:
      return `Votre code OTP de vérification téléphone est : ${context.code}. Ce code est valable 5 minutes. Ne le partagez jamais avec un tiers.`;

    default:
      return `Notification générique`;
  }
};
