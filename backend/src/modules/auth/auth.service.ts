import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { TokenPayload } from '../../middlewares/auth.middleware';

export class AuthService {
  async login(email: string, senha: string, ip?: string, userAgent?: string) {
    if (!email || !senha) {
      throw { statusCode: 400, message: 'Email e senha são obrigatórios' };
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
            ativo: true,
          },
        },
      },
    });

    if (!usuario || !usuario.ativo) {
      throw { statusCode: 401, message: 'Credenciais inválidas ou usuário inativo' };
    }

    // Se for usuário vinculado a empresa, verificar se a empresa está ativa
    if (usuario.empresa && !usuario.empresa.ativo) {
      throw { statusCode: 403, message: 'Empresa suspensa ou inativa. Contate o administrador.' };
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw { statusCode: 401, message: 'Credenciais inválidas ou usuário inativo' };
    }

    // Atualiza último login
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() },
    });

    const payload: TokenPayload = {
      usuarioId: usuario.id,
      empresaId: usuario.empresaId,
      perfil: usuario.perfil,
      email: usuario.email,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });

    // Registro de Auditoria
    await prisma.auditoria.create({
      data: {
        empresaId: usuario.empresaId,
        usuarioId: usuario.id,
        acao: 'LOGIN',
        entidade: 'Usuario',
        entidadeId: usuario.id,
        ip: ip || null,
        userAgent: userAgent || null,
      },
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        empresa: usuario.empresa,
      },
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw { statusCode: 400, message: 'Refresh token não fornecido' };
    }

    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;

      const usuario = await prisma.usuario.findUnique({
        where: { id: decoded.usuarioId },
        include: { empresa: true },
      });

      if (!usuario || !usuario.ativo) {
        throw { statusCode: 401, message: 'Usuário não encontrado ou inativo' };
      }

      if (usuario.empresa && !usuario.empresa.ativo) {
        throw { statusCode: 403, message: 'Empresa suspensa ou inativa.' };
      }

      const payload: TokenPayload = {
        usuarioId: usuario.id,
        empresaId: usuario.empresaId,
        perfil: usuario.perfil,
        email: usuario.email,
      };

      const newToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
      const newRefreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw { statusCode: 401, message: 'Refresh token expirado ou inválido' };
    }
  }

  async getMe(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        ultimoLogin: true,
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
            ativo: true,
          },
        },
      },
    });

    if (!usuario) {
      throw { statusCode: 404, message: 'Usuário não encontrado' };
    }

    return usuario;
  }
}
