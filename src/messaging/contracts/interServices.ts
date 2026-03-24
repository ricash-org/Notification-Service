import { TypeNotification } from "../../entities/Notification";

export interface InterServices {
  utilisateurId: string;
  typeNotification: TypeNotification;

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
