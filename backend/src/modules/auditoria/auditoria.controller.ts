import { Response, NextFunction } from 'express';
import { AuditoriaService } from './auditoria.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { Perfil } from '@prisma/client';

const service = new AuditoriaService();

export class AuditoriaController {
  async listar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.user?.perfil === Perfil.SUPER_ADMIN ? undefined : req.empresaId;
      const registros = await service.listar(empresaId);
      res.json({ success: true, data: registros });
    } catch (error) {
      next(error);
    }
  }
}
