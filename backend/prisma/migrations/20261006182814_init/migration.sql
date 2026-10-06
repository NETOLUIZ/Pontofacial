-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('SUPER_ADMIN', 'ADMIN_EMPRESA', 'RH', 'GESTOR', 'OPERADOR', 'TERMINAL');

-- CreateEnum
CREATE TYPE "StatusFuncionario" AS ENUM ('ATIVO', 'INATIVO', 'AFASTADO');

-- CreateEnum
CREATE TYPE "TipoRegistro" AS ENUM ('ENTRADA', 'SAIDA_INTERVALO', 'RETORNO_INTERVALO', 'SAIDA');

-- CreateEnum
CREATE TYPE "OrigemRegistro" AS ENUM ('ONLINE', 'OFFLINE', 'MANUAL');

-- CreateEnum
CREATE TYPE "StatusRegistro" AS ENUM ('VALIDO', 'PENDENTE', 'CANCELADO', 'AJUSTADO');

-- CreateEnum
CREATE TYPE "StatusDispositivo" AS ENUM ('ONLINE', 'OFFLINE', 'BLOQUEADO');

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'OPERADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jornadas" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "hora_entrada" TEXT NOT NULL DEFAULT '08:00',
    "hora_intervalo" TEXT DEFAULT '12:00',
    "hora_retorno" TEXT DEFAULT '13:00',
    "hora_saida" TEXT NOT NULL DEFAULT '17:00',
    "controle_intervalo" BOOLEAN NOT NULL DEFAULT true,
    "tolerancia_minutos" INTEGER NOT NULL DEFAULT 10,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jornadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "jornada_id" TEXT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "biometria_cadastrada" BOOLEAN NOT NULL DEFAULT false,
    "foto_url" TEXT,
    "status" "StatusFuncionario" NOT NULL DEFAULT 'ATIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "identificador_uuid" TEXT NOT NULL,
    "localizacao" TEXT,
    "status" "StatusDispositivo" NOT NULL DEFAULT 'ONLINE',
    "ultimo_sync" TIMESTAMP(3),
    "versao_app" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_ponto" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "funcionario_id" TEXT NOT NULL,
    "dispositivo_id" TEXT,
    "tipo" "TipoRegistro" NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "origem" "OrigemRegistro" NOT NULL DEFAULT 'ONLINE',
    "status" "StatusRegistro" NOT NULL DEFAULT 'VALIDO',
    "idempotency_key" TEXT,
    "foto_registro_url" TEXT,
    "hash_integridade" TEXT,
    "observacao" TEXT,
    "motivo_ajuste" TEXT,
    "ajustado_por_id" TEXT,
    "ajustado_por_nome" TEXT,
    "data_hora_original" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "registros_ponto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT,
    "usuario_id" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT,
    "dados_anteriores" JSONB,
    "dados_novos" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_empresa_id_idx" ON "usuarios"("empresa_id");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "jornadas_empresa_id_idx" ON "jornadas"("empresa_id");

-- CreateIndex
CREATE INDEX "funcionarios_empresa_id_idx" ON "funcionarios"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_empresa_id_cpf_key" ON "funcionarios"("empresa_id", "cpf");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_empresa_id_matricula_key" ON "funcionarios"("empresa_id", "matricula");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_identificador_uuid_key" ON "dispositivos"("identificador_uuid");

-- CreateIndex
CREATE INDEX "dispositivos_empresa_id_idx" ON "dispositivos"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "registros_ponto_idempotency_key_key" ON "registros_ponto"("idempotency_key");

-- CreateIndex
CREATE INDEX "registros_ponto_empresa_id_data_hora_idx" ON "registros_ponto"("empresa_id", "data_hora");

-- CreateIndex
CREATE INDEX "registros_ponto_funcionario_id_data_hora_idx" ON "registros_ponto"("funcionario_id", "data_hora");

-- CreateIndex
CREATE INDEX "auditorias_empresa_id_idx" ON "auditorias"("empresa_id");

-- CreateIndex
CREATE INDEX "auditorias_usuario_id_idx" ON "auditorias"("usuario_id");

-- CreateIndex
CREATE INDEX "auditorias_created_at_idx" ON "auditorias"("created_at");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jornadas" ADD CONSTRAINT "jornadas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_jornada_id_fkey" FOREIGN KEY ("jornada_id") REFERENCES "jornadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ponto" ADD CONSTRAINT "registros_ponto_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ponto" ADD CONSTRAINT "registros_ponto_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ponto" ADD CONSTRAINT "registros_ponto_dispositivo_id_fkey" FOREIGN KEY ("dispositivo_id") REFERENCES "dispositivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
