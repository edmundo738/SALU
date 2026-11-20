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

export function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const pedidos = useApp((estado) => estado.pedidos);
  const propostas = useApp((estado) => estado.propostas);
  const contactos = useApp((estado) => estado.contactos);
  const carregar = useApp((estado) => estado.carregar);
  const carregarContactos = useApp((estado) => estado.carregarContactos);
  const estado = useApp((estado) => estado.estado);
  const registarContacto = useApp((estado) => estado.registarContacto);
  const sessao = useSessao((estado) => estado.sessao);

  const [contactado, setContactado] = useState(false);

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

  const minhaProposta = sessao
    ? propostasDoPedido.find((proposta) => proposta.autorNome === sessao.nome)
    : undefined;

  const contactosRecebidos = contactos.filter(
    (evento) => evento.alvoTipo === 'pedido' && evento.alvoId === pedido.id,
  ).length;

  const linkWhatsApp = construirLinkWhatsAppPedido({
    telefone: pedido.autorTelefone,
    nome: pedido.autorNome,
    titulo: pedido.titulo,
  });

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
          {pedido.exemplo && (
            <span className="selo ml-auto bg-ink/5 text-mute">pedido de exemplo</span>
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
              <li key={proposta.id} className="cartao p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{proposta.autorNome}</span>
                  <span className="text-[11px] text-mute">
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
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Formulário — visível ao profissional que ainda não propôs. */}
      {!ehMeuPedido && !pedido.exemplo && !minhaProposta && sessao && (
        <FormularioProposta pedidoId={pedido.id} autorNome={sessao.nome} />
      )}

      {/* Conversa — só depois de haver proposta, e nunca em pedidos de exemplo. */}
      {!pedido.exemplo && (ehMeuPedido || minhaProposta) && (
        <Conversa
          pedidoId={pedido.id}
          lado={ehMeuPedido ? 'cliente' : 'prestador'}
          autorNome={ehMeuPedido ? pedido.autorNome : (sessao?.nome ?? 'Profissional')}
        />
      )}

      <footer className="mt-8">
        {ehMeuPedido ? (
          <div className="cartao p-5 sm:p-6">
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

            <Link to="/pedidos" className="btn-secundario mt-4 w-full px-4 py-2.5 text-sm">
              Ver o mural
            </Link>
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
