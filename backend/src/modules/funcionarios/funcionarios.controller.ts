import { Response, NextFunction } from 'express';
import { FuncionariosService } from './funcionarios.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

const service = new FuncionariosService();

export class FuncionariosController {
  async listar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const funcionarios = await service.listar(empresaId);
      res.json({ success: true, data: funcionarios });
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
      const funcionario = await service.obterPorId(empresaId, req.params.id);
      res.json({ success: true, data: funcionario });
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
      const novo = await service.criar(empresaId, req.body);
      res.status(201).json({ success: true, data: novo });
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
      const atualizado = await service.atualizar(empresaId, req.params.id, req.body);
      res.json({ success: true, data: atualizado });
    } catch (error) {
      next(error);
    }
  }
}
