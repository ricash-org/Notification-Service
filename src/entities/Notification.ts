import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum TypeNotification {
  CONFIRMATION_TRANSFERT = "CONFIRMATION_TRANSFERT",
  CONFIRMATION_RETRAIT = "CONFIRMATION_RETRAIT",
  RETRAIT_REUSSI = "RETRAIT_REUSSI",
  DEPOT_REUSSI = "DEPOT_REUSSI",
  ALERT_SECURITE = "ALERT_SECURITE",
  VERIFICATION_KYC = "VERIFICATION_KYC",
  VERIFICATION_EMAIL = "VERIFICATION_EMAIL",
  VERIFICATION_TELEPHONE = "VERIFICATION_TELEPHONE",
}

export enum CanalNotification {
  SMS = "SMS",
  EMAIL = "EMAIL",
  PUSH = "PUSH",
  WHATSAPP = "WHATSAPP",
}

export enum StatutNotification {
  CREE = "CREE",
  EN_COURS = "EN_COURS",
  ENVOYEE = "ENVOYEE",
  LUE = "LUE",
  ECHEC = "ECHEC",
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  utilisateurId!: string;

  @Column({ nullable: true })
  destinationEmail?: string;

  @Column({ nullable: true })
  destinationPhone?: string;

  @Column({ type: "enum", enum: TypeNotification })
  typeNotification!: TypeNotification;

  // @Column()
  // titre!: string;

  @Column()
  message!: string;

  @Column({ type: "enum", enum: CanalNotification })
  canal!: CanalNotification;

  @Column({
    type: "enum",
    enum: StatutNotification,
    default: StatutNotification.CREE,
  })
  statut!: StatutNotification;

  @CreateDateColumn()
  dateEnvoi!: Date;

  // champ optionnel pour passer des données contextuelles (ex: code OTP)
  @Column({ type: "simple-json", nullable: true })
  context?: Record<string, any>;
}
