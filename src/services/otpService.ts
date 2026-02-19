import { AppDataSource } from "../data-source";
import { CanalNotification, TypeNotification } from "../entities/Notification";
import { Otp } from "../entities/Otp";
import { InterServices } from "../messaging/contracts/interServices";
import { publishNotification } from "../messaging/publisher";

export class OtpService {
  private otpRepo = AppDataSource.getRepository(Otp);

  private generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4chiffres
  }

  private expirationDelay = 5 * 60 * 1000; // 5 minutes

  async createOtp(
    utilisateurId: string,
    canalNotification: CanalNotification.EMAIL | CanalNotification.SMS,
    email: string,
    phone: string,
  ) {
    const code = this.generateCode();
    const expiration = new Date(Date.now() + this.expirationDelay);
    const destinationEmail: string = email;
    const destinationPhone: string = phone;

    const otp = this.otpRepo.create({
      utilisateurId, // identifiant métier
      canal: canalNotification,
      code,
      expiration,
      destinationEmail,
      destinationPhone,
    });
    await this.otpRepo.save(otp);

    //  Détermination automatique du type de notification
    const notifType =
      canalNotification === "EMAIL"
        ? TypeNotification.VERIFICATION_EMAIL
        : TypeNotification.VERIFICATION_TELEPHONE;

    // message standard inter-services (aligné sur InterServices / NotificationEvent)
    const message: InterServices = {
      utilisateurId,
      typeNotification: notifType,
      canal: canalNotification,
      context: { code },
      email: destinationEmail,
      phone: destinationPhone,
      metadata: {
        service: "notification-service:otp",
        correlationId: `otp-${otp.id}`,
      },
    };

    // Publication d'un événement OTP sur l'exchange partagé (ex: ricash.events)
    // Routing key dédiée : otp.verification (captée via le binding "otp.*")
    await publishNotification("otp.verification", message);

    return { success: true, message: "OTP envoyé", expiration };
  }

  async verifyOtp(utilisateurId: string, code: string) {
    const otp = await this.otpRepo.findOne({
      where: { utilisateurId, code },
    });

    if (!otp) {
      return { success: false, message: "Code invalide " };
    }

    if (otp.utilise) {
      return { success: false, message: "Ce code a déjà été utilisé " };
    }

    if (otp.expiration < new Date()) {
      return { success: false, message: "Code expiré " };
    }

    otp.utilise = true;
    await this.otpRepo.save(otp);

    return { success: true, message: "OTP validé " };
  }

  async cleanExpiredOtps() {
    const now = new Date();
    await this.otpRepo
      .createQueryBuilder()
      .delete()
      .where("expiration < :now", { now }).execute;
  }
}
