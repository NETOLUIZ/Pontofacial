# Arquitetura Técnica — Controle de Ponto Facial

## 1. Visão de Domínio e Entidades

```
Empresa (Multi-Tenant Root)
  ├── Usuario (RBAC: SUPER_ADMIN, ADMIN_EMPRESA, RH, GESTOR, OPERADOR, TERMINAL)
  ├── Jornada (Horários previstos, flexibilidade e controle de intervalo)
  ├── Funcionario (Dados contratuais e biometria)
  ├── Dispositivo (Tablets e terminais registrados com UUID único)
  ├── RegistroPonto (Batidas auditadas com idempotency_key e hash de integridade)
  └── Auditoria (Trilha de modificações com IP e User-Agent)
```

## 2. Segurança e Controle de Acesso

- **Autenticação**: Tokens JWT assinados com algoritmo HMAC SHA-256 e tempo de vida de 8 horas. Refresh tokens com rotação automática válidos por 7 dias.
- **Isolamento de Tenants**: Impossibilidade de adulteração via `empresa_id` passado pelo cliente. O backend resolve a empresa pelo payload criptográfico do token.
- **Integridade de Batida**: O ponto armazena o momento exato em que ocorreu (`dataHora`), a origem (`ONLINE` ou `OFFLINE`) e o hash para comprovação perante auditoria de conformidade.

## 3. Estratégia de Deploy em VPS (Hostinger)

1. A VPS executa Docker e Docker Compose.
2. O Nginx atua como proxy reverso frontal nas portas 80/443 com certificado Let's Encrypt (Certbot).
3. O tráfego para `/api/*` é roteado internamente para o contêiner Node.js (`ponto_backend:3001`).
4. As páginas e recursos estáticos do frontend SPA são servidos pelo Nginx interno do contêiner (`ponto_frontend:80`).
5. PostgreSQL 16 utiliza um volume Docker persistente mapeado no host (`ponto_postgres_data`), garantindo que atualizações de contêiner não causem perda de dados.
