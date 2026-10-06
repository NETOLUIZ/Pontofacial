import { Response, NextFunction } from 'express';
import { JornadasService } from './jornadas.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

const service = new JornadasService();

export class JornadasController {
  async listar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const jornadas = await service.listar(empresaId);
      res.json({ success: true, data: jornadas });
    } catch (error) {
      next(error);
    }
  }

  async obter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const jornada = await service.obterPorId(empresaId, req.params.id);
      res.json({ success: true, data: jornada });
    } catch (error) {
      next(error);
    }
  }

  async criar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const nova = await service.criar(empresaId, req.body);
      res.status(201).json({ success: true, data: nova });
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const atualizada = await service.atualizar(empresaId, req.params.id, req.body);
      res.json({ success: true, data: atualizada });
    } catch (error) {
      next(error);
    }
  }
}
