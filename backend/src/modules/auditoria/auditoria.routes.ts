import { Router } from 'express';
import { AuditoriaController } from './auditoria.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { rbacGuard } from '../../middlewares/rbac.guard';
import { Perfil } from '@prisma/client';

const router = Router();
const controller = new AuditoriaController();

router.use(authMiddleware);
router.get('/', rbacGuard([Perfil.SUPER_ADMIN, Perfil.ADMIN_EMPRESA]), controller.listar.bind(controller));

export const auditoriaRoutes = router;
