import dotenv from "dotenv";
import { Dialect } from "sequelize";

dotenv.config({ path: ".env" });

export const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  dialect: process.env.DB_TYPE as Dialect,
  database: process.env.DB_NAME,
  username: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
};
