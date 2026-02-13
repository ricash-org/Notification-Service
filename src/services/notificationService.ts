import dotenv from "dotenv";
import twilio from "twilio";
import { AppDataSource } from "../data-source";
import {
  CanalNotification,
  Notification,
  StatutNotification,
  TypeNotification,
} from "../entities/Notification";
import { sendEmail } from "../utils/mailService";
import { generateMessage } from "../utils/messageTemplates";
import { userContactService } from "./userContactService";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export class NotificationService {
  private notifRepo = AppDataSource.getRepository(Notification);

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

  async envoyerNotification(data: {
    utilisateurId: string; // identifiant métier (ex: user-123)
    typeNotification: TypeNotification;
    canal: CanalNotification;
    context?: any;
    /** Coordonnées facultatives fournies directement par l'appelant */
    email?: string | null;
    phone?: string | null;
  }) {
    // Génération automatique du message personnalisé
    const message = generateMessage(data.typeNotification, data.context || {});

    // 1. On part des coordonnées explicitement fournies dans la requête / l'événement
    let destinationEmail: string | undefined = data.email ?? undefined;
    let destinationPhone: string | undefined = data.phone ?? undefined;

    // 2. Si au moins une coordonnée manque, on essaie de la compléter via le service de contact
    if (!destinationEmail || !destinationPhone) {
      const contact = await userContactService.getContact(data.utilisateurId);

      if (!destinationEmail && contact.email) {
        destinationEmail = contact.email;
      }
      if (!destinationPhone && contact.phone) {
        destinationPhone = contact.phone;
      }
    }

    // 3. Validation générale : au moins un des deux doit être présent
    if (!destinationEmail && !destinationPhone) {
      throw new Error(
        `Aucun contact (email ou téléphone) disponible pour l'utilisateur ${data.utilisateurId}`,
      );
    }

    // 4. Validation spécifique au canal demandé
    if (data.canal === CanalNotification.EMAIL && !destinationEmail) {
      throw new Error(
        `Canal EMAIL demandé mais aucune adresse email valide pour l'utilisateur ${data.utilisateurId}`,
      );
    }

    if (data.canal === CanalNotification.SMS && !destinationPhone) {
      throw new Error(
        `Canal SMS demandé mais aucun numéro de téléphone valide pour l'utilisateur ${data.utilisateurId}`,
      );
    }

    const notif = this.notifRepo.create({
      utilisateurId: data.utilisateurId,
      typeNotification: data.typeNotification,
      canal: data.canal,
      context: data.context,
      message,
      destinationEmail,
      destinationPhone,
      statut: StatutNotification.EN_COURS,
    });

    await this.notifRepo.save(notif);

    try {
      if (notif.canal === CanalNotification.SMS && destinationPhone) {
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: destinationPhone,
        });
      }

      if (notif.canal === CanalNotification.EMAIL && destinationEmail) {
        await sendEmail(destinationEmail, "HELLO", message);
      }

      notif.statut = StatutNotification.ENVOYEE;
      await this.notifRepo.save(notif);

      return notif;
    } catch (error) {
      notif.statut = StatutNotification.ECHEC;
      await this.notifRepo.save(notif);
      console.error("Erreur d'envoi :", error);
      throw new Error("Erreur d'envoi : " + error);
    }
  }

  async getAll() {
    return this.notifRepo.find();
  }
}
