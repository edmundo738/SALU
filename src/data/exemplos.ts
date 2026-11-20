import type { Pedido, Perfil } from '../domain/types';

/**
 * Dados de demonstração.
 *
 * REGRA DO PROJECTO: nunca apresentar dados inventados como reais.
 *
 * Tudo aqui tem `exemplo: true`. Na interface isso significa três coisas
 * visíveis: um selo «Exemplo», um aviso na página de detalhe e o botão de
 * contacto desactivado. O telefone é um espaço reservado (`244900000000`) que
 * não pertence a ninguém — e, como o contacto está desactivado, nunca é marcado.
 *
 * O objectivo é o visitante perceber o produto num ecrã, não confundir isto com
 * uma comunidade activa.
 */

const TELEFONE_RESERVADO = '244900000000';

export function perfisDeExemplo(agora: string = new Date().toISOString()): Perfil[] {
  const base = {
    exemplo: true,
    disponivel: true,
    criadoEm: agora,
    telefone: TELEFONE_RESERVADO,
    fotoUrl: null,
  };

  return [
    {
      ...base,
      id: 'exemplo-reparacoes',
      nome: 'António Kiala',
      municipio: 'Cazenga',
      bairro: 'Tala Hady',
      categoria: 'reparacoes',
      oficio: 'Reparação de electrodomésticos',
      descricao:
        'Reparo máquinas de lavar, frigoríficos e fogões. Diagnóstico em casa do cliente e orçamento antes de começar. Trabalho com peças originais quando existem.',
      precoTexto: 'A combinar',
    },
    {
      ...base,
      id: 'exemplo-electricidade',
      nome: 'Neusa Domingos',
      municipio: 'Viana',
      bairro: 'Zango 3',
      categoria: 'electricidade',
      oficio: 'Electricista',
      descricao:
        'Instalações eléctricas em casas e pequenos negócios. Quadros, tomadas, iluminação e detecção de curto-circuitos. Dez anos a trabalhar em Viana e Cacuaco.',
      precoTexto: 'A combinar',
    },
    {
      ...base,
      id: 'exemplo-canalizacao',
      nome: 'Paulo Miguel',
      municipio: 'Luanda',
      bairro: 'Maianga',
      categoria: 'canalizacao',
      oficio: 'Canalizador',
      descricao:
        'Fugas de água, torneiras, autoclismos e sanitários. Atendo no mesmo dia em casos urgentes. Material próprio e limpeza do local no fim.',
      precoTexto: 'A combinar',
    },
    {
      ...base,
      id: 'exemplo-design',
      nome: 'Joana Baptista',
      municipio: 'Talatona',
      bairro: 'Benfica',
      categoria: 'design',
      oficio: 'Designer gráfica',
      descricao:
        'Logotipos, cartazes e conteúdos para redes sociais. Trabalho à distância com qualquer ponto do país. Entrego ficheiros prontos para impressão e para o Instagram.',
      precoTexto: 'A combinar',
    },
    {
      ...base,
      id: 'exemplo-tecnologia',
      nome: 'Kiala Neto',
      municipio: 'Belas',
      bairro: 'Kilamba',
      categoria: 'tecnologia',
      oficio: 'Técnico de informática',
      descricao:
        'Formatação, substituição de ecrãs, recuperação de dados e montagem de redes em casa ou em escritório. Também dou apoio remoto por WhatsApp.',
      precoTexto: 'A combinar',
    },
    {
      ...base,
      id: 'exemplo-explicacoes',
      nome: 'Teresa Francisco',
      municipio: 'Cacuaco',
      bairro: 'Sequele',
      categoria: 'explicacoes',
      oficio: 'Explicadora de matemática',
      descricao:
        'Aulas de matemática do 7.º ao 12.º ano, ao domicílio ou online. Preparação para exames e recuperação de disciplinas. Turmas pequenas ou aulas individuais.',
      precoTexto: 'A combinar',
    },
    {
      ...base,
      id: 'exemplo-entregas',
      nome: 'Domingos Severino',
      municipio: 'Luanda',
      bairro: 'Rangel',
      categoria: 'entregas',
      oficio: 'Entregas e mandados',
      descricao:
        'Entregas dentro de Luanda com mota própria. Documentos, encomendas e compras por conta de outrem. Disponibilidade de segunda a sábado.',
      precoTexto: 'A combinar',
    },
    {
      ...base,
      id: 'exemplo-cozinha',
      nome: 'Rosa Chilombo',
      municipio: 'Belas',
      bairro: 'Kilamba',
      categoria: 'cozinha',
      oficio: 'Bolos e refeições por encomenda',
      descricao:
        'Bolos de aniversário, salgados e refeições para eventos pequenos. Encomendas com dois dias de antecedência. Entrego em Kilamba e Talatona.',
      precoTexto: 'A combinar',
    },
  ];
}

export function pedidosDeExemplo(agora: string = new Date().toISOString()): Pedido[] {
  const base = {
    exemplo: true,
    estado: 'aberto' as const,
    criadoEm: agora,
    autorTelefone: TELEFONE_RESERVADO,
    fotoUrl: null,
  };

  return [
    {
      ...base,
      id: 'exemplo-pedido-frigorifico',
      autorNome: 'Cliente de exemplo',
      titulo: 'O frigorífico deixou de refrigerar',
      categoria: 'reparacoes',
      municipio: 'Luanda',
      bairro: 'Maianga',
      descricao:
        'O frigorífico liga, faz barulho, mas não arrefece nada desde ontem. Já tentei desligar e voltar a ligar. Preciso de alguém que possa vir ver esta semana.',
    },
    {
      ...base,
      id: 'exemplo-pedido-logotipo',
      autorNome: 'Cliente de exemplo',
      titulo: 'Logotipo para uma loja de roupa',
      categoria: 'design',
      municipio: 'Talatona',
      bairro: 'Benfica',
      descricao:
        'Estou a abrir uma loja de roupa e preciso de um logotipo simples, que funcione bem no Instagram e na fachada. Tenho referências para mostrar.',
    },
    {
      ...base,
      id: 'exemplo-pedido-limpeza',
      autorNome: 'Cliente de exemplo',
      titulo: 'Limpeza profunda de apartamento T3',
      categoria: 'limpeza',
      municipio: 'Belas',
      bairro: 'Kilamba',
      descricao:
        'Apartamento de três quartos que está vazio e precisa de limpeza profunda antes de entrar um novo inquilino. Inclui janelas e cozinha.',
    },
    {
      ...base,
      id: 'exemplo-pedido-explicacoes',
      autorNome: 'Cliente de exemplo',
      titulo: 'Aulas de matemática para o 10.º ano',
      categoria: 'explicacoes',
      municipio: 'Cacuaco',
      bairro: 'Sequele',
      descricao:
        'A minha filha está com dificuldades em matemática e tem exames em dezembro. Procuro explicações duas vezes por semana, ao fim do dia.',
    },
  ];
}
