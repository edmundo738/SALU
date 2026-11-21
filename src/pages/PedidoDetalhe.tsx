import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { obterCategoria } from '../domain/categorias';
import { construirLinkWhatsAppPedido } from '../domain/whatsapp';
import { PASSOS_PEDIDO, indicePasso } from '../domain/estados';
import { URGENCIAS } from '../domain/types';
import type { EventoPedido, TipoAvaliado } from '../domain/types';
import { calcularReputacao } from '../domain/reputacao';
import { tempoRelativo } from '../lib/formato';
import { IconeCategoria } from '../components/IconeCategoria';
import { Conversa } from '../components/Conversa';
import { FormularioProposta } from '../components/FormularioProposta';
import { AvaliacaoForm } from '../components/AvaliacaoForm';

const ROTULO_EVENTO: Record<EventoPedido['tipo'], string> = {
  publicado: 'Pedido publicado',
  proposta: 'Proposta recebida',
  aceite: 'Proposta aceite',
  concluido: 'Trabalho concluído',
  cancelado: 'Pedido cancelado',
  avaliado: 'Avaliação registada',
};

export function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const pedidos = useApp((estado) => estado.pedidos);
  const propostas = useApp((estado) => estado.propostas);
  const avaliacoes = useApp((estado) => estado.avaliacoes);
  const carregar = useApp((estado) => estado.carregar);
  const carregarContactos = useApp((estado) => estado.carregarContactos);
  const estado = useApp((estado) => estado.estado);
  const registarContacto = useApp((estado) => estado.registarContacto);
  const aceitarProposta = useApp((estado) => estado.aceitarProposta);
  const concluirPedido = useApp((estado) => estado.concluirPedido);
  const sessao = useSessao((estado) => estado.sessao);

  const [aProcessar, setAProcessar] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  useEffect(() => {
    void carregar();
    void carregarContactos();
  }, [carregar, carregarContactos]);

  const pedido = pedidos.find((item) => item.id === id);

  if (!pedido) {
    return (
      <div className="mx-auto max-w-md p-10 text-center rounded-3xl bg-white border border-slate-200 shadow-sm mt-12">
        <p className="font-bold text-slate-800">
          {estado === 'a-carregar' ? 'A carregar pedido…' : 'Pedido não encontrado.'}
        </p>
        {estado !== 'a-carregar' && (
          <Link
            to="/pedidos"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#FF6A00] hover:underline"
          >
            <span>← Voltar ao mural de pedidos</span>
          </Link>
        )}
      </div>
    );
  }

  const categoria = obterCategoria(pedido.categoria);
  const urgencia = URGENCIAS.find((u) => u.id === pedido.urgencia);

  const ehMeuPedido = Boolean(sessao?.pedidoIds.includes(pedido.id));
  const propostasDoPedido = propostas.filter((proposta) => proposta.pedidoId === pedido.id);
  const propostaAceite = propostasDoPedido.find((proposta) => proposta.estado === 'aceite');

  const indice = indicePasso(pedido.estado);
  const reputacaoCliente = calcularReputacao(avaliacoes, pedido.autorNome, 'cliente');

  const linkWhatsApp = construirLinkWhatsAppPedido({
    telefone: pedido.autorTelefone,
    nome: pedido.autorNome,
    titulo: pedido.titulo,
  });

  async function aceitar(propostaId: string) {
    setAProcessar(true);
    setErroAcao(null);
    try {
      await aceitarProposta(pedido!.id, propostaId);
    } catch (falha) {
      setErroAcao(falha instanceof Error ? falha.message : 'Não foi possível aceitar a proposta.');
    } finally {
      setAProcessar(false);
    }
  }

  async function concluir() {
    setAProcessar(true);
    setErroAcao(null);
    try {
      await concluirPedido(pedido!.id);
    } catch (falha) {
      setErroAcao(falha instanceof Error ? falha.message : 'Não foi possível concluir.');
    } finally {
      setAProcessar(false);
    }
  }

  const autorDaSessao = sessao ? sessao.nome : 'Visitante';
  const alvoAvaliadoNome = ehMeuPedido
    ? (propostaAceite ? propostaAceite.autorNome : 'Prestador')
    : pedido.autorNome;
  const alvoAvaliadoTipo: TipoAvaliado = ehMeuPedido ? 'prestador' : 'cliente';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navegação Superior */}
      <div className="flex items-center justify-between">
        <Link
          to="/pedidos"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span>←</span>
          <span>Voltar ao mural de pedidos</span>
        </Link>

        <div className="flex items-center gap-2">
          {pedido.exemplo && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-mono text-slate-500 font-bold">
              Modo Demonstração
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              pedido.estado === 'aberto'
                ? 'bg-blue-100 text-blue-700'
                : pedido.estado === 'acordado'
                ? 'bg-amber-100 text-amber-800'
                : pedido.estado === 'concluido'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            ● {pedido.estado.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stepper de Progresso (Fluxo do Acordo) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto gap-4 pb-2">
          {PASSOS_PEDIDO.map((etapa, idx) => {
            const concluido = idx < indice;
            const atual = idx === indice;
            return (
              <div key={etapa.estado} className="flex items-center gap-3 shrink-0">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-bold ${
                    concluido
                      ? 'bg-emerald-500 text-white'
                      : atual
                      ? 'bg-[#FF6A00] text-white shadow-md shadow-orange-500/20'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {concluido ? '✓' : `0${idx + 1}`}
                </div>
                <div>
                  <p
                    className={`text-xs font-bold leading-tight ${
                      atual ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {etapa.rotulo}
                  </p>
                </div>
                {idx < PASSOS_PEDIDO.length - 1 && (
                  <span className="text-slate-300 ml-2">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid de Duas Colunas Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================== */}
        {/* COLUNA ESQUERDA (8 Colunas): Detalhes, Propostas e Ações       */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cartão de Detalhe do Pedido */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1 text-[#FF6A00] font-bold">
                  <IconeCategoria categoria={pedido.categoria} className="h-4 w-4" />
                  {categoria.rotulo}
                </span>
                <span>•</span>
                <span>{pedido.bairro ? `${pedido.bairro}, ` : ''}{pedido.municipio}</span>
                <span>•</span>
                <span>{tempoRelativo(pedido.criadoEm)}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-2">
                {pedido.titulo}
              </h1>
            </div>

            {/* Métricas Rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Orçamento Indicativo
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-slate-900">
                  {pedido.orcamentoTexto || 'A combinar'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Prazo Desejado
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {urgencia?.rotulo || 'Esta semana'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Propostas Recebidas
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#FF6A00]">
                  {propostasDoPedido.length} proposta{propostasDoPedido.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Descrição Completa */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Descrição do Problema & Requisitos
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {pedido.descricao}
              </p>
            </div>

            {/* Foto anexada se houver */}
            {pedido.fotoUrl && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Fotografia do Local
                </h3>
                <img
                  src={pedido.fotoUrl}
                  alt={pedido.titulo}
                  className="rounded-2xl max-h-72 w-full object-cover border border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Secção de Propostas Recebidas */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-[#0F172A]">
                  Propostas dos Profissionais ({propostasDoPedido.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Valores privados em Kwanzas. O cliente decide qual a proposta mais adequada.
                </p>
              </div>
            </div>

            {erroAcao && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700 font-semibold">
                {erroAcao}
              </p>
            )}

            {propostasDoPedido.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-700">Ainda não existem propostas.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Profissionais cadastrados poderão enviar propostas com valor e prazo.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {propostasDoPedido.map((prop) => {
                  const aceite = prop.estado === 'aceite';
                  return (
                    <div
                      key={prop.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        aceite
                          ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0B192E] text-white font-bold text-sm">
                            {prop.autorNome.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#0F172A]">{prop.autorNome}</h4>
                              {aceite && (
                                <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                                  ✓ Proposta Aceite
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {prop.prazoTexto} • {tempoRelativo(prop.criadoEm)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-extrabold text-slate-900">
                            {prop.precoTexto}
                          </span>

                          {ehMeuPedido && pedido.estado === 'aberto' && (
                            <button
                              type="button"
                              disabled={aProcessar}
                              onClick={() => aceitar(prop.id)}
                              className="rounded-xl bg-[#FF6A00] hover:bg-[#e85f00] text-white text-xs font-bold px-4 py-2 shadow-sm transition disabled:opacity-50"
                            >
                              Aceitar Proposta
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                        {prop.mensagem}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form de Enviar Proposta (se for prestador) */}
          {!ehMeuPedido && pedido.estado === 'aberto' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="font-display text-xl font-bold text-[#0F172A] mb-4">
                Enviar Proposta a Este Pedido
              </h2>
              <FormularioProposta pedidoId={pedido.id} autorNome={autorDaSessao} />
            </div>
          )}

          {/* Conclusão e Avaliação */}
          {propostaAceite && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="font-display text-xl font-bold text-[#0F172A]">
                Conclusão do Trabalho & Avaliação Bilateral
              </h2>
              <p className="text-xs text-slate-500">
                Quando o trabalho estiver concluído, ambas as partes confirmam e trocam avaliação em 3 dimensões.
              </p>

              {pedido.estado === 'acordado' && (
                <button
                  type="button"
                  disabled={aProcessar}
                  onClick={concluir}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 shadow transition disabled:opacity-50"
                >
                  Confirmar Conclusão do Serviço
                </button>
              )}

              {pedido.estado === 'concluido' && (
                <div className="pt-2">
                  <AvaliacaoForm
                    pedidoId={pedido.id}
                    autorNome={autorDaSessao}
                    alvoNome={alvoAvaliadoNome}
                    alvoTipo={alvoAvaliadoTipo}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* COLUNA DIREITA (4 Colunas): Autor, Contacto e Conversa         */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cartão do Cliente / Autor */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sobre o Cliente
            </h3>

            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700 font-bold text-lg">
                {pedido.autorNome.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm text-[#0F172A]">{pedido.autorNome}</p>
                <p className="text-xs text-slate-500">
                  {reputacaoCliente.media !== null
                    ? `★ ${reputacaoCliente.media.toFixed(1)} (${reputacaoCliente.total} avaliações)`
                    : 'Novo utilizador no SALU'}
                </p>
              </div>
            </div>

            {/* Botão de WhatsApp */}
            {!ehMeuPedido && (
              <a
                href={linkWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  void registarContacto('pedido', pedido.id, 'pedido');
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 text-xs shadow-md transition"
              >
                <span>Falar no WhatsApp</span>
                <span>↗</span>
              </a>
            )}
          </div>

          {/* Conversa Interna Directa */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Conversa do Pedido
            </h3>
            <Conversa
              pedidoId={pedido.id}
              lado={ehMeuPedido ? 'cliente' : 'prestador'}
              autorNome={autorDaSessao}
              fechada={pedido.estado === 'concluido' || pedido.estado === 'cancelado'}
            />
          </div>

          {/* Histórico / Linha do Tempo */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registo de Acontecimentos
            </h3>
            <div className="space-y-2 text-xs">
              {pedido.historico.map((evento, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-600">
                  <span className="text-[#FF6A00] font-bold">•</span>
                  <div>
                    <span className="font-medium text-slate-800">{ROTULO_EVENTO[evento.tipo]}</span>
                    <span className="text-slate-400 text-[10px] ml-1.5">
                      {tempoRelativo(evento.criadoEm)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
