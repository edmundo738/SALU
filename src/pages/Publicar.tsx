import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/store';
import { CATEGORIAS } from '../domain/categorias';
import { MUNICIPIOS } from '../domain/types';
import type { CategoriaId, Municipio, PerfilEntrada } from '../domain/types';
import { perfilVazio, validarPerfil, type ErrosPerfil } from '../domain/validacao';

export function Publicar() {
  const navegar = useNavigate();
  const publicar = useApp((estado) => estado.publicar);

  const [entrada, setEntrada] = useState<PerfilEntrada>(perfilVazio);
  const [erros, setErros] = useState<ErrosPerfil>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  function actualizar<K extends keyof PerfilEntrada>(campo: K, valor: PerfilEntrada[K]) {
    setEntrada((anterior) => ({ ...anterior, [campo]: valor }));
    setErros((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  async function aoSubmeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral(null);

    const validacao = validarPerfil(entrada);
    if (!validacao.valido) {
      setErros(validacao.erros);
      return;
    }

    setAEnviar(true);
    try {
      const perfil = await publicar(validacao.valor);
      navegar(`/perfil/${perfil.id}`);
    } catch (erro) {
      setErroGeral(erro instanceof Error ? erro.message : 'Não foi possível publicar.');
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black sm:text-3xl">Publicar o meu perfil</h1>
      <p className="mt-2 max-w-prose text-sm text-mute">
        É gratuito. O seu número só é mostrado como botão de contacto — não aparece escrito
        na página.
      </p>

      <form onSubmit={aoSubmeter} className="mt-6 space-y-5" noValidate>
        <div>
          <label htmlFor="nome" className="etiqueta">
            O seu nome
          </label>
          <input
            id="nome"
            className="campo"
            autoComplete="name"
            value={entrada.nome}
            onChange={(evento) => actualizar('nome', evento.target.value)}
            aria-invalid={Boolean(erros.nome)}
            aria-describedby={erros.nome ? 'erro-nome' : undefined}
          />
          {erros.nome && (
            <p id="erro-nome" className="mt-1 text-sm text-red-700">
              {erros.nome}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="telefone" className="etiqueta">
            Número de WhatsApp
          </label>
          <input
            id="telefone"
            className="campo"
            inputMode="tel"
            autoComplete="tel"
            placeholder="923 456 789"
            value={entrada.telefone}
            onChange={(evento) => actualizar('telefone', evento.target.value)}
            aria-invalid={Boolean(erros.telefone)}
            aria-describedby={erros.telefone ? 'erro-telefone' : 'dica-telefone'}
          />
          <p id="dica-telefone" className="mt-1 text-xs text-mute">
            Número angolano. É por aqui que os clientes vão falar consigo.
          </p>
          {erros.telefone && (
            <p id="erro-telefone" className="mt-1 text-sm text-red-700">
              {erros.telefone}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="categoria" className="etiqueta">
              Categoria
            </label>
            <select
              id="categoria"
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
            <label htmlFor="municipio" className="etiqueta">
              Município
            </label>
            <select
              id="municipio"
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
          <label htmlFor="bairro" className="etiqueta">
            Bairro onde trabalha
          </label>
          <input
            id="bairro"
            className="campo"
            placeholder="Ex.: Maianga, Kilamba, Benfica…"
            value={entrada.bairro}
            onChange={(evento) => actualizar('bairro', evento.target.value)}
            aria-invalid={Boolean(erros.bairro)}
          />
          {erros.bairro && <p className="mt-1 text-sm text-red-700">{erros.bairro}</p>}
        </div>

        <div>
          <label htmlFor="oficio" className="etiqueta">
            O que sabe fazer
          </label>
          <input
            id="oficio"
            className="campo"
            placeholder="Ex.: Reparação de computadores e telemóveis"
            value={entrada.oficio}
            onChange={(evento) => actualizar('oficio', evento.target.value)}
            aria-invalid={Boolean(erros.oficio)}
          />
          {erros.oficio && <p className="mt-1 text-sm text-red-700">{erros.oficio}</p>}
        </div>

        <div>
          <label htmlFor="descricao" className="etiqueta">
            Descrição
          </label>
          <textarea
            id="descricao"
            className="campo min-h-32 resize-y"
            placeholder="Explique em poucas frases o que faz, como trabalha e o que o cliente deve esperar."
            value={entrada.descricao}
            onChange={(evento) => actualizar('descricao', evento.target.value)}
            aria-invalid={Boolean(erros.descricao)}
          />
          <div className="mt-1 flex justify-between text-xs text-mute">
            <span>{erros.descricao ?? 'Mínimo 20 caracteres.'}</span>
            <span>{entrada.descricao.trim().length}/400</span>
          </div>
        </div>

        <div>
          <label htmlFor="preco" className="etiqueta">
            Preço <span className="font-normal text-mute">(opcional)</span>
          </label>
          <input
            id="preco"
            className="campo"
            placeholder="Ex.: A combinar, 5.000–10.000 Kz"
            value={entrada.precoTexto}
            onChange={(evento) => actualizar('precoTexto', evento.target.value)}
          />
          {erros.precoTexto && <p className="mt-1 text-sm text-red-700">{erros.precoTexto}</p>}
        </div>

        {erroGeral && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
            {erroGeral}
          </p>
        )}

        <button type="submit" className="btn-primario w-full" disabled={aEnviar}>
          {aEnviar ? 'A publicar…' : 'Publicar perfil'}
        </button>
      </form>
    </div>
  );
}
