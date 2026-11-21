/**
 * Taxonomia única de categorias. O id é estável; as etiquetas são traduzidas
 * no cliente. "other" existe para não obrigar ninguém a mentir.
 */
export interface Category {
  id: string;
  pt: string;
  en: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'construction', pt: 'Construção e manutenção', en: 'Construction and maintenance', icon: 'Hammer' },
  { id: 'electrical', pt: 'Electricidade', en: 'Electrical work', icon: 'Zap' },
  { id: 'plumbing', pt: 'Canalização e água', en: 'Plumbing and water', icon: 'Droplets' },
  { id: 'hvac', pt: 'Ar condicionado e refrigeração', en: 'Air conditioning and refrigeration', icon: 'Wind' },
  { id: 'cleaning', pt: 'Limpeza e doméstica', en: 'Cleaning and domestic help', icon: 'Sparkles' },
  { id: 'technology', pt: 'Tecnologia e redes', en: 'Technology and networks', icon: 'Laptop' },
  { id: 'design', pt: 'Design e comunicação', en: 'Design and communication', icon: 'Palette' },
  { id: 'catering', pt: 'Catering e eventos', en: 'Catering and events', icon: 'UtensilsCrossed' },
  { id: 'transport', pt: 'Transporte e logística', en: 'Transport and logistics', icon: 'Truck' },
  { id: 'beauty', pt: 'Beleza e bem-estar', en: 'Beauty and wellbeing', icon: 'Scissors' },
  { id: 'education', pt: 'Educação e formação', en: 'Education and training', icon: 'GraduationCap' },
  { id: 'health', pt: 'Saúde e cuidado', en: 'Health and care', icon: 'HeartPulse' },
  { id: 'professional', pt: 'Serviços profissionais', en: 'Professional services', icon: 'Briefcase' },
  { id: 'other', pt: 'Outro serviço', en: 'Other service', icon: 'MoreHorizontal' },
];

export function categoryLabel(id: string, lang: 'pt' | 'en'): string {
  const category = CATEGORIES.find((c) => c.id === id);
  if (!category) return lang === 'pt' ? 'Outro serviço' : 'Other service';
  return lang === 'pt' ? category.pt : category.en;
}

export function isValidCategory(id: unknown): boolean {
  return typeof id === 'string' && CATEGORIES.some((c) => c.id === id);
}
