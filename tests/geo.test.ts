import { describe, expect, it } from 'vitest';
import { getMunicipality, getProvince, isValidLocation, locationLabel } from '../shared/geo';

describe('divisão administrativa de Angola (2024)', () => {
  it('tem os 16 municípios de Luanda', () => {
    const luanda = getProvince('AO-LUA');
    expect(luanda?.municipalities).toHaveLength(16);
    const names = luanda?.municipalities.map((m) => m.name) ?? [];
    expect(names).toContain('Camama');
    expect(names).toContain('Mulenvos');
    expect(names).toContain('Kilamba');
    expect(names).toContain('Hoji ya Henda');
    expect(names).toContain('Kilamba Kiaxi');
  });

  it('não trata Camama como zona de Talatona', () => {
    expect(isValidLocation('AO-LUA', 'AO-LUA-CAMAMA', 'AO-LUA-CAMAMA-CAMAMA')).toBe(true);
    expect(isValidLocation('AO-LUA', 'AO-LUA-TALATONA', 'AO-LUA-CAMAMA-CAMAMA')).toBe(false);
  });

  it('tem Icolo e Bengo com os 7 municípios e Quiçama', () => {
    const icb = getProvince('AO-ICB');
    expect(icb?.municipalities).toHaveLength(7);
    expect(icb?.municipalities.map((m) => m.name)).toContain('Quiçama');
    expect(icb?.municipalities.map((m) => m.name)).toContain('Sequele');
    expect(getMunicipality('AO-ICB', 'AO-ICB-SEQUELE')?.communes.map((c) => c.name)).toContain('Sequele');
  });

  it('coloca Benfica em Talatona, não em Belas', () => {
    expect(getMunicipality('AO-LUA', 'AO-LUA-TALATONA')?.communes.map((c) => c.name)).toContain('Benfica');
    expect(getMunicipality('AO-LUA', 'AO-LUA-BELAS')?.communes.map((c) => c.name)).not.toContain('Benfica');
  });

  it('não coloca Zango dentro de Luanda', () => {
    const luanda = getProvince('AO-LUA');
    const names = luanda?.municipalities.flatMap((m) => [m.name, ...m.communes.map((c) => c.name)]) ?? [];
    expect(names).not.toContain('Zango');
  });

  it('produz uma etiqueta sem repetir o município', () => {
    expect(locationLabel('AO-LUA', 'AO-LUA-CAMAMA', 'AO-LUA-CAMAMA-CAMAMA')).toBe('Camama, Luanda');
    expect(locationLabel('AO-LUA', 'AO-LUA-TALATONA', 'AO-LUA-TALATONA-TALATONA')).toBe('Talatona, Luanda');
  });
});
