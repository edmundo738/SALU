import { useEffect, useState } from 'react';
import type { FileRecord } from '../../shared/types';
import { api } from '../lib/api';

/**
 * Imagem de um ficheiro do SALU.
 *
 * - Público (avatar, portfólio, fotos de pedido): servido pelo proxy `/media`
 *   do próprio site — mesmo domínio, sem bloqueios entre origens.
 * - Privado (anexos, provas): lido com a sessão e mostrado a partir de memória.
 * - Se o proxy falhar, tenta o URL directo antes de desistir.
 */
export function FileImage({
  file,
  alt,
  className = '',
  onGiveUp,
}: {
  file: FileRecord;
  alt?: string;
  className?: string;
  /** Chamado quando nenhuma via funcionou (ex.: avatar cai para as iniciais). */
  onGiveUp?: () => void;
}) {
  const [src, setSrc] = useState('');
  const [usedDirect, setUsedDirect] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    let objectUrl = '';
    setSrc('');
    setFailed(false);
    setUsedDirect(false);

    if (file.visibility === 'public') {
      setSrc(api.fileUrl(file));
      return () => {
        alive = false;
      };
    }

    api
      .fetchFileObjectUrl(file)
      .then((url) => {
        if (alive) {
          objectUrl = url;
          setSrc(url);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch(() => {
        if (alive) setSrc(api.fileUrlDirect(file));
      });

    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.id, file.visibility]);

  if (failed || !src) return null;

  return (
    <img
      src={src}
      alt={alt ?? file.name}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!usedDirect && file.visibility === 'public') {
          setUsedDirect(true);
          setSrc(api.fileUrlDirect(file));
          return;
        }
        setFailed(true);
        onGiveUp?.();
      }}
    />
  );
}
