import React, { useState, useEffect } from 'react';
import { requestApi } from '../services/api';
import { Jornada } from '../types';
import { Clock, Plus, CheckCircle2, Sliders, X } from 'lucide-react';

export const Jornadas: React.FC = () => {
  const [jornadas, setJornadas] = useState<Jornada[]>([
    {
      id: '1',
      empresaId: 'demo',
      nome: 'Jornada Administrativa Padrão',
      horaEntrada: '07:00',
      horaIntervalo: '12:00',
      horaRetorno: '13:00',
      horaSaida: '17:00',
      controleIntervalo: true,
      toleranciaMinutos: 10,
      ativo: true,
    },
    {
      id: '2',
      empresaId: 'demo',
      nome: 'Jornada Comercial Corrida',
      horaEntrada: '08:00',
      horaSaida: '17:00',
      controleIntervalo: false,
      toleranciaMinutos: 15,
      ativo: true,
    },
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [novaJornada, setNovaJornada] = useState({
    nome: '',
    horaEntrada: '08:00',
    horaIntervalo: '12:00',
    horaRetorno: '13:00',
    horaSaida: '17:00',
    controleIntervalo: true,
    toleranciaMinutos: 10,
  });

  const carregarJornadas = async () => {
    try {
      const data: any = await requestApi('/jornadas');
      if (Array.isArray(data) && data.length > 0) {
        setJornadas(data);
      }
    } catch (e) {
      // Mantém mock inicial
    }
  };

  useEffect(() => {
    carregarJornadas();
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestApi('/jornadas', {
        method: 'POST',
        body: JSON.stringify(novaJornada),
      });
      carregarJornadas();
    } catch (e) {
      const nova: Jornada = {
        id: String(Date.now()),
        empresaId: 'demo',
        ...novaJornada,
        ativo: true,
      };
      setJornadas((prev) => [...prev, nova]);
    }
    setModalAberto(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Configuração de Jornadas</h1>
          <p className="text-xs text-[#6B7280]">Regras de horário, tolerâncias e controle flexível de intervalos</p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="btn-primary text-xs"
        >
          <Plus size={16} /> Nova Jornada
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jornadas.map((j) => (
          <div key={j.id} className="card-corporate p-6 bg-[#111116] border-[#27272A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div>
                <h3 className="font-bold text-white text-base">{j.nome}</h3>
                <div className="text-[11px] text-[#6B7280]">Tolerância: {j.toleranciaMinutos} minutos</div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  j.controleIntervalo
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-blue-500/20 text-[#2F5FD0] border-[#1746B8]/40'
                }`}
              >
                {j.controleIntervalo ? 'Intervalo Obrigatório' : 'Intervalo Livre'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                <div className="text-[#6B7280] text-[10px]">Entrada Prevista</div>
                <div className="text-white font-bold text-base mt-0.5">{j.horaEntrada}</div>
              </div>

              <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                <div className="text-[#6B7280] text-[10px]">Saída Prevista</div>
                <div className="text-white font-bold text-base mt-0.5">{j.horaSaida}</div>
              </div>

              {j.controleIntervalo && (
                <>
                  <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                    <div className="text-[#6B7280] text-[10px]">Início Intervalo</div>
                    <div className="text-white font-bold text-base mt-0.5">{j.horaIntervalo || '12:00'}</div>
                  </div>

                  <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                    <div className="text-[#6B7280] text-[10px]">Retorno Intervalo</div>
                    <div className="text-white font-bold text-base mt-0.5">{j.horaRetorno || '13:00'}</div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-[#6B7280]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={14} /> Ativa para apuração
              </span>
              <button className="text-[#2F5FD0] hover:underline text-xs">Editar Parâmetros</button>
            </div>
          </div>
        ))}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-corporate p-6 bg-[#111116] border-[#27272A] w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="font-bold text-white text-base">Criar Nova Jornada</h3>
              <button onClick={() => setModalAberto(false)} className="text-[#6B7280] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1">Nome da Jornada</label>
                <input
                  type="text"
                  required
                  value={novaJornada.nome}
                  onChange={(e) => setNovaJornada({ ...novaJornada, nome: e.target.value })}
                  placeholder="Ex: Turno Noturno 19h às 07h"
                  className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#1746B8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1 font-sans">Entrada</label>
                  <input
                    type="time"
                    required
                    value={novaJornada.horaEntrada}
                    onChange={(e) => setNovaJornada({ ...novaJornada, horaEntrada: e.target.value })}
                    className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#1746B8]"
                  />
                </div>
                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1 font-sans">Saída</label>
                  <input
                    type="time"
                    required
                    value={novaJornada.horaSaida}
                    onChange={(e) => setNovaJornada({ ...novaJornada, horaSaida: e.target.value })}
                    className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#1746B8]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Controle de Intervalo Ativado</div>
                  <div className="text-[11px] text-[#6B7280]">Exigir batida de almoço/descanso</div>
                </div>
                <input
                  type="checkbox"
                  checked={novaJornada.controleIntervalo}
                  onChange={(e) => setNovaJornada({ ...novaJornada, controleIntervalo: e.target.checked })}
                  className="w-4 h-4 accent-[#1746B8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#27272A]">
                <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary text-xs">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Salvar Jornada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
