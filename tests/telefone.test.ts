import { describe, expect, it } from 'vitest';
import { formatarTelefone, normalizarTelefone } from '../src/domain/telefone';

describe('normalizarTelefone', () => {
  it.each([
    ['923456789', '244923456789'],
    ['923 456 789', '244923456789'],
    ['+244 923 456 789', '244923456789'],
    ['244923456789', '244923456789'],
    ['00244923456789', '244923456789'],
    ['0923456789', '244923456789'],
  ])('aceita %s e devolve %s', (entrada, esperado) => {
    expect(normalizarTelefone(entrada)).toBe(esperado);
  });

  it('rejeita números que não são móveis angolanos', () => {
    expect(normalizarTelefone('')).toBeNull();
    expect(normalizarTelefone('12345')).toBeNull();
    expect(normalizarTelefone('823456789')).toBeNull(); // não começa por 9
    expect(normalizarTelefone('92345678')).toBeNull(); // 8 dígitos
    expect(normalizarTelefone('9234567890')).toBeNull(); // 10 dígitos
  });

  it('não confunde texto com número', () => {
    expect(normalizarTelefone('sem número')).toBeNull();
  });
});

describe('formatarTelefone', () => {
  it('apresenta em grupos de três', () => {
    expect(formatarTelefone('244923456789')).toBe('923 456 789');
  });

  it('devolve o valor original se não reconhecer o formato', () => {
    expect(formatarTelefone('244')).toBe('244');
  });
});
