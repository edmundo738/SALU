import { describe, expect, it } from 'vitest';
import { competenciasDeTexto, perfilVazio, validarPerfil } from '../src/domain/validacao';
import type { PerfilEntrada } from '../src/domain/types';

function perfilValido(alteracoes: Partial<PerfilEntrada> = {}): PerfilEntrada {
  return {
    ...perfilVazio(),
    nome: 'Ana Manuel',
    telefone: '923 456 789',
    bairro: 'Maianga',
    oficio: 'Reparação de computadores',
    descricao: 'Reparo computadores e telemóveis em casa do cliente, com garantia de 30 dias.',
    ...alteracoes,
  };
}

describe('competenciasDeTexto', () => {
  it('separa por vírgula, limpa e remove repetidas sem olhar a maiúsculas', () => {
    expect(competenciasDeTexto('frigoríficos, arcas,  Máquinas de lavar ,FRIGORÍFICOS,')).toEqual([
      'frigoríficos',
      'arcas',
      'Máquinas de lavar',
    ]);
  });

  it('corta a oito', () => {
    expect(competenciasDeTexto('a,b,c,d,e,f,g,h,i,j')).toHaveLength(8);
  });

  it('texto vazio dá lista vazia', () => {
    expect(competenciasDeTexto('   ')).toEqual([]);
  });
});

describe('validarPerfil', () => {
  it('aceita um perfil completo', () => {
    const resultado = validarPerfil(perfilValido());
    expect(resultado.valido).toBe(true);
    expect(resultado.erros).toEqual({});
  });

  it('normaliza o telefone e limpa espaços', () => {
    const resultado = validarPerfil(
      perfilValido({ nome: '  Ana   Manuel  ', telefone: '+244 923 456 789' }),
    );
    expect(resultado.valor.nome).toBe('Ana Manuel');
    expect(resultado.valor.telefone).toBe('244923456789');
  });

  it('rejeita nome demasiado curto', () => {
    const resultado = validarPerfil(perfilValido({ nome: 'A' }));
    expect(resultado.valido).toBe(false);
    expect(resultado.erros.nome).toBeDefined();
  });

  it('rejeita telefone inválido', () => {
    const resultado = validarPerfil(perfilValido({ telefone: '999' }));
    expect(resultado.valido).toBe(false);
    expect(resultado.erros.telefone).toBeDefined();
  });

  it('rejeita descrição curta', () => {
    const resultado = validarPerfil(perfilValido({ descricao: 'Faço tudo' }));
    expect(resultado.valido).toBe(false);
    expect(resultado.erros.descricao).toBeDefined();
  });

  it('rejeita descrição acima do limite', () => {
    const resultado = validarPerfil(perfilValido({ descricao: 'a'.repeat(401) }));
    expect(resultado.valido).toBe(false);
    expect(resultado.erros.descricao).toBeDefined();
  });

  it('rejeita categoria desconhecida', () => {
    const resultado = validarPerfil(
      perfilValido({ categoria: 'astronauta' as PerfilEntrada['categoria'] }),
    );
    expect(resultado.valido).toBe(false);
    expect(resultado.erros.categoria).toBeDefined();
  });

  it('rejeita município desconhecido', () => {
    const resultado = validarPerfil(
      perfilValido({ municipio: 'Lisboa' as PerfilEntrada['municipio'] }),
    );
    expect(resultado.valido).toBe(false);
    expect(resultado.erros.municipio).toBeDefined();
  });

  it('reúne todos os erros de uma vez, em vez de parar no primeiro', () => {
    const resultado = validarPerfil({ ...perfilVazio() });
    expect(resultado.valido).toBe(false);
    expect(Object.keys(resultado.erros).length).toBeGreaterThanOrEqual(4);
  });
});
