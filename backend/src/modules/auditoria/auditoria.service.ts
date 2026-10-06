import { prisma } from '../../config/prisma';

export class AuditoriaService {
  async listar(empresaId?: string) {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }

    return prisma.auditoria.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
