import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Perfil } from '@prisma/client';
import { ACCESS_COOKIE, readCookie } from '../modules/auth/auth.cookies';

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
  const tokenFromCookie = readCookie(req.headers.cookie, ACCESS_COOKIE);

  if (!authHeader && !tokenFromCookie) {
    res.status(401).json({ success: false, message: 'Token de autenticação não fornecido' });
    return;
  }

  const [scheme, tokenFromHeader] = authHeader?.split(' ') || [];
  const token = tokenFromCookie || tokenFromHeader;

  if ((authHeader && !/^Bearer$/i.test(scheme)) || !token) {
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
