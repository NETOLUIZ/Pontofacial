export type Perfil = 'SUPER_ADMIN' | 'ADMIN_EMPRESA' | 'RH' | 'GESTOR' | 'OPERADOR' | 'TERMINAL';

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ativo: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  empresaId?: string | null;
  empresa?: Empresa | null;
}

export interface FaceDescriptorData {
  descriptor: number[];
  fotoBase64?: string;
  dataCaptura: string;
}

export interface Funcionario {
  id: string;
  empresaId: string;
  nome: string;
  cpf: string;
  matricula: string;
  cargo: string;
  departamento: string;
  biometriaCadastrada: boolean;
  biometria?: FaceDescriptorData;
  fotoUrl?: string | null;
  status: 'ATIVO' | 'INATIVO' | 'AFASTADO';
  jornadaId?: string | null;
  jornada?: {
    id: string;
    nome: string;
    horaEntrada: string;
    horaSaida: string;
  };
}

export interface Jornada {
  id: string;
  empresaId: string;
  nome: string;
  horaEntrada: string;
  horaIntervalo?: string | null;
  horaRetorno?: string | null;
  horaSaida: string;
  controleIntervalo: boolean;
  toleranciaMinutos: number;
  ativo: boolean;
}

export interface Dispositivo {
  id: string;
  empresaId: string;
  nome: string;
  identificadorUuid: string;
  localizacao?: string | null;
  status: 'ONLINE' | 'OFFLINE' | 'BLOQUEADO';
  versaoApp?: string | null;
  ultimoSync?: string | null;
}

export interface RegistroPonto {
  id: string;
  empresaId: string;
  funcionarioId: string;
  funcionarioNome?: string;
  cargo?: string;
  tipo: 'ENTRADA' | 'SAIDA_INTERVALO' | 'RETORNO_INTERVALO' | 'SAIDA';
  dataHora: string;
  dataHoraOriginal?: string | null;
  origem: 'ONLINE' | 'OFFLINE' | 'MANUAL';
  status: 'VALIDO' | 'PENDENTE' | 'CANCELADO' | 'AJUSTADO';
  horario?: string;
  motivoAjuste?: string | null;
  ajustadoPorNome?: string | null;
  observacao?: string | null;
}

export interface DashboardData {
  cards: {
    totalFuncionarios: number;
    presentes: number;
    atrasados: number;
    ausentes: number;
    dispositivos: {
      total: number;
      online: number;
    };
  };
  registrosRecentes: Array<{
    id: string;
    funcionarioNome: string;
    cargo: string;
    departamento: string;
    tipo: 'ENTRADA' | 'SAIDA_INTERVALO' | 'RETORNO_INTERVALO' | 'SAIDA';
    horario: string;
    origem: 'ONLINE' | 'OFFLINE';
    status: 'VALIDO' | 'PENDENTE' | 'CANCELADO';
  }>;
}
