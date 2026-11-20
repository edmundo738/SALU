import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../state/store';
import { obterCategoria } from '../domain/categorias';
import { formatarTelefone } from '../domain/telefone';
import { construirLinkWhatsApp } from '../domain/whatsapp';

export function PerfilPublico() {
  const { id } = useParams<{ id: string }>();
  const perfis = useApp((estado) => estado.perfis);
  const carregar = useApp((estado) => estado.carregar);
  const estado = useApp((estado) => estado.estado);
  const registarContacto = useApp((estado) => estado.registarContacto);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const perfil = perfis.find((item) => item.id === id);

  if (!perfil) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-8 text-center">
        <p className="font-medium">
          {estado === 'a-carregar' ? 'A carregar…' : 'Perfil não encontrado.'}
        </p>
        {estado !== 'a-carregar' && (
          <Link to="/" className="btn-secundario mt-4">
            Voltar à pesquisa
          </Link>
        )}
      </div>
    );
  }

  const categoria = obterCategoria(perfil.categoria);
  const linkWhatsApp = construirLinkWhatsApp({
    telefone: perfil.telefone,
    nome: perfil.nome,
    oficio: perfil.oficio,
  });

  return (
    <article>
      <Link to="/" className="text-sm text-mute hover:text-ink">
        ← Voltar à pesquisa
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="selo bg-forest-500/10 text-forest-600">{categoria.rotulo}</span>
          {perfil.exemplo && <span className="selo bg-line/70 text-mute">Perfil de exemplo</span>}
        </div>

        <h1 className="mt-3 text-2xl font-black sm:text-3xl">{perfil.nome}</h1>
        <p className="text-lg text-mute">{perfil.oficio}</p>
        <p className="mt-1 text-sm text-mute">
          {perfil.bairro} · {perfil.municipio}
        </p>
      </header>

      <section className="mt-6 rounded-2xl border border-line bg-paper p-5">
        <h2 className="sr-only">Descrição</h2>
        <p className="whitespace-pre-line leading-relaxed">{perfil.descricao}</p>

        {perfil.precoTexto && (
          <p className="mt-4 border-t border-line pt-3 text-sm">
            <span className="text-mute">Preço: </span>
            <span className="font-medium">{perfil.precoTexto}</span>
          </p>
        )}
      </section>

      <section className="mt-6">
        {perfil.exemplo ? (
          <div className="rounded-2xl border border-line bg-paper p-5">
            <p className="text-sm text-mute">
              Este é um perfil de exemplo criado para demonstrar a plataforma. Não
              corresponde a uma pessoa real, por isso o contacto está desactivado.
            </p>
          </div>
        ) : (
          <>
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primario w-full text-base"
              onClick={() => {
                void registarContacto(perfil.id, 'perfil');
              }}
            >
              Falar no WhatsApp
            </a>
            <p className="mt-3 text-center text-xs text-mute">
              Abre o WhatsApp com uma mensagem já escrita. Número:{' '}
              {formatarTelefone(perfil.telefone)}
            </p>
          </>
        )}
      </section>
    </article>
  );
}
