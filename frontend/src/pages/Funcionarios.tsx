import React, { useState, useEffect } from 'react';
import { requestApi } from '../services/api';
import { Funcionario, FaceDescriptorData } from '../types';
import { Users, Plus, Search, CheckCircle2, AlertTriangle, ScanFace, X, Camera, Trash2, Building, Briefcase } from 'lucide-react';
import { BiometriaModal } from '../components/BiometriaModal';

export const Funcionarios: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([
    {
      id: '1',
      empresaId: 'demo',
      nome: 'João Silva',
      cpf: '111.222.333-44',
      matricula: '00152',
      cargo: 'Auxiliar Administrativo',
      departamento: 'Administrativo',
      biometriaCadastrada: true,
      status: 'ATIVO',
      jornada: { id: 'j1', nome: 'Administrativo (07h às 17h)', horaEntrada: '07:00', horaSaida: '17:00' },
    },
    {
      id: '2',
      empresaId: 'demo',
      nome: 'Maria Souza',
      cpf: '222.333.444-55',
      matricula: '00153',
      cargo: 'Analista de Suporte',
      departamento: 'Operações',
      biometriaCadastrada: true,
      status: 'ATIVO',
      jornada: { id: 'j1', nome: 'Administrativo (07h às 17h)', horaEntrada: '07:00', horaSaida: '17:00' },
    },
    {
      id: '3',
      empresaId: 'demo',
      nome: 'Carlos Lima',
      cpf: '333.444.555-66',
      matricula: '00154',
      cargo: 'Desenvolvedor Frontend',
      departamento: 'TI',
      biometriaCadastrada: true,
      status: 'ATIVO',
      jornada: { id: 'j1', nome: 'Administrativo (07h às 17h)', horaEntrada: '07:00', horaSaida: '17:00' },
    },
    {
      id: '4',
      empresaId: 'demo',
      nome: 'Ana Oliveira',
      cpf: '444.555.666-77',
      matricula: '00155',
      cargo: 'Consultora de Vendas',
      departamento: 'Comercial',
      biometriaCadastrada: false,
      status: 'ATIVO',
      jornada: { id: 'j2', nome: 'Comercial (08h às 17h)', horaEntrada: '08:00', horaSaida: '17:00' },
    },
  ]);

  const [busca, setBusca] = useState('');
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalBiometriaAberto, setModalBiometriaAberto] = useState(false);
  const [funcionarioSelecionadoBiometria, setFuncionarioSelecionadoBiometria] = useState<Funcionario | null>(null);

  // Estado do novo funcionário
  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    cargo: '',
    departamento: '',
  });

  const [biometriaTemp, setBiometriaTemp] = useState<FaceDescriptorData | null>(null);

  // Mascaramento LGPD para proteger documento pessoal em telas operacionais
  const mascararCpf = (cpf: string) => {
    if (!cpf) return '***.***.***-**';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length >= 11) {
      return `***.${digits.substring(3, 6)}.${digits.substring(6, 9)}-**`;
    }
    return '***.***.***-**';
  };

  const carregarFuncionarios = async () => {
    try {
      const data: any = await requestApi('/funcionarios');
      if (Array.isArray(data) && data.length > 0) {
        setFuncionarios(data);
        localStorage.setItem('ponto_funcionarios', JSON.stringify(data));
        return;
      }
    } catch (e) {
      // Mantém mock inicial ou localStorage
    }

    const salvos = localStorage.getItem('ponto_funcionarios');
    if (salvos) {
      try {
        const parsed = JSON.parse(salvos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFuncionarios(parsed);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const salvarListaLocal = (lista: Funcionario[]) => {
    setFuncionarios(lista);
    localStorage.setItem('ponto_funcionarios', JSON.stringify(lista));
    window.dispatchEvent(new CustomEvent('atualizacao-funcionarios', { detail: lista }));
  };

  const handleSalvarNovo = async (e: React.FormEvent) => {
    e.preventDefault();

    const novo: Funcionario = {
      id: String(Date.now()),
      empresaId: 'demo',
      nome: novoFuncionario.nome,
      cpf: novoFuncionario.cpf,
      matricula: novoFuncionario.matricula || String(Math.floor(10000 + Math.random() * 90000)),
      cargo: novoFuncionario.cargo || 'Colaborador',
      departamento: novoFuncionario.departamento || 'Geral',
      biometriaCadastrada: !!biometriaTemp,
      biometria: biometriaTemp || undefined,
      fotoUrl: biometriaTemp?.fotoBase64 || null,
      status: 'ATIVO',
      jornada: { id: 'j1', nome: 'Administrativo Padrão (07h às 17h)', horaEntrada: '07:00', horaSaida: '17:00' },
    };

    try {
      await requestApi('/funcionarios', {
        method: 'POST',
        body: JSON.stringify(novo),
      });
      carregarFuncionarios();
    } catch (err) {
      // Salva localmente
      salvarListaLocal([novo, ...funcionarios]);
    }

    setModalNovoAberto(false);
    setBiometriaTemp(null);
    setNovoFuncionario({
      nome: '',
      cpf: '',
      matricula: '',
      cargo: '',
      departamento: '',
    });
  };

  const abrirCapturaBiometria = (func: Funcionario) => {
    setFuncionarioSelecionadoBiometria(func);
    setModalBiometriaAberto(true);
  };

  const handleSalvarBiometria = (biometria: FaceDescriptorData) => {
    if (funcionarioSelecionadoBiometria) {
      // Vincula ao colaborador existente
      const atualizados = funcionarios.map((f) => {
        if (f.id === funcionarioSelecionadoBiometria.id) {
          return {
            ...f,
            biometriaCadastrada: true,
            biometria,
            fotoUrl: biometria.fotoBase64,
          };
        }
        return f;
      });
      salvarListaLocal(atualizados);
      setFuncionarioSelecionadoBiometria(null);
    } else {
      // Salva no formulário de criação de novo colaborador
      setBiometriaTemp(biometria);
    }
    setModalBiometriaAberto(false);
  };

  const handleExcluir = (id: string) => {
    if (confirm('Tem certeza que deseja inativar este colaborador?')) {
      const atualizados = funcionarios.filter((f) => f.id !== id);
      salvarListaLocal(atualizados);
    }
  };

  const filtrados = funcionarios.filter(
    (f) =>
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.cargo.toLowerCase().includes(busca.toLowerCase()) ||
      f.matricula.includes(busca)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Gestão de Funcionários</h1>
          <p className="text-xs text-[#6B7280]">
            Cadastro completo, biometria facial 128D por IA e associação de jornadas
          </p>
        </div>

        <button
          onClick={() => {
            setBiometriaTemp(null);
            setModalNovoAberto(true);
          }}
          className="btn-primary text-xs"
        >
          <Plus size={16} /> Cadastrar Novo Colaborador
        </button>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="card-corporate p-4 bg-[#111116] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, matrícula ou cargo..."
            className="input-corporate pl-10"
          />
        </div>

        <div className="text-xs text-[#A1A1AA] flex items-center gap-4">
          <div>
            Total: <span className="font-bold text-white font-mono">{filtrados.length}</span> colaboradores
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {filtrados.filter((f) => f.biometriaCadastrada).length} com biometria facial
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Colaboradores */}
      <div className="card-corporate bg-[#111116] border-[#27272A] overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-corporate">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Matrícula / CPF</th>
                <th>Departamento & Cargo</th>
                <th>Jornada de Trabalho</th>
                <th>Biometria Facial (IA 128D)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((f) => (
                <tr key={f.id}>
                  {/* Foto e Nome */}
                  <td>
                    <div className="flex items-center gap-3">
                      {f.fotoUrl ? (
                        <img
                          src={f.fotoUrl}
                          alt={f.nome}
                          className="w-10 h-10 rounded-xl object-cover border border-[#27272A]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center font-bold text-sm text-[#1746B8]">
                          {f.nome.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white text-xs">{f.nome}</div>
                        <div className="text-[11px] text-[#6B7280]">{f.cargo}</div>
                      </div>
                    </div>
                  </td>

                  {/* Matrícula / CPF */}
                  <td className="font-mono text-xs">
                    <div className="text-white font-semibold">{f.matricula}</div>
                    <div className="text-[11px] text-[#6B7280]">{mascararCpf(f.cpf)}</div>
                  </td>

                  {/* Departamento */}
                  <td>
                    <div className="text-white text-xs font-medium">{f.departamento}</div>
                    <div className="text-[11px] text-[#6B7280]">{f.cargo}</div>
                  </td>

                  {/* Jornada */}
                  <td className="text-xs">
                    <span className="text-[#A1A1AA]">{f.jornada?.nome || 'Jornada Padrão 07h - 17h'}</span>
                  </td>

                  {/* Status Biometria */}
                  <td>
                    {f.biometriaCadastrada ? (
                      <div className="flex items-center gap-2">
                        <span className="badge badge-green">
                          <CheckCircle2 size={12} />
                          Biometria Ativa
                        </span>
                        <button
                          type="button"
                          onClick={() => abrirCapturaBiometria(f)}
                          className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#222228] border border-[#27272A] text-[#A1A1AA] hover:text-white transition"
                          title="Recapturar Biometria"
                        >
                          <Camera size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => abrirCapturaBiometria(f)}
                        className="badge badge-amber hover:opacity-90 transition cursor-pointer"
                        title="Clique para capturar biometria facial agora"
                      >
                        <Camera size={12} />
                        Capturar Rosto
                      </button>
                    )}
                  </td>

                  {/* Ações */}
                  <td>
                    <button
                      type="button"
                      onClick={() => handleExcluir(f.id)}
                      className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Excluir Colaborador"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro de Novo Colaborador */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-corporate bg-[#111116] border-[#27272A] w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="font-bold text-white text-base">Novo Colaborador</h3>
              <button
                onClick={() => setModalNovoAberto(false)}
                className="text-[#6B7280] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovo} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] font-semibold mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={novoFuncionario.nome}
                  onChange={(e) => setNovoFuncionario({ ...novoFuncionario, nome: e.target.value })}
                  placeholder="Ex: Gabriel Albuquerque"
                  className="input-corporate"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1">CPF</label>
                  <input
                    type="text"
                    required
                    value={novoFuncionario.cpf}
                    onChange={(e) => setNovoFuncionario({ ...novoFuncionario, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="input-corporate"
                  />
                </div>

                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1">Matrícula</label>
                  <input
                    type="text"
                    value={novoFuncionario.matricula}
                    onChange={(e) => setNovoFuncionario({ ...novoFuncionario, matricula: e.target.value })}
                    placeholder="00189"
                    className="input-corporate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1">Cargo</label>
                  <input
                    type="text"
                    required
                    value={novoFuncionario.cargo}
                    onChange={(e) => setNovoFuncionario({ ...novoFuncionario, cargo: e.target.value })}
                    placeholder="Ex: Assistente de Operações"
                    className="input-corporate"
                  />
                </div>

                <div>
                  <label className="block text-[#A1A1AA] font-semibold mb-1">Departamento</label>
                  <input
                    type="text"
                    value={novoFuncionario.departamento}
                    onChange={(e) => setNovoFuncionario({ ...novoFuncionario, departamento: e.target.value })}
                    placeholder="Ex: Logística"
                    className="input-corporate"
                  />
                </div>
              </div>

              {/* Seção de Biometria Facial */}
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScanFace size={16} className="text-[#1746B8]" />
                    <span className="font-bold text-white text-xs">Biometria Facial (Rede Neural)</span>
                  </div>
                  {biometriaTemp ? (
                    <span className="badge badge-green text-[10px]">✓ Capturada</span>
                  ) : (
                    <span className="badge badge-amber text-[10px]">Pendente</span>
                  )}
                </div>

                {biometriaTemp ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {biometriaTemp.fotoBase64 && (
                        <img
                          src={biometriaTemp.fotoBase64}
                          alt="Foto Capturada"
                          className="w-12 h-12 rounded-xl object-cover border border-emerald-500/50"
                        />
                      )}
                      <div>
                        <div className="text-white font-semibold text-xs">Descritor 128D Extraído</div>
                        <div className="text-[10px] text-[#6B7280]">Pronto para validação instantânea no terminal</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalBiometriaAberto(true)}
                      className="text-[#2F5FD0] hover:underline text-xs"
                    >
                      Recapturar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setFuncionarioSelecionadoBiometria(null);
                      setModalBiometriaAberto(true);
                    }}
                    className="w-full btn-secondary text-xs border-[#1746B8]/40 hover:bg-[#1746B8]/10 text-[#5E87F5]"
                  >
                    <Camera size={14} /> Capturar Foto & Biometria Facial Agora
                  </button>
                )}
              </div>

              {/* Botões do Formulário */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Cadastrar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reutilizável de Captura Biometria */}
      <BiometriaModal
        isOpen={modalBiometriaAberto}
        onClose={() => {
          setModalBiometriaAberto(false);
          setFuncionarioSelecionadoBiometria(null);
        }}
        funcionarioNome={
          funcionarioSelecionadoBiometria?.nome || novoFuncionario.nome || 'Novo Colaborador'
        }
        onBiometriaSalva={handleSalvarBiometria}
      />
    </div>
  );
};
