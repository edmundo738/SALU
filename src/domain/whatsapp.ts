/**
 * Ligação para o WhatsApp.
 *
 * Decisão de produto: o SALU não constrói chat próprio no MVP.
 * O WhatsApp já está instalado, funciona com dados mínimos e é onde as pessoas
 * já falam. Construir chat seria meses de trabalho para chegar a um sítio pior.
 *
 * O que o SALU acrescenta é a mensagem pré-preenchida: quem recebe sabe
 * imediatamente de onde veio o contacto. É a diferença entre «quem é você?»
 * e uma conversa que começa a meio caminho.
 */

const BASE = 'https://wa.me/';

export function construirLinkWhatsApp(opcoes: {
  telefone: string;
  nome: string;
  oficio: string;
}): string {
  const { telefone, nome, oficio } = opcoes;

  const mensagem =
    `Olá ${nome}, vi o seu perfil no SALU (${oficio}). ` +
    'Ainda está disponível para um trabalho?';

  return `${BASE}${telefone}?text=${encodeURIComponent(mensagem)}`;
}
