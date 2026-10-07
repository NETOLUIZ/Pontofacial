import { CookieOptions } from 'express';
import { env } from '../../config/env';

export const ACCESS_COOKIE = 'ponto_access';
export const REFRESH_COOKIE = 'ponto_refresh';

export function getCookieOptions(): CookieOptions {
  return { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', domain: env.NODE_ENV === 'production' ? '.ptfacial.korentech.com.br' : undefined, path: '/' };
}

export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  const entry = cookieHeader?.split(';').map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}
