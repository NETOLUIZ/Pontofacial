import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';

import { authRoutes } from './modules/auth/auth.routes';
import { empresasRoutes } from './modules/empresas/empresas.routes';
import { funcionariosRoutes } from './modules/funcionarios/funcionarios.routes';
import { jornadasRoutes } from './modules/jornadas/jornadas.routes';
import { dispositivosRoutes } from './modules/dispositivos/dispositivos.routes';
import { pontoRoutes } from './modules/ponto/ponto.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { auditoriaRoutes } from './modules/auditoria/auditoria.routes';

const app: Express = express();

// Segurança e Cabeçalhos HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Configuração CORS
app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-empresa-id'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rota de Health Check
const healthHandler = (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Controle de Ponto Facial - Backend API',
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/jornadas', jornadasRoutes);
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/registros-ponto', pontoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auditoria', auditoriaRoutes);

// Middleware centralizado de tratamento de erros
app.use(errorMiddleware);

export { app };
