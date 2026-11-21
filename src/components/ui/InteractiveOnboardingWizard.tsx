import { useState } from 'react';
import { UserRole } from '../../types/salu';
import {
  Wrench,
  Laptop,
  Paintbrush,
  GraduationCap,
  Utensils,
  Truck,
  CheckCircle2,
  ArrowRight,
  X,
  Compass,
} from 'lucide-react';

interface WizardProps {
  initialRole?: UserRole;
  onComplete: (data: {
    role: UserRole;
    profession: string;
    municipality: string;
    source: string;
  }) => void;
  onSkip: () => void;
}

const CATEGORIES_LIST = [
  { id: 'Construção & Manutenção', label: 'Construção & Manutenção', icon: Wrench },
  { id: 'Tecnologia & Suporte TI', label: 'Tecnologia & Suporte TI', icon: Laptop },
  { id: 'Design & Comunicação', label: 'Design & Comunicação', icon: Paintbrush },
  { id: 'Educação & Explicações', label: 'Educação & Explicações', icon: GraduationCap },
  { id: 'Catering & Eventos', label: 'Catering & Eventos', icon: Utensils },
  { id: 'Transporte & Logística', label: 'Transporte & Logística', icon: Truck },
];

const MUNICIPALITIES = [
  'Talatona, Luanda',
  'Maianga, Luanda',
  'Ingombota, Luanda',
  'Kilamba, Luanda',
  'Viana, Luanda',
  'Cazenga, Luanda',
  'Belas, Luanda',
  'Cacuaco, Luanda',
  'Benguela & Lobito',
  'Huambo',
  'Lubango, Huíla',
];

export function InteractiveOnboardingWizard({ initialRole = 'customer', onComplete, onSkip }: WizardProps) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [profession, setProfession] = useState('Construção & Manutenção');
  const [municipality, setMunicipality] = useState('Talatona, Luanda');
  const [source, setSource] = useState('Recomendação de amigos ou familiares');

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({ role, profession, municipality, source });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0C1833] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with progress */}
        <div className="p-5 pb-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFF7ED] dark:bg-[#F97316]/20 text-[#F97316] font-bold text-xs flex items-center justify-center">
              {step}/{totalSteps}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Configuração Rápida &middot; Estilo Guiado
            </span>
          </div>

          <button
            onClick={onSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white inline-flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span>Saltar tutorial</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5">
          <div
            className="bg-gradient-to-r from-[#1D6FE5] to-[#F97316] h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-[#1D6FE5]/20 text-[#1D6FE5] flex items-center justify-center font-bold text-xl">
                  👋
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    O que pretende fazer na SALU hoje?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Escolha a sua finalidade inicial (pode alternar de papel a qualquer momento na mesma conta).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === 'customer'
                      ? 'border-[#1D6FE5] bg-[#EFF6FF] dark:bg-[#1D6FE5]/15 ring-2 ring-[#1D6FE5]/30'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🔍</span>
                    {role === 'customer' && <CheckCircle2 className="w-5 h-5 text-[#1D6FE5]" />}
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Preciso de um serviço
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Quero publicar pedidos, receber orçamentos e contratar especialistas confiáveis.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === 'provider'
                      ? 'border-[#F97316] bg-[#FFF7ED] dark:bg-[#F97316]/15 ring-2 ring-[#F97316]/30'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">💼</span>
                    {role === 'provider' && <CheckCircle2 className="w-5 h-5 text-[#F97316]" />}
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Quero prestar serviços
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tenho habilidades e quero encontrar oportunidades de rendimento perto de mim.
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] dark:bg-[#F97316]/20 text-[#F97316] flex items-center justify-center font-bold text-xl">
                  🎯
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {role === 'provider'
                      ? 'Qual é a sua especialidade principal?'
                      : 'Que tipo de serviços costuma procurar com mais frequência?'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selecione a categoria que melhor representa o seu interesse no momento.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {CATEGORIES_LIST.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = profession === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setProfession(cat.id)}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1D6FE5] bg-[#EFF6FF] dark:bg-[#1D6FE5]/15 text-[#1D6FE5] ring-1 ring-[#1D6FE5]'
                          : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xl">
                  📍
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Em que município ou área se encontra?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ajudará a encontrar oportunidades e profissionais a escassos quilómetros de si.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Município de actuação / residência
                </label>
                <select
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D6FE5]"
                >
                  {MUNICIPALITIES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-2">
                  * Pode alterar ou adicionar mais zonas de cobertura nas definições do perfil.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF5FF] dark:bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold text-xl">
                  📢
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Como ouviu falar da SALU?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Uma pergunta rápida para melhorarmos a presença comunitária em Angola.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  'Recomendação de amigos ou familiares',
                  'Redes Sociais (Facebook, Instagram, LinkedIn)',
                  'Grupos de WhatsApp do bairro/trabalho',
                  'Pesquisa na Internet / Google',
                  'Centros de formação ou institutos técnicos',
                ].map((s) => (
                  <label
                    key={s}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      source === s
                        ? 'border-[#1D6FE5] bg-[#EFF6FF] dark:bg-[#1D6FE5]/10 text-slate-900 dark:text-white font-medium'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="source"
                      checked={source === s}
                      onChange={() => setSource(s)}
                      className="text-[#1D6FE5] focus:ring-[#1D6FE5]"
                    />
                    <span className="text-xs">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              ← Voltar
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#FF6A00] hover:from-[#EA580C] hover:to-[#F97316] text-white text-xs font-bold shadow-md shadow-[#F97316]/25 transition-all cursor-pointer"
          >
            <span>{step === totalSteps ? 'Concluir & Entrar na Conta' : 'Continuar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
