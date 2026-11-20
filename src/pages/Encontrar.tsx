import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp, usePerfisFiltrados } from '../state/store';
import { PerfilCartao } from '../components/PerfilCartao';
import { CATEGORIAS } from '../domain/categorias';
import { MUNICIPIOS } from '../domain/types';
import type { CategoriaId, Municipio } from '../domain/types';

export function Encontrar() {
  const perfis = usePerfisFiltrados();
  const filtro = useApp((estado) => estado.filtro);
  const definirFiltro = useApp((estado) => estado.definirFiltro);
  const carregar = useApp((estado) => estado.carregar);
  const estado = useApp((estado) => estado.estado);
  const erro = useApp((estado) => estado.erro);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">
          Encontre quem sabe fazer.
        </h1>
        <p className="mt-2 max-w-prose text-mute">
          Perfis de profissionais em Luanda que ficam visíveis depois de a conversa acabar —
          ao contrário do que acontece num grupo de WhatsApp.
        </p>
      </section>

      <section aria-label="Pesquisa" className="mb-6 space-y-3">
        <label htmlFor="pesquisa" className="sr-only">
          Pesquisar por ofício, nome ou bairro
        </label>
        <input
          id="pesquisa"
          type="search"
          className="campo"
          placeholder="Ex.: computador, electricista, Kilamba…"
          value={filtro.texto}
          onChange={(evento) => definirFiltro({ texto: evento.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="categoria" className="sr-only">
              Categoria
            </label>
            <select
              id="categoria"
              className="campo"
              value={filtro.categoria}
              onChange={(evento) =>
                definirFiltro({ categoria: evento.target.value as CategoriaId | 'todas' })
              }
            >
              <option value="todas">Todas as categorias</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="municipio" className="sr-only">
              Município
            </label>
            <select
              id="municipio"
              className="campo"
              value={filtro.municipio}
              onChange={(evento) =>
                definirFiltro({ municipio: evento.target.value as Municipio | 'todos' })
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
        </div>
      </section>

      {estado === 'erro' && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {erro}
        </p>
      )}

      <p className="mb-3 text-sm text-mute">
        {perfis.length === 1 ? '1 profissional' : `${perfis.length} profissionais`}
      </p>

      {estado === 'a-carregar' && perfis.length === 0 ? (
        <p className="text-sm text-mute">A carregar…</p>
      ) : perfis.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-6 text-center">
          <p className="font-medium">Nenhum perfil encontrado.</p>
          <p className="mt-1 text-sm text-mute">
            Tente outra palavra ou remova os filtros.
          </p>
          <Link
            to="/publicar"
            className="btn-secundario mt-4"
          >
            Publicar o meu perfil
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {perfis.map((perfil) => (
            <li key={perfil.id}>
              <PerfilCartao perfil={perfil} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
