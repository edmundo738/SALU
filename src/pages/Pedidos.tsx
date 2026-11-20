import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp, usePedidosFiltrados } from '../state/store';
import { PedidoCartao } from '../components/PedidoCartao';
import { CATEGORIAS } from '../domain/categorias';
import { MUNICIPIOS } from '../domain/types';
import type { CategoriaId, Municipio } from '../domain/types';

export function Pedidos() {
  const pedidos = usePedidosFiltrados();
  const filtro = useApp((estado) => estado.filtroPedidos);
  const definirFiltroPedidos = useApp((estado) => estado.definirFiltroPedidos);
  const carregar = useApp((estado) => estado.carregar);
  const estado = useApp((estado) => estado.estado);
  const erro = useApp((estado) => estado.erro);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Mural de pedidos</h1>
          <p className="mt-1 text-sm text-mute">
            Pedidos de pessoas que precisam de um serviço. Se souberes fazer, responde.
          </p>
        </div>
        <Link to="/publicar-pedido" className="btn-secundario px-4 py-2 text-sm">
          Publicar pedido
        </Link>
      </header>

      <section aria-label="Filtros" className="mb-5 space-y-3">
        <label htmlFor="pesquisa-pedidos" className="sr-only">
          Pesquisar pedidos
        </label>
        <input
          id="pesquisa-pedidos"
          type="search"
          className="campo"
          placeholder="Ex.: frigorífico, logotipo, limpeza…"
          value={filtro.texto}
          onChange={(evento) => definirFiltroPedidos({ texto: evento.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            aria-label="Categoria"
            className="campo"
            value={filtro.categoria}
            onChange={(evento) =>
              definirFiltroPedidos({
                categoria: evento.target.value as CategoriaId | 'todas',
              })
            }
          >
            <option value="todas">Todas as categorias</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.rotulo}
              </option>
            ))}
          </select>

          <select
            aria-label="Município"
            className="campo"
            value={filtro.municipio}
            onChange={(evento) =>
              definirFiltroPedidos({ municipio: evento.target.value as Municipio | 'todos' })
            }
          >
            <option value="todos">Todo o município</option>
            {MUNICIPIOS.map((municipio) => (
              <option key={municipio} value={municipio}>
                {municipio}
              </option>
            ))}
          </select>
        </div>
      </section>

      {estado === 'erro' && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {erro}
        </p>
      )}

      <p className="mb-3 text-sm text-mute">
        {pedidos.length === 1 ? '1 pedido aberto' : `${pedidos.length} pedidos abertos`}
      </p>

      {pedidos.length === 0 ? (
        <div className="cartao border-dashed p-6 text-center">
          <p className="font-medium">Nenhum pedido encontrado.</p>
          <p className="mt-1 text-sm text-mute">
            Tenta outra palavra ou publica o que precisas.
          </p>
          <Link to="/publicar-pedido" className="btn-secundario mt-4">
            Publicar pedido
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {pedidos.map((pedido) => (
            <li key={pedido.id}>
              <PedidoCartao pedido={pedido} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
