import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { buildDatabaseOptions } from "./config/database";

dotenv.config();

export const AppDataSource = new DataSource(buildDatabaseOptions());
