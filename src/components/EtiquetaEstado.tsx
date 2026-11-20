import type { EstadoPedido, EstadoProposta } from '../domain/types';
import { META_PEDIDO, META_PROPOSTA, type Tom } from '../domain/estados';

const CLASSES_TOM: Record<Tom, string> = {
  verde: 'bg-forest-500/10 text-forest-700',
  ocre: 'bg-brand-50 text-brand-700',
  neutro: 'bg-ink/5 text-ink-soft',
  vermelho: 'bg-red-50 text-red-800',
};

const PONTO_TOM: Record<Tom, string> = {
  verde: 'bg-forest-500',
  ocre: 'bg-brand-600',
  neutro: 'bg-ink/30',
  vermelho: 'bg-red-600',
};

export function EtiquetaPedido({ estado, className = '' }: { estado: EstadoPedido; className?: string }) {
  const meta = META_PEDIDO[estado];
  return (
    <span className={`selo ${CLASSES_TOM[meta.tom]} ${className}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${PONTO_TOM[meta.tom]}`} />
      {meta.rotulo}
    </span>
  );
}

export function EtiquetaProposta({ estado, className = '' }: { estado: EstadoProposta; className?: string }) {
  const meta = META_PROPOSTA[estado];
  return (
    <span className={`selo ${CLASSES_TOM[meta.tom]} ${className}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${PONTO_TOM[meta.tom]}`} />
      {meta.rotulo}
    </span>
  );
}
