import { describe, expect, it } from 'vitest';
import { ACCESS_COOKIE, REFRESH_COOKIE, getCookieOptions } from './auth.cookies';

describe('cookies de autenticação', () => {
  it('usa nomes separados e opções HttpOnly', () => {
    expect(ACCESS_COOKIE).toBe('ponto_access');
    expect(REFRESH_COOKIE).toBe('ponto_refresh');
    expect(getCookieOptions().httpOnly).toBe(true);
    expect(getCookieOptions().sameSite).toBe('lax');
  });
});
