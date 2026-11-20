/**
 * Números móveis angolanos.
 *
 * Formato nacional: 9 dígitos começados por 9 (ex.: 923 456 789).
 * Formato internacional: 244 + 9 dígitos (ex.: 244923456789).
 *
 * Aceitamos o que as pessoas escrevem na realidade — com espaços, com +244,
 * com 00244, com um 0 à frente — e normalizamos para o formato de armazenamento.
 * O que não for inequivocamente um móvel angolano é rejeitado, porque um número
 * errado significa um contacto que nunca chega a ninguém.
 */

const PREFIXO_PAIS = '244';

export function normalizarTelefone(entrada: string): string | null {
  if (typeof entrada !== 'string') return null;

  const digitos = entrada.replace(/[^\d]/g, '');
  if (digitos.length === 0) return null;

  let nacional = digitos;

  if (nacional.startsWith('00244')) {
    nacional = nacional.slice(5);
  } else if (nacional.startsWith(PREFIXO_PAIS)) {
    nacional = nacional.slice(PREFIXO_PAIS.length);
  }

  // Um único 0 à frente é hábito nacional de marcação.
  if (nacional.length === 10 && nacional.startsWith('0')) {
    nacional = nacional.slice(1);
  }

  if (nacional.length !== 9) return null;
  if (!nacional.startsWith('9')) return null;

  return PREFIXO_PAIS + nacional;
}

/** 244923456789 → «923 456 789» */
export function formatarTelefone(telefone: string): string {
  const nacional = telefone.startsWith(PREFIXO_PAIS)
    ? telefone.slice(PREFIXO_PAIS.length)
    : telefone;

  if (nacional.length !== 9) return telefone;

  return `${nacional.slice(0, 3)} ${nacional.slice(3, 6)} ${nacional.slice(6)}`;
}

export function telefoneValido(telefone: string): boolean {
  return normalizarTelefone(telefone) === telefone;
}
