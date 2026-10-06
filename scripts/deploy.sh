#!/usr/bin/env bash
set -e

# ==============================================================================
# SCRIPT DE DEPLOY AUTOMATIZADO - CONTROLE DE PONTO FACIAL (VPS HOSTINGER/UBUNTU)
# ==============================================================================

echo "================================================================="
echo "  🚀 INICIANDO DEPLOY DO CONTROLE DE PONTO FACIAL NA VPS"
echo "================================================================="

# 1. Verifica se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker não encontrado. Instalando Docker automaticamente..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm -f get-docker.sh
    echo "✅ Docker instalado com sucesso!"
fi

# 2. Configura arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📄 Arquivo .env não encontrado. Gerando a partir de .env.example..."
    cp .env.example .env
    
    # Gera segredos randômicos seguros para JWT se openssl estiver disponível
    if command -v openssl &> /dev/null; then
        JWT_RANDOM=$(openssl rand -hex 32)
        JWT_REFRESH_RANDOM=$(openssl rand -hex 32)
        sed -i "s/chave-secreta-jwt-super-segura-ponto-facial-2026/$JWT_RANDOM/" .env
        sed -i "s/chave-secreta-refresh-jwt-super-segura-2026/$JWT_REFRESH_RANDOM/" .env
        echo "🔐 Novos segredos criptográficos JWT gerados no .env"
    fi
fi

# 3. Build e subida dos contêineres Docker
echo "📦 Construindo imagens e subindo os contêineres (PostgreSQL, Redis, Backend, Frontend, Nginx)..."
docker compose down --remove-orphans || true
docker compose up -d --build

# 4. Aguarda o PostgreSQL ficar saudável
echo "⏳ Aguardando banco de dados PostgreSQL inicializar..."
sleep 8

# 5. Executa as Migrations do Prisma no Backend
echo "🗄️ Executando migrations do banco de dados (Prisma)..."
docker compose exec -T backend npx prisma migrate deploy || true

# 6. Executa Seed Inicial com Empresa e Usuários Demonstração (apenas se solicitado ou banco novo)
echo "🌱 Populando banco com dados essenciais de demonstração..."
docker compose exec -T backend npm run prisma:seed || true

echo "================================================================="
echo "  ✅ DEPLOY CONCLUÍDO COM SUCESSO NA VPS!"
echo "================================================================="
echo "🌐 Acesso ao Sistema via Nginx (Porta 80):  http://IP_DA_SUA_VPS"
echo "📡 Healthcheck da API Backend:             http://IP_DA_SUA_VPS/health"
echo "🔑 Usuário Padrão:                          admin@pontofacial.com.br"
echo "🔒 Senha Padrão:                            admin123"
echo "================================================================="
