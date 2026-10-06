import { prisma } from '../../config/prisma';
import { StatusDispositivo } from '@prisma/client';

export class DispositivosService {
  async listar(empresaId: string) {
    return prisma.dispositivo.findMany({
      where: { empresaId },
      include: {
        _count: {
          select: { registrosPonto: true },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async obterPorId(empresaId: string, id: string) {
    const dispositivo = await prisma.dispositivo.findFirst({
      where: { id, empresaId },
    });

    if (!dispositivo) {
      throw { statusCode: 404, message: 'Dispositivo não encontrado' };
    }

    return dispositivo;
  }

  async registrar(empresaId: string, data: {
    nome: string;
    identificadorUuid: string;
    localizacao?: string;
    versaoApp?: string;
  }) {
    if (!data.nome || !data.identificadorUuid) {
      throw { statusCode: 400, message: 'Nome e UUID identificador são obrigatórios' };
    }

    const existe = await prisma.dispositivo.findUnique({
      where: { identificadorUuid: data.identificadorUuid },
    });

    if (existe) {
      // Atualiza último sync e status
      return prisma.dispositivo.update({
        where: { id: existe.id },
        data: {
          status: StatusDispositivo.ONLINE,
          ultimoSync: new Date(),
          versaoApp: data.versaoApp || existe.versaoApp,
          localizacao: data.localizacao || existe.localizacao,
        },
      });
    }

    return prisma.dispositivo.create({
      data: {
        empresaId,
        nome: data.nome,
        identificadorUuid: data.identificadorUuid,
        localizacao: data.localizacao || null,
        versaoApp: data.versaoApp || 'v1.0.0',
        status: StatusDispositivo.ONLINE,
        ultimoSync: new Date(),
      },
    });
  }

  async atualizarStatus(empresaId: string, id: string, status: StatusDispositivo) {
    await this.obterPorId(empresaId, id);

    return prisma.dispositivo.update({
      where: { id },
      data: { status, ultimoSync: new Date() },
    });
  }
}
