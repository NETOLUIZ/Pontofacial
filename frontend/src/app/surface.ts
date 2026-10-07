export type Surface = 'terminal' | 'rh' | 'unknown';

const RH_HOSTNAMES = new Set(['rh.ptfacial.korentech.com.br']);
const TERMINAL_HOSTNAMES = new Set([
  'ptfacial.korentech.com.br',
  'ptfacial.temnaarea.site',
  'localhost',
  '127.0.0.1',
]);

export function isRhSurface(hostname: string): boolean {
  return RH_HOSTNAMES.has(hostname.trim().toLowerCase());
}

export function resolveSurface(hostname: string): Surface {
  const normalizedHostname = hostname.trim().toLowerCase();

  if (RH_HOSTNAMES.has(normalizedHostname)) return 'rh';
  if (TERMINAL_HOSTNAMES.has(normalizedHostname)) return 'terminal';
  return 'unknown';
}
