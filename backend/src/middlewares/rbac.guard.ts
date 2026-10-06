import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { Perfil } from '@prisma/client';

export function rbacGuard(allowedRoles: Perfil[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const { perfil } = req.user;

    // Regra explícita: Terminal NUNCA tem acesso administrativo
    if (perfil === Perfil.TERMINAL && !allowedRoles.includes(Perfil.TERMINAL)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado: Terminais possuem acesso restrito apenas à sincronização e registro de ponto.',
      });
      return;
    }

    // Super Admin tem passe livre exceto se especificamente restrito
    if (perfil === Perfil.SUPER_ADMIN) {
      next();
      return;
    }

    if (!allowedRoles.includes(perfil)) {
      res.status(403).json({
        success: false,
        message: `Acesso negado: Perfil ${perfil} não possui permissão para este recurso.`,
      });
      return;
    }

    next();
  };
}
