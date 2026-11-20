import { useRef, useState } from 'react';
import { comprimirImagem, validarFicheiroImagem } from '../lib/imagem';

/**
 * Fotografia opcional, comprimida no dispositivo antes de ser guardada.
 *
 * A mensagem de erro diz o que fazer («escolha uma com menos de 8 MB»), não o
 * que falhou tecnicamente. E a compressão existe porque o armazenamento local
 * tem cerca de 5 MB: sem ela, três fotografias de telemóvel enchiam tudo.
 */
export function SeletorFoto({
  valor,
  onChange,
}: {
  valor: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aProcessar, setAProcessar] = useState(false);

  async function aoEscolher(evento: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = evento.target.files?.[0];
    evento.target.value = '';
    if (!ficheiro) return;

    const problema = validarFicheiroImagem(ficheiro);
    if (problema) {
      setErro(problema);
      return;
    }

    setErro(null);
    setAProcessar(true);

    try {
      onChange(await comprimirImagem(ficheiro));
    } catch {
      setErro('Não foi possível ler esta imagem. Tente outra.');
    } finally {
      setAProcessar(false);
    }
  }

  return (
    <div>
      <span className="etiqueta">
        Fotografia <span className="font-normal text-mute">(opcional)</span>
      </span>

      {valor ? (
        <div className="flex items-start gap-3">
          <img
            src={valor}
            alt="Pré-visualização da fotografia"
            className="h-24 w-24 rounded-xl border border-line object-cover"
          />
          <button
            type="button"
            className="btn-secundario px-4 py-2 text-sm"
            onClick={() => onChange(null)}
          >
            Remover
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper px-4 py-6 text-sm text-mute hover:border-ink/30"
          onClick={() => inputRef.current?.click()}
          disabled={aProcessar}
        >
          {aProcessar ? 'A processar…' : 'Escolher fotografia'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={aoEscolher}
      />

      <p className="mt-1 text-xs text-mute">
        Uma fotografia ajuda quem vai responder a perceber o problema antes de se
        deslocar.
      </p>

      {erro && <p className="mt-1 text-sm text-red-700">{erro}</p>}
    </div>
  );
}
