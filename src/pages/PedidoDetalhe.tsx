import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { obterCategoria } from '../domain/categorias';
import { construirLinkWhatsAppPedido } from '../domain/whatsapp';
import { tempoRelativo } from '../lib/formato';
import { IconeCategoria } from '../components/IconeCategoria';

export function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const pedidos = useApp((estado) => estado.pedidos);
  const contactos = useApp((estado) => estado.contactos);
  const carregar = useApp((estado) => estado.carregar);
  const carregarContactos = useApp((estado) => estado.carregarContactos);
  const estado = useApp((estado) => estado.estado);
  const registarContacto = useApp((estado) => estado.registarContacto);
  const sessao = useSessao((estado) => estado.sessao);

  useEffect(() => {
    void carregar();
    void carregarContactos();
  }, [carregar, carregarContactos]);

  const pedido = pedidos.find((item) => item.id === id);

  if (!pedido) {
    return (
      <div className="cartao border-dashed p-8 text-center">
        <p className="font-medium">
          {estado === 'a-carregar' ? 'A carregar…' : 'Pedido não encontrado.'}
        </p>
        {estado !== 'a-carregar' && (
          <Link to="/pedidos" className="btn-secundario mt-4">
            Voltar ao mural
          </Link>
        )}
      </div>
    );
  }

  const categoria = obterCategoria(pedido.categoria);

  /*
   * Regra de produto: quem publica o pedido está a pedir ajuda, não a contactar.
   * O primeiro passo é de quem vai resolver — por isso o botão de WhatsApp não
   * aparece ao autor do pedido. Mostrar-lhe o seu próprio contacto era pedir-lhe
   * que falasse consigo mesmo.
   */
  const ehMeuPedido = Boolean(sessao?.pedidoIds.includes(pedido.id));
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
      <Link to="/pedidos" className="text-sm text-mute hover:text-ink">
        ← Mural de pedidos
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="selo gap-1 bg-forest-500/10 text-forest-600">
            <IconeCategoria categoria={pedido.categoria} className="h-3.5 w-3.5" />
            {categoria.rotulo}
          </span>
          {pedido.exemplo && (
            <span className="selo bg-line/70 text-mute">Pedido de exemplo</span>
          )}
          <span className="text-xs text-mute">{tempoRelativo(pedido.criadoEm)}</span>
        </div>

        <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
          {pedido.titulo}
        </h1>
        <p className="mt-1 text-sm text-mute">
          {pedido.bairro} · {pedido.municipio}
        </p>
      </header>

      {pedido.fotoUrl && (
        <img
          src={pedido.fotoUrl}
          alt="Fotografia enviada com o pedido"
          className="mt-5 w-full rounded-2xl border border-line object-cover"
        />
      )}

      <section className="cartao mt-5 p-5">
        <h2 className="sr-only">Descrição do pedido</h2>
        <p className="whitespace-pre-line leading-relaxed">{pedido.descricao}</p>
      </section>

      <section className="mt-6">
        {ehMeuPedido ? (
          <div className="cartao p-5">
            <p className="font-semibold">O teu pedido está publicado.</p>
            <p className="mt-1 text-sm text-mute">
              Já está no mural, à espera de um profissional. Quem tiver interesse entra em
              contacto contigo pelo WhatsApp — o primeiro passo é de quem vai resolver.
            </p>

            {contactosRecebidos > 0 && (
              <p className="mt-3 text-sm">
                <span className="font-semibold">{contactosRecebidos}</span>{' '}
                {contactosRecebidos === 1
                  ? 'profissional já demonstrou interesse'
                  : 'profissionais já demonstraram interesse'}
                .
              </p>
            )}

            <Link to="/pedidos" className="btn-secundario mt-4 w-full">
              Ver o mural de pedidos
            </Link>
          </div>
        ) : pedido.exemplo ? (
          <div className="cartao p-5">
            <p className="text-sm text-mute">
              Este é um pedido de exemplo, criado para mostrar como funciona. Não
              corresponde a uma pessoa real e o contacto está desactivado. Publica o teu
              próprio pedido para experimentar o percurso completo.
            </p>
            <Link to="/publicar-pedido" className="btn-secundario mt-4 w-full">
              Publicar um pedido
            </Link>
          </div>
        ) : (
          <>
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primario w-full text-base"
              onClick={() => {
                void registarContacto('pedido', pedido.id, 'pedido');
              }}
            >
              Falar no WhatsApp
            </a>
            <p className="mt-3 text-center text-xs text-mute">
              Combinam preço, deslocação e pagamento directamente entre vocês. O SALU não
              recebe nem intermedeia o dinheiro.
            </p>
          </>
        )}
      </section>
    </article>
  );
}
