import { DatabaseSync } from 'node:sqlite';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'salu.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email_or_phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      municipality TEXT NOT NULL DEFAULT 'Talatona, Luanda',
      profession TEXT,
      avatar_url TEXT,
      bio TEXT,
      whatsapp TEXT,
      verified INTEGER NOT NULL DEFAULT 1,
      rating REAL NOT NULL DEFAULT 5.0,
      reviews_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      municipality TEXT NOT NULL,
      description TEXT NOT NULL,
      budget_type TEXT NOT NULL DEFAULT 'INSPECTION_NEEDED', /* 'FIXED' | 'INSPECTION_NEEDED' */
      budget_amount INTEGER DEFAULT 0,
      urgency TEXT NOT NULL DEFAULT 'NORMAL',
      status TEXT NOT NULL DEFAULT 'OPEN', /* 'OPEN' | 'IN_NEGOTIATION' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' */
      whatsapp_negotiated INTEGER NOT NULL DEFAULT 0,
      whatsapp_screenshot TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      provider_name TEXT NOT NULL,
      provider_profession TEXT NOT NULL,
      provider_avatar TEXT,
      amount INTEGER NOT NULL DEFAULT 0,
      is_inspection_needed INTEGER NOT NULL DEFAULT 0,
      estimated_days INTEGER NOT NULL DEFAULT 1,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING', /* 'PENDING' | 'ACCEPTED' | 'REJECTED' */
      created_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      last_message TEXT,
      last_message_at TEXT,
      unread_customer INTEGER NOT NULL DEFAULT 0,
      unread_provider INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      text TEXT NOT NULL,
      attachment_url TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS agreements (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL UNIQUE,
      customer_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      terms TEXT,
      escrow_status TEXT NOT NULL DEFAULT 'HOLDING', /* 'HOLDING' | 'RELEASED' | 'REFUNDED' */
      status TEXT NOT NULL DEFAULT 'IN_PROGRESS', /* 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' */
      created_at TEXT NOT NULL,
      released_at TEXT,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      target_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bot_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  seedInitialDataIfEmpty();
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  // Compatibilidade com hashes legados sem salt
  if (!storedHash.includes(':')) {
    const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
    return legacyHash === storedHash;
  }
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

function seedInitialDataIfEmpty() {
  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  if (userCount > 0) return;

  console.log('[SALU DB] Semeando utilizadores e dados iniciais de demonstração...');

  // 1. Prestadores reais
  const pros = [
    {
      id: 'pro-mateus',
      name: 'Mateus Silva',
      email_or_phone: '923112233',
      role: 'provider',
      municipality: 'Maianga, Luanda',
      profession: 'Electricista Predial e Industrial',
      avatar_url: '/assets/sprites/salu-mark.png',
      bio: 'Técnico certificado pelo INFOCAP com mais de 8 anos de experiência em instalações prediais, quadros elétricos e manutenção preventiva.',
      whatsapp: '+244923112233',
      rating: 4.9,
      reviews_count: 28,
    },
    {
      id: 'pro-claudio',
      name: 'Cláudio Neto',
      email_or_phone: '934445566',
      role: 'provider',
      municipality: 'Talatona, Luanda',
      profession: 'Técnico de TI, Redes & CCTV',
      avatar_url: '/assets/sprites/salu-mark.png',
      bio: 'Especialista em redes estruturadas, suporte de informática a escritórios e montagem de sistemas de segurança e vigilância.',
      whatsapp: '+244934445566',
      rating: 4.8,
      reviews_count: 34,
    },
    {
      id: 'pro-engracia',
      name: 'Engrácia Manuel',
      email_or_phone: '945667788',
      role: 'provider',
      municipality: 'Kilamba, Luanda',
      profession: 'Designer Gráfica & Comunicação',
      avatar_url: '/assets/sprites/salu-mark.png',
      bio: 'Criação de marcas, identidades visuais, materiais corporativos e design para panfletos e redes sociais de pequenas empresas.',
      whatsapp: '+244945667788',
      rating: 5.0,
      reviews_count: 19,
    },
    {
      id: 'pro-joana',
      name: 'Joana Domingos',
      email_or_phone: '912778899',
      role: 'provider',
      municipality: 'Viana, Luanda',
      profession: 'Catering, Pastelaria & Decoração',
      avatar_url: '/assets/sprites/salu-mark.png',
      bio: 'Buffets para eventos empresariais e celebrações familiares, bolos personalizados e organização completa de mesas.',
      whatsapp: '+244912778899',
      rating: 4.9,
      reviews_count: 42,
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email_or_phone, password_hash, role, municipality, profession, avatar_url, bio, whatsapp, verified, rating, reviews_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  const defaultPass = hashPassword('salu1234');

  for (const p of pros) {
    insertUser.run(
      p.id,
      p.name,
      p.email_or_phone,
      defaultPass,
      p.role,
      p.municipality,
      p.profession,
      p.avatar_url,
      p.bio,
      p.whatsapp,
      1,
      p.rating,
      p.reviews_count,
      now
    );
  }

  // 2. Clientes de demonstração
  const customers = [
    {
      id: 'cli-helena',
      name: 'Helena Vandúnem',
      email_or_phone: 'helena@salu.ao',
      role: 'customer',
      municipality: 'Talatona, Luanda',
      bio: 'Gestora administrativa residente em Talatona.',
    },
    {
      id: 'cli-carlos',
      name: 'Eng. Carlos Morais',
      email_or_phone: 'carlos@empresa.ao',
      role: 'customer',
      municipality: 'Maianga, Luanda',
      bio: 'Empresário do ramo comercial em Luanda.',
    },
  ];

  for (const c of customers) {
    insertUser.run(
      c.id,
      c.name,
      c.email_or_phone,
      defaultPass,
      c.role,
      c.municipality,
      null,
      '/assets/sprites/salu-mark.png',
      c.bio,
      null,
      1,
      5.0,
      5,
      now
    );
  }

  // 3. Pedidos de serviço iniciais
  const insertReq = db.prepare(`
    INSERT INTO requests (id, user_id, user_name, title, category, municipality, description, budget_type, budget_amount, urgency, status, whatsapp_negotiated, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialRequests = [
    {
      id: 'req-001',
      user_id: 'cli-helena',
      user_name: 'Helena Vandúnem',
      title: 'Reparação de Ar Condicionado no Quarto e Sala',
      category: 'Construção & Manutenção',
      municipality: 'Talatona, Luanda',
      description: 'Dois aparelhos split de 12.000 BTU deixaram de gelar e estão a verter água. Preciso de técnico qualificado para diagnóstico, limpeza dos filtros e possível carga de gás refrigerante.',
      budget_type: 'INSPECTION_NEEDED',
      budget_amount: 35000,
      urgency: 'URGENT',
      status: 'OPEN',
    },
    {
      id: 'req-002',
      user_id: 'cli-carlos',
      user_name: 'Eng. Carlos Morais',
      title: 'Instalação de Rede Wi-Fi Estruturada em Escritório',
      category: 'Tecnologia & Suporte TI',
      municipality: 'Maianga, Luanda',
      description: 'Necessidade de passagem de 8 pontos de rede cabo Cat6 e configuração de 2 Access Points corporativos para cobertura total do piso.',
      budget_type: 'FIXED',
      budget_amount: 85000,
      urgency: 'NORMAL',
      status: 'IN_NEGOTIATION',
    },
    {
      id: 'req-003',
      user_id: 'cli-helena',
      user_name: 'Helena Vandúnem',
      title: 'Catering e Doces para Pequeno Almoço de Trabalho (15 pessoas)',
      category: 'Catering & Eventos',
      municipality: 'Talatona, Luanda',
      description: 'Salgadinhos diversos, mini sandes, pastéis, sumos naturais e café para reunião de diretoria numa sexta-feira pela manhã.',
      budget_type: 'FIXED',
      budget_amount: 60000,
      urgency: 'NORMAL',
      status: 'OPEN',
    },
  ];

  for (const r of initialRequests) {
    insertReq.run(
      r.id,
      r.user_id,
      r.user_name,
      r.title,
      r.category,
      r.municipality,
      r.description,
      r.budget_type,
      r.budget_amount,
      r.urgency,
      r.status,
      0,
      now
    );
  }

  // 4. Proposta de exemplo
  const insertProp = db.prepare(`
    INSERT INTO proposals (id, request_id, provider_id, provider_name, provider_profession, provider_avatar, amount, is_inspection_needed, estimated_days, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProp.run(
    'prop-001',
    'req-001',
    'pro-mateus',
    'Mateus Silva',
    'Electricista Predial e Industrial',
    '/assets/sprites/salu-mark.png',
    35000,
    1,
    1,
    'Olá D. Helena, posso deslocar-me a Talatona amanhã para fazer a vistoria técnica e verificar a pressão do gás. Caso seja apenas limpeza e carga de gás, o valor base cobre o serviço completo.',
    'PENDING',
    now
  );

  // 5. Configuração dos bots
  db.prepare(`INSERT OR REPLACE INTO bot_config (key, value) VALUES ('enabled', '1')`).run();
  db.prepare(`INSERT OR REPLACE INTO bot_config (key, value) VALUES ('interval_minutes', '4')`).run();

  console.log('[SALU DB] Banco de dados inicializado e pronto em data/salu.db.');
}
