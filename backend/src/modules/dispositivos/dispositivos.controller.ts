import { Response, NextFunction } from 'express';
import { DispositivosService } from './dispositivos.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

const service = new DispositivosService();

export class DispositivosController {
  async listar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const dispositivos = await service.listar(empresaId);
      res.json({ success: true, data: dispositivos });
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
      const dispositivo = await service.obterPorId(empresaId, req.params.id);
      res.json({ success: true, data: dispositivo });
    } catch (error) {
      next(error);
    }
  }

  async registrar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const registrado = await service.registrar(empresaId, req.body);
      res.status(201).json({ success: true, data: registrado });
    } catch (error) {
      next(error);
    }
  }

  async atualizarStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const { status } = req.body;
      const atualizado = await service.atualizarStatus(empresaId, req.params.id, status);
      res.json({ success: true, data: atualizado });
    } catch (error) {
      next(error);
    }
  }
}
