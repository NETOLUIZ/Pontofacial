import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { loginRateLimit } from '../../middlewares/rate-limit.middleware';

const router = Router();
const controller = new AuthController();

router.post('/login', loginRateLimit, controller.login.bind(controller));
router.post('/logout', controller.logout.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
router.get('/me', authMiddleware, controller.me.bind(controller));

export const authRoutes = router;
