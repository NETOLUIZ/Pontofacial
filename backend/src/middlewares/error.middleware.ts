import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('❌ Erro na API:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno no servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
