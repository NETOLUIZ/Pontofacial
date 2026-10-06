import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || process.env.API_PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://ponto_user:ponto_secret_2026@postgres:5432/ponto_facial_db?schema=public',
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'chave-secreta-jwt-super-segura-ponto-facial-2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'chave-secreta-refresh-jwt-super-segura-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
