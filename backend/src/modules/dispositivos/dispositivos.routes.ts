import { Router } from 'express';
import { DispositivosController } from './dispositivos.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { rbacGuard } from '../../middlewares/rbac.guard';
import { Perfil } from '@prisma/client';

const router = Router();
const controller = new DispositivosController();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH, Perfil.GESTOR, Perfil.TERMINAL]), controller.listar.bind(controller));
router.get('/:id', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH]), controller.obter.bind(controller));
router.post('/registrar', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.TERMINAL]), controller.registrar.bind(controller));
router.patch('/:id/status', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.TERMINAL]), controller.atualizarStatus.bind(controller));

export const dispositivosRoutes = router;
