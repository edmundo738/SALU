import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { PedidoCartao } from '../components/PedidoCartao';

export function MinhaArea() {
  const sessao = useSessao((estado) => estado.sessao);
  const sair = useSessao((estado) => estado.sair);

  const perfis = useApp((estado) => estado.perfis);
  const pedidos = useApp((estado) => estado.pedidos);
  const contactos = useApp((estado) => estado.contactos);
  const carregar = useApp((estado) => estado.carregar);
  const carregarContactos = useApp((estado) => estado.carregarContactos);

  useEffect(() => {
    void carregar();
    void carregarContactos();
  }, [carregar, carregarContactos]);

  if (!sessao) {
    return (
      <div className="cartao mx-auto max-w-md p-6 text-center">
        <p className="font-semibold">Ainda não entraste.</p>
        <p className="mt-1 text-sm text-mute">
          Escolhe o teu lado do mercado para começar.
        </p>
        <Link to="/entrar" className="btn-primario mt-4 w-full">
          Entrar
        </Link>
      </div>
    );
  }

  const meuPerfil = sessao.perfilId
    ? perfis.find((perfil) => perfil.id === sessao.perfilId)
    : undefined;

  const meusPedidos = pedidos.filter((pedido) => sessao.pedidoIds.includes(pedido.id));

  const contactosRecebidos = meuPerfil
    ? contactos.filter(
        (evento) => evento.alvoTipo === 'perfil' && evento.alvoId === meuPerfil.id,
      ).length
    : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="cartao flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">Sessão de demonstração</p>
          <h1 className="mt-1 text-xl font-black">{sessao.nome}</h1>
          <p className="text-sm text-mute">
            {sessao.tipo === 'prestador' ? 'Prestador de serviços' : 'Cliente'}
          </p>
        </div>
        <button type="button" className="btn-secundario px-4 py-2 text-sm" onClick={sair}>
          Sair
        </button>
      </header>

      {sessao.tipo === 'prestador' && (
        <section>
          <h2 className="seccao-titulo">O meu perfil</h2>

          {meuPerfil ? (
            <div className="cartao mt-3 p-5">
              <p className="font-semibold">{meuPerfil.oficio}</p>
              <p className="text-sm text-mute">
                {meuPerfil.bairro} · {meuPerfil.municipio}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/perfil/${meuPerfil.id}`} className="btn-secundario px-4 py-2 text-sm">
                  Ver perfil público
                </Link>
                <Link to="/pedidos" className="btn-primario px-4 py-2 text-sm">
                  Procurar pedidos
                </Link>
              </div>
            </div>
          ) : (
            <div className="cartao mt-3 border-dashed p-5">
              <p className="text-sm text-mute">
                Ainda não publicaste o teu perfil. É gratuito e leva dois minutos.
              </p>
              <Link to="/perfil/novo" className="btn-primario mt-4 px-4 py-2 text-sm">
                Criar perfil
              </Link>
            </div>
          )}

          {meuPerfil && (
            <div className="cartao mt-3 flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-mute">Contactos recebidos</p>
                <p className="text-2xl font-black">{contactosRecebidos}</p>
              </div>
              <p className="max-w-56 text-xs text-mute">
                Pessoas que tocaram no botão de WhatsApp do teu perfil neste dispositivo.
              </p>
            </div>
          )}
        </section>
      )}

      {sessao.tipo === 'cliente' && (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="seccao-titulo">Os meus pedidos</h2>
            <Link to="/publicar-pedido" className="btn-secundario px-4 py-2 text-sm">
              Novo pedido
            </Link>
          </div>

          {meusPedidos.length === 0 ? (
            <div className="cartao mt-3 border-dashed p-5">
              <p className="text-sm text-mute">
                Ainda não publicaste nenhum pedido. Descreve o que precisas e um
                profissional encontra-te.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {meusPedidos.map((pedido) => (
                <li key={pedido.id}>
                  <PedidoCartao pedido={pedido} />
                </li>
              ))}
            </ul>
          )}

          <Link to="/explorar" className="link-seta mt-4 inline-flex">
            Ou procura um profissional <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}

      <p className="text-xs text-mute">
        Esta área mostra apenas o que foi criado neste dispositivo. Ainda não há contas
        reais: é uma sessão de demonstração.
      </p>
    </div>
  );
}
