import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { obterCategoria } from '../domain/categorias';
import { construirLinkWhatsAppPedido } from '../domain/whatsapp';
import { PASSOS_PEDIDO, indicePasso, proximoPasso } from '../domain/estados';
import { URGENCIAS } from '../domain/types';
import type { EventoPedido } from '../domain/types';
import { calcularReputacao } from '../domain/reputacao';
import { tempoRelativo } from '../lib/formato';
import { IconeCategoria } from '../components/IconeCategoria';
import { EtiquetaPedido, EtiquetaProposta } from '../components/EtiquetaEstado';
import { Conversa } from '../components/Conversa';
import { FormularioProposta } from '../components/FormularioProposta';
import { AvaliacaoForm } from '../components/AvaliacaoForm';

const ROTULO_EVENTO: Record<EventoPedido['tipo'], string> = {
  publicado: 'Pedido publicado',
  proposta: 'Proposta recebida',
  aceite: 'Proposta aceite',
  concluido: 'Trabalho concluído',
  cancelado: 'Pedido cancelado',
  avaliado: 'Avaliação registada',
};

export function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const pedidos = useApp((estado) => estado.pedidos);
  const propostas = useApp((estado) => estado.propostas);
  const avaliacoes = useApp((estado) => estado.avaliacoes);
  const contactos = useApp((estado) => estado.contactos);
  const carregar = useApp((estado) => estado.carregar);
  const carregarContactos = useApp((estado) => estado.carregarContactos);
  const estado = useApp((estado) => estado.estado);
  const registarContacto = useApp((estado) => estado.registarContacto);
  const aceitarProposta = useApp((estado) => estado.aceitarProposta);
  const concluirPedido = useApp((estado) => estado.concluirPedido);
  const sessao = useSessao((estado) => estado.sessao);

  const [contactado, setContactado] = useState(false);
  const [aProcessar, setAProcessar] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  useEffect(() => {
    void carregar();
    void carregarContactos();
  }, [carregar, carregarContactos]);

  const pedido = pedidos.find((item) => item.id === id);

  if (!pedido) {
    return (
      <div className="cartao mx-auto max-w-md p-10 text-center">
        <p className="font-semibold">
          {estado === 'a-carregar' ? 'A carregar…' : 'Pedido não encontrado.'}
        </p>
        {estado !== 'a-carregar' && (
          <Link to="/pedidos" className="btn-secundario mt-5 px-4 py-2 text-sm">
            Voltar ao mural
          </Link>
        )}
      </div>
    );
  }

  const categoria = obterCategoria(pedido.categoria);
  const urgencia = URGENCIAS.find((u) => u.id === pedido.urgencia);

  /*
   * Quem publica o pedido está a pedir, não a contactar. O primeiro passo é de
   * quem vai resolver — por isso o botão de WhatsApp nunca aparece ao autor.
   */
  const ehMeuPedido = Boolean(sessao?.pedidoIds.includes(pedido.id));
  const papel = ehMeuPedido ? 'cliente' : 'prestador';

  const propostasDoPedido = propostas.filter((proposta) => proposta.pedidoId === pedido.id);
  const propostaAceite = propostasDoPedido.find((proposta) => proposta.estado === 'aceite');

  const minhaProposta = sessao
    ? propostasDoPedido.find(
        (proposta) => proposta.autorNome.toLowerCase() === sessao.nome.toLowerCase(),
      )
    : undefined;

  const jaAvaliei = Boolean(
    sessao &&
      avaliacoes.some(
        (avaliacao) =>
          avaliacao.pedidoId === pedido.id &&
          avaliacao.autorNome.toLowerCase() === sessao.nome.toLowerCase(),
      ),
  );

  const passo = proximoPasso(pedido, papel, { propostas: propostasDoPedido, minhaProposta, jaAvaliei });

  const contactosRecebidos = contactos.filter(
    (evento) => evento.alvoTipo === 'pedido' && evento.alvoId === pedido.id,
  ).length;

  const fechado = pedido.estado === 'concluido' || pedido.estado === 'cancelado';
  const indice = indicePasso(pedido.estado);
  const reputacaoCliente = calcularReputacao(avaliacoes, pedido.autorNome, 'cliente');

  const linkWhatsApp = construirLinkWhatsAppPedido({
    telefone: pedido.autorTelefone,
    nome: pedido.autorNome,
    titulo: pedido.titulo,
  });

  async function aceitar(propostaId: string) {
    setAProcessar(true);
    setErroAcao(null);
    try {
      await aceitarProposta(pedido!.id, propostaId);
    } catch (falha) {
      setErroAcao(falha instanceof Error ? falha.message : 'Não foi possível aceitar.');
    } finally {
      setAProcessar(false);
    }
  }

  async function concluir() {
    setAProcessar(true);
    setErroAcao(null);
    try {
      await concluirPedido(pedido!.id);
    } catch (falha) {
      setErroAcao(falha instanceof Error ? falha.message : 'Não foi possível concluir.');
    } finally {
      setAProcessar(false);
    }
  }

  const botaoWhatsApp = (classe: string, rotulo = 'Falar no WhatsApp') => (
    <a
      href={linkWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      className={classe}
      onClick={() => {
        setContactado(true);
        void registarContacto('pedido', pedido.id, 'pedido');
      }}
    >
      {rotulo}
    </a>
  );

  return (
    <article className="mx-auto max-w-2xl">
      <Link to="/pedidos" className="btn-fantasma -ml-2 text-mute hover:text-ink">
        <span aria-hidden="true">←</span> Mural de pedidos
      </Link>

      {/* -- Cabeçalho ------------------------------------------------------ */}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
          <span className="inline-flex items-center gap-1.5 text-brand-700">
            <IconeCategoria categoria={pedido.categoria} className="h-3.5 w-3.5" />
            {categoria.rotulo}
          </span>
          <span aria-hidden="true" className="text-line">/</span>
          <span className="text-mute">{pedido.bairro} · {pedido.municipio}</span>
          <span aria-hidden="true" className="text-line">/</span>
          <span className="text-mute">{tempoRelativo(pedido.criadoEm)}</span>
          {pedido.exemplo ? (
            <span className="selo ml-auto bg-ink/5 text-mute">pedido de exemplo</span>
          ) : (
            <EtiquetaPedido estado={pedido.estado} className="ml-auto" />
          )}
        </div>

        <h1 className="titulo-display mt-4 text-[clamp(2rem,5.5vw,3.4rem)] texto-balanco">
          {pedido.titulo}
        </h1>

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">Para quando</dt>
            <dd className={`mt-0.5 font-medium ${pedido.urgencia === 'urgente' ? 'text-red-800' : ''}`}>
              {urgencia?.rotulo ?? 'Flexível'}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">Orçamento</dt>
            <dd className="mt-0.5 font-medium">{pedido.orcamentoTexto ?? 'A combinar'}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">Publicado por</dt>
            <dd className="mt-0.5 font-medium">
              {pedido.autorNome}
              {!pedido.exemplo && (
                <span className="font-normal text-mute">
                  {reputacaoCliente.media !== null
                    ? ` · ${reputacaoCliente.media.toFixed(1).replace('.', ',')} como cliente (${reputacaoCliente.total})`
                    : ' · primeiro pedido'}
                </span>
              )}
            </dd>
          </div>
        </dl>
      </header>

      {/* -- Progresso ------------------------------------------------------ */}
      {!pedido.exemplo && pedido.estado !== 'cancelado' && (
        <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="Progresso do pedido">
          {PASSOS_PEDIDO.map((p, i) => {
            const feito = i <= indice;
            const actual = i === indice;
            return (
              <li key={p.estado} className="min-w-0">
                <div className={`h-1 rounded-full ${feito ? (actual ? 'bg-brand-600' : 'bg-forest-500') : 'bg-line'}`} />
                <p className={`mt-1.5 truncate text-[11px] font-semibold uppercase tracking-[0.08em] ${feito ? 'text-ink' : 'text-mute'}`}>
                  {p.rotulo}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {pedido.fotoUrl && (
        <img
          src={pedido.fotoUrl}
          alt="Fotografia enviada com o pedido"
          className="mt-6 w-full rounded-cartao border border-line object-cover"
        />
      )}

      <p className="mt-6 whitespace-pre-line text-[17px] leading-[1.7] text-ink-soft">
        {pedido.descricao}
      </p>

      {/* -- Próximo passo -------------------------------------------------- */}
      {!pedido.exemplo && sessao && (
        <section className={`cartao mt-7 p-5 sm:p-6 ${passo.pendente ? 'border-brand-600/40' : ''}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
            {passo.pendente ? 'A tua vez' : 'Ponto de situação'}
          </p>
          <p className="mt-2 text-lg font-semibold">{passo.titulo}</p>
          <p className="mt-1 text-sm leading-relaxed text-mute">{passo.detalhe}</p>

          {ehMeuPedido && pedido.estado === 'aberto' && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-sand px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-[0.1em] text-mute">Profissionais interessados</span>
              <span className="numeral text-2xl leading-none">{propostasDoPedido.length + contactosRecebidos}</span>
            </div>
          )}

          {ehMeuPedido && pedido.estado === 'acordado' && (
            <button
              type="button"
              className="btn-primario mt-4 w-full px-4 py-2.5 text-sm"
              disabled={aProcessar}
              onClick={() => void concluir()}
            >
              Marcar como concluído
            </button>
          )}

          {!ehMeuPedido && minhaProposta && minhaProposta.estado !== 'recusada' && !fechado &&
            botaoWhatsApp('btn-clay mt-4 w-full px-4 py-2.5 text-sm', contactado ? 'Reabrir WhatsApp' : 'Falar no WhatsApp')}

          {erroAcao && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{erroAcao}</p>
          )}
        </section>
      )}

      {/* -- Propostas recebidas (autor) ------------------------------------ */}
      {ehMeuPedido && propostasDoPedido.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="seccao-titulo text-xl">Propostas recebidas</h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">{propostasDoPedido.length}</span>
          </div>

          <ul className="mt-3 space-y-2">
            {propostasDoPedido.map((proposta) => (
              <li key={proposta.id} className={`cartao p-4 ${proposta.estado === 'aceite' ? 'border-forest-500/40' : ''}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{proposta.autorNome}</span>
                  <span className="flex items-center gap-2 text-[11px] text-mute">
                    {proposta.estado !== 'pendente' && <EtiquetaProposta estado={proposta.estado} />}
                    {tempoRelativo(proposta.criadoEm)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{proposta.mensagem}</p>
                {(proposta.precoTexto || proposta.prazoTexto) && (
                  <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-mute">
                    {proposta.precoTexto && <span>Valor: {proposta.precoTexto}</span>}
                    {proposta.prazoTexto && <span>Prazo: {proposta.prazoTexto}</span>}
                  </p>
                )}
                {pedido.estado === 'aberto' && (
                  <button
                    type="button"
                    className="btn-primario mt-3 w-full px-4 py-2 text-sm"
                    disabled={aProcessar}
                    onClick={() => void aceitar(proposta.id)}
                  >
                    Aceitar esta proposta
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -- Formulário de proposta (prestador sem proposta) ---------------- */}
      {!ehMeuPedido && !pedido.exemplo && !minhaProposta && sessao && pedido.estado === 'aberto' && (
        <FormularioProposta pedidoId={pedido.id} autorNome={sessao.nome} />
      )}

      {/* -- Conversa ------------------------------------------------------- */}
      {!pedido.exemplo && (ehMeuPedido || minhaProposta) && (
        <Conversa
          pedidoId={pedido.id}
          lado={ehMeuPedido ? 'cliente' : 'prestador'}
          autorNome={ehMeuPedido ? pedido.autorNome : (sessao?.nome ?? 'Profissional')}
          fechada={fechado}
        />
      )}

      {/* -- Avaliação (nos dois sentidos) ---------------------------------- */}
      {ehMeuPedido && pedido.estado === 'concluido' && !jaAvaliei && propostaAceite && (
        <AvaliacaoForm
          pedidoId={pedido.id}
          autorNome={pedido.autorNome}
          alvoNome={propostaAceite.autorNome}
          alvoTipo="prestador"
        />
      )}
      {!ehMeuPedido && pedido.estado === 'concluido' && !jaAvaliei && minhaProposta?.estado === 'aceite' && sessao && (
        <AvaliacaoForm
          pedidoId={pedido.id}
          autorNome={sessao.nome}
          alvoNome={pedido.autorNome}
          alvoTipo="cliente"
        />
      )}

      {/* -- Linha do tempo ------------------------------------------------- */}
      {!pedido.exemplo && pedido.historico.length > 0 && (
        <section className="mt-8">
          <h2 className="seccao-titulo text-xl">O que aconteceu</h2>
          <ol className="mt-3 border-l border-line pl-4">
            {[...pedido.historico]
              .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))
              .map((evento, i) => (
                <li key={`${evento.tipo}-${evento.criadoEm}-${i}`} className="relative pb-4 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-sand ${
                      evento.tipo === 'concluido' || evento.tipo === 'aceite' ? 'bg-forest-500' : evento.tipo === 'avaliado' ? 'bg-brand-600' : 'bg-ink/30'
                    }`}
                  />
                  <p className="text-sm font-semibold">{ROTULO_EVENTO[evento.tipo]}</p>
                  <p className="text-xs text-mute">
                    {evento.autorNome}
                    {evento.detalhe ? ` · ${evento.detalhe}` : ''} · {tempoRelativo(evento.criadoEm)}
                  </p>
                </li>
              ))}
          </ol>
        </section>
      )}

      {/* -- Rodapé de acção para quem não participa ------------------------ */}
      <footer className="mt-8">
        {pedido.exemplo ? (
          <div className="cartao p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-mute">
              Este é um pedido de exemplo, criado para mostrar como funciona. Não representa uma
              pessoa real, por isso o contacto está desactivado.
            </p>
            <Link to="/publicar-pedido" className="btn-primario mt-4 w-full px-4 py-2.5 text-sm">
              Publicar um pedido
            </Link>
          </div>
        ) : !sessao ? (
          <div className="cartao p-5 sm:p-6">
            <p className="font-semibold">Sabes resolver isto?</p>
            <p className="mt-1 text-sm text-mute">Entra como prestador para enviar uma proposta.</p>
            <Link to="/entrar?tipo=prestador" className="btn-primario mt-4 w-full px-4 py-2.5 text-sm">
              Entrar
            </Link>
          </div>
        ) : !ehMeuPedido && !minhaProposta && pedido.estado !== 'aberto' ? (
          <div className="cartao p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-mute">
              Este pedido já tem profissional. Vê outros pedidos abertos na tua zona.
            </p>
            <Link to="/pedidos" className="btn-secundario mt-4 w-full px-4 py-2.5 text-sm">
              Ver o mural
            </Link>
          </div>
        ) : !ehMeuPedido && !minhaProposta ? (
          <>
            {botaoWhatsApp('btn-secundario w-full px-5 py-3 text-base', contactado ? 'Reabrir WhatsApp' : 'Ou falar já no WhatsApp')}
            <p className="mt-3 text-center text-xs leading-relaxed text-mute">
              A proposta fica registada no SALU; o WhatsApp é para quando quiserem continuar fora.
            </p>
          </>
        ) : null}
      </footer>
    </article>
  );
}
