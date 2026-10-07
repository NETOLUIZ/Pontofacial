import { describe, expect, it } from 'vitest';
import { Perfil } from '@prisma/client';
import { tenantMiddleware } from './tenant.middleware';
import { rbacGuard } from './rbac.guard';

function response() {
  return { status: (code: number) => ({ json: (body: unknown) => ({ code, body }) }) } as any;
}

describe('isolamento e autorização', () => {
  it('mantém a empresa do usuário mesmo quando o cliente envia outro header', () => {
    const req = { user: { usuarioId: 'u1', empresaId: null, perfil: Perfil.SUPER_ADMIN, email: 'admin@test' }, headers: { 'x-empresa-id': 'empresa-alheia' } } as any;
    let nextCalled = false;
    tenantMiddleware(req, response(), () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(req.empresaId).toBeUndefined();
  });

  it('nega terminal em rotas administrativas', () => {
    const req = { user: { usuarioId: 't1', empresaId: 'empresa-1', perfil: Perfil.TERMINAL, email: 'terminal@test' } } as any;
    let nextCalled = false;
    rbacGuard([Perfil.RH])(req, response(), () => { nextCalled = true; });
    expect(nextCalled).toBe(false);
  });
});
