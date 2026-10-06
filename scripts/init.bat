@echo off
echo ===================================================
echo Inicializando Controle de Ponto Facial via Docker
echo ===================================================

if not exist .env (
    echo Criando arquivo .env a partir de .env.example...
    copy .env.example .env
)

echo Subindo os servicos (PostgreSQL, Redis, Backend, Frontend, Nginx)...
docker compose up -d --build

echo Aguardando o banco de dados inicializar...
timeout /t 5 /nobreak > nul

echo Executando migracoes do Prisma e Seed de dados...
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed

echo ===================================================
echo Sistema inicializado com sucesso!
echo Painel Web: http://localhost:3000
echo Proxy Nginx: http://localhost:80
echo API Backend: http://localhost:3001/health
echo ===================================================
pause
