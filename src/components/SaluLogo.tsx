import { Link } from 'react-router-dom';
import saluLogoImg from '../assets/images/salu_logo.png';

export function SaluLogo({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-3 group transition-transform hover:scale-[1.02] ${className}`} aria-label="SALU — Início">
      <img
        src={saluLogoImg}
        alt="SALU — Serviços · Oportunidades · Confiança"
        className={compact ? 'h-7 w-auto object-contain' : 'h-9 sm:h-10 w-auto object-contain'}
      />
    </Link>
  );
}
