import { Response, NextFunction } from 'express';
import { PontoService } from './ponto.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

const service = new PontoService();

export class PontoController {
  async listar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const registros = await service.listar(empresaId, req.query as any);
      res.json({ success: true, data: registros });
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
      const resultado = await service.registrar(empresaId, req.body);
      res.status(resultado.duplicado ? 200 : 201).json({ success: true, ...resultado });
    } catch (error) {
      next(error);
    }
  }

  async sincronizarLote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      const { registros } = req.body;
      if (!Array.isArray(registros)) {
        res.status(400).json({ success: false, message: 'Array de registros é obrigatório' });
        return;
      }
      const resultado = await service.sincronizarLote(empresaId, registros);
      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  }

  async ajustar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      const { id } = req.params;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const resultado = await service.ajustar(empresaId, id, req.user, req.body);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async incluirManual(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = req.empresaId;
      if (!empresaId) {
        res.status(400).json({ success: false, message: 'Empresa não identificada' });
        return;
      }
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const resultado = await service.incluirManual(empresaId, req.user, req.body);
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }
}
