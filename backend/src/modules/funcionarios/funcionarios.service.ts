import { prisma } from '../../config/prisma';
import { StatusFuncionario } from '@prisma/client';

export class FuncionariosService {
  async listar(empresaId: string) {
    return prisma.funcionario.findMany({
      where: { empresaId },
      include: {
        jornada: {
          select: {
            id: true,
            nome: true,
            horaEntrada: true,
            horaSaida: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async obterPorId(empresaId: string, id: string) {
    const funcionario = await prisma.funcionario.findFirst({
      where: { id, empresaId },
      include: {
        jornada: true,
        registrosPonto: {
          take: 10,
          orderBy: { dataHora: 'desc' },
        },
      },
    });

    if (!funcionario) {
      throw { statusCode: 404, message: 'Funcionário não encontrado nesta empresa' };
    }

    return funcionario;
  }

  async criar(empresaId: string, data: {
    nome: string;
    cpf: string;
    matricula: string;
    cargo: string;
    departamento: string;
    jornadaId?: string;
    biometriaCadastrada?: boolean;
    biometria?: object;
    fotoUrl?: string | null;
  }) {
    if (!data.nome || !data.cpf || !data.matricula || !data.cargo || !data.departamento) {
      throw { statusCode: 400, message: 'Nome, CPF, matrícula, cargo e departamento são obrigatórios' };
    }

    const cpfLimpo = data.cpf.replace(/\D/g, '');

    const existe = await prisma.funcionario.findFirst({
      where: {
        empresaId,
        OR: [{ cpf: cpfLimpo }, { matricula: data.matricula }],
      },
    });

    if (existe) {
      throw { statusCode: 400, message: 'Já existe um funcionário com este CPF ou matrícula nesta empresa' };
    }

    return prisma.funcionario.create({
      data: {
        empresaId,
        nome: data.nome,
        cpf: cpfLimpo,
        matricula: data.matricula,
        cargo: data.cargo,
        departamento: data.departamento,
        jornadaId: data.jornadaId || null,
        biometriaCadastrada: !!data.biometriaCadastrada,
        biometria: data.biometria || undefined,
        fotoUrl: data.fotoUrl || null,
        status: StatusFuncionario.ATIVO,
      },
      include: {
        jornada: true,
      },
    });
  }

  async atualizar(empresaId: string, id: string, data: Partial<{
    nome: string;
    cargo: string;
    departamento: string;
    jornadaId: string;
    status: StatusFuncionario;
    biometriaCadastrada: boolean;
    biometria?: object;
    fotoUrl?: string | null;
  }>) {
    await this.obterPorId(empresaId, id);

    return prisma.funcionario.update({
      where: { id },
      data,
      include: { jornada: true },
    });
  }
}
