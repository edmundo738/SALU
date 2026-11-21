import { db } from './db.ts';

interface BotPersona {
  name: string;
  role: 'customer' | 'provider';
  municipality: string;
  profession?: string;
}

const CUSTOMER_BOTS: BotPersona[] = [
  { name: 'Dona Teresa Maianga', role: 'customer', municipality: 'Maianga, Luanda' },
  { name: 'Eng. Paulo Kilamba', role: 'customer', municipality: 'Kilamba, Luanda' },
  { name: 'Mariana Talatona', role: 'customer', municipality: 'Talatona, Luanda' },
  { name: 'Dr. Sebastião Cazenga', role: 'customer', municipality: 'Cazenga, Luanda' },
  { name: 'Família Baptista', role: 'customer', municipality: 'Viana, Luanda' },
];

const SAMPLE_REQUEST_TEMPLATES = [
  {
    title: 'Canalizador urgente para desentupimento de esgoto e ralo',
    category: 'Construção & Manutenção',
    description: 'Caixa de visita no quintal com refluxo de água. Preciso de canalizador experiente com equipamento para desentupir e higienizar a tubagem hoje.',
    budget_type: 'INSPECTION_NEEDED',
    budget_amount: 25000,
    urgency: 'URGENT',
  },
  {
    title: 'Pintura geral de apartamento T3 (sala e 3 quartos)',
    category: 'Construção & Manutenção',
    description: 'Paredes interiores com pequenos retoques de massa corrida e pintura a tinta acrílica lavável. Forneço as tintas.',
    budget_type: 'INSPECTION_NEEDED',
    budget_amount: 70000,
    urgency: 'NORMAL',
  },
  {
    title: 'Explicações de Matemática e Física para 10ª classe',
    category: 'Educação & Explicações',
    description: 'Apoio escolar 3 vezes por semana (1h30 por sessão) para aluno do ensino médio no Kilamba.',
    budget_type: 'FIXED',
    budget_amount: 40000,
    urgency: 'NORMAL',
  },
  {
    title: 'Configuração de impressora de rede e recuperação de disco externo',
    category: 'Tecnologia & Suporte TI',
    description: 'Impressora Epson multifuncional a não responder na rede local e disco rígido com fotos da família que não é reconhecido pelo computador.',
    budget_type: 'INSPECTION_NEEDED',
    budget_amount: 30000,
    urgency: 'NORMAL',
  },
  {
    title: 'Pequena mudança de mobiliário de Talatona para a Maianga',
    category: 'Transporte & Logística',
    description: 'Transporte de 1 cama de casal desmontada, 1 frigorífico e 6 caixas de pertences pessoais. Preciso de carrinha e 1 ajudante para carga e descarga.',
    budget_type: 'FIXED',
    budget_amount: 45000,
    urgency: 'NORMAL',
  },
];

const PROPOSAL_TEMPLATES = [
  'Olá! Estou disponível na sua zona e posso realizar este serviço com rigor e garantia. Tenho o material necessário para iniciar.',
  'Boa tarde. Como o serviço pode envolver componentes específicos, proponho uma vistoria técnica no local para diagnosticar com exatidão antes de fechar o valor final.',
  'Saudações! Já executei trabalhos similares com excelentes recomendações aqui na SALU. Posso atender com pontualidade.',
  'Disponível para avançar. Trabalho com factura/recibo se necessário e garanto assistência técnica após a conclusão.',
];

let botIntervalHandle: NodeJS.Timeout | null = null;

export function runBotSimulationAction(): { action: string; detail: string } {
  try {
    const isEnabled = (db.prepare(`SELECT value FROM bot_config WHERE key = 'enabled'`).get() as { value: string } | undefined)?.value === '1';
    if (!isEnabled) {
      return { action: 'skipped', detail: 'Bots desativados na configuração.' };
    }

    // 1. Get open requests
    const openRequests = db.prepare(`SELECT * FROM requests WHERE status = 'OPEN' ORDER BY created_at DESC LIMIT 10`).all() as any[];
    const providers = db.prepare(`SELECT * FROM users WHERE role = 'provider'`).all() as any[];

    // Decide what to do:
    // Option A: If we have fewer than 8 open requests, create a new request from a random customer bot
    if (openRequests.length < 8 && Math.random() > 0.4) {
      const template = SAMPLE_REQUEST_TEMPLATES[Math.floor(Math.random() * SAMPLE_REQUEST_TEMPLATES.length)];
      const customer = CUSTOMER_BOTS[Math.floor(Math.random() * CUSTOMER_BOTS.length)];
      const customerId = `bot-${customer.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const reqId = `req-bot-${Date.now().toString(36)}`;
      const now = new Date().toISOString();

      // Ensure bot user exists in users table to satisfy foreign key constraint
      db.prepare(`
        INSERT OR IGNORE INTO users (id, name, email_or_phone, password_hash, role, municipality, verified, created_at)
        VALUES (?, ?, ?, 'bot_hash', 'customer', ?, 1, ?)
      `).run(customerId, customer.name, `${customerId}@salu.bot`, customer.municipality, now);

      db.prepare(`
        INSERT INTO requests (id, user_id, user_name, title, category, municipality, description, budget_type, budget_amount, urgency, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
      `).run(
        reqId,
        customerId,
        customer.name,
        template.title,
        template.category,
        customer.municipality,
        template.description,
        template.budget_type,
        template.budget_amount,
        template.urgency,
        now
      );

      return {
        action: 'new_request',
        detail: `Bot "${customer.name}" publicou o pedido: "${template.title}" em ${customer.municipality}.`,
      };
    }

    // Option B: Provider bot submits proposal for an existing open request that has fewer than 3 proposals
    if (openRequests.length > 0 && providers.length > 0) {
      const req = openRequests[Math.floor(Math.random() * openRequests.length)];
      const currentProps = db.prepare(`SELECT provider_id FROM proposals WHERE request_id = ?`).all(req.id) as any[];
      const existingProviderIds = new Set(currentProps.map((p) => p.provider_id));

      const eligibleProviders = providers.filter((p) => !existingProviderIds.has(p.id));
      if (eligibleProviders.length > 0) {
        const pro = eligibleProviders[Math.floor(Math.random() * eligibleProviders.length)];
        const propId = `prop-bot-${Date.now().toString(36)}`;
        const message = PROPOSAL_TEMPLATES[Math.floor(Math.random() * PROPOSAL_TEMPLATES.length)];
        const isInspection = req.budget_type === 'INSPECTION_NEEDED' || Math.random() > 0.5;
        const baseAmount = req.budget_amount > 0 ? req.budget_amount : 25000;
        const variance = (Math.random() * 0.3 - 0.15); // +/- 15%
        const amount = Math.round((baseAmount * (1 + variance)) / 1000) * 1000;
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO proposals (id, request_id, provider_id, provider_name, provider_profession, provider_avatar, amount, is_inspection_needed, estimated_days, message, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'PENDING', ?)
        `).run(
          propId,
          req.id,
          pro.id,
          pro.name,
          pro.profession || 'Técnico Especializado',
          pro.avatar_url || '/assets/sprites/salu-mark.png',
          amount,
          isInspection ? 1 : 0,
          message,
          now
        );

        // Also notify the customer
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, message, link, read, created_at)
          VALUES (?, ?, ?, ?, ?, 0, ?)
        `).run(
          `notif-${Date.now()}`,
          req.user_id,
          'Nova Proposta Recebida',
          `O profissional ${pro.name} enviou uma proposta para "${req.title}".`,
          `/pedidos/${req.id}`,
          now
        );

        return {
          action: 'new_proposal',
          detail: `Profissional "${pro.name}" enviou proposta de ${amount.toLocaleString('pt-AO')} Kz para "${req.title}".`,
        };
      }
    }

    return { action: 'idle', detail: 'Nenhuma ação necessária nesta ronda.' };
  } catch (err: any) {
    return { action: 'error', detail: err.message };
  }
}

export function startBotScheduler(intervalSeconds: number = 180) {
  if (botIntervalHandle) {
    clearInterval(botIntervalHandle);
  }

  console.log(`[SALU Bots] Scheduler de simulação ativado (intervalo: ${intervalSeconds}s).`);
  botIntervalHandle = setInterval(() => {
    const res = runBotSimulationAction();
    if (res.action !== 'idle' && res.action !== 'skipped') {
      console.log(`[SALU Bots Activity] ${res.detail}`);
    }
  }, intervalSeconds * 1000);
}

export function stopBotScheduler() {
  if (botIntervalHandle) {
    clearInterval(botIntervalHandle);
    botIntervalHandle = null;
    console.log('[SALU Bots] Scheduler de simulação desativado.');
  }
}
