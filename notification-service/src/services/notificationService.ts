import { AppDataSource } from "../data-source";
import { CanalNotification, Notification, StatutNotification, TypeNotification } from "../entities/Notification";
import twilio from "twilio";
import dotenv from "dotenv";
import { generateMessage } from "../utils/messageTemplates";
import { sendEmail } from "../utils/mailService";

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
    utilisateurId: string;
    typeNotification: TypeNotification;
    canal: CanalNotification;
    context?: any;
  }) {
    // ✅ Génération automatique du message personnalisé
    const message = generateMessage(data.typeNotification, data.context || {});

    const notif = this.notifRepo.create({
      ...data,
      message,
      statut: StatutNotification.EN_COURS,
    });

    await this.notifRepo.save(notif);

    try {
      if (notif.canal === CanalNotification.SMS) {
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: data.utilisateurId, // ici utilisateurId = numéro pour simplifier
        });
      }

      //Envoi d'email si canal = EMAIL 
        if (notif.canal === CanalNotification.EMAIL) {
        await sendEmail(data.utilisateurId," HELLO ", message);
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
