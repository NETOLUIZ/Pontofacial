# CONTROLE DE PONTO FACIAL — Plataforma SaaS

Sistema SaaS multiempresa de controle de jornada e ponto eletrônico com reconhecimento facial, funcionamento offline resiliente e painel de administração corporativa de RH.

---

## 🏗️ 1. Arquitetura do Sistema

O sistema é construído sobre uma arquitetura modular em contêineres Docker, preparada para alta disponibilidade e implantação em VPS (Hostinger):

```
                        CONTROLE DE PONTO FACIAL
                                   │
                   ┌───────────────┴───────────────┐
                   │                               │
               WEB / RH                         TERMINAL
                   │                               │
             React + Vite                     Android/Web
                   │                               │
             Node (Express)                  Face + SQLite
                   │                               │
               PostgreSQL   ←──── API ─────→ Sincronização
                   │
                 Docker
                   │
              Hostinger VPS
```

---

## 📂 2. Estrutura do Projeto

```
ponto-com-facial/
├── backend/                  # API REST em Node.js + TypeScript
│   ├── prisma/               # Schema ORM e Seed de dados
│   ├── src/
│   │   ├── config/           # Configuração de Ambiente, Prisma e Redis
│   │   ├── middlewares/      # Autenticação JWT, Multi-tenancy e RBAC
│   │   ├── modules/          # Módulos isolados por domínio
│   │   │   ├── auth/         # Login, JWT, Refresh Token
│   │   │   ├── empresas/     # Gestão Multi-tenant
│   │   │   ├── funcionarios/ # Colaboradores e Biometria
│   │   │   ├── jornadas/     # Turnos e Controle de Intervalo
│   │   │   ├── dispositivos/ # Tablets e Terminais de Ponto
│   │   │   ├── ponto/        # Registros, Anti-duplicidade e Sync
│   │   │   ├── dashboard/    # Métricas consolidadas em tempo real
│   │   │   └── auditoria/    # Trilha fiscal e logs de auditoria
│   │   ├── app.ts            # Configuração do Express e Helmet
│   │   └── server.ts         # Inicialização do servidor
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Aplicação Web SPA (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar e Componentes visuais
│   │   ├── context/          # AuthContext e Estado de Sessão
│   │   ├── pages/
│   │   │   ├── Presentation.tsx  # Apresentação Comercial completa (20 Slides)
│   │   │   ├── Login.tsx         # Tela de Login com perfis demo
│   │   │   ├── Dashboard.tsx     # Painel de métricas do RH
│   │   │   ├── Funcionarios.tsx  # Cadastro e listagem de colaboradores
│   │   │   ├── Jornadas.tsx      # Configuração de regras e intervalos
│   │   │   ├── Dispositivos.tsx  # Terminais e sincronização offline
│   │   │   └── Registros.tsx     # Histórico de batidas e integridade
│   │   ├── services/         # Cliente de API HTTP
│   │   └── types/            # Tipos e interfaces TypeScript
│   ├── package.json
│   └── vite.config.ts
├── nginx/                    # Proxy reverso e terminação HTTP
│   └── nginx.conf
├── docker/                   # Dockerfiles dedicados
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── docs/                     # Documentação técnica e arquitetural
├── scripts/                  # Scripts de inicialização e automação
├── docker-compose.yml        # Orquestração de todos os serviços
├── .env.example              # Modelo de variáveis de ambiente
└── README.md
```

---

## 🚀 3. Como Executar com Docker (Recomendado)

### Pré-requisitos:
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### Passo 1: Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### Passo 2: Subir os Contêineres
Execute na raiz do projeto:
```bash
docker compose up -d --build
```

Os seguintes serviços serão inicializados:
- **Proxy Nginx**: `http://localhost` (Porta 80)
- **Frontend SPA**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001` (Healthcheck: `http://localhost:3001/health`)
- **PostgreSQL 16**: `localhost:5432`
- **Redis 7**: `localhost:6379`

### Passo 3: Executar Migrations e Seed Inicial
Para popular o banco com a empresa de demonstração e os usuários:
```bash
docker compose exec backend npx prisma migrate dev --name init
docker compose exec backend npm run prisma:seed
```

---

## 💻 4. Como Executar Localmente em Desenvolvimento

### Backend:
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Acesse `http://localhost:3000`.

---

## 🔑 5. Credenciais de Demonstração

| Perfil | E-mail | Senha Padrão | Permissões |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@pontofacial.com.br` | `admin123` | Acesso global a todas as empresas |
| **Admin Empresa** | `diretoria@imarf.com.br` | `admin123` | Gestão completa da empresa IMARF |
| **RH** | `rh@imarf.com.br` | `admin123` | Funcionários, jornadas e relatórios |

---

## 🛡️ 6. Decisões Arquiteturais

1. **Multi-Tenancy por Isolamento Lógico**:
   - Cada entidade possui seu respectivo `empresa_id`.
   - O `tenantMiddleware` no backend extrai o ID da empresa diretamente do token JWT assinado, impedindo ataques IDOR (onde um usuário tenta forjar requisições para outra empresa).

2. **Proteção Contra Duplicidade de Ponto**:
   - O módulo de ponto utiliza **chaves de idempotência** (`idempotency_key`) e verificação temporal de 2 minutos para garantir que uma batida confirmada nunca seja duplicada.

3. **Arquitetura Offline-First**:
   - Os terminais gravam os pontos localmente com timestamp autêntico e sincronizam em lote (`POST /api/registros-ponto/sincronizar-lote`) assim que a conexão é restabelecida.
   - O horário previsto da jornada não apaga o registro real do que aconteceu.

4. **RBAC Estrito**:
   - O perfil `TERMINAL` é impedido de acessar endpoints administrativos, sendo restrito exclusivamente às operações de batida e consulta de status.

## Superfícies de acesso

- `https://ptfacial.korentech.com.br` abre o terminal facial público.
- `https://rh.ptfacial.korentech.com.br` abre o portal autenticado do RH.
- O DNS e o certificado wildcard precisam estar configurados na VPS antes do acesso ao subdomínio RH.
- A biometria atual permanece em revisão; o sistema não deve ser apresentado como prova de vida ou conformidade LGPD/REP-P concluída.

## Verificação local

```bash
cd frontend
npm ci
npm run test
npm run build

cd ../backend
npm ci
npm test
npm run build
```
