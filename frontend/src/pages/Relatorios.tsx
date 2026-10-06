import React, { useState } from 'react';
import { FileSpreadsheet, Download, Printer, Filter, Calendar, Users, CheckCircle2, AlertTriangle } from 'lucide-react';

export const Relatorios: React.FC = () => {
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('1');
  const [mesSelecionado, setMesSelecionado] = useState('10/2026');

  const funcionarios = [
    { id: '1', nome: 'João Silva', cargo: 'Auxiliar Administrativo', matricula: '00152', departamento: 'Administrativo' },
    { id: '2', nome: 'Maria Souza', cargo: 'Analista de Suporte', matricula: '00153', departamento: 'Operações' },
    { id: '3', nome: 'Carlos Lima', cargo: 'Desenvolvedor Frontend', matricula: '00154', departamento: 'TI' },
    { id: '4', nome: 'Ana Oliveira', cargo: 'Consultora de Vendas', matricula: '00155', departamento: 'Comercial' },
  ];

  // Simulação de apuração mensal detalhada
  const diasApurados = [
    { dia: '01/10/2026', diaSemana: 'Qui', e1: '07:02', s1: '12:00', e2: '13:00', s2: '17:01', trabalhado: '08h59', previsto: '09h00', saldo: '-00h01', status: 'Normal' },
    { dia: '02/10/2026', diaSemana: 'Sex', e1: '06:58', s1: '12:02', e2: '13:00', s2: '17:00', trabalhado: '09h00', previsto: '09h00', saldo: '00h00', status: 'Normal' },
    { dia: '03/10/2026', diaSemana: 'Sáb', e1: '--:--', s1: '--:--', e2: '--:--', s2: '--:--', trabalhado: '00h00', previsto: '00h00', saldo: '00h00', status: 'DSR' },
    { dia: '04/10/2026', diaSemana: 'Dom', e1: '--:--', s1: '--:--', e2: '--:--', s2: '--:--', trabalhado: '00h00', previsto: '00h00', saldo: '00h00', status: 'DSR' },
    { dia: '05/10/2026', diaSemana: 'Seg', e1: '08:00*', s1: '12:00', e2: '13:00', s2: '17:10', trabalhado: '08h10', previsto: '09h00', saldo: '-00h50', status: '✎ Ajustado RH (Esquecimento de Marcação)' },
  ];

  const atual = funcionarios.find((f) => f.id === funcionarioSelecionado) || funcionarios[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Espelho de Ponto & Relatórios</h1>
          <p className="text-xs text-[#6B7280]">Apuração mensal, cálculo de saldo de jornada e exportação em conformidade fiscal</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="btn-secondary text-xs"
          >
            <Printer size={14} /> Imprimir Espelho
          </button>
          <button
            onClick={() => alert('Download do arquivo AFD / Excel iniciado!')}
            className="btn-primary text-xs"
          >
            <Download size={14} /> Exportar Excel / AFD
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card-corporate p-4 bg-[#111116] border-[#27272A] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Selecionar Colaborador</label>
          <select
            value={funcionarioSelecionado}
            onChange={(e) => setFuncionarioSelecionado(e.target.value)}
            className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#1746B8]"
          >
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome} (Matrícula {f.matricula})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Mês de Apuração</label>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#1746B8]"
          >
            <option value="10/2026">Outubro / 2026 (Mês Atual)</option>
            <option value="09/2026">Setembro / 2026</option>
            <option value="08/2026">Agosto / 2026</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Empresa</label>
          <div className="px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs text-[#A1A1AA]">
            IMARF Tecnologia LTDA
          </div>
        </div>
      </div>

      {/* Cards de Totais da Folha */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-corporate p-4 bg-[#18181B] space-y-1">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase">Horas Previstas</span>
          <div className="text-2xl font-bold font-mono text-white">176h 00m</div>
          <div className="text-[10px] text-[#A1A1AA]">22 dias úteis</div>
        </div>

        <div className="card-corporate p-4 bg-[#18181B] border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Horas Efetivas</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">178h 30m</div>
          <div className="text-[10px] text-emerald-400">Batidas confirmadas</div>
        </div>

        <div className="card-corporate p-4 bg-[#18181B] border-blue-500/30 space-y-1">
          <span className="text-[10px] font-bold text-[#2F5FD0] uppercase">Saldo Banco de Horas</span>
          <div className="text-2xl font-bold font-mono text-[#2F5FD0]">+ 02h 30m</div>
          <div className="text-[10px] text-[#A1A1AA]">Crédito no mês</div>
        </div>

        <div className="card-corporate p-4 bg-[#18181B] space-y-1">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase">Faltas Injustificadas</span>
          <div className="text-2xl font-bold font-mono text-white">0</div>
          <div className="text-[10px] text-emerald-400">100% de assiduidade</div>
        </div>
      </div>

      {/* Tabela do Espelho de Ponto */}
      <div className="card-corporate bg-[#111116] border-[#27272A] overflow-hidden space-y-4 p-6">
        <div className="flex flex-wrap justify-between items-center border-b border-[#27272A] pb-3 text-xs">
          <div>
            <div className="font-bold text-white text-base">{atual.nome}</div>
            <div className="text-[#6B7280] font-mono">
              Cargo: {atual.cargo} • Departamento: {atual.departamento} • Matrícula: {atual.matricula}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
            ✓ Espelho em Aberto (Outubro/2026)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#18181B] text-[#A1A1AA] border-b border-[#27272A]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Data</th>
                <th className="py-2.5 px-3 font-semibold">Dia</th>
                <th className="py-2.5 px-3 font-semibold">Entrada</th>
                <th className="py-2.5 px-3 font-semibold">Saída Int.</th>
                <th className="py-2.5 px-3 font-semibold">Retorno Int.</th>
                <th className="py-2.5 px-3 font-semibold">Saída</th>
                <th className="py-2.5 px-3 font-semibold">Trabalhado</th>
                <th className="py-2.5 px-3 font-semibold">Saldo</th>
                <th className="py-2.5 px-3 font-semibold">Ocorrência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] font-mono">
              {diasApurados.map((d) => (
                <tr key={d.dia} className="hover:bg-[#18181B]/50 transition">
                  <td className="py-2.5 px-3 text-white font-medium">{d.dia}</td>
                  <td className="py-2.5 px-3 text-[#6B7280] font-sans">{d.diaSemana}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{d.e1}</td>
                  <td className="py-2.5 px-3 text-[#A1A1AA]">{d.s1}</td>
                  <td className="py-2.5 px-3 text-[#A1A1AA]">{d.e2}</td>
                  <td className="py-2.5 px-3 text-white font-bold">{d.s2}</td>
                  <td className="py-2.5 px-3 text-white">{d.trabalhado}</td>
                  <td className={`py-2.5 px-3 font-bold ${d.saldo.startsWith('+') ? 'text-emerald-400' : d.saldo.startsWith('-') ? 'text-amber-400' : 'text-[#6B7280]'}`}>
                    {d.saldo}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-[#A1A1AA] text-[11px]">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
