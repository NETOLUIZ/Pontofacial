import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Perfil } from '@prisma/client';

export interface TokenPayload {
  usuarioId: string;
  empresaId: string | null;
  perfil: Perfil;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  empresaId?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ success: false, message: 'Token de autenticação não fornecido' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (!/^Bearer$/i.test(scheme) || !token) {
    res.status(401).json({ success: false, message: 'Formato de token inválido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = decoded;

    // Se o usuário possuir empresa vinculada, define como contexto ativo
    if (decoded.empresaId) {
      req.empresaId = decoded.empresaId;
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token expirado ou inválido' });
  }
}
