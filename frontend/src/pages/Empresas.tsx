import React, { useState } from 'react';
import { Building2, Plus, Users, Tablet, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export const Empresas: React.FC = () => {
  const [empresas, setEmpresas] = useState([
    {
      id: '1',
      razaoSocial: 'IMARF Soluções Tecnológicas LTDA',
      nomeFantasia: 'IMARF Tecnologia',
      cnpj: '12.345.678/0001-90',
      totalFuncionarios: 128,
      totalDispositivos: 2,
      ativo: true,
      dataCriacao: '15/01/2026',
    },
    {
      id: '2',
      razaoSocial: 'Clínica Médica Vida & Saúde LTDA',
      nomeFantasia: 'Clínica Vida & Saúde',
      cnpj: '98.765.432/0001-10',
      totalFuncionarios: 42,
      totalDispositivos: 1,
      ativo: true,
      dataCriacao: '03/03/2026',
    },
    {
      id: '3',
      razaoSocial: 'Varejo Central Distribuidora S/A',
      nomeFantasia: 'Central Distribuição',
      cnpj: '45.123.789/0001-55',
      totalFuncionarios: 310,
      totalDispositivos: 4,
      ativo: true,
      dataCriacao: '12/05/2026',
    },
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [novaEmpresa, setNovaEmpresa] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
  });

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const nova = {
      id: String(Date.now()),
      ...novaEmpresa,
      totalFuncionarios: 0,
      totalDispositivos: 0,
      ativo: true,
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
    };
    setEmpresas((prev) => [...prev, nova]);
    setModalAberto(false);
    setNovaEmpresa({ razaoSocial: '', nomeFantasia: '', cnpj: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Gestão Multi-Empresa (Super Admin)</h1>
          <p className="text-xs text-[#6B7280]">Isolamento de dados por tenant, credenciamento de clientes e capacidade</p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="btn-primary text-xs"
        >
          <Plus size={16} /> Nova Empresa Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {empresas.map((emp) => (
          <div key={emp.id} className="card-corporate p-6 bg-[#111116] border-[#27272A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1746B8]/20 border border-[#1746B8] flex items-center justify-center text-[#2F5FD0]">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{emp.nomeFantasia}</h3>
                  <div className="text-[11px] text-[#6B7280] font-mono">{emp.cnpj}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                ATIVA
              </span>
            </div>

            <div className="text-xs text-[#A1A1AA]">
              <div className="text-[11px] text-[#6B7280]">Razão Social:</div>
              <div className="font-medium text-white truncate">{emp.razaoSocial}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                <div className="text-[#6B7280] text-[10px]">Funcionários</div>
                <div className="text-white font-bold text-base mt-0.5">{emp.totalFuncionarios}</div>
              </div>
              <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                <div className="text-[#6B7280] text-[10px]">Terminais Tablets</div>
                <div className="text-white font-bold text-base mt-0.5">{emp.totalDispositivos}</div>
              </div>
            </div>

            <div className="text-[11px] text-[#6B7280] flex justify-between items-center pt-2 border-t border-[#27272A]">
              <span>Cadastrada em: {emp.dataCriacao}</span>
              <button className="text-[#2F5FD0] hover:underline">Gerenciar</button>
            </div>
          </div>
        ))}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-corporate p-6 bg-[#111116] border-[#27272A] w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="font-bold text-white text-base">Credenciar Nova Empresa</h3>
              <button onClick={() => setModalAberto(false)} className="text-[#6B7280] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  required
                  value={novaEmpresa.nomeFantasia}
                  onChange={(e) => setNovaEmpresa({ ...novaEmpresa, nomeFantasia: e.target.value })}
                  placeholder="Ex: Grupo Alfa Logística"
                  className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#1746B8]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1">Razão Social</label>
                <input
                  type="text"
                  required
                  value={novaEmpresa.razaoSocial}
                  onChange={(e) => setNovaEmpresa({ ...novaEmpresa, razaoSocial: e.target.value })}
                  placeholder="Ex: Alfa Transportes e Logística LTDA"
                  className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#1746B8]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1">CNPJ</label>
                <input
                  type="text"
                  required
                  value={novaEmpresa.cnpj}
                  onChange={(e) => setNovaEmpresa({ ...novaEmpresa, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#1746B8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#27272A]">
                <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary text-xs">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Cadastrar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
