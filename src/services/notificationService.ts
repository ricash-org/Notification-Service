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

export interface ContactInfoDTO {
  email: string;
  phone: string;
}

export interface TransferNotificationDTO {
  type: "transfer";
  sender: ContactInfoDTO;
  receiver: ContactInfoDTO;
  amount: number;
  content: string;
}

export interface SimpleNotificationDTO {
  type: string;
  user: ContactInfoDTO;
  content: string;
}

export type HttpNotificationDTO =
  | TransferNotificationDTO
  | SimpleNotificationDTO;

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

  private mapStringToTypeNotification(type: string): TypeNotification {
    switch (type) {
      case "transfer":
        return TypeNotification.CONFIRMATION_TRANSFERT;
      case "retrait_reussi":
      case "RETRAIT_REUSSI":
        return TypeNotification.RETRAIT_REUSSI;
      case "depot_reussi":
      case "DEPOT_REUSSI":
        return TypeNotification.DEPOT_REUSSI;
      case "alert_securite":
      case "ALERT_SECURITE":
        return TypeNotification.ALERT_SECURITE;
      case "verification_email":
      case "VERIFICATION_EMAIL":
        return TypeNotification.VERIFICATION_EMAIL;
      case "verification_telephone":
      case "VERIFICATION_TELEPHONE":
        return TypeNotification.VERIFICATION_TELEPHONE;
      case "verification_kyc":
      case "VERIFICATION_KYC":
        return TypeNotification.VERIFICATION_KYC;
      default:
        return TypeNotification.ALERT_SECURITE;
    }
  }

  private async sendMultiChannelToContact(
    contact: ContactInfoDTO,
    content: string,
    type: TypeNotification,
    role: string,
    extraContext?: Record<string, any>,
  ) {
    const context = { ...(extraContext || {}), role };

    // SMS
    const notifSms = this.notifRepo.create({
      utilisateurId: contact.phone,
      typeNotification: type,
      canal: CanalNotification.SMS,
      context,
      message: content,
      destinationPhone: contact.phone,
      statut: StatutNotification.EN_COURS,
    });

    await this.notifRepo.save(notifSms);

    try {
      await client.messages.create({
        body: content,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: contact.phone,
      });
      notifSms.statut = StatutNotification.ENVOYEE;
    } catch (error) {
      notifSms.statut = StatutNotification.ECHEC;
      console.error("Erreur d'envoi SMS :", error);
    }

    await this.notifRepo.save(notifSms);

    // EMAIL
    const notifEmail = this.notifRepo.create({
      utilisateurId: contact.email,
      typeNotification: type,
      canal: CanalNotification.EMAIL,
      context,
      message: content,
      destinationEmail: contact.email,
      statut: StatutNotification.EN_COURS,
    });

    await this.notifRepo.save(notifEmail);

    try {
      await sendEmail(contact.email, "Notification", content);
      notifEmail.statut = StatutNotification.ENVOYEE;
    } catch (error) {
      notifEmail.statut = StatutNotification.ECHEC;
      console.error("Erreur d'envoi email :", error);
    }

    await this.notifRepo.save(notifEmail);

    return {
      sms: notifSms,
      email: notifEmail,
    };
  }

  /**
   * Endpoint HTTP (Postman) :
   *  - dépend UNIQUEMENT des coordonnées fournies dans le JSON
   *  - envoie systématiquement sur email ET SMS quand fournis
   *  - gère le cas spécifique type = "transfer" (sender / receiver)
   */
  async envoyerNotificationFromHttp(payload: HttpNotificationDTO) {
    if (payload.type === "transfer") {
      const transferPayload = payload as TransferNotificationDTO;
      const type = this.mapStringToTypeNotification(payload.type);

      const senderResult = await this.sendMultiChannelToContact(
        transferPayload.sender,
        transferPayload.content,
        type,
        "SENDER",
        { montant: transferPayload.amount },
      );
      const receiverResult = await this.sendMultiChannelToContact(
        transferPayload.receiver,
        transferPayload.content,
        type,
        "RECEIVER",
        { montant: transferPayload.amount },
      );

      return {
        sender: senderResult,
        receiver: receiverResult,
      };
    }

    const simplePayload = payload as SimpleNotificationDTO;
    const type = this.mapStringToTypeNotification(simplePayload.type);

    const userResult = await this.sendMultiChannelToContact(
      simplePayload.user,
      simplePayload.content,
      type,
      "USER",
    );

    return {
      user: userResult,
    };
  }

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
