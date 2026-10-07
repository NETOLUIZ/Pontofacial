import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { ACCESS_COOKIE, REFRESH_COOKIE, getCookieOptions, readCookie } from './auth.cookies';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, senha } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(email, senha, ip, userAgent);
      const cookieOptions = getCookieOptions();
      res.cookie(ACCESS_COOKIE, result.token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 });
      res.cookie(REFRESH_COOKIE, result.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ success: true, data: { usuario: result.usuario } });
    } catch (error) {
      next(error);
    }
  }

  logout(_req: Request, res: Response): void {
    const cookieOptions = getCookieOptions();
    res.clearCookie(ACCESS_COOKIE, cookieOptions);
    res.clearCookie(REFRESH_COOKIE, cookieOptions);
    res.json({ success: true, data: null });
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = readCookie(req.headers.cookie, REFRESH_COOKIE);
      if (!refreshToken) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }
      const result = await authService.refreshToken(refreshToken);
      const cookieOptions = getCookieOptions();
      res.cookie(ACCESS_COOKIE, result.token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 });
      res.cookie(REFRESH_COOKIE, result.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }
      const usuario = await authService.getMe(req.user.usuarioId);
      res.json({ success: true, data: usuario });
    } catch (error) {
      next(error);
    }
  }
}
