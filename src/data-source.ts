import "reflect-metadata";
import { DataSource } from "typeorm";
import { RicashNotification } from "./entities/Notification";
import dotenv from "dotenv";
import { Otp } from "./entities/Otp";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [RicashNotification, Otp],
  synchronize: true, // auto-crée les tables
  logging: true,
});
