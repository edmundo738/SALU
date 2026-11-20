import type {
  Avaliacao,
  EventoContacto,
  Mensagem,
  Pedido,
  Perfil,
  Proposta,
  TipoSessao,
} from '../domain/types';
import { CHAVES, chaveNome, type MapaPertence } from './chaves';
import { pedidosDeExemplo, perfisDeExemplo } from './exemplos';
import type { ArmazenamentoSimples } from './repositorioLocal';

/**
 * Personagens de demonstração.
 *
 * Diferem dos exemplos estáticos numa coisa: têm história e são utilizáveis.
 * Pode-se entrar como qualquer uma, aceitar propostas, concluir trabalhos e
 * avaliar — porque uma plataforma vazia não deixa ninguém imaginar nada.
 *
 * Continuam a ser demonstração: a faixa no topo di-lo em todas as páginas e os
 * telefones são números reservados (2449000000xx), não de pessoas reais. Para
 * o WhatsApp abrir numa demonstração ao vivo, troca-se o número da personagem
 * por um número próprio em `TELEFONES`.
 *
 * A história foi desenhada para cobrir os três momentos do ciclo:
 *   - Marta tem um pedido ABERTO com duas propostas → demonstra-se aceitar.
 *   - Paulo tem um trabalho ACORDADO com a Neusa → demonstra-se concluir e avaliar.
 *   - Lúcia e Paulo têm trabalhos CONCLUÍDOS com o Ivo → o perfil dele já tem
 *     reputação, enquanto a Joana, acabada de entrar, não tem nenhuma.
 */

export interface Persona {
  nome: string;
  tipo: TipoSessao;
  papel: string;
  /** Onde a demonstração deve começar quando se entra como esta pessoa. */
  rota: string;
}

const TELEFONES = {
  ivo: '244900000001',
  neusa: '244900000002',
  joana: '244900000003',
  marta: '244900000004',
  paulo: '244900000005',
  lucia: '244900000006',
} as const;

export const PERSONAS: readonly Persona[] = [
  {
    nome: 'Marta Kilamba',
    tipo: 'cliente',
    papel: 'Tem um pedido aberto com duas propostas para decidir.',
    rota: '/pedidos/pedido-marta-frigorifico',
  },
  {
    nome: 'Ivo Manuel',
    tipo: 'prestador',
    papel: 'Técnico de frigoríficos. Dois trabalhos concluídos e avaliados.',
    rota: '/pedidos',
  },
  {
    nome: 'Paulo Sebastião',
    tipo: 'cliente',
    papel: 'Tem um trabalho acordado por concluir e outro já avaliado.',
    rota: '/pedidos/pedido-paulo-quadro',
  },
  {
    nome: 'Neusa Domingos',
    tipo: 'prestador',
    papel: 'Electricista. Um trabalho avaliado, outro em curso.',
    rota: '/perfil/persona-neusa',
  },
  {
    nome: 'Joana Baptista',
    tipo: 'prestador',
    papel: 'Designer. Acabou de entrar — ainda sem avaliações.',
    rota: '/pedidos',
  },
  {
    nome: 'Lúcia Tavares',
    tipo: 'cliente',
    papel: 'Já teve dois trabalhos concluídos através do SALU.',
    rota: '/painel',
  },
];

export interface Semente {
  perfis: Perfil[];
  pedidos: Pedido[];
  propostas: Proposta[];
  mensagens: Mensagem[];
  avaliacoes: Avaliacao[];
  contactos: EventoContacto[];
  pertence: MapaPertence;
}

export function construirSemente(agora: Date = new Date()): Semente {
  const ha = (minutos: number) => new Date(agora.getTime() - minutos * 60_000).toISOString();
  const DIA = 24 * 60;
  const isoAgora = agora.toISOString();

  const perfis: Perfil[] = [
    {
      id: 'persona-ivo',
      nome: 'Ivo Manuel',
      telefone: TELEFONES.ivo,
      municipio: 'Kilamba Kiaxi',
      bairro: 'Centralidade do Kilamba',
      categoria: 'reparacoes',
      oficio: 'Técnico de frigoríficos e arcas',
      descricao:
        'Reparo frigoríficos, arcas congeladoras e máquinas de lavar ao domicílio. Diagnóstico no local, orçamento antes de começar e garantia de 30 dias na peça substituída.',
      precoTexto: 'Visita 5.000 Kz · desconta no serviço',
      fotoUrl: null,
      disponivel: true,
      exemplo: false,
      criadoEm: ha(45 * DIA),
    },
    {
      id: 'persona-neusa',
      nome: 'Neusa Domingos',
      telefone: TELEFONES.neusa,
      municipio: 'Viana',
      bairro: 'Zango 3',
      categoria: 'electricidade',
      oficio: 'Electricista',
      descricao:
        'Instalações eléctricas em casas e pequenos negócios: quadros, tomadas, iluminação, detecção de fugas e curto-circuitos. Dez anos a trabalhar em Viana e Cacuaco.',
      precoTexto: 'A combinar',
      fotoUrl: null,
      disponivel: true,
      exemplo: false,
      criadoEm: ha(30 * DIA),
    },
    {
      id: 'persona-joana',
      nome: 'Joana Baptista',
      telefone: TELEFONES.joana,
      municipio: 'Talatona',
      bairro: 'Benfica',
      categoria: 'design',
      oficio: 'Designer gráfica',
      descricao:
        'Logotipos, cartazes e conteúdos para redes sociais. Trabalho à distância com qualquer ponto do país. Entrego ficheiros prontos para impressão e para o Instagram.',
      precoTexto: 'Logotipo desde 25.000 Kz',
      fotoUrl: null,
      disponivel: true,
      exemplo: false,
      criadoEm: ha(2 * DIA),
    },
    ...perfisDeExemplo(isoAgora),
  ];

  const pedidos: Pedido[] = [
    {
      id: 'pedido-marta-frigorifico',
      autorNome: 'Marta Kilamba',
      autorTelefone: TELEFONES.marta,
      titulo: 'O frigorífico deixou de refrigerar',
      categoria: 'reparacoes',
      municipio: 'Kilamba Kiaxi',
      bairro: 'Centralidade do Kilamba',
      descricao:
        'Liga, faz barulho, mas não arrefece nada desde ontem à noite. Já desliguei da tomada e voltei a ligar. É um Samsung de duas portas. Preciso de alguém que venha ver esta semana.',
      fotoUrl: null,
      urgencia: 'esta-semana',
      orcamentoTexto: 'Até 20.000 Kz',
      estado: 'aberto',
      historico: [
        { tipo: 'publicado', autorNome: 'Marta Kilamba', criadoEm: ha(180) },
        { tipo: 'proposta', autorNome: 'Ivo Manuel', criadoEm: ha(120) },
        { tipo: 'proposta', autorNome: 'António Kiala', criadoEm: ha(60) },
      ],
      exemplo: false,
      criadoEm: ha(180),
    },
    {
      id: 'pedido-paulo-quadro',
      autorNome: 'Paulo Sebastião',
      autorTelefone: TELEFONES.paulo,
      titulo: 'O quadro eléctrico dispara à noite',
      categoria: 'electricidade',
      municipio: 'Viana',
      bairro: 'Zango 3',
      descricao:
        'Quase todas as noites, por volta das 22h, o disjuntor geral dispara. De dia não acontece. Casa com ar condicionado em dois quartos.',
      fotoUrl: null,
      urgencia: 'urgente',
      orcamentoTexto: null,
      estado: 'acordado',
      historico: [
        { tipo: 'publicado', autorNome: 'Paulo Sebastião', criadoEm: ha(2 * DIA + 120) },
        { tipo: 'proposta', autorNome: 'Neusa Domingos', criadoEm: ha(2 * DIA + 60) },
        { tipo: 'aceite', autorNome: 'Neusa Domingos', criadoEm: ha(2 * DIA + 40), detalhe: 'Escolhida por Paulo Sebastião' },
      ],
      exemplo: false,
      criadoEm: ha(2 * DIA + 120),
    },
    {
      id: 'pedido-paulo-arca',
      autorNome: 'Paulo Sebastião',
      autorTelefone: TELEFONES.paulo,
      titulo: 'Arca congeladora não gela',
      categoria: 'reparacoes',
      municipio: 'Viana',
      bairro: 'Zango 3',
      descricao:
        'Arca horizontal de 300 litros. Liga, mas não passa dos 0 graus. Tenho carne a estragar-se, é urgente.',
      fotoUrl: null,
      urgencia: 'urgente',
      orcamentoTexto: null,
      estado: 'concluido',
      historico: [
        { tipo: 'publicado', autorNome: 'Paulo Sebastião', criadoEm: ha(12 * DIA) },
        { tipo: 'proposta', autorNome: 'Ivo Manuel', criadoEm: ha(12 * DIA - 90) },
        { tipo: 'aceite', autorNome: 'Ivo Manuel', criadoEm: ha(12 * DIA - 120), detalhe: 'Escolhido por Paulo Sebastião' },
        { tipo: 'concluido', autorNome: 'Paulo Sebastião', criadoEm: ha(11 * DIA + 60) },
        { tipo: 'avaliado', autorNome: 'Paulo Sebastião', criadoEm: ha(11 * DIA), detalhe: '4/5 para Ivo Manuel' },
      ],
      exemplo: false,
      criadoEm: ha(12 * DIA),
    },
    {
      id: 'pedido-lucia-maquina',
      autorNome: 'Lúcia Tavares',
      autorTelefone: TELEFONES.lucia,
      titulo: 'Máquina de lavar não centrifuga',
      categoria: 'reparacoes',
      municipio: 'Luanda',
      bairro: 'Maianga',
      descricao:
        'Lava normalmente mas no fim a roupa sai encharcada. Faz um barulho estranho quando devia centrifugar.',
      fotoUrl: null,
      urgencia: 'esta-semana',
      orcamentoTexto: null,
      estado: 'concluido',
      historico: [
        { tipo: 'publicado', autorNome: 'Lúcia Tavares', criadoEm: ha(8 * DIA) },
        { tipo: 'proposta', autorNome: 'Ivo Manuel', criadoEm: ha(8 * DIA - 60) },
        { tipo: 'aceite', autorNome: 'Ivo Manuel', criadoEm: ha(8 * DIA - 90), detalhe: 'Escolhido por Lúcia Tavares' },
        { tipo: 'concluido', autorNome: 'Lúcia Tavares', criadoEm: ha(7 * DIA + 30) },
        { tipo: 'avaliado', autorNome: 'Lúcia Tavares', criadoEm: ha(7 * DIA - 60), detalhe: '5/5 para Ivo Manuel' },
      ],
      exemplo: false,
      criadoEm: ha(8 * DIA),
    },
    {
      id: 'pedido-lucia-ventoinha',
      autorNome: 'Lúcia Tavares',
      autorTelefone: TELEFONES.lucia,
      titulo: 'Instalar ventoinha de tecto na sala',
      categoria: 'electricidade',
      municipio: 'Luanda',
      bairro: 'Maianga',
      descricao:
        'Já comprei a ventoinha. Preciso de quem a instale no sítio do candeeiro actual, com interruptor de velocidades.',
      fotoUrl: null,
      urgencia: 'flexivel',
      orcamentoTexto: 'Até 10.000 Kz',
      estado: 'concluido',
      historico: [
        { tipo: 'publicado', autorNome: 'Lúcia Tavares', criadoEm: ha(20 * DIA) },
        { tipo: 'proposta', autorNome: 'Neusa Domingos', criadoEm: ha(20 * DIA - 120) },
        { tipo: 'aceite', autorNome: 'Neusa Domingos', criadoEm: ha(20 * DIA - 150), detalhe: 'Escolhida por Lúcia Tavares' },
        { tipo: 'concluido', autorNome: 'Lúcia Tavares', criadoEm: ha(19 * DIA + 60) },
        { tipo: 'avaliado', autorNome: 'Lúcia Tavares', criadoEm: ha(19 * DIA), detalhe: '5/5 para Neusa Domingos' },
      ],
      exemplo: false,
      criadoEm: ha(20 * DIA),
    },
    ...pedidosDeExemplo(isoAgora),
  ];

  const propostas: Proposta[] = [
    {
      id: 'proposta-ivo-marta',
      pedidoId: 'pedido-marta-frigorifico',
      autorNome: 'Ivo Manuel',
      mensagem:
        'Trabalho com frigoríficos Samsung. Pelo que descreve, pode ser o motor da ventoinha ou o termóstato. Posso passar amanhã de manhã para ver.',
      precoTexto: 'Visita 5.000 Kz',
      prazoTexto: 'Amanhã de manhã',
      estado: 'pendente',
      criadoEm: ha(120),
    },
    {
      id: 'proposta-antonio-marta',
      pedidoId: 'pedido-marta-frigorifico',
      autorNome: 'António Kiala',
      mensagem: 'Faço reparação de frigoríficos. Disponível a partir de quinta-feira.',
      precoTexto: 'A combinar',
      prazoTexto: 'Quinta-feira',
      estado: 'pendente',
      criadoEm: ha(60),
    },
    {
      id: 'proposta-neusa-paulo-quadro',
      pedidoId: 'pedido-paulo-quadro',
      autorNome: 'Neusa Domingos',
      mensagem:
        'Isso à noite com ar condicionado costuma ser disjuntor subdimensionado ou um aparelho com fuga. Levo material para resolver no dia.',
      precoTexto: '12.000 Kz',
      prazoTexto: 'Quinta de manhã',
      estado: 'aceite',
      criadoEm: ha(2 * DIA + 60),
    },
    {
      id: 'proposta-ivo-paulo-arca',
      pedidoId: 'pedido-paulo-arca',
      autorNome: 'Ivo Manuel',
      mensagem: 'Arcas horizontais é o que mais faço. Consigo ir hoje ao fim da tarde.',
      precoTexto: '18.000 Kz',
      prazoTexto: 'Hoje',
      estado: 'aceite',
      criadoEm: ha(12 * DIA - 90),
    },
    {
      id: 'proposta-ivo-lucia-maquina',
      pedidoId: 'pedido-lucia-maquina',
      autorNome: 'Ivo Manuel',
      mensagem: 'Parece a correia ou o rolamento do tambor. Levo as duas peças e vejo no local.',
      precoTexto: '15.000 Kz',
      prazoTexto: 'Amanhã',
      estado: 'aceite',
      criadoEm: ha(8 * DIA - 60),
    },
    {
      id: 'proposta-neusa-lucia-ventoinha',
      pedidoId: 'pedido-lucia-ventoinha',
      autorNome: 'Neusa Domingos',
      mensagem: 'Instalo com regulador de velocidades no lugar do interruptor actual. Uma hora de trabalho.',
      precoTexto: '8.000 Kz',
      prazoTexto: 'Sábado de manhã',
      estado: 'aceite',
      criadoEm: ha(20 * DIA - 120),
    },
  ];

  const mensagens: Mensagem[] = [
    {
      id: 'msg-1',
      pedidoId: 'pedido-marta-frigorifico',
      lado: 'prestador',
      autorNome: 'Ivo Manuel',
      texto: 'Boa tarde! Consegue dizer-me se o motor lá atrás está quente ao toque?',
      criadoEm: ha(110),
    },
    {
      id: 'msg-2',
      pedidoId: 'pedido-marta-frigorifico',
      lado: 'cliente',
      autorNome: 'Marta Kilamba',
      texto: 'Está, sim. E ouve-se a trabalhar. De manhã dá-me jeito, estou em casa até às 11h.',
      criadoEm: ha(100),
    },
    {
      id: 'msg-3',
      pedidoId: 'pedido-paulo-quadro',
      lado: 'cliente',
      autorNome: 'Paulo Sebastião',
      texto: 'Combinado, quinta às 8h. O portão é o verde, ao lado da padaria.',
      criadoEm: ha(2 * DIA + 30),
    },
    {
      id: 'msg-4',
      pedidoId: 'pedido-paulo-quadro',
      lado: 'prestador',
      autorNome: 'Neusa Domingos',
      texto: 'Perfeito. Se puder, deixe os ares condicionados ligados nessa manhã para eu medir a carga.',
      criadoEm: ha(2 * DIA + 20),
    },
    {
      id: 'msg-5',
      pedidoId: 'pedido-lucia-maquina',
      lado: 'prestador',
      autorNome: 'Ivo Manuel',
      texto: 'Era o rolamento. Já está substituído e testei dois ciclos.',
      criadoEm: ha(7 * DIA),
    },
    {
      id: 'msg-6',
      pedidoId: 'pedido-lucia-maquina',
      lado: 'cliente',
      autorNome: 'Lúcia Tavares',
      texto: 'Muito obrigada, ficou perfeita.',
      criadoEm: ha(7 * DIA - 30),
    },
  ];

  const avaliacoes: Avaliacao[] = [
    // Clientes avaliam prestadores
    {
      id: 'aval-lucia-ivo',
      pedidoId: 'pedido-lucia-maquina',
      autorNome: 'Lúcia Tavares',
      alvoNome: 'Ivo Manuel',
      alvoTipo: 'prestador',
      nota: 5,
      dimensoes: { comunicacao: 5, pontualidade: 5, qualidade: 5 },
      voltaria: true,
      comentario: 'Pontual, explicou o problema antes de mexer e deixou tudo limpo.',
      criadoEm: ha(7 * DIA - 60),
    },
    {
      id: 'aval-paulo-ivo',
      pedidoId: 'pedido-paulo-arca',
      autorNome: 'Paulo Sebastião',
      alvoNome: 'Ivo Manuel',
      alvoTipo: 'prestador',
      nota: 4,
      dimensoes: { comunicacao: 5, pontualidade: 3, qualidade: 5 },
      voltaria: true,
      comentario: 'Resolveu no próprio dia. Chegou com uma hora de atraso, mas avisou.',
      criadoEm: ha(11 * DIA),
    },
    {
      id: 'aval-lucia-neusa',
      pedidoId: 'pedido-lucia-ventoinha',
      autorNome: 'Lúcia Tavares',
      alvoNome: 'Neusa Domingos',
      alvoTipo: 'prestador',
      nota: 5,
      dimensoes: { comunicacao: 5, pontualidade: 5, qualidade: 5 },
      voltaria: true,
      comentario: 'Rápida e cuidadosa. Deixou o regulador bem explicado.',
      criadoEm: ha(19 * DIA),
    },
    // Prestadores avaliam clientes — a confiança corre nos dois sentidos
    {
      id: 'aval-ivo-lucia',
      pedidoId: 'pedido-lucia-maquina',
      autorNome: 'Ivo Manuel',
      alvoNome: 'Lúcia Tavares',
      alvoTipo: 'cliente',
      nota: 5,
      dimensoes: { comunicacao: 5, pontualidade: 5, qualidade: 5 },
      voltaria: true,
      comentario: 'Pedido claro, estava em casa à hora combinada, pagou no fim.',
      criadoEm: ha(7 * DIA - 90),
    },
    {
      id: 'aval-ivo-paulo',
      pedidoId: 'pedido-paulo-arca',
      autorNome: 'Ivo Manuel',
      alvoNome: 'Paulo Sebastião',
      alvoTipo: 'cliente',
      nota: 4,
      dimensoes: { comunicacao: 4, pontualidade: 4, qualidade: 4 },
      voltaria: true,
      comentario: 'Tudo bem. A descrição podia ter dito a marca da arca.',
      criadoEm: ha(11 * DIA - 30),
    },
    {
      id: 'aval-neusa-lucia',
      pedidoId: 'pedido-lucia-ventoinha',
      autorNome: 'Neusa Domingos',
      alvoNome: 'Lúcia Tavares',
      alvoTipo: 'cliente',
      nota: 5,
      dimensoes: { comunicacao: 5, pontualidade: 5, qualidade: 5 },
      voltaria: true,
      comentario: '',
      criadoEm: ha(19 * DIA - 30),
    },
  ];

  const contactos: EventoContacto[] = [
    { id: 'ct-1', alvoTipo: 'perfil', alvoId: 'persona-ivo', origem: 'perfil', criadoEm: ha(9 * DIA) },
    { id: 'ct-2', alvoTipo: 'pedido', alvoId: 'pedido-lucia-maquina', origem: 'pedido', criadoEm: ha(8 * DIA - 70) },
    { id: 'ct-3', alvoTipo: 'perfil', alvoId: 'persona-neusa', origem: 'perfil', criadoEm: ha(3 * DIA) },
    { id: 'ct-4', alvoTipo: 'pedido', alvoId: 'pedido-paulo-quadro', origem: 'pedido', criadoEm: ha(2 * DIA + 50) },
    { id: 'ct-5', alvoTipo: 'pedido', alvoId: 'pedido-marta-frigorifico', origem: 'pedido', criadoEm: ha(115) },
  ];

  const pertence: MapaPertence = {
    [chaveNome('Ivo Manuel')]: { perfilId: 'persona-ivo', pedidoIds: [] },
    [chaveNome('Neusa Domingos')]: { perfilId: 'persona-neusa', pedidoIds: [] },
    [chaveNome('Joana Baptista')]: { perfilId: 'persona-joana', pedidoIds: [] },
    [chaveNome('Marta Kilamba')]: { perfilId: null, pedidoIds: ['pedido-marta-frigorifico'] },
    [chaveNome('Paulo Sebastião')]: {
      perfilId: null,
      pedidoIds: ['pedido-paulo-quadro', 'pedido-paulo-arca'],
    },
    [chaveNome('Lúcia Tavares')]: {
      perfilId: null,
      pedidoIds: ['pedido-lucia-maquina', 'pedido-lucia-ventoinha'],
    },
  };

  return { perfis, pedidos, propostas, mensagens, avaliacoes, contactos, pertence };
}

/** Escreve a semente no armazenamento, uma vez. Idempotente através do marcador. */
export function semear(armazenamento: ArmazenamentoSimples, agora: Date = new Date()): boolean {
  if (armazenamento.getItem(CHAVES.semente) !== null) return false;

  const s = construirSemente(agora);
  armazenamento.setItem(CHAVES.perfis, JSON.stringify(s.perfis));
  armazenamento.setItem(CHAVES.pedidos, JSON.stringify(s.pedidos));
  armazenamento.setItem(CHAVES.propostas, JSON.stringify(s.propostas));
  armazenamento.setItem(CHAVES.mensagens, JSON.stringify(s.mensagens));
  armazenamento.setItem(CHAVES.avaliacoes, JSON.stringify(s.avaliacoes));
  armazenamento.setItem(CHAVES.contactos, JSON.stringify(s.contactos));
  armazenamento.setItem(CHAVES.pertence, JSON.stringify(s.pertence));
  armazenamento.setItem(CHAVES.semente, agora.toISOString());
  return true;
}
