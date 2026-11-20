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
  const definirFiltroPedidos = useApp((estado) => estado.definirFiltroPedidos);

  const [termo, setTermo] = useState('');

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const destaques = perfis.filter((perfil) => perfil.disponivel).slice(0, 3);
  const pedidosRecentes = pedidos.filter((pedido) => pedido.estado === 'aberto').slice(0, 3);

  function pesquisar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = termo.trim();
    definirFiltro({ texto, categoria: 'todas', municipio: 'todos' });
    definirFiltroPedidos({ texto, categoria: 'todas', municipio: 'todos' });
    navegar('/explorar');
  }

  function abrirCategoria(categoria: CategoriaId) {
    definirFiltro({ texto: '', categoria, municipio: 'todos' });
    navegar('/explorar');
  }

  return (
    <div className="space-y-14 sm:space-y-20">
      {/* -- Abertura ---------------------------------------------------- */}
      <section className="grid gap-8 pt-2 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-12">
        <div>
          <p className="eyebrow anim-subir">Luanda · trabalho independente</p>
          <h1 className="titulo-display anim-subir atraso-1 mt-4 text-[clamp(2.7rem,8vw,5.4rem)] texto-balanco">
            O teu próximo
            <br />
            trabalho começa{' '}
            <em className="italic text-brand-600">aqui</em>.
          </h1>
        </div>

        <div className="anim-subir atraso-2 lg:pb-2">
          <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft texto-bonito">
            Um sítio onde quem sabe fazer aparece, e quem precisa encontra. Sem depender de
            conheceres as pessoas certas.
          </p>

          <form onSubmit={pesquisar} className="mt-5">
            <label htmlFor="pesquisa-home" className="sr-only">
              O que procuras hoje?
            </label>
            <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-paper p-1.5 pl-4 shadow-suave transition focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-600/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                className="h-5 w-5 shrink-0 text-mute"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              <input
                id="pesquisa-home"
                type="search"
                className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-mute/70"
                placeholder="Reparar frigorífico, logotipo…"
                value={termo}
                onChange={(evento) => setTermo(evento.target.value)}
              />
              <button type="submit" className="btn-primario shrink-0 px-4 py-2 text-sm">
                Procurar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* -- Duas portas -------------------------------------------------- */}
      <section className="anim-subir atraso-3 grid gap-3 sm:grid-cols-2">
        <Link
          to="/entrar?tipo=prestador"
          className="cartao-interativo group relative overflow-hidden p-6 sm:p-7"
        >
          <span className="numeral pointer-events-none absolute -right-2 -top-4 text-[86px] leading-none text-brand-600/10">
            01
          </span>
          <span className="relative block text-lg font-semibold">Quero trabalhar</span>
          <span className="relative mt-1.5 block max-w-[22ch] text-sm leading-relaxed text-mute">
            Cria o teu perfil e aparece nas pesquisas.
          </span>
          <span className="link-seta relative mt-5 inline-flex">
            Criar perfil
            <span className="transition group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </span>
        </Link>

        <Link
          to="/entrar?tipo=cliente"
          className="cartao-interativo group relative overflow-hidden p-6 sm:p-7"
        >
          <span className="numeral pointer-events-none absolute -right-2 -top-4 text-[86px] leading-none text-brand-500/20">
            02
          </span>
          <span className="relative block text-lg font-semibold">Preciso de um serviço</span>
          <span className="relative mt-1.5 block max-w-[24ch] text-sm leading-relaxed text-mute">
            Publica o teu pedido ou encontra um profissional.
          </span>
          <span className="link-seta relative mt-5 inline-flex">
            Publicar pedido
            <span className="transition group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </span>
        </Link>
      </section>

      {/* -- O que é diferente (sem números inventados) -------------------- */}
      <section className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 lg:grid-cols-4" aria-label="O que distingue o SALU">
        {[
          ['Quem começa aparece', 'Um perfil novo entra na pesquisa sem precisar de histórico.'],
          ['Preço privado', 'O que combinam fica entre os dois, nunca em página pública.'],
          ['Confiança a duas mãos', 'Clientes avaliam profissionais e profissionais avaliam clientes.'],
          ['WhatsApp quando quiserem', 'A conversa fica registada; a saída para o WhatsApp é livre.'],
        ].map(([titulo, texto]) => (
          <div key={titulo}>
            <p className="titulo-display text-xl leading-tight">{titulo}</p>
            <p className="mt-1 text-sm leading-relaxed text-mute">{texto}</p>
          </div>
        ))}
      </section>

      {/* -- Faixa de categorias ------------------------------------------ */}
      <section aria-label="Categorias" className="-mx-4 overflow-hidden border-y border-line py-3">
        <div className="marquee flex w-max gap-6 pr-6">
          {[...CATEGORIAS, ...CATEGORIAS].map((categoria, indice) => (
            <span
              key={`${categoria.id}-${indice}`}
              className="flex items-center gap-2 whitespace-nowrap text-sm text-ink-soft"
            >
              <IconeCategoria categoria={categoria.id} className="h-4 w-4 text-brand-600" />
              {categoria.rotulo}
              <span aria-hidden="true" className="ml-4 text-brand-600/40">
                ·
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* -- Categorias --------------------------------------------------- */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="seccao-titulo">O que procuras hoje?</h2>
          <Link to="/explorar" className="link-seta hidden sm:inline-flex">
            Ver tudo <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIAS.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => abrirCategoria(categoria.id)}
              className="cartao-interativo flex items-center gap-2.5 px-3.5 py-3 text-left"
            >
              <IconeCategoria categoria={categoria.id} className="h-[18px] w-[18px] text-brand-600" />
              <span className="text-sm font-medium">{categoria.rotulo}</span>
            </button>
          ))}
        </div>
      </section>

      {/* -- Como funciona ------------------------------------------------ */}
      <section>
        <h2 className="seccao-titulo">Como funciona</h2>
        <ol className="mt-4 divide-y divide-line border-y border-line">
          {[
            ['Publicas o pedido', 'Descreves o problema e juntas uma fotografia.'],
            ['Um profissional encontra', 'Aparece no mural, filtrado por ofício e bairro.'],
            ['Falam no WhatsApp', 'Combinam preço e hora directamente. Sem intermediários.'],
          ].map(([titulo, texto], indice) => (
            <li key={titulo} className="flex gap-4 py-4 sm:gap-6">
              <span className="numeral w-8 shrink-0 text-xl text-brand-600">
                {String(indice + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{titulo}</span>
                <span className="mt-0.5 block text-sm text-mute">{texto}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* -- Profissionais ------------------------------------------------ */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="seccao-titulo">Profissionais</h2>
          <Link to="/explorar" className="link-seta">
            Ver todos <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {destaques.map((perfil) => (
            <PerfilCartao key={perfil.id} perfil={perfil} />
          ))}
        </div>
      </section>

      {/* -- Pedidos ------------------------------------------------------ */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="seccao-titulo">Pedidos recentes</h2>
          <Link to="/pedidos" className="link-seta">
            Ver mural <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {pedidosRecentes.map((pedido) => (
            <PedidoCartao key={pedido.id} pedido={pedido} />
          ))}
        </div>
      </section>

      {/* -- Confiança ---------------------------------------------------- */}
      <section>
        <h2 className="seccao-titulo">Confiança, sem atalhos</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ['Entrada sem barreiras', 'Não é preciso dinheiro, contactos nem portefólio para publicar um perfil. A reputação constrói-se trabalho a trabalho.'],
            ['Responsabilidade dos dois lados', 'A avaliação tem três dimensões e corre nos dois sentidos. Uma nota diz quanto; as dimensões dizem porquê.'],
            ['Denúncias com análise', 'Há um sítio para denunciar e um processo com direito a resposta. Uma denúncia não é uma condenação.'],
          ].map(([titulo, texto]) => (
            <div key={titulo} className="cartao p-5">
              <p className="font-semibold">{titulo}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-mute">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -- Fecho -------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-cartao bg-ink px-6 py-9 text-sand sm:px-10 sm:py-12">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl"
        />
        <p className="eyebrow relative text-sand/50">O princípio</p>
        <p className="titulo-display relative mt-3 max-w-2xl text-[clamp(1.6rem,3.4vw,2.6rem)] texto-balanco">
          Quem procura a primeira oportunidade nunca paga para ser visto.
        </p>
        <div className="relative mt-6 flex flex-wrap gap-2">
          <Link to="/entrar?tipo=prestador" className="btn-clay px-5 py-2.5 text-sm">
            Criar o meu perfil
          </Link>
          <Link
            to="/pedidos"
            className="inline-flex items-center rounded-full border border-sand/25 px-5 py-2.5 text-sm font-medium text-sand transition hover:border-sand/60"
          >
            Ver pedidos
          </Link>
        </div>
      </section>
    </div>
  );
}
