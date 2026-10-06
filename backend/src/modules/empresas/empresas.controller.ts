import { Response, NextFunction } from 'express';
import { EmpresasService } from './empresas.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { Perfil } from '@prisma/client';

const service = new EmpresasService();

export class EmpresasController {
  async listar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.perfil === Perfil.SUPER_ADMIN) {
        const empresas = await service.listarTodas();
        res.json({ success: true, data: empresas });
        return;
      }

      // Se não for super admin, retorna apenas a empresa do usuário
      if (req.empresaId) {
        const empresa = await service.obterPorId(req.empresaId);
        res.json({ success: true, data: [empresa] });
        return;
      }

      res.status(403).json({ success: false, message: 'Acesso não autorizado' });
    } catch (error) {
      next(error);
    }
  }

  async obter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;

      // Validação de Tenant
      if (req.user?.perfil !== Perfil.SUPER_ADMIN && req.empresaId !== id) {
        res.status(403).json({ success: false, message: 'Acesso negado aos dados desta empresa' });
        return;
      }

      const empresa = await service.obterPorId(id);
      res.json({ success: true, data: empresa });
    } catch (error) {
      next(error);
    }
  }

  async criar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const novaEmpresa = await service.criar(req.body);
      res.status(201).json({ success: true, data: novaEmpresa });
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;

      if (req.user?.perfil !== Perfil.SUPER_ADMIN && req.empresaId !== id) {
        res.status(403).json({ success: false, message: 'Acesso negado aos dados desta empresa' });
        return;
      }

      const atualizada = await service.atualizar(id, req.body);
      res.json({ success: true, data: atualizada });
    } catch (error) {
      next(error);
    }
  }
}
