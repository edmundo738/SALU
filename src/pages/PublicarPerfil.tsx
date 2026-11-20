import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { CATEGORIAS } from '../domain/categorias';
import { MUNICIPIOS, TIPOS_ENTIDADE } from '../domain/types';
import type { CategoriaId, Municipio, PerfilEntrada, TipoEntidade } from '../domain/types';
import { perfilVazio, validarPerfil, type ErrosPerfil } from '../domain/validacao';
import { SeletorFoto } from '../components/SeletorFoto';

export function PublicarPerfil() {
  const navegar = useNavigate();
  const publicarPerfil = useApp((estado) => estado.publicarPerfil);
  const sessao = useSessao((estado) => estado.sessao);
  const definirPerfil = useSessao((estado) => estado.definirPerfil);

  const [entrada, setEntrada] = useState<PerfilEntrada>(() => ({
    ...perfilVazio(),
    nome: sessao?.tipo === 'prestador' ? sessao.nome : '',
  }));
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
      const perfil = await publicarPerfil(validacao.valor);
      definirPerfil(perfil.id);
      navegar(`/perfil/${perfil.id}`);
    } catch (erro) {
      setErroGeral(erro instanceof Error ? erro.message : 'Não foi possível publicar.');
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-black sm:text-3xl">O meu perfil profissional</h1>
      <p className="mt-2 text-sm text-mute">
        É gratuito e leva dois minutos. O teu número só aparece como botão de contacto.
      </p>

      <form onSubmit={aoSubmeter} className="mt-6 space-y-5" noValidate>
        <div>
          <label htmlFor="nome" className="etiqueta">
            O teu nome
          </label>
          <input
            id="nome"
            className="campo"
            autoComplete="name"
            value={entrada.nome}
            onChange={(evento) => actualizar('nome', evento.target.value)}
            aria-invalid={Boolean(erros.nome)}
          />
          {erros.nome && <p className="mt-1 text-sm text-red-700">{erros.nome}</p>}
        </div>

        <div>
          <label htmlFor="telefone" className="etiqueta">
            Telemóvel (WhatsApp)
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
          />
          <p className="mt-1 text-xs text-mute">
            É por aqui que os clientes vão falar contigo.
          </p>
          {erros.telefone && <p className="mt-1 text-sm text-red-700">{erros.telefone}</p>}
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
            Bairro onde trabalhas
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
            O que sabes fazer
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
            Apresentação
          </label>
          <textarea
            id="descricao"
            className="campo min-h-32 resize-y"
            placeholder="O que fazes, como trabalhas e o que o cliente deve esperar."
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
          <label htmlFor="competencias" className="etiqueta">
            Competências <span className="font-normal text-mute">(opcional, separadas por vírgula)</span>
          </label>
          <input
            id="competencias"
            className="campo"
            placeholder="Ex.: frigoríficos Samsung, arcas, máquinas de lavar"
            value={entrada.competenciasTexto}
            onChange={(evento) => actualizar('competenciasTexto', evento.target.value)}
            aria-invalid={Boolean(erros.competenciasTexto)}
          />
          <p className="mt-1 text-xs text-mute">Até 8. É por aqui que os clientes te encontram na pesquisa.</p>
          {erros.competenciasTexto && <p className="mt-1 text-sm text-red-700">{erros.competenciasTexto}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tipo-entidade" className="etiqueta">Trabalhas como</label>
            <select
              id="tipo-entidade"
              className="campo"
              value={entrada.tipoEntidade}
              onChange={(evento) => actualizar('tipoEntidade', evento.target.value as TipoEntidade)}
            >
              {TIPOS_ENTIDADE.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.rotulo}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="disponibilidade" className="etiqueta">
              Disponibilidade <span className="font-normal text-mute">(opcional)</span>
            </label>
            <input
              id="disponibilidade"
              className="campo"
              placeholder="Ex.: seg–sáb, 8h–18h"
              value={entrada.disponibilidadeTexto}
              onChange={(evento) => actualizar('disponibilidadeTexto', evento.target.value)}
              aria-invalid={Boolean(erros.disponibilidadeTexto)}
            />
            {erros.disponibilidadeTexto && <p className="mt-1 text-sm text-red-700">{erros.disponibilidadeTexto}</p>}
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

        <SeletorFoto
          valor={entrada.fotoUrl}
          onChange={(fotoUrl) => actualizar('fotoUrl', fotoUrl)}
        />

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
