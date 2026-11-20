import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../state/store';
import { CATEGORIAS } from '../domain/categorias';
import type { CategoriaId } from '../domain/types';
import { IconeCategoria } from '../components/IconeCategoria';
import { PerfilCartao } from '../components/PerfilCartao';
import { PedidoCartao } from '../components/PedidoCartao';

export function Home() {
  const navegar = useNavigate();
  const perfis = useApp((estado) => estado.perfis);
  const pedidos = useApp((estado) => estado.pedidos);
  const carregar = useApp((estado) => estado.carregar);
  const definirFiltro = useApp((estado) => estado.definirFiltro);

  const [termo, setTermo] = useState('');

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const destaques = perfis.filter((perfil) => perfil.disponivel).slice(0, 3);
  const pedidosRecentes = pedidos.filter((pedido) => pedido.estado === 'aberto').slice(0, 3);

  function pesquisar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    definirFiltro({ texto: termo, categoria: 'todas', municipio: 'todos' });
    navegar('/explorar');
  }

  function abrirCategoria(categoria: CategoriaId) {
    definirFiltro({ texto: '', categoria, municipio: 'todos' });
    navegar('/explorar');
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-brand-50 via-sand to-sand px-5 py-9 sm:px-10 sm:py-12">
        <span className="selo bg-forest-500/10 text-forest-600">Luanda · trabalho independente</span>

        <h1 className="mt-3 max-w-2xl text-3xl font-black leading-[1.06] sm:text-5xl">
          O teu próximo trabalho começa aqui.
        </h1>

        <p className="mt-3 max-w-xl text-mute">
          Encontra quem pode ajudar. Mostra o que sabes fazer. Descobre novas
          oportunidades — sem depender de conheceres as pessoas certas.
        </p>

        <form onSubmit={pesquisar} className="mt-6 max-w-xl">
          <label htmlFor="pesquisa-home" className="sr-only">
            O que procuras hoje?
          </label>
          <div className="flex gap-2">
            <input
              id="pesquisa-home"
              type="search"
              className="campo"
              placeholder="O que procuras hoje? Ex.: reparar frigorífico"
              value={termo}
              onChange={(evento) => setTermo(evento.target.value)}
            />
            <button type="submit" className="btn-primario shrink-0 px-5">
              Procurar
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/entrar?tipo=prestador"
          className="cartao group flex items-center gap-4 p-5 transition hover:border-ink/25 hover:shadow-sm"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest-500/10 text-forest-600">
            <IconeCategoria categoria="tecnologia" className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block font-bold">Quero trabalhar</span>
            <span className="block text-sm text-mute">
              Cria o teu perfil e apresenta os teus serviços.
            </span>
          </span>
        </Link>

        <Link
          to="/entrar?tipo=cliente"
          className="cartao group flex items-center gap-4 p-5 transition hover:border-ink/25 hover:shadow-sm"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700">
            <IconeCategoria categoria="reparacoes" className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block font-bold">Preciso de um serviço</span>
            <span className="block text-sm text-mute">
              Encontra um profissional ou publica o teu pedido.
            </span>
          </span>
        </Link>
      </section>

      <section>
        <h2 className="seccao-titulo">O que procuras hoje?</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CATEGORIAS.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => abrirCategoria(categoria.id)}
              className="cartao flex items-center gap-2.5 px-3 py-3 text-left transition hover:border-ink/25"
            >
              <IconeCategoria categoria={categoria.id} className="h-5 w-5 text-forest-600" />
              <span className="text-sm font-medium">{categoria.rotulo}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-ink px-5 py-7 text-sand sm:px-8">
        <h2 className="text-lg font-bold sm:text-xl">Como funciona</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            ['Publicas o teu pedido', 'Descreves o problema e juntas uma fotografia.'],
            ['Um profissional encontra', 'Aparece no mural, filtrado por ofício e bairro.'],
            ['Falam no WhatsApp', 'Sem intermediários: combinam preço e hora directamente.'],
          ].map(([titulo, texto], indice) => (
            <li key={titulo} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sand/15 text-sm font-bold">
                {indice + 1}
              </span>
              <span>
                <span className="block font-semibold">{titulo}</span>
                <span className="block text-sm text-sand/70">{texto}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="seccao-titulo">Profissionais</h2>
          <Link to="/explorar" className="link-seta">
            Ver todos <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {destaques.map((perfil) => (
            <PerfilCartao key={perfil.id} perfil={perfil} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="seccao-titulo">Pedidos recentes</h2>
          <Link to="/pedidos" className="link-seta">
            Ver mural <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {pedidosRecentes.map((pedido) => (
            <PedidoCartao key={pedido.id} pedido={pedido} />
          ))}
        </div>
      </section>
    </div>
  );
}
