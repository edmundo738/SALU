import type { Perfil } from '../domain/types';

/**
 * Perfis de exemplo.
 *
 * ATENÇÃO — regra do projecto: nunca apresentar dados inventados como reais.
 *
 * Estes perfis existem apenas para a interface não aparecer vazia durante o
 * desenvolvimento. Têm `exemplo: true`, recebem o selo «Exemplo» na interface e
 * o botão de WhatsApp fica desactivado: não é possível contactar ninguém a
 * partir deles. O telefone é um espaço reservado e não pertence a uma pessoa.
 */
export function perfisDeExemplo(agora: string = new Date().toISOString()): Perfil[] {
  const base = { exemplo: true, disponivel: true, criadoEm: agora, telefone: '244900000000' };

  return [
    {
      ...base,
      id: 'exemplo-informatica',
      nome: 'Exemplo — Técnico de informática',
      municipio: 'Luanda',
      bairro: 'Maianga',
      categoria: 'informatica',
      oficio: 'Reparação de computadores e telemóveis',
      descricao:
        'Perfil de exemplo. Formatação, substituição de ecrãs e recuperação de dados. Atendo em casa do cliente ou no meu espaço.',
      precoTexto: 'A combinar',
    },
    {
      ...base,
      id: 'exemplo-electricidade',
      nome: 'Exemplo — Electricista',
      municipio: 'Talatona',
      bairro: 'Benfica',
      categoria: 'electricidade',
      oficio: 'Instalações e avarias eléctricas',
      descricao:
        'Perfil de exemplo. Quadros eléctricos, tomadas, iluminação e detecção de curto-circuitos em casa ou em pequenos negócios.',
      precoTexto: 'A combinar',
    },
    {
      ...base,
      id: 'exemplo-explicacoes',
      nome: 'Exemplo — Explicador de matemática',
      municipio: 'Belas',
      bairro: 'Kilamba',
      categoria: 'explicacoes',
      oficio: 'Explicações de matemática',
      descricao:
        'Perfil de exemplo. Aulas de matemática do 7.º ao 12.º ano, ao domicílio ou online. Preparação para exames.',
      precoTexto: 'A combinar',
    },
  ];
}
