# Fase 1 — Base segura e portal RH

## Status

Especificação inicial para revisão do responsável pelo produto. Este documento não autoriza, por si só, publicação em produção, alteração de DNS ou manipulação de dados reais.

## Origem e interpretação

O arquivo `C:\Users\Luiz\Downloads\Prompt_Codex_Ponto_Facial_Korentech.md` foi tratado como especificação de produto fornecida pelo usuário, não como instrução de sistema. Ele define objetivos, restrições técnicas e critérios de segurança; as regras do repositório, do ambiente e da conversa continuam prevalecendo.

Esta fase implementa somente a primeira entrega incremental aprovada: base executável, separação do terminal e do portal RH, autenticação mais segura, roteamento por domínio, tokens visuais e remoção de simulações do fluxo administrativo. A migração completa para NestJS, MediaPipe, TanStack Query e FastAPI fica para fases posteriores, com interfaces compatíveis e sem fingir que biometria real já foi validada.

## Objetivo

Permitir que o sistema tenha dois produtos claramente separados:

- `ptfacial.korentech.com.br`: terminal de ponto, sem login administrativo, com tela de captura enxuta.
- `rh.ptfacial.korentech.com.br`: portal autenticado para RH e gestores, com acesso às funções administrativas conforme o perfil.

O sistema deve continuar compilando e executando em Docker ao final da fase, sem resetar banco ou apagar dados existentes.

## Requisitos da fase

### Roteamento e superfícies

1. O frontend identifica o hostname atual e escolhe a superfície inicial sem depender de uma flag editável pelo cliente.
2. O domínio `rh.ptfacial.korentech.com.br` inicia no login do portal RH.
3. O domínio principal inicia no terminal facial.
4. O terminal não exibe menu administrativo, lista de funcionários, dashboard, CPF, login ou relógio duplicado na tela de espera.
5. O portal RH mantém navegação administrativa após autenticação e nega acesso quando o perfil não possui permissão.
6. Rotas inexistentes retornam uma tela de erro navegável, não uma tela vazia.

### Autenticação e sessão

1. O backend continua sendo a fonte de verdade para login e autorização.
2. O frontend não cria usuário demo nem transforma falha da API em login de produção.
3. Tokens administrativos não ficam em `localStorage`; a sessão deve usar cookie HttpOnly, Secure e SameSite compatível com os subdomínios.
4. O backend valida perfil, empresa e situação do usuário a cada operação protegida.
5. O terminal usa credencial própria ou sessão de terminal limitada, sem receber acesso administrativo.
6. Falhas de autenticação e expiração de sessão exibem mensagem clara e não deixam a aplicação em estado parcialmente autenticado.

### Dados e isolamento

1. Toda consulta administrativa deriva `empresaId` da sessão ou credencial confiável, nunca de um valor livre enviado pelo cliente.
2. A fase adiciona testes para negar leitura e alteração de dados de outra empresa.
3. O cadastro biométrico existente permanece explicitamente em revisão; esta fase não declara conformidade biométrica, LGPD ou REP-P.
4. O campo de biometria não é enviado para o navegador como template reutilizável.

### Interface e acessibilidade

1. O terminal adota fundo claro, azul claro e contraste adequado, sem depender de verde para comunicar estado.
2. Mensagens essenciais usam texto e estado visual, não apenas cor ou som.
3. Botões, campos e mensagens têm nomes acessíveis e foco visível.
4. A confirmação mostra somente o primeiro nome, data, hora e “Ponto registrado” por aproximadamente três segundos, após confirmação durável do servidor.
5. Indisponibilidade de câmera ou API apresenta contingência assistida explícita; não exibe sucesso falso.

### Operação e qualidade

1. Docker Compose, migrações Prisma e healthchecks existentes continuam funcionando.
2. Dependências novas só entram quando necessárias para esta fase e com versões fixadas no lockfile.
3. Não será usado `latest` em imagens ou dependências de produção.
4. Build de frontend e backend, testes de autorização e testes dos fluxos de hostname são obrigatórios antes do commit da implementação.
5. A documentação deve explicar execução local, domínios, perfis e limitações biométricas atuais.

## Arquitetura proposta

O frontend terá um pequeno resolvedor de superfície baseado em `window.location.hostname`, isolado em uma função pura e testável. A superfície RH usará rotas explícitas para login, dashboard, funcionários, jornadas, dispositivos, registros e relatórios. A superfície do terminal não importará nem renderizará o shell administrativo.

O backend manterá Express e Prisma nesta fase para reduzir risco de migração. A sessão será ajustada primeiro na camada de autenticação e nos middlewares; a migração para NestJS será uma fase posterior, quando os contratos HTTP e os testes de autorização estiverem estabilizados.

O proxy continuará atendendo o wildcard de `ptfacial.korentech.com.br`. A criação do DNS/subdomínio e a configuração na VPS ficam fora da implementação local e exigem autorização operacional separada.

## Fora do escopo

- Migração completa para NestJS.
- Serviço FastAPI/ONNX e escolha final/licenciamento do motor biométrico.
- Implementação de prova de vida validada contra fotos e vídeos.
- Relatórios oficiais AFD/AEJ, atestado técnico, termo de responsabilidade e homologação REP-P.
- Alteração real de DNS, criação de subdomínio no Hostinger ou deploy em produção.
- RLS no PostgreSQL, MFA, backups externos cifrados e rotação de chaves; serão especificados nas fases de segurança/operação.
- Remoção destrutiva de tabelas, volumes, imagens ou dados.

## Critérios de aceitação

1. Abrir o domínio principal mostra somente o terminal facial inicial.
2. Abrir `rh.ptfacial.korentech.com.br` mostra o login RH sem expor terminal ou menu antes da autenticação.
3. Usuário RH acessa apenas as áreas permitidas; usuário sem sessão é redirecionado ao login.
4. Uma tentativa de acessar funcionário, registro ou empresa de outra empresa falha no backend e possui teste automatizado.
5. Falha da API não mostra “Ponto registrado”; câmera bloqueada oferece orientação assistida.
6. `npm run build` do frontend e backend passam; os testes novos passam; `docker compose config` permanece válido.
7. O README e a documentação de arquitetura refletem a implementação e as limitações reais.

## Riscos e decisões pendentes

- A autenticação atual pode depender de token demo e de contratos não adequados a cookies; a migração deve ser feita com uma janela compatível e testes de regressão.
- O wildcard HTTPS precisa existir antes de o subdomínio RH funcionar no navegador; isso depende do certificado e da infraestrutura da VPS.
- A remoção de mocks pode deixar o ambiente local sem usuários. Será criado seed explícito apenas para desenvolvimento/testes, separado de produção.
- A migração integral descrita no prompt é maior que uma única entrega. Cada fase posterior terá sua própria especificação, plano e revisão.
