import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSessao } from '../state/sessao';
import { useApp } from '../state/store';
import type { TipoSessao } from '../domain/types';
import { IconeCategoria } from '../components/IconeCategoria';
import { PERSONAS } from '../data/semente';
import { iniciais } from '../lib/formato';

const OPCOES: { tipo: TipoSessao; titulo: string; texto: string; icone: 'tecnologia' | 'reparacoes' }[] =
  [
    {
      tipo: 'prestador',
      titulo: 'Sou prestador de serviços',
      texto: 'Quero mostrar o que sei fazer e ser encontrado por clientes.',
      icone: 'tecnologia',
    },
    {
      tipo: 'cliente',
      titulo: 'Procuro um serviço',
      texto: 'Preciso de resolver um problema e quero encontrar quem o faça.',
      icone: 'reparacoes',
    },
  ];

export function Entrar() {
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const entrar = useSessao((estado) => estado.entrar);
  const modo = useApp((estado) => estado.modo);

  function entrarComo(persona: (typeof PERSONAS)[number]) {
    entrar(persona.tipo, persona.nome);
    navegar(persona.rota);
  }

  const [tipo, setTipo] = useState<TipoSessao>(
    parametros.get('tipo') === 'cliente' ? 'cliente' : 'prestador',
  );
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  function submeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (nome.trim().length < 2) {
      setErro('Escreva o seu nome para continuar.');
      return;
    }

    entrar(tipo, nome);
    navegar('/painel');
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-black sm:text-3xl">Como queres usar o SALU?</h1>
      <p className="mt-2 text-sm text-mute">
        Escolhe o teu lado do mercado. Podes mudar quando quiseres.
      </p>

      <form onSubmit={submeter} className="mt-6 space-y-5" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          {OPCOES.map((opcao) => (
            <button
              key={opcao.tipo}
              type="button"
              onClick={() => setTipo(opcao.tipo)}
              aria-pressed={tipo === opcao.tipo}
              className={`cartao p-4 text-left transition ${
                tipo === opcao.tipo
                  ? 'border-ink ring-2 ring-ink/10'
                  : 'hover:border-ink/25'
              }`}
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${
                  tipo === opcao.tipo
                    ? 'bg-forest-600 text-white'
                    : 'bg-brand-100 text-brand-700'
                }`}
              >
                <IconeCategoria categoria={opcao.icone} className="h-5 w-5" />
              </span>
              <span className="mt-3 block font-semibold">{opcao.titulo}</span>
              <span className="mt-1 block text-sm text-mute">{opcao.texto}</span>
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="nome-sessao" className="etiqueta">
            Como te chamas
          </label>
          <input
            id="nome-sessao"
            className="campo"
            autoComplete="name"
            placeholder="O teu primeiro nome"
            value={nome}
            onChange={(evento) => {
              setNome(evento.target.value);
              setErro(null);
            }}
            aria-invalid={Boolean(erro)}
          />
          {erro && <p className="mt-1 text-sm text-red-700">{erro}</p>}
        </div>

        <button type="submit" className="btn-primario w-full">
          {tipo === 'prestador' ? 'Criar o meu perfil' : 'Publicar um pedido'}
        </button>
      </form>

      <p className="mt-5 rounded-xl border border-line bg-paper p-3 text-xs text-mute">
        <strong className="text-ink">Sessão de demonstração.</strong> Não pedimos
        palavra-passe, não verificamos identidade e não enviamos SMS. Nesta versão os
        teus dados ficam apenas neste dispositivo.
      </p>

      {modo === 'local' && (
        <section className="mt-10" aria-labelledby="personas-titulo">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="personas-titulo" className="seccao-titulo text-xl">
              Ou entra como uma personagem
            </h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">
              demonstração
            </span>
          </div>
          <p className="mt-1 text-sm text-mute">
            Pessoas fictícias com história já criada — pedidos, propostas, conversas e
            avaliações — para percorrer o produto sem começar do zero.
          </p>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {PERSONAS.map((persona) => (
              <li key={persona.nome}>
                <button
                  type="button"
                  onClick={() => entrarComo(persona)}
                  className="cartao-interativo flex w-full items-start gap-3 p-3.5 text-left"
                >
                  <span
                    aria-hidden="true"
                    className={`titulo-display grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${
                      persona.tipo === 'prestador'
                        ? 'bg-forest-500/10 text-forest-700'
                        : 'bg-brand-100 text-brand-700'
                    }`}
                  >
                    {iniciais(persona.nome).charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold">{persona.nome}</span>
                      <span className="selo bg-ink/5 text-mute">
                        {persona.tipo === 'prestador' ? 'prestador' : 'cliente'}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-mute">
                      {persona.papel}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
