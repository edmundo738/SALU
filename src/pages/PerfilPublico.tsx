import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { obterCategoria } from '../domain/categorias';
import { formatarTelefone } from '../domain/telefone';
import { construirLinkWhatsApp } from '../domain/whatsapp';
import { iniciais } from '../lib/formato';
import { IconeCategoria } from '../components/IconeCategoria';

export function PerfilPublico() {
  const { id } = useParams<{ id: string }>();
  const perfis = useApp((estado) => estado.perfis);
  const carregar = useApp((estado) => estado.carregar);
  const estado = useApp((estado) => estado.estado);
  const registarContacto = useApp((estado) => estado.registarContacto);
  const sessao = useSessao((estado) => estado.sessao);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const perfil = perfis.find((item) => item.id === id);

  if (!perfil) {
    return (
      <div className="cartao border-dashed p-8 text-center">
        <p className="font-medium">
          {estado === 'a-carregar' ? 'A carregar…' : 'Perfil não encontrado.'}
        </p>
        {estado !== 'a-carregar' && (
          <Link to="/explorar" className="btn-secundario mt-4">
            Voltar aos profissionais
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
    <article className="mx-auto max-w-2xl">
      <Link to="/explorar" className="text-sm text-mute hover:text-ink">
        ← Profissionais
      </Link>

      <header className="mt-4 flex items-start gap-4">
        {perfil.fotoUrl ? (
          <img
            src={perfil.fotoUrl}
            alt=""
            className="h-20 w-20 shrink-0 rounded-3xl object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-brand-100 text-2xl font-black text-brand-700"
          >
            {iniciais(perfil.nome)}
          </span>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="selo gap-1 bg-forest-500/10 text-forest-600">
              <IconeCategoria categoria={perfil.categoria} className="h-3.5 w-3.5" />
              {categoria.rotulo}
            </span>
            {perfil.exemplo && (
              <span className="selo bg-line/70 text-mute">Perfil de exemplo</span>
            )}
          </div>

          <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{perfil.nome}</h1>
          <p className="text-lg text-mute">{perfil.oficio}</p>
          <p className="mt-0.5 text-sm text-mute">
            {perfil.bairro} · {perfil.municipio}
          </p>
        </div>
      </header>

      <section className="cartao mt-6 p-5">
        <h2 className="sr-only">Apresentação</h2>
        <p className="whitespace-pre-line leading-relaxed">{perfil.descricao}</p>

        {perfil.precoTexto && (
          <p className="mt-4 border-t border-line pt-3 text-sm">
            <span className="text-mute">Preço: </span>
            <span className="font-medium">{perfil.precoTexto}</span>
          </p>
        )}
      </section>

      <section className="mt-6">
        {sessao?.perfilId === perfil.id ? (
          <div className="cartao p-5">
            <p className="font-semibold">Este é o teu perfil público.</p>
            <p className="mt-1 text-sm text-mute">
              É assim que os clientes te vêem. Apareces na pesquisa por ofício, categoria e
              bairro, e o contacto chega-te pelo WhatsApp.
            </p>
            <Link to="/pedidos" className="btn-primario mt-4 w-full">
              Procurar pedidos de trabalho
            </Link>
          </div>
        ) : perfil.exemplo ? (
          <div className="cartao p-5">
            <p className="text-sm text-mute">
              Este é um perfil de exemplo, criado para mostrar como a plataforma funciona.
              Não corresponde a uma pessoa real e o contacto está desactivado. Publica o
              teu próprio perfil para ativar o botão.
            </p>
            <Link to="/perfil/novo" className="btn-secundario mt-4 w-full">
              Criar o meu perfil
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
                void registarContacto('perfil', perfil.id, 'perfil');
              }}
            >
              Falar no WhatsApp
            </a>
            <p className="mt-3 text-center text-xs text-mute">
              Abre o WhatsApp com uma mensagem já escrita · {formatarTelefone(perfil.telefone)}
            </p>
          </>
        )}
      </section>
    </article>
  );
}
