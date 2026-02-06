import { AppDataSource } from "../data-source";
import { CanalNotification, Notification, StatutNotification, TypeNotification } from "../entities/Notification";
import twilio from "twilio";
import dotenv from "dotenv";
import { generateMessage } from "../utils/messageTemplates";
import { sendEmail } from "../utils/mailService";
import { userContactService } from "./userContactService";

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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
  }) {
    // Génération automatique du message personnalisé
    const message = generateMessage(data.typeNotification, data.context || {});

    // Récupération des coordonnées à partir de l'identifiant métier
    const contact = await userContactService.getContact(data.utilisateurId);

    let destinationEmail: string | undefined;
    let destinationPhone: string | undefined;

    if (data.canal === CanalNotification.EMAIL) {
      destinationEmail = contact.email;
      if (!destinationEmail) {
        throw new Error(
          `Aucune adresse email trouvée pour l'utilisateur ${data.utilisateurId}`,
        );
      }
    }

    if (data.canal === CanalNotification.SMS) {
      destinationPhone = contact.phone;
      if (!destinationPhone) {
        throw new Error(
          `Aucun numéro de téléphone trouvé pour l'utilisateur ${data.utilisateurId}`,
        );
      }
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
