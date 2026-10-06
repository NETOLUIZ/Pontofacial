import dotenv from 'dotenv';
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
if (isProduction && (!jwtSecret || jwtSecret.length < 32 || !jwtRefreshSecret || jwtRefreshSecret.length < 32)) {
  throw new Error('JWT secrets must be configured with at least 32 characters in production.');
}

export const env = {
  PORT: process.env.PORT || process.env.API_PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://ponto_user:ponto_secret_2026@postgres:5432/ponto_facial_db?schema=public',
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',
  JWT_SECRET: jwtSecret || 'development-only-jwt-secret-change-me',
  JWT_REFRESH_SECRET: jwtRefreshSecret || 'development-only-refresh-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
