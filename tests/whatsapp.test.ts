import { describe, expect, it } from 'vitest';
import { construirLinkWhatsApp } from '../src/domain/whatsapp';

describe('construirLinkWhatsApp', () => {
  const link = construirLinkWhatsApp({
    telefone: '244923456789',
    nome: 'Ana Manuel',
    oficio: 'Reparação de computadores',
  });

  it('usa o número em formato internacional', () => {
    expect(link.startsWith('https://wa.me/244923456789?text=')).toBe(true);
  });

  it('identifica o SALU na mensagem', () => {
    const mensagem = decodeURIComponent(link.split('?text=')[1] ?? '');
    expect(mensagem).toContain('SALU');
    expect(mensagem).toContain('Ana Manuel');
    expect(mensagem).toContain('Reparação de computadores');
  });

  it('codifica caracteres especiais para não quebrar o URL', () => {
    expect(link).not.toContain(' ');
    expect(link).toContain('%C3%A7'); // ç
  });
});
