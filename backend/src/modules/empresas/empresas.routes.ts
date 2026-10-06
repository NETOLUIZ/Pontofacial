import { Router } from 'express';
import { EmpresasController } from './empresas.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { rbacGuard } from '../../middlewares/rbac.guard';
import { Perfil } from '@prisma/client';

const router = Router();
const controller = new EmpresasController();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', controller.listar.bind(controller));
router.get('/:id', controller.obter.bind(controller));
router.post('/', rbacGuard([Perfil.SUPER_ADMIN]), controller.criar.bind(controller));
router.put('/:id', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA]), controller.atualizar.bind(controller));

export const empresasRoutes = router;
