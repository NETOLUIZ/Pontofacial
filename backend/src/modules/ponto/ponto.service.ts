import { prisma } from '../../config/prisma';
import { TipoRegistro, OrigemRegistro, StatusRegistro } from '@prisma/client';

export class PontoService {
  async listar(empresaId: string, filtros?: {
    funcionarioId?: string;
    dataInicio?: string;
    dataFim?: string;
    tipo?: TipoRegistro;
  }) {
    const where: any = { empresaId };

    if (filtros?.funcionarioId) {
      where.funcionarioId = filtros.funcionarioId;
    }

    if (filtros?.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros?.dataInicio || filtros?.dataFim) {
      where.dataHora = {};
      if (filtros.dataInicio) {
        where.dataHora.gte = new Date(filtros.dataInicio);
      }
      if (filtros.dataFim) {
        where.dataHora.lte = new Date(filtros.dataFim);
      }
    }

    return prisma.registroPonto.findMany({
      where,
      include: {
        funcionario: {
          select: {
            id: true,
            nome: true,
            matricula: true,
            cargo: true,
            departamento: true,
          },
        },
        dispositivo: {
          select: {
            id: true,
            nome: true,
            identificadorUuid: true,
          },
        },
      },
      orderBy: { dataHora: 'desc' },
      take: 100,
    });
  }

  async registrar(empresaId: string, data: {
    funcionarioId: string;
    dispositivoId?: string;
    tipo: TipoRegistro;
    dataHora?: string | Date;
    origem?: OrigemRegistro;
    status?: StatusRegistro;
    idempotencyKey?: string;
    fotoRegistroUrl?: string;
    observacao?: string;
  }) {
    if (!data.funcionarioId || !data.tipo) {
      throw { statusCode: 400, message: 'ID do funcionário e tipo de registro são obrigatórios' };
    }

    const funcionario = await prisma.funcionario.findFirst({
      where: { id: data.funcionarioId, empresaId },
    });

    if (!funcionario) {
      throw { statusCode: 404, message: 'Funcionário não encontrado ou não pertence a esta empresa' };
    }

    // 1. Proteção de duplicidade por Chave de Idempotência
    if (data.idempotencyKey) {
      const registroExistente = await prisma.registroPonto.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
        include: { funcionario: true },
      });

      if (registroExistente) {
        return {
          duplicado: true,
          mensagem: 'Registro já processado anteriormente (idempotência preservada)',
          registro: registroExistente,
        };
      }
    }

    const dataHoraEfetiva = data.dataHora ? new Date(data.dataHora) : new Date();
    if (Number.isNaN(dataHoraEfetiva.getTime())) {
      throw { statusCode: 400, message: 'Data/hora inválida' };
    }

    if (data.dispositivoId) {
      const dispositivo = await prisma.dispositivo.findFirst({
        where: { id: data.dispositivoId, empresaId },
      });
      if (!dispositivo) {
        throw { statusCode: 400, message: 'Dispositivo não pertence a esta empresa' };
      }
    }

    // 2. Proteção de duplicidade temporal (evita batida dupla acidental em menos de 2 minutos do mesmo tipo)
    const doisMinutosAtras = new Date(dataHoraEfetiva.getTime() - 2 * 60 * 1000);
    const batidaRecente = await prisma.registroPonto.findFirst({
      where: {
        empresaId,
        funcionarioId: data.funcionarioId,
        tipo: data.tipo,
        dataHora: {
          gte: doisMinutosAtras,
          lte: dataHoraEfetiva,
        },
      },
    });

    if (batidaRecente) {
      return {
        duplicado: true,
        mensagem: 'Registro já realizado nos últimos 2 minutos. Próximo evento aguardado.',
        registro: batidaRecente,
      };
    }

    // Cria registro de ponto
    const novoRegistro = await prisma.registroPonto.create({
      data: {
        empresaId,
        funcionarioId: data.funcionarioId,
        dispositivoId: data.dispositivoId || null,
        tipo: data.tipo,
        dataHora: dataHoraEfetiva,
        origem: data.origem || OrigemRegistro.ONLINE,
        status: data.status || StatusRegistro.VALIDO,
        idempotencyKey: data.idempotencyKey || `pt-${data.funcionarioId}-${dataHoraEfetiva.getTime()}`,
        fotoRegistroUrl: data.fotoRegistroUrl || null,
        observacao: data.observacao || null,
      },
      include: {
        funcionario: {
          select: {
            id: true,
            nome: true,
            matricula: true,
            cargo: true,
          },
        },
      },
    });

    return {
      duplicado: false,
      mensagem: 'Ponto registrado com sucesso',
      registro: novoRegistro,
    };
  }

  async sincronizarLote(empresaId: string, registros: Array<{
    funcionarioId: string;
    dispositivoId?: string;
    tipo: TipoRegistro;
    dataHora: string;
    idempotencyKey: string;
  }>) {
    const resultados = [];

    for (const reg of registros) {
      const res = await this.registrar(empresaId, {
        ...reg,
        origem: OrigemRegistro.OFFLINE,
      });
      resultados.push(res);
    }

    return {
      totalRecebidos: registros.length,
      processados: resultados,
    };
  }

  async ajustar(
    empresaId: string,
    registroId: string,
    usuarioAjustador: { usuarioId: string; email?: string; perfil?: string },
    dados: {
      dataHora?: string | Date;
      tipo?: TipoRegistro;
      motivoAjuste: string;
      observacao?: string;
    }
  ) {
    if (!dados.motivoAjuste || !dados.motivoAjuste.trim()) {
      throw { statusCode: 400, message: 'Justificativa legal do ajuste é obrigatória (exigência MTP/CLT)' };
    }

    const registroAtual = await prisma.registroPonto.findFirst({
      where: { id: registroId, empresaId },
      include: { funcionario: true },
    });

    if (!registroAtual) {
      throw { statusCode: 404, message: 'Registro de ponto não encontrado' };
    }

    // Preserva a dataHora original da marcação para auditoria e histórico fiscal
    const dataHoraOriginal = registroAtual.dataHoraOriginal || registroAtual.dataHora;
    const novaDataHora = dados.dataHora ? new Date(dados.dataHora) : registroAtual.dataHora;
    const novoTipo = dados.tipo || registroAtual.tipo;

    // Busca usuário do RH que realizou o ajuste
    const usuarioRh = await prisma.usuario.findUnique({
      where: { id: usuarioAjustador.usuarioId },
      select: { id: true, nome: true, email: true },
    });

    const nomeResponsavel = usuarioRh?.nome || usuarioAjustador.email || 'Analista de RH';

    const registroAtualizado = await prisma.$transaction(async (tx) => {
      const registroAtualizado = await tx.registroPonto.update({
      where: { id: registroId },
      data: {
        dataHora: novaDataHora,
        tipo: novoTipo,
        status: StatusRegistro.AJUSTADO,
        motivoAjuste: dados.motivoAjuste,
        ajustadoPorId: usuarioAjustador.usuarioId,
        ajustadoPorNome: nomeResponsavel,
        dataHoraOriginal,
        observacao: dados.observacao !== undefined ? dados.observacao : registroAtual.observacao,
      },
      include: {
        funcionario: {
          select: {
            id: true,
            nome: true,
            matricula: true,
            cargo: true,
            departamento: true,
          },
        },
      },
    });

    // Trilha de Auditoria
      await tx.auditoria.create({
      data: {
        empresaId,
        usuarioId: usuarioAjustador.usuarioId,
        acao: 'AJUSTE_PONTO_RH',
        entidade: 'RegistroPonto',
        entidadeId: registroId,
        dadosAnteriores: {
          tipo: registroAtual.tipo,
          dataHora: registroAtual.dataHora,
          status: registroAtual.status,
        },
        dadosNovos: {
          tipo: novoTipo,
          dataHora: novaDataHora,
          status: StatusRegistro.AJUSTADO,
          motivoAjuste: dados.motivoAjuste,
          ajustadoPorNome: nomeResponsavel,
        },
      },
      });
      return registroAtualizado;
    });

    return {
      success: true,
      mensagem: 'Ponto ajustado com sucesso e auditado para fins fiscais',
      registro: registroAtualizado,
    };
  }

  async incluirManual(
    empresaId: string,
    usuarioAjustador: { usuarioId: string; email?: string; perfil?: string },
    dados: {
      funcionarioId: string;
      tipo: TipoRegistro;
      dataHora: string | Date;
      motivoAjuste: string;
      observacao?: string;
    }
  ) {
    if (!dados.funcionarioId || !dados.tipo || !dados.dataHora) {
      throw { statusCode: 400, message: 'Funcionário, tipo de batida e data/hora são obrigatórios' };
    }

    if (!dados.motivoAjuste || !dados.motivoAjuste.trim()) {
      throw { statusCode: 400, message: 'Justificativa do lançamento manual é obrigatória (Portaria 671 MTP)' };
    }

    const funcionario = await prisma.funcionario.findFirst({
      where: { id: dados.funcionarioId, empresaId },
    });

    if (!funcionario) {
      throw { statusCode: 404, message: 'Funcionário não encontrado ou não pertence a esta empresa' };
    }

    const dataHoraEfetiva = new Date(dados.dataHora);
    if (Number.isNaN(dataHoraEfetiva.getTime())) {
      throw { statusCode: 400, message: 'Data/hora inválida' };
    }

    const usuarioRh = await prisma.usuario.findUnique({
      where: { id: usuarioAjustador.usuarioId },
      select: { id: true, nome: true, email: true },
    });

    const nomeResponsavel = usuarioRh?.nome || usuarioAjustador.email || 'Analista de RH';

    const novoRegistro = await prisma.registroPonto.create({
      data: {
        empresaId,
        funcionarioId: dados.funcionarioId,
        tipo: dados.tipo,
        dataHora: dataHoraEfetiva,
        origem: OrigemRegistro.MANUAL,
        status: StatusRegistro.AJUSTADO,
        motivoAjuste: dados.motivoAjuste,
        ajustadoPorId: usuarioAjustador.usuarioId,
        ajustadoPorNome: nomeResponsavel,
        observacao: dados.observacao || 'Inclusão manual realizada pelo RH',
        idempotencyKey: `manual-${dados.funcionarioId}-${dataHoraEfetiva.getTime()}`,
      },
      include: {
        funcionario: {
          select: {
            id: true,
            nome: true,
            matricula: true,
            cargo: true,
            departamento: true,
          },
        },
      },
    });

    // Trilha de Auditoria
    await prisma.auditoria.create({
      data: {
        empresaId,
        usuarioId: usuarioAjustador.usuarioId,
        acao: 'INCLUSAO_MANUAL_PONTO_RH',
        entidade: 'RegistroPonto',
        entidadeId: novoRegistro.id,
        dadosNovos: {
          funcionarioId: dados.funcionarioId,
          tipo: dados.tipo,
          dataHora: dataHoraEfetiva,
          origem: 'MANUAL',
          status: 'AJUSTADO',
          motivoAjuste: dados.motivoAjuste,
          ajustadoPorNome: nomeResponsavel,
        },
      },
    });

    return {
      success: true,
      mensagem: 'Inclusão manual registrada com sucesso com respaldo de auditoria',
      registro: novoRegistro,
    };
  }
}
