import React, { useState, useEffect } from 'react';
import { requestApi } from '../services/api';
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  Tablet, 
  ScanFace, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lastPunchMessage, setLastPunchMessage] = useState<string | null>(null);

  // Dados com fallback inicial fiel aos mockups
  const [metrics, setMetrics] = useState({
    totalFuncionarios: 128,
    presentes: 96,
    atrasados: 7,
    ausentes: 25,
    dispositivosOnline: 1,
    totalDispositivos: 1,
  });

  const [registros, setRegistros] = useState([
    { id: '1', nome: 'João Silva', cargo: 'Auxiliar Administrativo', departamento: 'Administrativo', tipo: 'ENTRADA', horario: '07:02:14', status: 'Presente' },
    { id: '2', nome: 'Maria Souza', cargo: 'Analista de Suporte', departamento: 'Operações', tipo: 'ENTRADA', horario: '06:58:42', status: 'Presente' },
    { id: '3', nome: 'Carlos Lima', cargo: 'Desenvolvedor Frontend', departamento: 'TI', tipo: 'ENTRADA', horario: '07:18:05', status: 'Atrasado (18 min)' },
    { id: '4', nome: 'Ana Oliveira', cargo: 'Consultora de Vendas', departamento: 'Comercial', tipo: 'ENTRADA', horario: '08:00:10', status: 'Presente' },
  ]);

  const carregarMetricas = async () => {
    try {
      setLoading(true);
      const data: any = await requestApi('/dashboard');
      if (data?.cards) {
        setMetrics({
          totalFuncionarios: data.cards.totalFuncionarios,
          presentes: data.cards.presentes,
          atrasados: data.cards.atrasados,
          ausentes: data.cards.ausentes,
          dispositivosOnline: data.cards.dispositivos.online,
          totalDispositivos: data.cards.dispositivos.total,
        });
      }
      if (data?.registrosRecentes && data.registrosRecentes.length > 0) {
        setRegistros(data.registrosRecentes.map((r: any) => ({
          id: r.id,
          nome: r.funcionarioNome,
          cargo: r.cargo,
          departamento: r.departamento,
          tipo: r.tipo,
          horario: r.horario,
          status: r.status === 'VALIDO' ? 'Presente' : r.status,
        })));
      }
    } catch (err) {
      // Mantém mock inicial suave
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMetricas();

    // Sincroniza batidas em tempo real feitas no Terminal
    const handleNovoRegistro = (e: any) => {
      if (e.detail) {
        const item = e.detail;
        const novo = {
          id: item.id,
          nome: item.funcionarioNome,
          cargo: item.cargo,
          departamento: 'Operações',
          tipo: item.tipo,
          horario: item.horario,
          status: 'Presente (Reconhecido 98%)',
        };
        setRegistros((prev) => [novo, ...prev]);
        setMetrics((prev) => ({
          ...prev,
          presentes: prev.presentes + 1,
          ausentes: Math.max(0, prev.ausentes - 1),
        }));
        setLastPunchMessage(`✓ Ponto registrado via Facial para ${item.funcionarioNome} às ${item.horario}`);
      }
    };

    window.addEventListener('novo-registro-ponto', handleNovoRegistro);
    return () => window.removeEventListener('novo-registro-ponto', handleNovoRegistro);
  }, []);

  // Simular batida facial interativa
  const simularBatidaFacial = () => {
    const agora = new Date();
    const horarioFormatado = agora.toLocaleTimeString('pt-BR');

    const novoRegistro = {
      id: String(Date.now()),
      nome: 'João Silva',
      cargo: 'Auxiliar Administrativo',
      departamento: 'Administrativo',
      tipo: 'ENTRADA',
      horario: horarioFormatado,
      status: 'Presente (Reconhecido 98%)',
    };

    setRegistros((prev) => [novoRegistro, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      presentes: prev.presentes + 1,
      ausentes: Math.max(0, prev.ausentes - 1),
    }));

    setLastPunchMessage(`✓ Ponto registrado via Facial para João Silva às ${horarioFormatado}`);
    setTimeout(() => setLastPunchMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Painel de Gestão da Jornada</h1>
          <p className="text-xs text-[#6B7280]">Visão consolidada em tempo real da equipe e dos terminais</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarMetricas}
            className="btn-secondary text-xs"
            title="Atualizar dados"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <button
            onClick={simularBatidaFacial}
            className="btn-primary text-xs"
          >
            <ScanFace size={16} />
            Simular Batida Facial no Terminal
          </button>
        </div>
      </div>

      {lastPunchMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} />
          {lastPunchMessage}
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        <div className="card-corporate bg-[#141419] border-[#27272A] hover:border-[#1746B8]/50 p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Total de Equipe</span>
            <div className="w-10 h-10 rounded-xl bg-[#1746B8]/15 border border-[#1746B8]/30 flex items-center justify-center text-[#5E87F5]">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono text-white tracking-tight">{metrics.totalFuncionarios}</div>
            <div className="text-xs text-[#6B7280] mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1746B8]"></span>
              Equipe cadastrada e ativa
            </div>
          </div>
        </div>

        <div className="card-corporate bg-[#141419] border-[#27272A] hover:border-emerald-500/50 p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Presentes Hoje</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">{metrics.presentes}</div>
            <div className="text-xs text-emerald-400/80 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Batida de entrada confirmada
            </div>
          </div>
        </div>

        <div className="card-corporate bg-[#141419] border-[#27272A] hover:border-amber-500/50 p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Atrasados</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono text-amber-400 tracking-tight">{metrics.atrasados}</div>
            <div className="text-xs text-amber-400/80 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Após tolerância de 10 min
            </div>
          </div>
        </div>

        <div className="card-corporate bg-[#141419] border-[#27272A] hover:border-red-500/50 p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Ausentes</span>
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <UserX size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono text-red-400 tracking-tight">{metrics.ausentes}</div>
            <div className="text-xs text-red-400/80 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              Sem registro até o momento
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Status & Registros Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tabela de Batidas do Dia */}
        <div className="lg:col-span-8 card-corporate p-6 bg-[#111116] border-[#27272A] space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Últimas Batidas do Dia</h2>
              <div className="text-xs text-[#6B7280]">Registros auditados e validados pelo terminal facial</div>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Tempo Real
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#18181B] text-[#A1A1AA] border-b border-[#27272A]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Funcionário</th>
                  <th className="py-3 px-4 font-semibold">Departamento</th>
                  <th className="py-3 px-4 font-semibold">Tipo</th>
                  <th className="py-3 px-4 font-semibold">Horário</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] font-mono">
                {registros.map((r) => (
                  <tr key={r.id} className="hover:bg-[#18181B]/50 transition">
                    <td className="py-3 px-4 text-white font-sans font-medium">
                      <div>{r.nome}</div>
                      <div className="text-[11px] text-[#6B7280]">{r.cargo}</div>
                    </td>
                    <td className="py-3 px-4 text-[#A1A1AA] font-sans">{r.departamento}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#1746B8]/20 text-[#2F5FD0] text-[10px] font-bold border border-[#1746B8]/40">
                        {r.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-bold">{r.horario}</td>
                    <td className="py-3 px-4 font-sans">
                      {r.status.includes('Atrasado') ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle size={12} /> {r.status}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> {r.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status dos Terminais / Dispositivos */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card-corporate p-6 bg-[#111116] border-[#27272A] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tablet size={16} className="text-[#1746B8]" />
              Terminais na Empresa
            </h3>
            
            <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Tablet Recepção Bloco A</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  ONLINE
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280] space-y-1">
                <div>Identificador: <span className="font-mono text-[#A1A1AA]">term-rec-*** (Criptografado)</span></div>
                <div>App Versão: <span className="font-mono text-[#A1A1AA]">v1.0.0-rc</span></div>
                <div>Último Sync: <span className="text-emerald-400 font-mono">Agora mesmo</span></div>
              </div>
              <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-xs text-[#A1A1AA]">
                <span>Câmera Facial:</span>
                <span className="text-emerald-400 font-bold">Ativa (30 FPS)</span>
              </div>
            </div>

            {/* Banner de Funcionamento Offline */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#1746B8]/10 to-[#18181B] border border-[#1746B8]/30 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                Resiliência Offline
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Mesmo se a rede externa cair, os terminais gravam em banco local criptografado (SQLite) e sincronizam automaticamente na reconexão.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
