const TAB_ROUTES: Record<string, string> = {
  dashboard: '/dashboard',
  funcionarios: '/funcionarios',
  jornadas: '/jornadas',
  dispositivos: '/dispositivos',
  registros: '/registros',
  relatorios: '/relatorios',
  empresas: '/empresas',
};

export function routeForTab(tab: string): string {
  return TAB_ROUTES[tab] || '/dashboard';
}
