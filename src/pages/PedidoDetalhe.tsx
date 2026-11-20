import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { obterCategoria } from '../domain/categorias';
import { construirLinkWhatsAppPedido } from '../domain/whatsapp';
import { tempoRelativo } from '../lib/formato';
import { IconeCategoria } from '../components/IconeCategoria';
import { Conversa } from '../components/Conversa';
import { FormularioProposta } from '../components/FormularioProposta';
import { AvaliacaoForm } from '../components/AvaliacaoForm';

const ETIQUETA_ESTADO: Record<string, string> = {
  aberto: 'À procura de profissional',
  acordado: 'Trabalho acordado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
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

  /*
   * Quem publica o pedido está a pedir, não a contactar. O primeiro passo é de
   * quem vai resolver — por isso o botão de WhatsApp nunca aparece ao autor.
   */
  const ehMeuPedido = Boolean(sessao?.pedidoIds.includes(pedido.id));

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

  const contactosRecebidos = contactos.filter(
    (evento) => evento.alvoTipo === 'pedido' && evento.alvoId === pedido.id,
  ).length;

  const fechado = pedido.estado === 'concluido' || pedido.estado === 'cancelado';

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

  return (
    <article className="mx-auto max-w-2xl">
      <Link to="/pedidos" className="btn-fantasma -ml-2 text-mute hover:text-ink">
        <span aria-hidden="true">←</span> Mural de pedidos
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
          <span className="inline-flex items-center gap-1.5 text-brand-700">
            <IconeCategoria categoria={pedido.categoria} className="h-3.5 w-3.5" />
            {categoria.rotulo}
          </span>
          <span aria-hidden="true" className="text-line">
            /
          </span>
          <span className="text-mute">
            {pedido.bairro} · {pedido.municipio}
          </span>
          <span aria-hidden="true" className="text-line">
            /
          </span>
          <span className="text-mute">{tempoRelativo(pedido.criadoEm)}</span>

          {pedido.exemplo ? (
            <span className="selo ml-auto bg-ink/5 text-mute">pedido de exemplo</span>
          ) : (
            <span
              className={`selo ml-auto ${
                pedido.estado === 'aberto'
                  ? 'bg-forest-500/10 text-forest-700'
                  : 'bg-ink/5 text-ink-soft'
              }`}
            >
              {ETIQUETA_ESTADO[pedido.estado] ?? pedido.estado}
            </span>
          )}
        </div>

        <h1 className="titulo-display mt-4 text-[clamp(2rem,5.5vw,3.4rem)] texto-balanco">
          {pedido.titulo}
        </h1>
      </header>

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

      {/* Propostas recebidas — visíveis a quem publicou o pedido. */}
      {ehMeuPedido && propostasDoPedido.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="seccao-titulo text-xl">Propostas recebidas</h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">
              {propostasDoPedido.length}
            </span>
          </div>

          <ul className="mt-3 space-y-2">
            {propostasDoPedido.map((proposta) => (
              <li
                key={proposta.id}
                className={`cartao p-4 ${
                  proposta.estado === 'aceite' ? 'border-forest-500/40' : ''
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{proposta.autorNome}</span>
                  <span className="flex items-center gap-2 text-[11px] text-mute">
                    {proposta.estado !== 'pendente' && (
                      <span
                        className={`selo ${
                          proposta.estado === 'aceite'
                            ? 'bg-forest-500/10 text-forest-700'
                            : 'bg-ink/5 text-mute'
                        }`}
                      >
                        {proposta.estado === 'aceite' ? 'aceite' : 'recusada'}
                      </span>
                    )}
                    {tempoRelativo(proposta.criadoEm)}
                  </span>
                </div>

                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {proposta.mensagem}
                </p>

                {(proposta.precoTexto || proposta.prazoTexto) && (
                  <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-mute">
                    {proposta.precoTexto && <span>Valor: {proposta.precoTexto}</span>}
                    {proposta.prazoTexto && <span>Prazo: {proposta.prazoTexto}</span>}
                  </p>
                )}

                {ehMeuPedido && pedido.estado === 'aberto' && (
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

          {erroAcao && (
            <p role="alert" className="mt-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {erroAcao}
            </p>
          )}
        </section>
      )}

      {/* Formulário — visível ao profissional que ainda não propôs. */}
      {!ehMeuPedido &&
        !pedido.exemplo &&
        !minhaProposta &&
        sessao &&
        pedido.estado === 'aberto' && (
          <FormularioProposta pedidoId={pedido.id} autorNome={sessao.nome} />
        )}

      {/* Conversa — só depois de haver proposta, e nunca em pedidos de exemplo. */}
      {!pedido.exemplo && (ehMeuPedido || minhaProposta) && (
        <Conversa
          pedidoId={pedido.id}
          lado={ehMeuPedido ? 'cliente' : 'prestador'}
          autorNome={ehMeuPedido ? pedido.autorNome : (sessao?.nome ?? 'Profissional')}
          fechada={fechado}
        />
      )}

      {/* Avaliação — só o cliente, só depois de concluído, só uma vez. */}
      {ehMeuPedido && pedido.estado === 'concluido' && !jaAvaliei && propostaAceite && (
        <AvaliacaoForm
          pedidoId={pedido.id}
          autorNome={pedido.autorNome}
          alvoNome={propostaAceite.autorNome}
          alvoTipo="prestador"
        />
      )}

      <footer className="mt-8">
        {ehMeuPedido ? (
          <div className="cartao p-5 sm:p-6">
            {pedido.estado === 'aberto' && (
              <>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-forest-500" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700">
                    Publicado
                  </p>
                </div>
                <p className="mt-3 text-lg font-semibold">O teu pedido está no mural.</p>
                <p className="mt-1.5 text-sm leading-relaxed text-mute">
                  Quem tiver interesse envia uma proposta ou contacta-te pelo WhatsApp. O
                  primeiro passo é de quem vai resolver.
                </p>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-sand px-4 py-3">
                  <span className="text-xs font-medium uppercase tracking-[0.1em] text-mute">
                    Profissionais interessados
                  </span>
                  <span className="numeral text-2xl leading-none">{contactosRecebidos}</span>
                </div>
              </>
            )}

            {pedido.estado === 'acordado' && (
              <>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-600" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">
                    Acordado
                  </p>
                </div>
                <p className="mt-3 text-lg font-semibold">
                  Escolheste {propostaAceite?.autorNome ?? 'um profissional'}.
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-mute">
                  O trabalho está combinado, ainda não concluído. Quando estiver feito,
                  marca aqui — é isso que permite avaliar.
                </p>
                <button
                  type="button"
                  className="btn-primario mt-4 w-full px-4 py-2.5 text-sm"
                  disabled={aProcessar}
                  onClick={() => void concluir()}
                >
                  Marcar como concluído
                </button>
                {erroAcao && (
                  <p className="mt-2 text-sm text-red-700" role="alert">
                    {erroAcao}
                  </p>
                )}
              </>
            )}

            {pedido.estado === 'concluido' && (
              <>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-forest-500" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700">
                    Concluído
                  </p>
                </div>
                <p className="mt-3 text-lg font-semibold">Trabalho terminado.</p>
                <p className="mt-1.5 text-sm leading-relaxed text-mute">
                  {jaAvaliei
                    ? 'A tua avaliação está registada. Obrigado — é assim que a reputação se constrói.'
                    : 'Ainda podes avaliar o profissional abaixo.'}
                </p>
              </>
            )}
          </div>
        ) : pedido.exemplo ? (
          <div className="cartao p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-mute">
              Este é um pedido de exemplo, criado para mostrar como funciona. Não representa
              uma pessoa real, por isso o contacto está desactivado. Publica o teu próprio
              pedido para percorrer a experiência completa.
            </p>
            <Link to="/publicar-pedido" className="btn-primario mt-4 w-full px-4 py-2.5 text-sm">
              Publicar um pedido
            </Link>
          </div>
        ) : minhaProposta ? (
          <div className="cartao p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${
                  minhaProposta.estado === 'aceite' ? 'bg-forest-500' : 'bg-ink/20'
                }`}
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                {minhaProposta.estado === 'aceite'
                  ? 'Proposta aceite'
                  : minhaProposta.estado === 'recusada'
                    ? 'Proposta não escolhida'
                    : 'Proposta enviada'}
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              {minhaProposta.estado === 'aceite'
                ? 'O cliente escolheu-te. Combina os detalhes na conversa acima ou no WhatsApp.'
                : minhaProposta.estado === 'recusada'
                  ? 'O cliente escolheu outro profissional desta vez. O teu perfil continua visível para outros pedidos.'
                  : 'Ainda à espera de resposta. Podes adiantar detalhes na conversa acima.'}
            </p>
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-clay mt-4 w-full px-4 py-2.5 text-sm"
              onClick={() => {
                setContactado(true);
                void registarContacto('pedido', pedido.id, 'pedido');
              }}
            >
              {contactado ? 'Reabrir WhatsApp' : 'Falar no WhatsApp'}
            </a>
          </div>
        ) : pedido.estado !== 'aberto' ? (
          /* Um pedido que já não está aberto não recebe propostas nem contactos novos. */
          <div className="cartao p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
              {ETIQUETA_ESTADO[pedido.estado] ?? pedido.estado}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              Este pedido já tem profissional. Vê outros pedidos abertos na tua zona.
            </p>
            <Link to="/pedidos" className="btn-secundario mt-4 w-full px-4 py-2.5 text-sm">
              Ver o mural
            </Link>
          </div>
        ) : contactado ? (
          <div className="cartao border-forest-500/30 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-forest-500" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700">
                Contacto iniciado
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Abrimos o WhatsApp com a mensagem já escrita. Combina o resto directamente —
              o SALU não intermedeia o dinheiro.
            </p>
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secundario mt-4 w-full px-4 py-2.5 text-sm"
            >
              Reabrir conversa
            </a>
          </div>
        ) : (
          <>
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-clay w-full px-5 py-3.5 text-base"
              onClick={() => {
                setContactado(true);
                void registarContacto('pedido', pedido.id, 'pedido');
              }}
            >
              Falar no WhatsApp
            </a>
            <p className="mt-3 text-center text-xs leading-relaxed text-mute">
              A mensagem já vai escrita com o título do pedido. O SALU não recebe nem
              intermedeia o pagamento.
            </p>
          </>
        )}
      </footer>
    </article>
  );
}
