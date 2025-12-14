import { AppDataSource } from "../data-source";
import { Otp } from "../entities/Otp";
import { NotificationService } from "./notificationService";
import { CanalNotification, TypeNotification } from "../entities/Notification";
import { publishNotification } from "../messaging/publisher";

export class OtpService {
  private otpRepo = AppDataSource.getRepository(Otp);
  private notificationService = new NotificationService();

  private generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4chiffres
  }

  private expirationDelay = 5 * 60 * 1000; // 5 minutes

  async createOtp(utilisateurId: string, canalNotification: CanalNotification.EMAIL | CanalNotification.SMS ) {
    const code = this.generateCode();
    const expiration = new Date(Date.now() + this.expirationDelay);

    const otp = this.otpRepo.create({
        utilisateurId,
        canal: canalNotification,
        code,
        expiration
       });
    await this.otpRepo.save(otp);

    //  Détermination automatique du type de notification
    const notifType =
      canalNotification === "EMAIL"
        ? TypeNotification.VERIFICATION_EMAIL
        : TypeNotification.VERIFICATION_TELEPHONE;

    // message standard convenu entre services
    const message = {
      traceId: `otp-${otp.id}`, // utile pour idempotence / debug
      source: "otp-service",
      typeNotification: notifType,
      canal: canalNotification,
      utilisateurId,
      context: { code },
      meta: { otpId: otp.id, expiresAt: expiration.toISOString() },
    };


    // NotificationService s’occupe de générer le message
    //await this.notificationService.envoyerNotification({
    await publishNotification("notifications.main", message
      //{
      // utilisateurId,
      // typeNotification: notifType,
      // canal: canalNotification === "EMAIL" ? CanalNotification.EMAIL : CanalNotification.SMS,
      // context: { code },
   // }
  );

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
    await this.otpRepo.createQueryBuilder().delete().where("expiration < :now",{  now }).execute;
  }
}
