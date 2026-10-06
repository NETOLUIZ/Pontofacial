import { prisma } from '../../config/prisma';

export class JornadasService {
  async listar(empresaId: string) {
    return prisma.jornada.findMany({
      where: { empresaId },
      include: {
        _count: {
          select: { funcionarios: true },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async obterPorId(empresaId: string, id: string) {
    const jornada = await prisma.jornada.findFirst({
      where: { id, empresaId },
      include: { funcionarios: true },
    });

    if (!jornada) {
      throw { statusCode: 404, message: 'Jornada não encontrada' };
    }

    return jornada;
  }

  async criar(empresaId: string, data: {
    nome: string;
    horaEntrada: string;
    horaIntervalo?: string;
    horaRetorno?: string;
    horaSaida: string;
    controleIntervalo?: boolean;
    toleranciaMinutos?: number;
  }) {
    if (!data.nome || !data.horaEntrada || !data.horaSaida) {
      throw { statusCode: 400, message: 'Nome, hora de entrada e hora de saída são obrigatórios' };
    }

    return prisma.jornada.create({
      data: {
        empresaId,
        nome: data.nome,
        horaEntrada: data.horaEntrada,
        horaIntervalo: data.horaIntervalo || null,
        horaRetorno: data.horaRetorno || null,
        horaSaida: data.horaSaida,
        controleIntervalo: data.controleIntervalo ?? true,
        toleranciaMinutos: data.toleranciaMinutos ?? 10,
        ativo: true,
      },
    });
  }

  async atualizar(empresaId: string, id: string, data: Partial<{
    nome: string;
    horaEntrada: string;
    horaIntervalo: string;
    horaRetorno: string;
    horaSaida: string;
    controleIntervalo: boolean;
    toleranciaMinutos: number;
    ativo: boolean;
  }>) {
    await this.obterPorId(empresaId, id);

    return prisma.jornada.update({
      where: { id },
      data,
    });
  }
}
