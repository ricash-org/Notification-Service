import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum TypeNotification {
  // Existing types
  CONFIRMATION_TRANSFERT = "CONFIRMATION_TRANSFERT",
  CONFIRMATION_DEPOT = "CONFIRMATION_DEPOT",
  CONFIRMATION_RETRAIT = "CONFIRMATION_RETRAIT",
  RETRAIT_REUSSI = "RETRAIT_REUSSI",
  DEPOT_REUSSI = "DEPOT_REUSSI",
  ALERT_SECURITE = "ALERT_SECURITE",
  VERIFICATION_KYC = "VERIFICATION_KYC",
  VERIFICATION_EMAIL = "VERIFICATION_EMAIL",
  VERIFICATION_TELEPHONE = "VERIFICATION_TELEPHONE",

  // 1. ADMIN MANAGEMENT
  ADMIN_CREE = "ADMIN_CREE",
  ADMIN_MIS_A_JOUR = "ADMIN_MIS_A_JOUR",
  ADMIN_SUPPRIME = "ADMIN_SUPPRIME",

  // 2. AGENT WORKFLOW
  AGENT_INSCRIPTION = "AGENT_INSCRIPTION",
  AGENT_EN_ATTENTE_VALIDATION = "AGENT_EN_ATTENTE_VALIDATION",
  AGENT_VALIDE = "AGENT_VALIDE",
  AGENT_REJETE = "AGENT_REJETE",

  // 3. CLIENT
  CLIENT_INSCRIPTION = "CLIENT_INSCRIPTION",
  CLIENT_COMPTE_ACTIF = "CLIENT_COMPTE_ACTIF",

  // 4. AUTHENTICATION AND SECURITY
  CONNEXION_REUSSIE = "CONNEXION_REUSSIE",
  ECHEC_CONNEXION = "ECHEC_CONNEXION",
  DECONNEXION = "DECONNEXION",
  NOUVEL_APPAREIL = "NOUVEL_APPAREIL",
  CHANGEMENT_MOT_DE_PASSE = "CHANGEMENT_MOT_DE_PASSE",
  CHANGEMENT_EMAIL = "CHANGEMENT_EMAIL",
  CHANGEMENT_TELEPHONE = "CHANGEMENT_TELEPHONE",
  COMPTE_BLOQUE = "COMPTE_BLOQUE",
  COMPTE_DEBLOQUE = "COMPTE_DEBLOQUE",

  // 5. TRANSACTIONS
  TRANSFERT_ENVOYE = "TRANSFERT_ENVOYE",
  TRANSFERT_RECU = "TRANSFERT_RECU",
  ECHEC_TRANSFERT = "ECHEC_TRANSFERT",
  DEPOT_EN_COURS = "DEPOT_EN_COURS",
  ECHEC_DEPOT = "ECHEC_DEPOT",
  RETRAIT_EN_COURS = "RETRAIT_EN_COURS",
  ECHEC_RETRAIT = "ECHEC_RETRAIT",

  // 6. OTP AND VERIFICATION
  OTP_ENVOYE = "OTP_ENVOYE",
  OTP_VALIDE = "OTP_VALIDE",
  OTP_EXPIRE = "OTP_EXPIRE",
  OTP_INVALIDE = "OTP_INVALIDE",

  // 7. KYC
  KYC_EN_COURS = "KYC_EN_COURS",
  KYC_VALIDE = "KYC_VALIDE",
  KYC_REJETE = "KYC_REJETE",

  // 8. PAYMENT
  PAIEMENT_REUSSI = "PAIEMENT_REUSSI",
  PAIEMENT_ECHOUE = "PAIEMENT_ECHOUE",
  FACTURE_GENEREE = "FACTURE_GENEREE",
  FACTURE_PAYEE = "FACTURE_PAYEE",

  // 9. FRAUD AND ALERTS
  TENTATIVE_FRAUDE = "TENTATIVE_FRAUDE",
  TRANSACTION_SUSPECTE = "TRANSACTION_SUSPECTE",
  ACTIVITE_INHABITUELLE = "ACTIVITE_INHABITUELLE",

  // 10. SYSTEM
  MAINTENANCE = "MAINTENANCE",
  MISE_A_JOUR_SYSTEME = "MISE_A_JOUR_SYSTEME",
  ANNONCE = "ANNONCE",
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
