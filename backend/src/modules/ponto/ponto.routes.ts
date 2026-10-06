import { Router } from 'express';
import { PontoController } from './ponto.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { rbacGuard } from '../../middlewares/rbac.guard';
import { Perfil } from '@prisma/client';

const router = Router();
const controller = new PontoController();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Leitura permitida para gestores, RH e Admins
router.get('/', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH, Perfil.GESTOR]), controller.listar.bind(controller));

// Registro permitido para Terminal, Operador, RH e Admins
router.post('/', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH, Perfil.OPERADOR, Perfil.TERMINAL]), controller.registrar.bind(controller));

// Sincronização em lote originada dos terminais
router.post('/sincronizar-lote', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.TERMINAL]), controller.sincronizarLote.bind(controller));

// Ajuste e tratamento de ponto (exclusivo para RH, Admin Empresa e Super Admin)
router.patch('/:id/ajustar', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH]), controller.ajustar.bind(controller));

// Inclusão manual de marcação de ponto retroativa (exclusivo para RH e Admins)
router.post('/manual', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH]), controller.incluirManual.bind(controller));

export const pontoRoutes = router;
