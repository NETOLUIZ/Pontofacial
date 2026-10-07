import { describe, expect, it } from 'vitest';
import { routeForTab } from './route-map';

describe('rotas do portal RH', () => {
  it('mapeia cada seção administrativa para uma rota explícita', () => {
    expect(routeForTab('dashboard')).toBe('/dashboard');
    expect(routeForTab('funcionarios')).toBe('/funcionarios');
    expect(routeForTab('jornadas')).toBe('/jornadas');
    expect(routeForTab('dispositivos')).toBe('/dispositivos');
    expect(routeForTab('registros')).toBe('/registros');
    expect(routeForTab('relatorios')).toBe('/relatorios');
  });

  it('não transforma uma seção desconhecida em acesso administrativo', () => {
    expect(routeForTab('terminal')).toBe('/dashboard');
    expect(routeForTab('empresas')).toBe('/empresas');
  });
});
