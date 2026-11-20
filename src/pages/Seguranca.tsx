import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSessao } from '../state/sessao';
import { MOTIVOS, useDenuncias, type MotivoDenuncia } from '../state/denuncias';
import { tempoRelativo } from '../lib/formato';

const ESTADO: Record<string, string> = {
  recebida: 'Recebida',
  'em-analise': 'Em análise',
  decidida: 'Decidida',
};

export function Seguranca() {
  const [parametros] = useSearchParams();
  const sessao = useSessao((estado) => estado.sessao);
  const denuncias = useDenuncias((estado) => estado.denuncias);
  const denunciar = useDenuncias((estado) => estado.denunciar);

  const [alvoNome, setAlvoNome] = useState(parametros.get('alvo') ?? '');
  const [motivo, setMotivo] = useState<MotivoDenuncia>('incumprimento');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviada, setEnviada] = useState(false);

  const minhas = sessao
    ? denuncias.filter((d) => d.autorNome.toLowerCase() === sessao.nome.toLowerCase())
    : [];

  function submeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!sessao) return;
    if (alvoNome.trim().length < 2) {
      setErro('Indique quem está a denunciar.');
      return;
    }
    if (descricao.trim().length < 20) {
      setErro('Descreva o que aconteceu com pelo menos 20 caracteres.');
      return;
    }
    denunciar({
      autorNome: sessao.nome,
      alvoNome: alvoNome.trim(),
      pedidoId: parametros.get('pedido'),
      motivo,
      descricao: descricao.trim(),
    });
    setEnviada(true);
    setDescricao('');
    setErro(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header>
        <h1 className="titulo-display text-[clamp(1.9rem,5vw,2.8rem)]">Segurança</h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-mute">
          O SALU é para trabalho legítimo entre pessoas que se respeitam. Se algo correu mal,
          conta-nos. Uma denúncia não é uma condenação: é o início de uma análise, com direito
          a resposta da outra parte.
        </p>
      </header>

      <section>
        <h2 className="seccao-titulo text-xl">Denunciar</h2>

        {!sessao ? (
          <div className="cartao mt-3 p-5">
            <p className="text-sm text-mute">Entra para apresentar uma denúncia.</p>
            <Link to="/entrar" className="btn-primario mt-3 px-4 py-2 text-sm">Entrar</Link>
          </div>
        ) : enviada ? (
          <div className="cartao mt-3 border-forest-500/40 p-5">
            <p className="font-semibold">Denúncia recebida.</p>
            <p className="mt-1 text-sm text-mute">
              Fica registada com data e descrição. Nesta versão de demonstração não há equipa
              a analisar; no produto, a análise é feita por pessoas e a outra parte é ouvida.
            </p>
            <button type="button" className="btn-secundario mt-4 px-4 py-2 text-sm" onClick={() => setEnviada(false)}>
              Apresentar outra
            </button>
          </div>
        ) : (
          <form onSubmit={submeter} className="cartao mt-3 space-y-4 p-4 sm:p-5" noValidate>
            <div>
              <label htmlFor="denuncia-alvo" className="etiqueta">Quem</label>
              <input id="denuncia-alvo" className="campo" placeholder="Nome como aparece no SALU" value={alvoNome} onChange={(e) => setAlvoNome(e.target.value)} />
            </div>
            <div>
              <label htmlFor="denuncia-motivo" className="etiqueta">Motivo</label>
              <select id="denuncia-motivo" className="campo" value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoDenuncia)}>
                {MOTIVOS.map((m) => (
                  <option key={m.id} value={m.id}>{m.rotulo}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="denuncia-descricao" className="etiqueta">O que aconteceu</label>
              <textarea id="denuncia-descricao" className="campo min-h-28 resize-y" placeholder="Datas, o que foi combinado, o que falhou. Quanto mais concreto, mais fácil de analisar." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
            <button type="submit" className="btn-primario w-full px-4 py-2.5 text-sm">Enviar denúncia</button>
          </form>
        )}

        {minhas.length > 0 && (
          <ul className="mt-4 divide-y divide-line rounded-cartao border border-line bg-paper">
            {minhas.map((d) => (
              <li key={d.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{d.alvoNome} · {MOTIVOS.find((m) => m.id === d.motivo)?.rotulo}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-mute">{d.descricao}</p>
                </div>
                <span className="shrink-0 text-right text-[11px] text-mute">
                  <span className="selo bg-brand-50 text-brand-700">{ESTADO[d.estado]}</span>
                  <br />{tempoRelativo(d.criadoEm)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="seccao-titulo text-xl">O que não entra no SALU</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
          <li>· Drogas, prostituição e qualquer actividade criminosa.</li>
          <li>· Venda de medicamentos fora de farmácia, produtos perigosos e «curas» milagrosas.</li>
          <li>· Álcool e produtos regulamentados sem as regras que a lei exige.</li>
          <li>· Actividades que exigem licença ou qualificação, sem as ter.</li>
        </ul>
        <p className="mt-3 text-xs text-mute">
          Publicações suspeitas são removidas e a conta pode ser restringida ou suspensa, sempre com possibilidade de contestação.
        </p>
      </section>

      <section>
        <h2 className="seccao-titulo text-xl">Como funciona a análise</h2>
        <ol className="mt-3 divide-y divide-line border-y border-line">
          {[
            ['Recebida', 'Fica registada com data, motivo e descrição. Podes juntar provas.'],
            ['Em análise', 'Alguém lê, pede a versão da outra parte e consulta o acordo e a conversa.'],
            ['Decidida', 'Pode não haver lugar a medida, haver aviso, restrição ou suspensão. Há recurso.'],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4 py-3">
              <span className="numeral w-6 shrink-0 text-lg text-brand-600">{i + 1}</span>
              <span><span className="block font-semibold">{t}</span><span className="block text-sm text-mute">{d}</span></span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
