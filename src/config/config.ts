import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config({ path: '.env' });

export const dbConfig = {
  environment: process.env.ENVIRONMENT || 'development',
  url: process.env.DATABASE_URL || '',
  host: process.env.DB_HOST || '',
  port: parseInt(process.env.DB_PORT || '', 10) || 5432,
  dialect: (process.env.DB_TYPE as Dialect) || 'postgres',
  database: process.env.DB_NAME || '',
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
};
