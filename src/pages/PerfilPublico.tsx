import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { obterCategoria } from '../domain/categorias';
import { formatarTelefone } from '../domain/telefone';
import { construirLinkWhatsApp } from '../domain/whatsapp';
import { iniciais } from '../lib/formato';
import { calcularReputacao } from '../domain/reputacao';
import { IconeCategoria } from '../components/IconeCategoria';

export function PerfilPublico() {
  const { id } = useParams<{ id: string }>();
  const perfis = useApp((estado) => estado.perfis);
  const carregar = useApp((estado) => estado.carregar);
  const estado = useApp((estado) => estado.estado);
  const registarContacto = useApp((estado) => estado.registarContacto);
  const avaliacoes = useApp((estado) => estado.avaliacoes);
  const sessao = useSessao((estado) => estado.sessao);

  const [contactado, setContactado] = useState(false);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const perfil = perfis.find((item) => item.id === id);

  if (!perfil) {
    return (
      <div className="cartao mx-auto max-w-md p-10 text-center">
        <p className="font-semibold">
          {estado === 'a-carregar' ? 'A carregar…' : 'Perfil não encontrado.'}
        </p>
        {estado !== 'a-carregar' && (
          <Link to="/explorar" className="btn-secundario mt-5 px-4 py-2 text-sm">
            Voltar aos profissionais
          </Link>
        )}
      </div>
    );
  }

  const categoria = obterCategoria(perfil.categoria);
  const reputacao = calcularReputacao(avaliacoes, perfil.nome, 'prestador');
  const criticas = avaliacoes
    .filter(
      (avaliacao) =>
        avaliacao.alvoTipo === 'prestador' &&
        avaliacao.alvoNome.trim().toLowerCase() === perfil.nome.trim().toLowerCase() &&
        avaliacao.comentario.trim() !== '',
    )
    .slice(0, 3);

  const linkWhatsApp = construirLinkWhatsApp({
    telefone: perfil.telefone,
    nome: perfil.nome,
    oficio: perfil.oficio,
  });

  return (
    <article className="mx-auto max-w-2xl">
      <Link to="/explorar" className="btn-fantasma -ml-2 text-mute hover:text-ink">
        <span aria-hidden="true">←</span> Profissionais
      </Link>

      <header className="mt-6 flex items-start gap-4 sm:gap-5">
        {perfil.fotoUrl ? (
          <img
            src={perfil.fotoUrl}
            alt=""
            className="h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24"
          />
        ) : (
          <span
            aria-hidden="true"
            className="titulo-display grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand-100 text-4xl text-brand-700 sm:h-24 sm:w-24"
          >
            {iniciais(perfil.nome).charAt(0)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <span className="selo bg-forest-500/10 text-forest-700">
            <IconeCategoria categoria={perfil.categoria} className="h-3 w-3" />
            {categoria.rotulo}
          </span>

          <h1 className="titulo-display mt-2 text-[clamp(1.9rem,5vw,3rem)] leading-none">
            {perfil.nome}
          </h1>
          <p className="mt-1.5 text-[15px] text-ink-soft">{perfil.oficio}</p>
          <p className="mt-0.5 text-sm text-mute">
            {perfil.bairro} · {perfil.municipio}
          </p>

          <p className="mt-2 flex items-baseline gap-1.5 text-sm">
            {reputacao.media !== null ? (
              <>
                <span className="numeral text-lg leading-none">
                  {reputacao.media.toFixed(1).replace('.', ',')}
                </span>
                <span className="text-mute">
                  · {reputacao.total}{' '}
                  {reputacao.total === 1 ? 'trabalho avaliado' : 'trabalhos avaliados'}
                </span>
              </>
            ) : (
              <span className="text-mute">Ainda sem avaliações</span>
            )}
          </p>
        </div>
      </header>

      {perfil.exemplo && (
        <p className="mt-5 inline-flex rounded-full bg-ink/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">
          Perfil de exemplo
        </p>
      )}

      <p className="mt-6 whitespace-pre-line text-[17px] leading-[1.7] text-ink-soft">
        {perfil.descricao}
      </p>

      {criticas.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
            O que dizem de {perfil.nome.split(' ')[0]}
          </h2>
          <ul className="mt-2 space-y-2">
            {criticas.map((avaliacao) => (
              <li key={avaliacao.id} className="cartao p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold">{avaliacao.autorNome}</span>
                  <span className="numeral text-sm text-brand-700">{avaliacao.nota}/5</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {avaliacao.comentario}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {perfil.precoTexto && (
        <dl className="mt-6 flex items-baseline justify-between border-y border-line py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
            Preço
          </dt>
          <dd className="text-sm font-medium">{perfil.precoTexto}</dd>
        </dl>
      )}

      <footer className="mt-7">
        {sessao?.perfilId === perfil.id ? (
          <div className="cartao p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-forest-500" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700">
                O teu perfil
              </p>
            </div>
            <p className="mt-3 text-lg font-semibold">É assim que os clientes te vêem.</p>
            <p className="mt-1.5 text-sm leading-relaxed text-mute">
              Apareces na pesquisa por ofício, categoria e bairro. O contacto chega-te pelo
              WhatsApp.
            </p>
            <Link to="/pedidos" className="btn-primario mt-4 w-full px-4 py-2.5 text-sm">
              Procurar pedidos de trabalho
            </Link>
          </div>
        ) : perfil.exemplo ? (
          <div className="cartao p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-mute">
              Este é um perfil de exemplo, criado para mostrar como a plataforma funciona.
              Não corresponde a uma pessoa real e o contacto está desactivado.
            </p>
            <Link to="/perfil/novo" className="btn-secundario mt-4 w-full px-4 py-2.5 text-sm">
              Criar o meu perfil
            </Link>
          </div>
        ) : contactado ? (
          <div className="cartao border-forest-500/30 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-forest-500" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700">
                Contacto iniciado
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Abrimos o WhatsApp com uma mensagem já escrita. Combina o trabalho
              directamente com {perfil.nome}.
            </p>
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secundario mt-4 w-full px-4 py-2.5 text-sm"
            >
              Reabrir conversa
            </a>
          </div>
        ) : (
          <>
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-clay w-full px-5 py-3.5 text-base"
              onClick={() => {
                setContactado(true);
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
      </footer>
    </article>
  );
}
