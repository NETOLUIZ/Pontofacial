import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { Perfil } from '@prisma/client';

/**
 * Middleware para isolamento de dados Multi-tenant.
 * Garante que usuários não possam acessar ou modificar dados de outras empresas.
 * Não confia em empresa_id enviado pelo cliente no corpo ou query da requisição.
 */
export function tenantMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    return;
  }

  // Super Admin pode simular ou filtrar por empresa via cabeçalho x-empresa-id se desejar
  if (req.user.perfil === Perfil.SUPER_ADMIN) {
    next();
    return;
  }

  // Para todos os outros perfis, a empresa DEVE ser exatamente a do token autenticado
  if (!req.user.empresaId) {
    res.status(403).json({
      success: false,
      message: 'Usuário não possui vínculo com nenhuma empresa ativa.',
    });
    return;
  }

  req.empresaId = req.user.empresaId;
  next();
}
