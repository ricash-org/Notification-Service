import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { CanalNotification, TypeNotification } from "./Notification";

@Entity()
export class Otp {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  utilisateurId!: string; // destinaire
  // email ou numéro de téléphone

  @Column()
  code!: string;

//   @Column()
//   type: TypeNotification; 
  @Column()
  canal!: CanalNotification; // EMAIL ou TELEPHONE

  @Column({ default: false })
  utilise!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "timestamp" })
  expiration!: Date;
}
