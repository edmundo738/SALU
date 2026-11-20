export function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter((parte) => parte.length > 0)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');
}

/**
 * «há 5 minutos», «há 2 dias».
 * Datas relativas dizem a quem está a decidir se o pedido ainda vale a pena
 * — uma data absoluta obriga a fazer contas.
 */
export function tempoRelativo(iso: string): string {
  const entao = new Date(iso).getTime();
  if (Number.isNaN(entao)) return '';

  const minutos = Math.floor((Date.now() - entao) / 60000);

  if (minutos < 1) return 'agora mesmo';
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;

  return new Date(iso).toLocaleDateString('pt-PT');
}
