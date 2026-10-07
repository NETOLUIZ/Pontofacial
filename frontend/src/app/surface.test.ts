import { describe, expect, it } from 'vitest';
import { isRhSurface, resolveSurface } from './surface';

describe('surface resolver', () => {
  it('opens the RH portal on the RH subdomain', () => {
    expect(resolveSurface('rh.ptfacial.korentech.com.br')).toBe('rh');
    expect(isRhSurface('rh.ptfacial.korentech.com.br')).toBe(true);
  });

  it('opens the terminal on the main domain', () => {
    expect(resolveSurface('ptfacial.korentech.com.br')).toBe('terminal');
    expect(resolveSurface('localhost')).toBe('terminal');
  });

  it('does not expose the RH portal on an unknown host', () => {
    expect(resolveSurface('admin.example.com')).toBe('unknown');
    expect(isRhSurface('admin.example.com')).toBe(false);
  });
});
