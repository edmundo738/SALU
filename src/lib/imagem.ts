export const TAMANHO_MAXIMO_FICHEIRO = 8 * 1024 * 1024; // 8 MB

/**
 * Valida o que o utilizador escolheu antes de gastar memória a processar.
 * Mensagens dizem o que fazer, não o que falhou.
 */
export function validarFicheiroImagem(ficheiro: File): string | null {
  if (!ficheiro.type.startsWith('image/')) {
    return 'Escolha um ficheiro de imagem (JPG, PNG ou HEIC).';
  }
  if (ficheiro.size > TAMANHO_MAXIMO_FICHEIRO) {
    return 'A fotografia é demasiado grande. Escolha uma com menos de 8 MB.';
  }
  return null;
}

/**
 * Reduz a fotografia antes de a guardar.
 *
 * Em Angola os dados são caros e os telemóveis têm pouca memória. Uma fotografia
 * de 4 MB transformada em ~80 KB continua a mostrar o problema ao técnico e não
 * rebenta o armazenamento local (cerca de 5 MB no total).
 */
export async function comprimirImagem(
  ficheiro: File,
  opcoes: { maxLado?: number; qualidade?: number } = {},
): Promise<string> {
  const { maxLado = 1000, qualidade = 0.72 } = opcoes;

  const bitmap = await createImageBitmap(ficheiro);
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const largura = Math.max(1, Math.round(bitmap.width * escala));
  const altura = Math.max(1, Math.round(bitmap.height * escala));

  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;

  const contexto = canvas.getContext('2d');
  if (!contexto) {
    throw new Error('Não foi possível processar a imagem neste dispositivo.');
  }

  contexto.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', qualidade);
}
