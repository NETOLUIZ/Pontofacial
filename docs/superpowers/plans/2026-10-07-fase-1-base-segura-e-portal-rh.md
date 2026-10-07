# Fase 1 — Base segura e portal RH Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separar o terminal facial do portal administrativo RH, estabilizar autenticação e isolamento multiempresa, e deixar a primeira entrega verificável em Docker sem simular sucesso em produção.

**Architecture:** Manter Express e Prisma nesta fase, introduzindo um resolvedor de superfície por hostname e rotas explícitas no frontend. O terminal será uma superfície enxuta e sem shell administrativo; o RH terá login, layout e guardas de acesso. A sessão administrativa migrará para cookie HttpOnly e o backend continuará como fonte de verdade para empresa e perfil.

**Tech Stack:** React, Vite, TypeScript, Express, Prisma, PostgreSQL, Docker Compose, Vitest ou ferramenta equivalente já compatível com o projeto, e Playwright somente para os fluxos críticos quando a infraestrutura de teste estiver disponível.

**Spec:** `docs/superpowers/specs/2026-10-07-fase-1-base-segura-e-portal-rh-design.md`

## Global Constraints

- Não resetar banco, remover volumes ou apagar dados existentes.
- Não publicar em produção, alterar DNS ou manipular dados reais nesta fase.
- Não declarar biometria real, LGPD ou REP-P como concluídos.
- Não usar `localStorage` para tokens administrativos.
- Não confiar em `empresaId` enviado pelo cliente para autorização.
- Não deixar mocks de autenticação ou sucesso no fluxo de produção.
- O domínio principal abre o terminal; `rh.ptfacial.korentech.com.br` abre o login RH.
- O terminal não exibe menu administrativo, dashboard, lista de funcionários, CPF ou login na espera.
- Toda alteração deve manter build, Docker Compose e migrações existentes válidos.

## Review Focus

- Hostname desconhecido ou subdomínio não configurado deve cair em uma superfície segura, nunca em portal administrativo.
- Cookie ausente, expirado ou inválido deve limpar o estado de sessão e retornar ao login sem mostrar dados antigos.
- Usuário de uma empresa tentando usar IDs de outra empresa deve receber negativa do backend.
- Terminal sem câmera/API deve mostrar contingência assistida e nunca uma confirmação de ponto fictícia.
- Erros de API, respostas incompletas e timeout não podem deixar a interface presa em estado autenticado ou de sucesso.

### Task 1: Baseline e contratos de superfície

**Files:**
- Create: `frontend/src/app/surface.ts`
- Create: `frontend/src/app/surface.test.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`
- Test: `frontend/src/app/surface.test.ts`

**Interfaces:**
- Produces `Surface = 'terminal' | 'rh' | 'unknown'`.
- Produces `resolveSurface(hostname: string): Surface`.
- Produces `isRhSurface(hostname: string): boolean`.

- [ ] **Step 1: Write failing hostname tests** for the main domain, RH subdomain, known aliases and unknown host.
- [ ] **Step 2: Run the focused test** and verify it fails because the resolver does not exist.
- [ ] **Step 3: Implement the pure hostname resolver** with exact matching for `rh.ptfacial.korentech.com.br` and safe fallback for unknown hosts.
- [ ] **Step 4: Update `App.tsx`** so the terminal surface does not import/render the administrative shell and the RH surface starts at the login flow.
- [ ] **Step 5: Run frontend typecheck and focused tests.**
- [ ] **Step 6: Commit** `feat: separate terminal and RH surfaces`.

### Task 2: Rotas e guardas do portal RH

**Files:**
- Create: `frontend/src/app/router.tsx`
- Create: `frontend/src/app/RequireAuth.tsx`
- Create: `frontend/src/app/RequirePermission.tsx`
- Create: `frontend/src/pages/NotFound.tsx`
- Modify: `frontend/package.json`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`
- Test: `frontend/src/app/router.test.tsx`

**Interfaces:**
- `RequireAuth` renders children only for an authenticated user; otherwise it renders login.
- `RequirePermission` accepts `allowedProfiles: Perfil[]` and denies unauthorized profiles.
- Routes include `/login`, `/dashboard`, `/funcionarios`, `/jornadas`, `/dispositivos`, `/registros`, `/relatorios` and a not-found route.

- [ ] **Step 1: Add the router dependency only if absent** and update the lockfile.
- [ ] **Step 2: Write failing tests** for unauthenticated redirect, RH route access, unauthorized profile and not-found rendering.
- [ ] **Step 3: Implement route configuration and guards** without putting authorization decisions only in the client.
- [ ] **Step 4: Keep terminal rendering outside the RH router** and ensure direct RH entry goes to `/login`.
- [ ] **Step 5: Run focused route tests and typecheck.**
- [ ] **Step 6: Commit** `feat: add RH routes and authorization guards`.

### Task 3: Sessão administrativa segura

**Files:**
- Modify: `backend/src/modules/auth/auth.controller.ts`
- Modify: `backend/src/modules/auth/auth.service.ts`
- Modify: `backend/src/middlewares/auth.middleware.ts`
- Modify: `backend/src/app.ts`
- Modify: `frontend/src/context/AuthContext.tsx`
- Modify: `frontend/src/services/api.ts`
- Create: `backend/src/modules/auth/auth.service.test.ts`
- Create: `backend/src/middlewares/auth.middleware.test.ts`

**Interfaces:**
- Login sets a HttpOnly, Secure, SameSite-compatible session cookie and returns safe user metadata without an administrative token.
- `POST /api/auth/logout` revokes or clears the session.
- `GET /api/auth/me` returns the authenticated user and company scope.
- Auth middleware attaches a validated user/session to the request.

- [ ] **Step 1: Inspect current JWT flow and write failing tests** for login cookie, logout, invalid session and safe response fields.
- [ ] **Step 2: Implement server-side session behavior** using the existing persistence strategy or a minimal Prisma-backed session model; do not add Redis dependence without a demonstrated need.
- [ ] **Step 3: Update frontend auth state** to bootstrap from `/api/auth/me`, remove demo login fallback, and stop writing admin tokens to `localStorage`.
- [ ] **Step 4: Update API client** to send credentials and handle 401 without retaining stale user state.
- [ ] **Step 5: Run auth tests, backend build and frontend typecheck.**
- [ ] **Step 6: Commit** `feat: secure administrative session`.

### Task 4: Isolamento multiempresa e autorização de recursos

**Files:**
- Modify: `backend/src/middlewares/tenant.middleware.ts`
- Modify: `backend/src/middlewares/rbac.guard.ts`
- Modify: `backend/src/modules/funcionarios/funcionarios.service.ts`
- Modify: `backend/src/modules/ponto/ponto.service.ts`
- Modify: `backend/src/modules/empresas/empresas.service.ts`
- Modify: `backend/src/modules/dispositivos/dispositivos.service.ts`
- Create: `backend/src/security/authorization.test.ts`

**Interfaces:**
- Services receive `empresaId` only from authenticated request context.
- Resource lookup always scopes by both resource ID and `empresaId`.
- Permission denials use consistent HTTP status and error payload.

- [ ] **Step 1: Write failing cross-company tests** for employees, records, devices and company resources.
- [ ] **Step 2: Remove client-supplied company scope** from service inputs and controller trust boundaries.
- [ ] **Step 3: Apply resource-scoped queries and profile checks** to all administrative modules.
- [ ] **Step 4: Add tests for terminal profile restrictions** and for RH/manager scope.
- [ ] **Step 5: Run the authorization suite and backend build.**
- [ ] **Step 6: Commit** `fix: enforce company-scoped authorization`.

### Task 5: Terminal enxuto e confirmação confiável

**Files:**
- Modify: `frontend/src/pages/Terminal.tsx`
- Create: `frontend/src/components/terminal/TerminalCapture.tsx`
- Create: `frontend/src/components/terminal/TerminalFeedback.tsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/services/faceRecognition.ts`
- Create: `frontend/src/components/terminal/TerminalCapture.test.tsx`

**Interfaces:**
- Terminal waiting state renders date, camera image and oval framing guide.
- Feedback state renders first name, date, time and “Ponto registrado” for about three seconds only after durable server confirmation.
- Camera/API failures render assistive text and never success.

- [ ] **Step 1: Write failing component tests** for waiting, recognized, failure and reset states.
- [ ] **Step 2: Extract terminal capture and feedback responsibilities** from `Terminal.tsx` without changing the backend contract.
- [ ] **Step 3: Remove administrative list and extra controls from the terminal waiting state.**
- [ ] **Step 4: Replace green-only status communication** with text, icons and accessible state labels using the existing light/blue visual direction.
- [ ] **Step 5: Ensure capture is armed only after the previous person leaves the frame** and does not auto-register background faces; keep facial engine limitations explicit.
- [ ] **Step 6: Run frontend tests and build.**
- [ ] **Step 7: Commit** `refactor: simplify terminal capture surface`.

### Task 6: Proxy, documentation e verificação integrada

**Files:**
- Modify: `nginx/nginx.conf`
- Modify: `nginx/vps-host-ptfacial.conf`
- Modify: `docker-compose.yml`
- Modify: `README.md`
- Modify: `docs/ARQUITETURA.md`
- Create: `tests/smoke/hostname-surfaces.spec.ts`

**Interfaces:**
- Proxy accepts the RH wildcard without changing unrelated virtual hosts.
- Smoke test verifies main-domain terminal and RH-domain login behavior using host overrides in a test environment.

- [ ] **Step 1: Write the smoke test** for both hostnames and expected initial surfaces.
- [ ] **Step 2: Update proxy configuration** only where needed for the RH hostname and SPA fallback.
- [ ] **Step 3: Add explicit development seed/configuration** for local users without enabling demo authentication in production.
- [ ] **Step 4: Document local setup, profiles, domain mapping, current biometric limitation and operational prerequisites.**
- [ ] **Step 5: Run frontend and backend builds, tests, `docker compose config`, and the smoke test where Docker/browser dependencies are available.**
- [ ] **Step 6: Commit** `docs: document phase one operation and verification`.

### Task 7: Final verification and handoff

**Files:**
- No product code changes expected unless verification finds a defect.

- [ ] **Step 1: Run the full available test suite and record exact output.**
- [ ] **Step 2: Run dependency and secret scans available in the repository; report unavailable tools rather than inventing results.**
- [ ] **Step 3: Review the diff for accidental `.env`, tokens, biometric templates or generated artifacts.**
- [ ] **Step 4: Verify `git status`, commit history and Docker configuration.**
- [ ] **Step 5: Produce a handoff listing completed behavior, evidence, limitations and the next phase.**

