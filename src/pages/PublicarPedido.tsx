import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { CATEGORIAS } from '../domain/categorias';
import { MUNICIPIOS, URGENCIAS } from '../domain/types';
import type { CategoriaId, Municipio, PedidoEntrada, Urgencia } from '../domain/types';
import { pedidoVazio, validarPedido, type ErrosPedido } from '../domain/validacao';
import { SeletorFoto } from '../components/SeletorFoto';

export function PublicarPedido() {
  const navegar = useNavigate();
  const publicarPedido = useApp((estado) => estado.publicarPedido);
  const sessao = useSessao((estado) => estado.sessao);
  const adicionarPedido = useSessao((estado) => estado.adicionarPedido);

  const [entrada, setEntrada] = useState<PedidoEntrada>(() => ({
    ...pedidoVazio(),
    autorNome: sessao?.tipo === 'cliente' ? sessao.nome : '',
  }));
  const [erros, setErros] = useState<ErrosPedido>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  function actualizar<K extends keyof PedidoEntrada>(campo: K, valor: PedidoEntrada[K]) {
    setEntrada((anterior) => ({ ...anterior, [campo]: valor }));
    setErros((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  async function aoSubmeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral(null);

    const validacao = validarPedido(entrada);
    if (!validacao.valido) {
      setErros(validacao.erros);
      return;
    }

    setAEnviar(true);
    try {
      const pedido = await publicarPedido(validacao.valor);
      adicionarPedido(pedido.id);
      navegar(`/pedidos/${pedido.id}`);
    } catch (erro) {
      setErroGeral(erro instanceof Error ? erro.message : 'Não foi possível publicar.');
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-black sm:text-3xl">Publicar um pedido</h1>
      <p className="mt-2 text-sm text-mute">
        Descreve o que precisas. Um profissional encontra o pedido no mural e fala contigo
        no WhatsApp.
      </p>

      <form onSubmit={aoSubmeter} className="mt-6 space-y-5" noValidate>
        <div>
          <label htmlFor="titulo-pedido" className="etiqueta">
            O que precisas
          </label>
          <input
            id="titulo-pedido"
            className="campo"
            placeholder="Ex.: O frigorífico deixou de refrigerar"
            value={entrada.titulo}
            onChange={(evento) => actualizar('titulo', evento.target.value)}
            aria-invalid={Boolean(erros.titulo)}
          />
          {erros.titulo && <p className="mt-1 text-sm text-red-700">{erros.titulo}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="categoria-pedido" className="etiqueta">
              Categoria
            </label>
            <select
              id="categoria-pedido"
              className="campo"
              value={entrada.categoria}
              onChange={(evento) => actualizar('categoria', evento.target.value as CategoriaId)}
            >
              {CATEGORIAS.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="municipio-pedido" className="etiqueta">
              Município
            </label>
            <select
              id="municipio-pedido"
              className="campo"
              value={entrada.municipio}
              onChange={(evento) => actualizar('municipio', evento.target.value as Municipio)}
            >
              {MUNICIPIOS.map((municipio) => (
                <option key={municipio} value={municipio}>
                  {municipio}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bairro-pedido" className="etiqueta">
            Bairro
          </label>
          <input
            id="bairro-pedido"
            className="campo"
            placeholder="Ex.: Maianga, Kilamba, Benfica…"
            value={entrada.bairro}
            onChange={(evento) => actualizar('bairro', evento.target.value)}
            aria-invalid={Boolean(erros.bairro)}
          />
          {erros.bairro && <p className="mt-1 text-sm text-red-700">{erros.bairro}</p>}
        </div>

        <div>
          <label htmlFor="descricao-pedido" className="etiqueta">
            Descreve o problema
          </label>
          <textarea
            id="descricao-pedido"
            className="campo min-h-32 resize-y"
            placeholder="Ex.: O frigorífico liga mas não arrefece desde ontem. Já tentei desligar e voltar a ligar."
            value={entrada.descricao}
            onChange={(evento) => actualizar('descricao', evento.target.value)}
            aria-invalid={Boolean(erros.descricao)}
          />
          <div className="mt-1 flex justify-between text-xs text-mute">
            <span>{erros.descricao ?? 'Mínimo 15 caracteres.'}</span>
            <span>{entrada.descricao.trim().length}/500</span>
          </div>
        </div>

        <SeletorFoto
          valor={entrada.fotoUrl}
          onChange={(fotoUrl) => actualizar('fotoUrl', fotoUrl)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="urgencia-pedido" className="etiqueta">
              Para quando
            </label>
            <select
              id="urgencia-pedido"
              className="campo"
              value={entrada.urgencia}
              onChange={(evento) => actualizar('urgencia', evento.target.value as Urgencia)}
            >
              {URGENCIAS.map((urgencia) => (
                <option key={urgencia.id} value={urgencia.id}>
                  {urgencia.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="orcamento-pedido" className="etiqueta">
              Orçamento <span className="font-normal text-mute">(opcional)</span>
            </label>
            <input
              id="orcamento-pedido"
              className="campo"
              placeholder="Ex.: até 20.000 Kz"
              value={entrada.orcamentoTexto}
              onChange={(evento) => actualizar('orcamentoTexto', evento.target.value)}
              aria-invalid={Boolean(erros.orcamentoTexto)}
            />
            <p className="mt-1 text-xs text-mute">Indicativo. O preço combina-se com o profissional.</p>
            {erros.orcamentoTexto && <p className="mt-1 text-sm text-red-700">{erros.orcamentoTexto}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="autor-nome" className="etiqueta">
              O teu nome
            </label>
            <input
              id="autor-nome"
              className="campo"
              autoComplete="name"
              value={entrada.autorNome}
              onChange={(evento) => actualizar('autorNome', evento.target.value)}
              aria-invalid={Boolean(erros.autorNome)}
            />
            {erros.autorNome && (
              <p className="mt-1 text-sm text-red-700">{erros.autorNome}</p>
            )}
          </div>

          <div>
            <label htmlFor="autor-telefone" className="etiqueta">
              Telemóvel (WhatsApp)
            </label>
            <input
              id="autor-telefone"
              className="campo"
              inputMode="tel"
              autoComplete="tel"
              placeholder="923 456 789"
              value={entrada.autorTelefone}
              onChange={(evento) => actualizar('autorTelefone', evento.target.value)}
              aria-invalid={Boolean(erros.autorTelefone)}
            />
            {erros.autorTelefone && (
              <p className="mt-1 text-sm text-red-700">{erros.autorTelefone}</p>
            )}
          </div>
        </div>

        {erroGeral && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
            {erroGeral}
          </p>
        )}

        <button type="submit" className="btn-primario w-full" disabled={aEnviar}>
          {aEnviar ? 'A publicar…' : 'Publicar pedido'}
        </button>
      </form>
    </div>
  );
}
