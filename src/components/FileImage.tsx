import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { FileRecord } from '../../shared/types';
import { api } from '../lib/api';

/**
 * Imagem de um ficheiro do SALU, com três vias por ordem de preferência:
 *
 * 1. `/media/<id>` — o próprio site serve a imagem (proxy para a API).
 *    Mesmo domínio: sem bloqueios entre origens e com cache do CDN.
 * 2. Leitura autenticada (`fetch` + object URL) — funciona mesmo que o proxy
 *    não exista, porque o pedido é CORS e o servidor autoriza a origem do site.
 * 3. URL directo da API — último recurso.
 *
 * Só depois de as três falharem é que desiste (o avatar cai para as iniciais).
 */
export function FileImage({
  file,
  alt,
  className = '',
  onGiveUp,
  fallback,
}: {
  file: FileRecord;
  alt?: string;
  className?: string;
  /** Chamado quando nenhuma via funcionou. */
  onGiveUp?: () => void;
  fallback?: ReactNode;
}) {
  return (
    <FileImageInstance
      key={`${file.id}:${file.visibility}`}
      file={file}
      alt={alt}
      className={className}
      onGiveUp={onGiveUp}
      fallback={fallback}
    />
  );
}

function FileImageInstance({
  file,
  alt,
  className = '',
  onGiveUp,
  fallback,
}: {
  file: FileRecord;
  alt?: string;
  className?: string;
  onGiveUp?: () => void;
  fallback?: ReactNode;
}) {
  const [src, setSrc] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const giveUpRef = useRef(onGiveUp);
  giveUpRef.current = onGiveUp;

  useEffect(() => {
    let alive = true;
    let objectUrl = '';
    setFailed(false);
    setSrc('');

    const isPublic = file.visibility === 'public';
    const maxAttempts = isPublic ? 3 : 2;

    // 1.ª tentativa dos públicos: proxy do próprio site.
    if (isPublic && attempt === 0) {
      setSrc(api.fileUrl(file));
      return () => {
        alive = false;
      };
    }

    if (attempt >= maxAttempts) {
      setFailed(true);
      giveUpRef.current?.();
      return () => {
        alive = false;
      };
    }

    // 2.ª via: bytes com a sessão (CORS), mostrados a partir de memória.
    if (attempt === (isPublic ? 1 : 0)) {
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
          if (alive) setAttempt((current) => current + 1);
        });
      return () => {
        alive = false;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    // 3.ª via: URL directo da API.
    setSrc(api.fileUrlDirect(file));
    return () => {
      alive = false;
    };
  }, [file.id, file.visibility, attempt]);

  if (failed) return <>{fallback ?? null}</>;
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt ?? file.name}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setAttempt((current) => current + 1)}
    />
  );
}
