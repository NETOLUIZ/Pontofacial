import { PrismaClient, Perfil, TipoRegistro, OrigemRegistro, StatusRegistro, StatusFuncionario } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpeza prévia para idempotência
  await prisma.registroPonto.deleteMany();
  await prisma.auditoria.deleteMany();
  await prisma.funcionario.deleteMany();
  await prisma.dispositivo.deleteMany();
  await prisma.jornada.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.empresa.deleteMany();

  const senhaPadraoHash = await bcrypt.hash('admin123', 10);

  // 1. Criar Super Admin Global
  const superAdmin = await prisma.usuario.create({
    data: {
      nome: 'Super Administrador',
      email: 'admin@pontofacial.com.br',
      senhaHash: senhaPadraoHash,
      perfil: Perfil.SUPER_ADMIN,
      ativo: true,
    },
  });
  console.log(`✅ Super Admin criado: ${superAdmin.email}`);

  // 2. Criar Empresa Demonstração
  const empresa = await prisma.empresa.create({
    data: {
      razaoSocial: 'IMARF Soluções Tecnológicas LTDA',
      nomeFantasia: 'IMARF Tecnologia',
      cnpj: '12345678000190',
      ativo: true,
    },
  });
  console.log(`✅ Empresa criada: ${empresa.nomeFantasia}`);

  // 3. Criar Admin e Usuário RH da Empresa
  const adminEmpresa = await prisma.usuario.create({
    data: {
      empresaId: empresa.id,
      nome: 'Diretoria IMARF',
      email: 'diretoria@imarf.com.br',
      senhaHash: senhaPadraoHash,
      perfil: Perfil.ADMIN_EMPRESA,
      ativo: true,
    },
  });

  const rhEmpresa = await prisma.usuario.create({
    data: {
      empresaId: empresa.id,
      nome: 'Camila RH',
      email: 'rh@imarf.com.br',
      senhaHash: senhaPadraoHash,
      perfil: Perfil.RH,
      ativo: true,
    },
  });

  // 4. Criar Jornadas
  const jornadaAdmin = await prisma.jornada.create({
    data: {
      empresaId: empresa.id,
      nome: 'Administrativo (07:00 - 17:00 com Intervalo)',
      horaEntrada: '07:00',
      horaIntervalo: '12:00',
      horaRetorno: '13:00',
      horaSaida: '17:00',
      controleIntervalo: true,
      toleranciaMinutos: 10,
    },
  });

  const jornadaComercial = await prisma.jornada.create({
    data: {
      empresaId: empresa.id,
      nome: 'Comercial (08:00 - 17:00 Direto)',
      horaEntrada: '08:00',
      horaSaida: '17:00',
      controleIntervalo: false,
      toleranciaMinutos: 10,
    },
  });

  // 5. Criar Dispositivo Terminal
  const dispositivoTablet = await prisma.dispositivo.create({
    data: {
      empresaId: empresa.id,
      nome: 'Tablet Terminal Recepção Principal',
      identificadorUuid: 'term-rec-001-uuid',
      localizacao: 'Hall de Entrada - Bloco A',
      status: 'ONLINE',
      versaoApp: 'v1.0.0-rc',
      ultimoSync: new Date(),
    },
  });

  // 6. Criar Funcionários
  const joao = await prisma.funcionario.create({
    data: {
      empresaId: empresa.id,
      jornadaId: jornadaAdmin.id,
      nome: 'João Silva',
      cpf: '11122233344',
      matricula: '00152',
      cargo: 'Auxiliar Administrativo',
      departamento: 'Administrativo',
      biometriaCadastrada: true,
      status: StatusFuncionario.ATIVO,
    },
  });

  const maria = await prisma.funcionario.create({
    data: {
      empresaId: empresa.id,
      jornadaId: jornadaAdmin.id,
      nome: 'Maria Souza',
      cpf: '22233344455',
      matricula: '00153',
      cargo: 'Analista de Suporte',
      departamento: 'Operações',
      biometriaCadastrada: true,
      status: StatusFuncionario.ATIVO,
    },
  });

  const carlos = await prisma.funcionario.create({
    data: {
      empresaId: empresa.id,
      jornadaId: jornadaAdmin.id,
      nome: 'Carlos Lima',
      cpf: '33344455566',
      matricula: '00154',
      cargo: 'Desenvolvedor Frontend',
      departamento: 'TI',
      biometriaCadastrada: true,
      status: StatusFuncionario.ATIVO,
    },
  });

  const ana = await prisma.funcionario.create({
    data: {
      empresaId: empresa.id,
      jornadaId: jornadaComercial.id,
      nome: 'Ana Oliveira',
      cpf: '44455566677',
      matricula: '00155',
      cargo: 'Consultora de Vendas',
      departamento: 'Comercial',
      biometriaCadastrada: false,
      status: StatusFuncionario.ATIVO,
    },
  });

  // 7. Criar Registros de Ponto de Demonstração
  const hoje = new Date();
  const hoje0702 = new Date(hoje);
  hoje0702.setHours(7, 2, 14, 0);

  const hoje0658 = new Date(hoje);
  hoje0658.setHours(6, 58, 42, 0);

  const hoje0718 = new Date(hoje);
  hoje0718.setHours(7, 18, 5, 0);

  await prisma.registroPonto.create({
    data: {
      empresaId: empresa.id,
      funcionarioId: joao.id,
      dispositivoId: dispositivoTablet.id,
      tipo: TipoRegistro.ENTRADA,
      dataHora: hoje0702,
      origem: OrigemRegistro.ONLINE,
      status: StatusRegistro.VALIDO,
      idempotencyKey: `pt-${joao.id}-20261005-0702`,
      hashIntegridade: 'sha256-hash-joao-ponto-702',
    },
  });

  await prisma.registroPonto.create({
    data: {
      empresaId: empresa.id,
      funcionarioId: maria.id,
      dispositivoId: dispositivoTablet.id,
      tipo: TipoRegistro.ENTRADA,
      dataHora: hoje0658,
      origem: OrigemRegistro.ONLINE,
      status: StatusRegistro.VALIDO,
      idempotencyKey: `pt-${maria.id}-20261005-0658`,
      hashIntegridade: 'sha256-hash-maria-ponto-658',
    },
  });

  await prisma.registroPonto.create({
    data: {
      empresaId: empresa.id,
      funcionarioId: carlos.id,
      dispositivoId: dispositivoTablet.id,
      tipo: TipoRegistro.ENTRADA,
      dataHora: hoje0718,
      origem: OrigemRegistro.ONLINE,
      status: StatusRegistro.VALIDO,
      idempotencyKey: `pt-${carlos.id}-20261005-0718`,
      hashIntegridade: 'sha256-hash-carlos-ponto-718',
    },
  });

  // 8. Auditoria inicial
  await prisma.auditoria.create({
    data: {
      empresaId: empresa.id,
      usuarioId: adminEmpresa.id,
      acao: 'SISTEMA_INICIALIZADO',
      entidade: 'Empresa',
      entidadeId: empresa.id,
      dadosNovos: { seed: true, timestamp: new Date().toISOString() },
      ip: '127.0.0.1',
      userAgent: 'Seed Script v1.0',
    },
  });

  console.log('✨ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
