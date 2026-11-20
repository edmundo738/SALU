import { useMemo } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { usePreferencias } from '../state/preferencias';
import { contarNaoLidas, derivarNotificacoes } from '../domain/notificacoes';
import type { TipoSessao } from '../domain/types';

/*
 * Duas peles para o mesmo sítio.
 *
 * Sem sessão: página pública, editorial, com cabeçalho leve — é o que um jurado
 * vê primeiro. Com sessão: um espaço de trabalho — coluna à esquerda no ecrã
 * grande, barra inferior no telemóvel, título do ecrã e uma acção principal
 * sempre à mão. A troca de papel está no shell porque uma pessoa pode precisar
 * de um canalizador de manhã e dar explicações à tarde.
 */

interface Ligacao {
  para: string;
  rotulo: string;
  icone: string;
  /** Marca activo também em sub-rotas (ex.: /pedidos/abc). */
  prefixo?: string;
  /** Contagem a mostrar ao lado (notificações por ver). */
  contagem?: number;
}

const ICONES = {
  painel: 'M3 11l9-8 9 8M5 10v10h14V10',
  lupa: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  lista: 'M4 6h16M4 12h16M4 18h10',
  mais: 'M12 5v14M5 12h14',
  pessoa: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  planos: 'M4 7h16M4 12h16M4 17h8',
  escudo: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  sino: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
  estrela: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
} as const;

function Icone({ d, className = 'h-5 w-5', forte = false }: { d: string; className?: string; forte?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={forte ? 2.1 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function percurso(tipo: TipoSessao, perfilId: string | null, naoLidas: number): Ligacao[] {
  const notificacoes: Ligacao = {
    para: '/notificacoes',
    rotulo: 'Notificações',
    icone: ICONES.sino,
    contagem: naoLidas,
  };
  if (tipo === 'cliente') {
    return [
      { para: '/painel', rotulo: 'Painel', icone: ICONES.painel },
      { para: '/publicar-pedido', rotulo: 'Publicar pedido', icone: ICONES.mais },
      { para: '/explorar', rotulo: 'Profissionais', icone: ICONES.lupa, prefixo: '/perfil/' },
      notificacoes,
      { para: '/pedidos', rotulo: 'Mural', icone: ICONES.lista, prefixo: '/pedidos' },
    ];
  }
  return [
    { para: '/painel', rotulo: 'Painel', icone: ICONES.painel },
    { para: '/pedidos', rotulo: 'Oportunidades', icone: ICONES.lupa, prefixo: '/pedidos' },
    {
      para: perfilId ? `/perfil/${perfilId}` : '/perfil/novo',
      rotulo: perfilId ? 'O meu perfil' : 'Criar perfil',
      icone: ICONES.pessoa,
      prefixo: '/perfil/',
    },
    notificacoes,
    { para: '/explorar', rotulo: 'Profissionais', icone: ICONES.lista },
  ];
}

const ECOSSISTEMA: Ligacao[] = [
  { para: '/confianca', rotulo: 'De confiança', icone: ICONES.estrela },
  { para: '/seguranca', rotulo: 'Segurança', icone: ICONES.escudo },
  { para: '/planos', rotulo: 'Planos', icone: ICONES.planos },
  { para: '/interno', rotulo: 'Área interna', icone: ICONES.lista },
];

const TITULOS: { teste: RegExp; titulo: string }[] = [
  { teste: /^\/$/, titulo: 'Início' },
  { teste: /^\/painel/, titulo: 'Painel' },
  { teste: /^\/explorar/, titulo: 'Profissionais' },
  { teste: /^\/pedidos\/./, titulo: 'Pedido' },
  { teste: /^\/pedidos/, titulo: 'Mural de pedidos' },
  { teste: /^\/publicar-pedido/, titulo: 'Publicar pedido' },
  { teste: /^\/perfil\/novo/, titulo: 'O meu perfil' },
  { teste: /^\/perfil\//, titulo: 'Perfil profissional' },
  { teste: /^\/planos/, titulo: 'Planos' },
  { teste: /^\/interno/, titulo: 'Área interna' },
  { teste: /^\/entrar/, titulo: 'Entrar' },
  { teste: /^\/notificacoes/, titulo: 'Notificações' },
  { teste: /^\/confianca/, titulo: 'Profissionais de confiança' },
  { teste: /^\/seguranca/, titulo: 'Segurança' },
];

function tituloDe(caminho: string): string {
  return TITULOS.find((item) => item.teste.test(caminho))?.titulo ?? 'SALU';
}

function activa(ligacao: Ligacao, caminho: string): boolean {
  if (ligacao.prefixo && caminho.startsWith(ligacao.prefixo)) return true;
  return ligacao.para === '/' ? caminho === '/' : caminho.startsWith(ligacao.para);
}

function Marca() {
  return (
    <Link to="/" className="group flex items-baseline gap-1.5" aria-label="SALU — início">
      <span className="titulo-display text-[27px] leading-none">SALU</span>
      <span
        aria-hidden="true"
        className="mb-1 h-1.5 w-1.5 rounded-full bg-brand-600 transition group-hover:scale-125"
      />
    </Link>
  );
}

function FaixaDemo({ modo }: { modo: string }) {
  if (modo !== 'local') return null;
  return (
    <div className="border-b border-brand-500/20 bg-brand-50/70">
      <p className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-1.5 text-[11px] font-medium tracking-wide text-brand-700">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        Demonstração · os dados ficam neste dispositivo · perfis «Exemplo» não são
        contactáveis
      </p>
    </div>
  );
}

function TrocaPapel({ tipo, aoTrocar, compacto = false }: { tipo: TipoSessao; aoTrocar: (t: TipoSessao) => void; compacto?: boolean }) {
  return (
    <div
      role="group"
      aria-label="Papel"
      className={`grid grid-cols-2 rounded-full border border-line bg-paper p-0.5 ${compacto ? 'text-[11px]' : 'text-xs'}`}
    >
      {(['cliente', 'prestador'] as const).map((opcao) => (
        <button
          key={opcao}
          type="button"
          onClick={() => aoTrocar(opcao)}
          aria-pressed={tipo === opcao}
          className={`rounded-full px-2.5 py-1 font-semibold capitalize transition ${
            tipo === opcao ? 'bg-ink text-sand' : 'text-mute hover:text-ink'
          }`}
        >
          {opcao}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pele pública
// ---------------------------------------------------------------------------

const PUBLICO: Ligacao[] = [
  { para: '/', rotulo: 'Início', icone: ICONES.painel },
  { para: '/explorar', rotulo: 'Profissionais', icone: ICONES.lupa, prefixo: '/perfil/' },
  { para: '/pedidos', rotulo: 'Pedidos', icone: ICONES.lista, prefixo: '/pedidos' },
  { para: '/entrar', rotulo: 'Entrar', icone: ICONES.pessoa },
];

function PelePublica({ modo }: { modo: string }) {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-sand/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Marca />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            {PUBLICO.slice(1, 3).concat({ para: '/planos', rotulo: 'Planos', icone: ICONES.planos }).map((l) => (
              <NavLink
                key={l.para}
                to={l.para}
                className={() =>
                  `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    activa(l, pathname) ? 'bg-ink text-sand' : 'text-ink-soft hover:bg-ink/5'
                  }`
                }
              >
                {l.rotulo}
              </NavLink>
            ))}
          </nav>
          <Link to="/entrar" className="btn-primario px-4 py-2 text-sm">
            Entrar
          </Link>
        </div>
        <FaixaDemo modo={modo} />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 pb-28 md:pb-12">
        <Outlet />
      </main>

      <footer className="hidden border-t border-line md:block">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-8 text-xs text-mute">
          <p className="max-w-md">
            SALU — protótipo para o concurso Africa Builds Tech, 2026. Não é um serviço em
            produção.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/planos" className="hover:text-ink">Planos</Link>
            <Link to="/interno" className="hover:text-ink">Área interna</Link>
          </div>
        </div>
      </footer>

      <BarraInferior ligacoes={PUBLICO} caminho={pathname} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pele de trabalho
// ---------------------------------------------------------------------------

function BarraInferior({ ligacoes, caminho }: { ligacoes: Ligacao[]; caminho: string }) {
  return (
    <nav
      aria-label="Navegação"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-sand/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {ligacoes.slice(0, 4).map((l) => {
          const estaActiva = activa(l, caminho);
          return (
            <li key={l.para} className="flex-1">
              <Link
                to={l.para}
                aria-current={estaActiva ? 'page' : undefined}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide transition ${
                  estaActiva ? 'text-brand-600' : 'text-mute'
                }`}
              >
                <Icone d={l.icone} forte={estaActiva} />
                {l.rotulo}
                {l.contagem ? (
                  <span
                    aria-label={`${l.contagem} por ver`}
                    className="absolute right-[calc(50%-18px)] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white"
                  >
                    {l.contagem > 9 ? '9+' : l.contagem}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function PeleTrabalho({ modo }: { modo: string }) {
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const sessao = useSessao((estado) => estado.sessao)!;
  const trocarPapel = useSessao((estado) => estado.trocarPapel);
  const sair = useSessao((estado) => estado.sair);

  const pedidos = useApp((estado) => estado.pedidos);
  const propostas = useApp((estado) => estado.propostas);
  const mensagens = useApp((estado) => estado.mensagens);
  const avaliacoes = useApp((estado) => estado.avaliacoes);
  const lidas = usePreferencias((estado) => estado.lidas);
  const lidasAte = lidas[sessao.nome.trim().toLowerCase()] ?? null;

  const naoLidas = useMemo(
    () => contarNaoLidas(derivarNotificacoes(sessao, { pedidos, propostas, mensagens, avaliacoes }, lidasAte)),
    [sessao, pedidos, propostas, mensagens, avaliacoes, lidasAte],
  );

  const ligacoes = percurso(sessao.tipo, sessao.perfilId, naoLidas);
  const titulo = tituloDe(pathname);

  const accaoPrincipal =
    sessao.tipo === 'cliente'
      ? { para: '/publicar-pedido', rotulo: 'Novo pedido' }
      : { para: '/pedidos', rotulo: 'Procurar trabalho' };

  function trocar(tipo: TipoSessao) {
    trocarPapel(tipo);
    navegar('/painel');
  }

  const itemNav = (l: Ligacao) => {
    const estaActiva = activa(l, pathname);
    return (
      <li key={l.para}>
        <Link
          to={l.para}
          aria-current={estaActiva ? 'page' : undefined}
          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
            estaActiva ? 'bg-ink text-sand' : 'text-ink-soft hover:bg-ink/5'
          }`}
        >
          <Icone d={l.icone} className="h-4 w-4 shrink-0" forte={estaActiva} />
          <span className="truncate">{l.rotulo}</span>
          {l.contagem ? (
            <span className={`numeral ml-auto rounded-full px-1.5 text-xs font-semibold ${estaActiva ? 'bg-sand/20 text-sand' : 'bg-brand-600 text-white'}`}>
              {l.contagem}
            </span>
          ) : null}
        </Link>
      </li>
    );
  };

  return (
    <div className="flex min-h-dvh">
      {/* Coluna de navegação (ecrã grande) */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-sand/60 px-4 py-5 lg:flex">
        <Marca />

        <div className="mt-6">
          <TrocaPapel tipo={sessao.tipo} aoTrocar={trocar} />
        </div>

        <p className="eyebrow mt-7 px-3">
          {sessao.tipo === 'cliente' ? 'Percurso do cliente' : 'Percurso do prestador'}
        </p>
        <ul className="mt-2 space-y-0.5">{ligacoes.map(itemNav)}</ul>

        <p className="eyebrow mt-7 px-3">Ecossistema</p>
        <ul className="mt-2 space-y-0.5">{ECOSSISTEMA.map(itemNav)}</ul>

        <div className="mt-auto border-t border-line pt-4">
          <p className="truncate px-3 text-sm font-semibold">{sessao.nome}</p>
          <p className="px-3 text-xs capitalize text-mute">{sessao.tipo}</p>
          <button type="button" onClick={sair} className="btn-fantasma mt-2 w-full justify-start text-mute">
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line/70 bg-sand/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="lg:hidden">
                <Marca />
              </span>
              <span className="hidden text-sm text-mute lg:inline">
                <span className="capitalize">{sessao.tipo}</span>
                <span aria-hidden="true" className="mx-2 text-line">/</span>
              </span>
              <h2 className="truncate text-sm font-semibold lg:text-base">{titulo}</h2>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="lg:hidden">
                <TrocaPapel tipo={sessao.tipo} aoTrocar={trocar} compacto />
              </span>
              <Link to={accaoPrincipal.para} className="btn-clay hidden px-4 py-2 text-sm sm:inline-flex">
                {accaoPrincipal.rotulo}
              </Link>
            </div>
          </div>
          <FaixaDemo modo={modo} />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-7 pb-28 lg:pb-12">
          <Outlet />
        </main>

        <BarraInferior ligacoes={ligacoes} caminho={pathname} />
      </div>
    </div>
  );
}

export function Layout() {
  const modo = useApp((estado) => estado.modo);
  const sessao = useSessao((estado) => estado.sessao);
  return sessao ? <PeleTrabalho modo={modo} /> : <PelePublica modo={modo} />;
}
