export interface InterServices {
  utilisateurId: string;
  typeNotification:
    | "CONFIRMATION_TRANSFERT"
    | "RETRAIT_REUSSI"
    | "DEPOT_REUSSI"
    | "ALERT_SECURITE"
    | "CONFIRMATION_DEPOT"
    | "VERIFICATION_EMAIL"
    | "VERIFICATION_TELEPHONE"
    | "VERIFICATION_KYC";

  canal: "SMS" | "EMAIL" | "PUSH";

  /**
   * Coordonnées facultatives transmises par le producteur de l'événement.
   * L'un des deux doit être renseigné (ou récupéré côté service de notif),
   * mais ils ne doivent pas être tous les deux absents au final.
   */
  email?: string | null;
  phone?: string | null;

  context?: any;

  metadata?: {
    service: string;
    correlationId?: string;
  };
}
