import { useEffect } from 'react';
import { useApp } from '../state/store';

/**
 * Área interna de acompanhamento.
 *
 * Não é um painel de produto — é o sítio onde verificamos se a métrica central
 * está a funcionar. Em modo local mostra os contactos deste dispositivo; em modo
 * Supabase mostra apenas o que as políticas permitem ao utilizador actual.
 */
export function Interno() {
  const contactos = useApp((estado) => estado.contactos);
  const carregarContactos = useApp((estado) => estado.carregarContactos);
  const perfis = useApp((estado) => estado.perfis);
  const modo = useApp((estado) => estado.modo);

  useEffect(() => {
    void carregarContactos();
  }, [carregarContactos]);

  const nomePorId = new Map(perfis.map((perfil) => [perfil.id, perfil.nome]));

  return (
    <div>
      <h1 className="text-2xl font-black">Área interna</h1>
      <p className="mt-2 text-sm text-mute">
        Acompanhamento do protótipo. Modo de dados: <strong>{modo}</strong>.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-paper p-4">
          <dt className="text-xs text-mute">Perfis publicados</dt>
          <dd className="mt-1 text-2xl font-black">{perfis.length}</dd>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-4">
          <dt className="text-xs text-mute">Contactos iniciados</dt>
          <dd className="mt-1 text-2xl font-black">{contactos.length}</dd>
        </div>
      </dl>

      <h2 className="mt-8 text-lg font-semibold">Contactos recentes</h2>

      {contactos.length === 0 ? (
        <p className="mt-2 text-sm text-mute">
          Ainda não há contactos registados. Abra um perfil e toque em «Falar no WhatsApp».
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-paper">
          {contactos.slice(0, 50).map((contacto) => (
            <li key={contacto.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="min-w-0 truncate text-sm">
                {nomePorId.get(contacto.perfilId) ?? contacto.perfilId}
              </span>
              <time className="shrink-0 text-xs text-mute" dateTime={contacto.criadoEm}>
                {new Date(contacto.criadoEm).toLocaleString('pt-PT')}
              </time>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-mute">
        «Contacto iniciado» significa que alguém tocou no botão de WhatsApp. Não prova que
        houve resposta, trabalho feito ou pagamento — isso só se sabe perguntando às pessoas.
      </p>
    </div>
  );
}
