import { prisma } from '../../config/prisma';

export class EmpresasService {
  async listarTodas() {
    return prisma.empresa.findMany({
      orderBy: { razaoSocial: 'asc' },
      include: {
        _count: {
          select: {
            funcionarios: true,
            usuarios: true,
            dispositivos: true,
          },
        },
      },
    });
  }

  async obterPorId(id: string) {
    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            funcionarios: true,
            usuarios: true,
            dispositivos: true,
            registrosPonto: true,
          },
        },
      },
    });

    if (!empresa) {
      throw { statusCode: 404, message: 'Empresa não encontrada' };
    }

    return empresa;
  }

  async criar(data: { razaoSocial: string; nomeFantasia: string; cnpj: string }) {
    if (!data.razaoSocial || !data.nomeFantasia || !data.cnpj) {
      throw { statusCode: 400, message: 'Razão social, nome fantasia e CNPJ são obrigatórios' };
    }

    const cnpjExiste = await prisma.empresa.findUnique({
      where: { cnpj: data.cnpj.replace(/\D/g, '') },
    });

    if (cnpjExiste) {
      throw { statusCode: 400, message: 'CNPJ já cadastrado no sistema' };
    }

    return prisma.empresa.create({
      data: {
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia,
        cnpj: data.cnpj.replace(/\D/g, ''),
        ativo: true,
      },
    });
  }

  async atualizar(id: string, data: { razaoSocial?: string; nomeFantasia?: string; ativo?: boolean }) {
    return prisma.empresa.update({
      where: { id },
      data,
    });
  }
}
