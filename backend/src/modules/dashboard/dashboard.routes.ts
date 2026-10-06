import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { rbacGuard } from '../../middlewares/rbac.guard';
import { Perfil } from '@prisma/client';

const router = Router();
const controller = new DashboardController();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA, Perfil.RH, Perfil.GESTOR]), controller.obterMetricas.bind(controller));

export const dashboardRoutes = router;
