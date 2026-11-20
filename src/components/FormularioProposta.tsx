import { useState } from 'react';
import { useApp } from '../state/store';
import { validarProposta, type ErrosProposta } from '../domain/validacao';

/**
 * Uma proposta é o que autoriza um profissional a falar com o cliente.
 * Sem ela, a conversa não abre — é a defesa contra mensagens não solicitadas.
 */
export function FormularioProposta({
  pedidoId,
  autorNome,
}: {
  pedidoId: string;
  autorNome: string;
}) {
  const enviarProposta = useApp((estado) => estado.enviarProposta);

  const [mensagem, setMensagem] = useState('');
  const [precoTexto, setPrecoTexto] = useState('');
  const [prazoTexto, setPrazoTexto] = useState('');
  const [erros, setErros] = useState<ErrosProposta>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  async function submeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral(null);

    const validacao = validarProposta({
      pedidoId,
      autorNome,
      mensagem,
      precoTexto,
      prazoTexto,
    });

    if (!validacao.valido) {
      setErros(validacao.erros);
      return;
    }

    setAEnviar(true);
    try {
      await enviarProposta(validacao.valor);
    } catch (erro) {
      setErroGeral(erro instanceof Error ? erro.message : 'Não foi possível enviar.');
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="seccao-titulo text-xl">Enviar proposta</h2>
      <p className="mt-1 text-sm text-mute">
        Depois de enviares, abre-se uma conversa com quem publicou o pedido.
      </p>

      <form onSubmit={submeter} className="cartao mt-3 space-y-4 p-4 sm:p-5" noValidate>
        <div>
          <label htmlFor="proposta-mensagem" className="etiqueta">
            O que consegues fazer
          </label>
          <textarea
            id="proposta-mensagem"
            className="campo min-h-24 resize-y"
            placeholder="Ex.: Trabalho com frigoríficos. Posso passar amanhã de manhã para verificar."
            value={mensagem}
            onChange={(evento) => {
              setMensagem(evento.target.value);
              setErros((anteriores) => ({ ...anteriores, mensagem: undefined }));
            }}
            aria-invalid={Boolean(erros.mensagem)}
          />
          {erros.mensagem && <p className="mt-1 text-sm text-red-700">{erros.mensagem}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="proposta-preco" className="etiqueta">
              Valor <span className="font-normal text-mute">(opcional)</span>
            </label>
            <input
              id="proposta-preco"
              className="campo"
              placeholder="Ex.: 15.000 Kz"
              value={precoTexto}
              onChange={(evento) => setPrecoTexto(evento.target.value)}
            />
          </div>

          <div>
            <label htmlFor="proposta-prazo" className="etiqueta">
              Prazo <span className="font-normal text-mute">(opcional)</span>
            </label>
            <input
              id="proposta-prazo"
              className="campo"
              placeholder="Ex.: amanhã de manhã"
              value={prazoTexto}
              onChange={(evento) => setPrazoTexto(evento.target.value)}
            />
          </div>
        </div>

        {erroGeral && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
            {erroGeral}
          </p>
        )}

        <button type="submit" className="btn-primario w-full px-4 py-2.5 text-sm" disabled={aEnviar}>
          {aEnviar ? 'A enviar…' : 'Enviar proposta'}
        </button>
      </form>
    </section>
  );
}
