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

// Configuração CORS (Suporte a subdomínios dinâmicos *.ptfacial.korentech.com.br)
const allowedDomainRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*ptfacial\.korentech\.com\.br(:\d+)?$/i;

app.use(cors({
  origin: (requestOrigin, callback) => {
    // Permite chamadas locais, server-to-server ou em modo desenvolvimento
    if (!requestOrigin || env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Permite o domínio principal e qualquer subdomínio dinâmico
    if (allowedDomainRegex.test(requestOrigin) || requestOrigin === env.FRONTEND_URL || requestOrigin.includes('localhost')) {
      return callback(null, true);
    }
    // Fallback permissivo para garantir funcionamento multi-tenant
    return callback(new Error('Origem não autorizada pelo CORS'));
  },
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
