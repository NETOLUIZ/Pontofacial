import { prisma } from '../../config/prisma';
import { StatusFuncionario, TipoRegistro } from '@prisma/client';

export class DashboardService {
  async obterMetricas(empresaId: string) {
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);

    const hojeFim = new Date();
    hojeFim.setHours(23, 59, 59, 999);

    // 1. Total funcionários ativos
    const totalFuncionarios = await prisma.funcionario.count({
      where: { empresaId, status: StatusFuncionario.ATIVO },
    });

    // 2. Registros de hoje
    const registrosHoje = await prisma.registroPonto.findMany({
      where: {
        empresaId,
        dataHora: {
          gte: hojeInicio,
          lte: hojeFim,
        },
      },
      include: {
        funcionario: {
          include: { jornada: true },
        },
      },
      orderBy: { dataHora: 'desc' },
    });

    // 3. Funcionários únicos com entrada hoje
    const funcionariosComEntrada = new Set<string>();
    let atrasadosContador = 0;

    for (const reg of registrosHoje) {
      if (reg.tipo === TipoRegistro.ENTRADA && !funcionariosComEntrada.has(reg.funcionarioId)) {
        funcionariosComEntrada.add(reg.funcionarioId);

        // Verifica atraso se possuir jornada
        if (reg.funcionario.jornada) {
          const [horaPrevista, minPrevisto] = reg.funcionario.jornada.horaEntrada.split(':').map(Number);
          const dataBatida = new Date(reg.dataHora);
          const minutosBatida = dataBatida.getHours() * 60 + dataBatida.getMinutes();
          const minutosLimite = horaPrevista * 60 + minPrevisto + (reg.funcionario.jornada.toleranciaMinutos || 10);

          if (minutosBatida > minutosLimite) {
            atrasadosContador++;
          }
        }
      }
    }

    const presentes = funcionariosComEntrada.size;
    const ausentes = Math.max(0, totalFuncionarios - presentes);

    // 4. Status dispositivos
    const totalDispositivos = await prisma.dispositivo.count({ where: { empresaId } });
    const dispositivosOnline = await prisma.dispositivo.count({
      where: { empresaId, status: 'ONLINE' },
    });

    // 5. Últimos 10 registros detalhados
    const registrosRecentes = registrosHoje.slice(0, 10).map((r) => ({
      id: r.id,
      funcionarioNome: r.funcionario.nome,
      cargo: r.funcionario.cargo,
      departamento: r.funcionario.departamento,
      tipo: r.tipo,
      horario: new Date(r.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      origem: r.origem,
      status: r.status,
    }));

    return {
      cards: {
        totalFuncionarios,
        presentes,
        atrasados: atrasadosContador,
        ausentes,
        dispositivos: {
          total: totalDispositivos,
          online: dispositivosOnline,
        },
      },
      registrosRecentes,
      dataReferencia: new Date().toISOString(),
    };
  }
}
