import "reflect-metadata";
import { DataSource } from "typeorm";
import { RicashNotification } from "./entities/Notification";
import dotenv from "dotenv";
import { Otp } from "./entities/Otp";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim();

export const AppDataSource = new DataSource(
  databaseUrl
    ? {
        type: "postgres",
        url: databaseUrl,
        entities: [RicashNotification, Otp],
        synchronize: true,
        logging: true,
      }
    : {
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [RicashNotification, Otp],
        synchronize: true,
        logging: true,
      }
);
