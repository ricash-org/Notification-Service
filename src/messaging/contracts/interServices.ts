
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

  context?: any;

  metadata?: {
    service: string;
    correlationId?: string;
  };
}
