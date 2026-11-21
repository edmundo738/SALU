import React, { createContext, useContext } from 'react';
import { RequestState, UrgencyLevel } from '../types/salu';

export type Language = 'pt' | 'en';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (pt: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'pt',
  setLang: () => {},
  t: (pt) => pt,
});

export function LanguageProvider({
  lang,
  setLang,
  children,
}: {
  lang: Language;
  setLang: (lang: Language) => void;
  children: React.ReactNode;
}) {
  const t = (pt: string, en: string) => (lang === 'pt' ? pt : en);
  return React.createElement(
    LanguageContext.Provider,
    { value: { lang, setLang, t } },
    children
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

const CATEGORY_PT: Record<string, string> = {
  'Electrical & Solar': 'Eletricidade & Solar',
  'Architecture & Renovation': 'Arquitetura & Remodelação',
  'IT & Networks': 'TI & Redes',
  'Plumbing & HVAC': 'Canalização & Climatização',
  'Catering & Events': 'Catering & Eventos',
  'Legal & Accounting': 'Jurídico & Contabilidade',
  'Transport & Logistics': 'Transporte & Logística',
  'Cleaning & Maintenance': 'Limpeza & Manutenção',
};

export function translateCategory(cat: string, lang: Language): string {
  if (lang === 'en') return cat;
  return CATEGORY_PT[cat] || cat;
}

const URGENCY_PT: Record<UrgencyLevel, string> = {
  Flexible: 'Prazo Flexível',
  'This Week': 'Esta Semana',
  'Urgent (48h)': 'Urgente (48h)',
};

export function translateUrgency(urgency: UrgencyLevel, lang: Language): string {
  if (lang === 'en') return urgency;
  return URGENCY_PT[urgency] || urgency;
}

const STATE_PT: Record<RequestState, string> = {
  DRAFT: 'Rascunho',
  OPEN: 'Aberto a Propostas',
  PROPOSALS_RECEIVED: 'Propostas Recebidas',
  NEGOTIATING: 'Em Negociação',
  AGREEMENT_CONFIRMED: 'Acordo Confirmado',
  IN_PROGRESS: 'Em Execução',
  COMPLETION_PENDING: 'Aguardar Conclusão',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  DISPUTED: 'Em Disputa · Revisão',
};

export function translateRequestState(state: RequestState, fallbackEn: string, lang: Language): string {
  if (lang === 'en') return fallbackEn;
  return STATE_PT[state] || fallbackEn;
}
