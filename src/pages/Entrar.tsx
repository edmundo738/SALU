import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSessao } from '../state/sessao';
import type { TipoSessao } from '../domain/types';
import { IconeCategoria } from '../components/IconeCategoria';

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
    navegar(tipo === 'prestador' ? '/perfil/novo' : '/publicar-pedido');
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
    </div>
  );
}
