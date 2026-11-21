// Canal público de suporte. Só aparece se for configurado no build.
export const SUPPORT_EMAIL = String(import.meta.env.VITE_SUPPORT_EMAIL || '').trim();
