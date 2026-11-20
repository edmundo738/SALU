import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { usePreferencias } from '../state/preferencias';
import { proximoPasso } from '../domain/estados';
import { calcularReputacao } from '../domain/reputacao';
import { obterCategoria } from '../domain/categorias';
import { EtiquetaPedido, EtiquetaProposta } from '../components/EtiquetaEstado';
import { PedidoCartao } from '../components/PedidoCartao';
import { PerfilCartao } from '../components/PerfilCartao';
import { tempoRelativo } from '../lib/formato';

function Tile({ rotulo, valor, destaque = false }: { rotulo: string; valor: number | string; destaque?: boolean }) {
  return (
    <div className={`cartao p-4 ${destaque ? 'border-brand-600/40' : ''}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">{rotulo}</p>
      <p className="numeral mt-1 text-3xl leading-none">{valor}</p>
    </div>
  );
}

export function Painel() {
  const sessao = useSessao((estado) => estado.sessao);
  const perfis = useApp((estado) => estado.perfis);
  const pedidos = useApp((estado) => estado.pedidos);
  const propostas = useApp((estado) => estado.propostas);
  const avaliacoes = useApp((estado) => estado.avaliacoes);
  const contactos = useApp((estado) => estado.contactos);
  const carregar = useApp((estado) => estado.carregar);
  const carregarContactos = useApp((estado) => estado.carregarContactos);
  const confianca = usePreferencias((estado) => estado.confianca);

  useEffect(() => {
    void carregar();
    void carregarContactos();
  }, [carregar, carregarContactos]);

  if (!sessao) {
    return (
      <div className="cartao mx-auto max-w-md p-8 text-center">
        <p className="font-semibold">Ainda não entraste.</p>
        <Link to="/entrar" className="btn-primario mt-4 px-5 py-2.5 text-sm">
          Entrar
        </Link>
      </div>
    );
  }

  const primeiroNome = sessao.nome.split(' ')[0];
  const chave = sessao.nome.toLowerCase();

  // -------------------------------------------------------------- cliente --
  if (sessao.tipo === 'cliente') {
    const meus = pedidos.filter((pedido) => sessao.pedidoIds.includes(pedido.id));
    const contagem = {
      abertos: meus.filter((p) => p.estado === 'aberto').length,
      comPropostas: meus.filter(
        (p) => p.estado === 'aberto' && propostas.some((x) => x.pedidoId === p.id && x.estado === 'pendente'),
      ).length,
      acordados: meus.filter((p) => p.estado === 'acordado').length,
      concluidos: meus.filter((p) => p.estado === 'concluido').length,
    };

    const municipios = new Set(meus.map((p) => p.municipio));
    const idsConfianca = confianca[chave] ?? [];
    const deConfianca = idsConfianca
      .map((id) => perfis.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    const sugeridos = perfis
      .filter((perfil) => perfil.disponivel && !idsConfianca.includes(perfil.id) && (municipios.size === 0 || municipios.has(perfil.municipio)))
      .slice(0, 3);

    return (
      <div className="space-y-9">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Cliente</p>
            <h1 className="titulo-display mt-1 text-[clamp(2rem,5vw,3rem)]">Olá, {primeiroNome}.</h1>
            <p className="mt-1 text-sm text-mute">
              {meus.length === 0
                ? 'Ainda não publicaste nenhum pedido.'
                : `${meus.length} ${meus.length === 1 ? 'pedido' : 'pedidos'} no total.`}
            </p>
          </div>
          <Link to="/publicar-pedido" className="btn-clay px-5 py-2.5 text-sm">
            Novo pedido
          </Link>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile rotulo="Abertos" valor={contagem.abertos} />
          <Tile rotulo="Com propostas" valor={contagem.comPropostas} destaque={contagem.comPropostas > 0} />
          <Tile rotulo="Acordados" valor={contagem.acordados} />
          <Tile rotulo="Concluídos" valor={contagem.concluidos} />
        </section>

        <section>
          <h2 className="seccao-titulo">Os meus pedidos</h2>
          {meus.length === 0 ? (
            <div className="cartao mt-3 border-dashed p-6">
              <p className="font-semibold">Descreve o que precisas.</p>
              <p className="mt-1 text-sm text-mute">
                Um profissional encontra o teu pedido no mural e propõe-se. O primeiro passo é dele.
              </p>
              <Link to="/publicar-pedido" className="btn-primario mt-4 px-4 py-2.5 text-sm">
                Publicar pedido
              </Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-cartao border border-line bg-paper">
              {meus.map((pedido) => {
                const suas = propostas.filter((p) => p.pedidoId === pedido.id);
                const jaAvaliei = avaliacoes.some(
                  (a) => a.pedidoId === pedido.id && a.autorNome.toLowerCase() === chave,
                );
                const passo = proximoPasso(pedido, 'cliente', { propostas: suas, jaAvaliei });
                return (
                  <li key={pedido.id}>
                    <Link to={`/pedidos/${pedido.id}`} className="flex items-start gap-4 px-4 py-4 transition hover:bg-sand/60">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{pedido.titulo}</h3>
                          <EtiquetaPedido estado={pedido.estado} />
                        </div>
                        <p className="mt-1 text-sm">
                          <span className={passo.pendente ? 'font-semibold text-brand-700' : 'text-ink-soft'}>
                            {passo.titulo}
                          </span>
                          <span className="text-mute"> — {passo.detalhe}</span>
                        </p>
                        <p className="mt-1 text-xs text-mute">
                          {obterCategoria(pedido.categoria).rotulo} · {pedido.bairro} · {tempoRelativo(pedido.criadoEm)}
                        </p>
                      </div>
                      <span aria-hidden="true" className="mt-1 text-brand-600">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {deConfianca.length > 0 && (
          <section>
            <div className="flex items-end justify-between gap-3">
              <h2 className="seccao-titulo">De confiança</h2>
              <Link to="/confianca" className="link-seta">Ver todos <span aria-hidden="true">→</span></Link>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {deConfianca.slice(0, 3).map((perfil) => (
                <PerfilCartao key={perfil.id} perfil={perfil} />
              ))}
            </div>
          </section>
        )}

        {sugeridos.length > 0 && (
          <section>
            <div className="flex items-end justify-between gap-3">
              <h2 className="seccao-titulo">Profissionais perto de ti</h2>
              <Link to="/explorar" className="link-seta">Ver todos <span aria-hidden="true">→</span></Link>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sugeridos.map((perfil) => (
                <PerfilCartao key={perfil.id} perfil={perfil} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------ prestador --
  const meuPerfil = sessao.perfilId ? perfis.find((p) => p.id === sessao.perfilId) : undefined;
  const minhas = propostas.filter((p) => p.autorNome.toLowerCase() === chave);
  const reputacao = calcularReputacao(avaliacoes, sessao.nome, 'prestador');

  const abertos = pedidos.filter((p) => p.estado === 'aberto' && !p.exemplo);
  const naMinhaCategoria = meuPerfil ? abertos.filter((p) => p.categoria === meuPerfil.categoria) : [];
  const oportunidades = (naMinhaCategoria.length > 0 ? naMinhaCategoria : abertos)
    .filter((p) => !minhas.some((m) => m.pedidoId === p.id))
    .slice(0, 4);

  const contactosRecebidos = meuPerfil
    ? contactos.filter((c) => c.alvoTipo === 'perfil' && c.alvoId === meuPerfil.id).length
    : 0;

  return (
    <div className="space-y-9">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Prestador</p>
          <h1 className="titulo-display mt-1 text-[clamp(2rem,5vw,3rem)]">Olá, {primeiroNome}.</h1>
          <p className="mt-1 text-sm text-mute">
            {reputacao.media !== null ? (
              <>
                <span className="numeral text-base text-ink">{reputacao.media.toFixed(1).replace('.', ',')}</span>
                {' · '}
                {reputacao.total} {reputacao.total === 1 ? 'trabalho avaliado' : 'trabalhos avaliados'}
              </>
            ) : (
              'Ainda sem avaliações — o primeiro trabalho muda isso.'
            )}
          </p>
        </div>
        <Link to="/pedidos" className="btn-clay px-5 py-2.5 text-sm">
          Procurar trabalho
        </Link>
      </header>

      {!meuPerfil && (
        <section className="cartao border-brand-600/40 p-5 sm:p-6">
          <p className="text-lg font-semibold">Ainda não tens perfil público.</p>
          <p className="mt-1 text-sm text-mute">
            Sem perfil, os clientes não te encontram na pesquisa. Leva dois minutos e é gratuito.
          </p>
          <Link to="/perfil/novo" className="btn-primario mt-4 px-4 py-2.5 text-sm">
            Criar o meu perfil
          </Link>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile rotulo="Oportunidades" valor={naMinhaCategoria.length || abertos.length} destaque />
        <Tile rotulo="Propostas enviadas" valor={minhas.length} />
        <Tile rotulo="Aceites" valor={minhas.filter((m) => m.estado === 'aceite').length} />
        <Tile rotulo="Contactos recebidos" valor={contactosRecebidos} />
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="seccao-titulo">
            {meuPerfil ? `Oportunidades em ${obterCategoria(meuPerfil.categoria).rotulo}` : 'Oportunidades abertas'}
          </h2>
          <Link to="/pedidos" className="link-seta">Ver mural <span aria-hidden="true">→</span></Link>
        </div>
        {oportunidades.length === 0 ? (
          <p className="mt-3 text-sm text-mute">Nada novo na tua categoria neste momento. Vê o mural completo.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {oportunidades.map((pedido) => (
              <PedidoCartao key={pedido.id} pedido={pedido} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="seccao-titulo">As minhas propostas</h2>
        {minhas.length === 0 ? (
          <p className="mt-3 text-sm text-mute">Ainda não te propuseste a nenhum pedido.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-cartao border border-line bg-paper">
            {minhas.map((proposta) => {
              const pedido = pedidos.find((p) => p.id === proposta.pedidoId);
              if (!pedido) return null;
              const jaAvaliei = avaliacoes.some(
                (a) => a.pedidoId === pedido.id && a.autorNome.toLowerCase() === chave,
              );
              const passo = proximoPasso(pedido, 'prestador', {
                propostas: propostas.filter((p) => p.pedidoId === pedido.id),
                minhaProposta: proposta,
                jaAvaliei,
              });
              return (
                <li key={proposta.id}>
                  <Link to={`/pedidos/${pedido.id}`} className="flex items-start gap-4 px-4 py-4 transition hover:bg-sand/60">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{pedido.titulo}</h3>
                        <EtiquetaProposta estado={proposta.estado} />
                      </div>
                      <p className="mt-1 text-sm">
                        <span className={passo.pendente ? 'font-semibold text-brand-700' : 'text-ink-soft'}>{passo.titulo}</span>
                        <span className="text-mute"> — {passo.detalhe}</span>
                      </p>
                      <p className="mt-1 text-xs text-mute">
                        {pedido.autorNome} · {pedido.bairro} · {tempoRelativo(proposta.criadoEm)}
                      </p>
                    </div>
                    <span aria-hidden="true" className="mt-1 text-brand-600">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
