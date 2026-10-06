import { Router } from 'express';
import { JornadasController } from './jornadas.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { rbacGuard } from '../../middlewares/rbac.guard';
import { Perfil } from '@prisma/client';

const router = Router();
const controller = new JornadasController();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH, Perfil.GESTOR]), controller.listar.bind(controller));
router.get('/:id', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH, Perfil.GESTOR]), controller.obter.bind(controller));
router.post('/', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH]), controller.criar.bind(controller));
router.put('/:id', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH]), controller.atualizar.bind(controller));

export const jornadasRoutes = router;
