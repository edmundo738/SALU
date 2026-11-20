import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { usePreferencias } from '../state/preferencias';
import { PerfilCartao } from '../components/PerfilCartao';

/**
 * Profissionais de confiança: a lista que substitui «tens o número daquele
 * electricista?». Guardados pelo cliente, têm prioridade quando volta a
 * precisar — e é o primeiro passo para a recomendação do ciclo 3.
 */
export function Confianca() {
  const sessao = useSessao((estado) => estado.sessao);
  const perfis = useApp((estado) => estado.perfis);
  const carregar = useApp((estado) => estado.carregar);
  const confianca = usePreferencias((estado) => estado.confianca);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (!sessao) {
    return (
      <div className="cartao mx-auto max-w-md p-8 text-center">
        <p className="font-semibold">Entra para guardar profissionais.</p>
        <Link to="/entrar" className="btn-primario mt-4 px-5 py-2.5 text-sm">Entrar</Link>
      </div>
    );
  }

  const ids = confianca[sessao.nome.trim().toLowerCase()] ?? [];
  const guardados = ids.map((id) => perfis.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div>
      <header>
        <h1 className="titulo-display text-[clamp(1.9rem,5vw,2.8rem)]">Profissionais de confiança</h1>
        <p className="mt-1 max-w-prose text-sm text-mute">
          Quem já te resolveu um problema, ou quem queres ter à mão. Aparecem primeiro quando voltares a precisar.
        </p>
      </header>

      {guardados.length === 0 ? (
        <div className="cartao mt-6 border-dashed p-6">
          <p className="font-semibold">Ainda não guardaste ninguém.</p>
          <p className="mt-1 text-sm text-mute">Abre um perfil e toca em «Guardar como de confiança».</p>
          <Link to="/explorar" className="btn-secundario mt-4 px-4 py-2.5 text-sm">Ver profissionais</Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guardados.map((perfil) => (
            <li key={perfil.id}><PerfilCartao perfil={perfil} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
