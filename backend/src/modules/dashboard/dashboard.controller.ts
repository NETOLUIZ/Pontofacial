import { Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

const service = new DashboardService();

export class DashboardController {
  async obterMetricas(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const metricas = await service.obterMetricas(empresaId);
      res.json({ success: true, data: metricas });
    } catch (error) {
      next(error);
    }
  }
}
