import { Router } from 'express';
import { db, hashPassword, verifyPassword } from './db.ts';
import { runBotSimulationAction, startBotScheduler, stopBotScheduler } from './bots.ts';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const apiRouter = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// -------------------------------------------------------------
// 1. AUTENTICAÇÃO E UTILIZADORES
// -------------------------------------------------------------
apiRouter.post('/auth/register', (req, res) => {
  try {
    const { name, email_or_phone, password, role, municipality, profession, bio } = req.body;
    if (!name || !email_or_phone || !password) {
      return res.status(400).json({ error: 'Nome, contacto e palavra-passe são obrigatórios.' });
    }

    const cleanContact = email_or_phone.trim();
    const existing = db.prepare('SELECT id FROM users WHERE email_or_phone = ?').get(cleanContact);
    if (existing) {
      return res.status(409).json({ error: 'Já existe uma conta associada a este número ou e-mail.' });
    }

    const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const passHash = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email_or_phone, password_hash, role, municipality, profession, avatar_url, bio, verified, rating, reviews_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 5.0, 0, ?)
    `).run(
      id,
      name.trim(),
      cleanContact,
      passHash,
      role || 'customer',
      municipality || 'Talatona, Luanda',
      profession || (role === 'provider' ? 'Prestador Independente' : null),
      '/assets/sprites/salu-mark.png',
      bio || 'Novo membro na plataforma SALU.',
      now
    );

    const user = db.prepare('SELECT id, name, email_or_phone, role, municipality, profession, avatar_url, bio FROM users WHERE id = ?').get(id);
    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email_or_phone, password } = req.body;
    if (!email_or_phone || !password) {
      return res.status(400).json({ error: 'Contacto e palavra-passe são obrigatórios.' });
    }

    const cleanContact = email_or_phone.trim();
    const user = db.prepare(`
      SELECT id, name, email_or_phone, password_hash, role, municipality, profession, avatar_url, bio, rating, reviews_count
      FROM users
      WHERE email_or_phone = ?
    `).get(cleanContact) as any;

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Contacto ou palavra-passe incorretos.' });
    }

    // Nunca expor o hash de palavra-passe no retorno
    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Google mock login
apiRouter.post('/auth/google', (req, res) => {
  try {
    const { email, name, role } = req.body;
    const cleanEmail = (email || 'google.user@salu.ao').trim();
    let user = db.prepare('SELECT id, name, email_or_phone, role, municipality, profession, avatar_url, bio FROM users WHERE email_or_phone = ?').get(cleanEmail) as any;

    if (!user) {
      const id = `usr-g-${Date.now().toString(36)}`;
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO users (id, name, email_or_phone, password_hash, role, municipality, profession, avatar_url, bio, verified, rating, reviews_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 5.0, 0, ?)
      `).run(
        id,
        name || 'Utilizador Google',
        cleanEmail,
        hashPassword('google_oauth_auto'),
        role || 'customer',
        'Talatona, Luanda',
        role === 'provider' ? 'Profissional Verificado' : null,
        '/assets/sprites/salu-mark.png',
        'Conta autenticada com segurança.',
        now
      );
      user = db.prepare('SELECT id, name, email_or_phone, role, municipality, profession, avatar_url, bio FROM users WHERE id = ?').get(id);
    }

    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. PROFISSIONAIS (DIRECTÓRIO ACTIVO)
// -------------------------------------------------------------
apiRouter.get('/providers', (req, res) => {
  try {
    const { municipality, category, search } = req.query as any;
    let query = `SELECT id, name, municipality, profession, avatar_url, bio, whatsapp, verified, rating, reviews_count FROM users WHERE role = 'provider'`;
    const params: any[] = [];

    if (municipality && municipality !== 'ALL' && municipality !== 'todos') {
      query += ` AND municipality LIKE ?`;
      params.push(`%${municipality}%`);
    }

    if (search) {
      query += ` AND (name LIKE ? OR profession LIKE ? OR bio LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY rating DESC, reviews_count DESC`;
    const providers = db.prepare(query).all(...params);
    return res.json({ success: true, providers });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. PEDIDOS DE SERVIÇO (OPORTUNIDADES)
// -------------------------------------------------------------
apiRouter.get('/requests', (req, res) => {
  try {
    const { category, municipality, user_id, status } = req.query as any;
    let query = `
      SELECT r.*, COUNT(p.id) as proposals_count
      FROM requests r
      LEFT JOIN proposals p ON r.id = p.request_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (user_id) {
      query += ` AND r.user_id = ?`;
      params.push(user_id);
    }

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (category && category !== 'ALL' && category !== 'todas') {
      query += ` AND r.category = ?`;
      params.push(category);
    }

    if (municipality && municipality !== 'ALL' && municipality !== 'todos') {
      query += ` AND r.municipality LIKE ?`;
      params.push(`%${municipality}%`);
    }

    query += ` GROUP BY r.id ORDER BY r.created_at DESC`;
    const requests = db.prepare(query).all(...params);
    return res.json({ success: true, requests });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/requests', (req, res) => {
  try {
    const { user_id, user_name, title, category, municipality, description, budget_type, budget_amount, urgency } = req.body;
    if (!title || !category || !municipality || !description) {
      return res.status(400).json({ error: 'Título, categoria, município e descrição são obrigatórios.' });
    }

    const id = `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO requests (id, user_id, user_name, title, category, municipality, description, budget_type, budget_amount, urgency, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
    `).run(
      id,
      user_id || 'usr-anon',
      user_name || 'Cliente SALU',
      title.trim(),
      category,
      municipality,
      description.trim(),
      budget_type || 'INSPECTION_NEEDED',
      parseInt(budget_amount) || 0,
      urgency || 'NORMAL',
      now
    );

    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    return res.json({ success: true, request });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/requests/:id', (req, res) => {
  try {
    const reqId = req.params.id;
    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(reqId);
    if (!request) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const proposals = db.prepare('SELECT * FROM proposals WHERE request_id = ? ORDER BY created_at DESC').all(reqId);
    const agreement = db.prepare('SELECT * FROM agreements WHERE request_id = ?').get(reqId);

    return res.json({ success: true, request, proposals, agreement });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. PROPOSTAS & VISTORIA TÉCNICA
// -------------------------------------------------------------
apiRouter.post('/requests/:id/proposals', (req, res) => {
  try {
    const requestId = req.params.id;
    const { provider_id, provider_name, provider_profession, amount, is_inspection_needed, estimated_days, message } = req.body;

    if (!provider_id || !message) {
      return res.status(400).json({ error: 'Identificação do profissional e mensagem de proposta são obrigatórios.' });
    }

    // Check if provider already submitted
    const existing = db.prepare('SELECT id FROM proposals WHERE request_id = ? AND provider_id = ?').get(requestId, provider_id);
    if (existing) {
      return res.status(409).json({ error: 'Já enviou uma proposta para este pedido.' });
    }

    const propId = `prop-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO proposals (id, request_id, provider_id, provider_name, provider_profession, provider_avatar, amount, is_inspection_needed, estimated_days, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `).run(
      propId,
      requestId,
      provider_id,
      provider_name || 'Profissional',
      provider_profession || 'Especialista',
      '/assets/sprites/salu-mark.png',
      parseInt(amount) || 0,
      is_inspection_needed ? 1 : 0,
      parseInt(estimated_days) || 1,
      message.trim(),
      now
    );

    // Notify request owner
    const request = db.prepare('SELECT user_id, title FROM requests WHERE id = ?').get(requestId) as any;
    if (request) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, link, read, created_at)
        VALUES (?, ?, 'Nova Proposta Recebida', ?, ?, 0, ?)
      `).run(
        `notif-${Date.now()}`,
        request.user_id,
        `${provider_name} enviou proposta para "${request.title}".`,
        `/pedidos/${requestId}`,
        now
      );
    }

    const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(propId);
    return res.json({ success: true, proposal });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/proposals/:id/accept', (req, res) => {
  try {
    const proposalId = req.params.id;
    const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(proposalId) as any;
    if (!proposal) {
      return res.status(404).json({ error: 'Proposta não encontrada.' });
    }

    const now = new Date().toISOString();

    // Mark proposal accepted, others rejected
    db.prepare(`UPDATE proposals SET status = 'ACCEPTED' WHERE id = ?`).run(proposalId);
    db.prepare(`UPDATE proposals SET status = 'REJECTED' WHERE request_id = ? AND id != ?`).run(proposal.request_id, proposalId);

    // Update request state
    db.prepare(`UPDATE requests SET status = 'ASSIGNED' WHERE id = ?`).run(proposal.request_id);

    // Create escrow agreement
    const agreementId = `agr-${Date.now().toString(36)}`;
    const request = db.prepare('SELECT user_id, title FROM requests WHERE id = ?').get(proposal.request_id) as any;

    db.prepare(`
      INSERT INTO agreements (id, request_id, customer_id, provider_id, amount, terms, escrow_status, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'HOLDING', 'IN_PROGRESS', ?)
    `).run(
      agreementId,
      proposal.request_id,
      request.user_id,
      proposal.provider_id,
      proposal.amount,
      `Acordo formalizado na SALU: ${request.title}. Pagamento seguro retido sob custódia da plataforma.`,
      now
    );

    // Create conversation between the two if doesn't exist
    const convId = `conv-${proposal.request_id}-${proposal.provider_id}`;
    const existingConv = db.prepare('SELECT id FROM conversations WHERE id = ?').get(convId);
    if (!existingConv) {
      db.prepare(`
        INSERT INTO conversations (id, request_id, customer_id, provider_id, last_message, last_message_at)
        VALUES (?, ?, ?, ?, 'Proposta aceite. Acordo em progresso.', ?)
      `).run(convId, proposal.request_id, request.user_id, proposal.provider_id, now);
    }

    return res.json({ success: true, message: 'Proposta aceite e acordo de garantia ativado.', agreementId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. ESCROW & CONFIRMAÇÃO DE CONCLUSÃO DO SERVIÇO
// -------------------------------------------------------------
apiRouter.post('/agreements/:id/release-escrow', (req, res) => {
  try {
    const agreementId = req.params.id;
    const now = new Date().toISOString();

    const agreement = db.prepare('SELECT * FROM agreements WHERE id = ?').get(agreementId) as any;
    if (!agreement) {
      return res.status(404).json({ error: 'Acordo não encontrado.' });
    }

    db.prepare(`
      UPDATE agreements
      SET escrow_status = 'RELEASED', status = 'COMPLETED', released_at = ?
      WHERE id = ?
    `).run(now, agreementId);

    db.prepare(`UPDATE requests SET status = 'COMPLETED' WHERE id = ?`).run(agreement.request_id);

    return res.json({ success: true, message: 'Serviço confirmado! O valor do pagamento foi transferido com sucesso ao prestador.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Confirmação de acordo negociado via WhatsApp com anexo
apiRouter.post('/agreements/whatsapp-confirm', (req, res) => {
  try {
    const { request_id, customer_id, provider_id, agreed_amount, screenshot_url, notes } = req.body;
    const now = new Date().toISOString();

    const agreementId = `agr-wa-${Date.now().toString(36)}`;
    db.prepare(`
      INSERT INTO agreements (id, request_id, customer_id, provider_id, amount, terms, escrow_status, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'HOLDING', 'IN_PROGRESS', ?)
    `).run(
      agreementId,
      request_id,
      customer_id,
      provider_id,
      parseInt(agreed_amount) || 0,
      `Acordo alinhado via WhatsApp e registrado no SALU com comprovação de captura de tela. Notas: ${notes || 'N/A'}`,
      now
    );

    db.prepare(`
      UPDATE requests
      SET status = 'IN_NEGOTIATION', whatsapp_negotiated = 1, whatsapp_screenshot = ?
      WHERE id = ?
    `).run(screenshot_url || null, request_id);

    return res.json({ success: true, message: 'Negociação do WhatsApp confirmada e protegida no SALU.', agreementId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. MENSAGENS E CHAT PRIVADO
// -------------------------------------------------------------
apiRouter.get('/conversations', (req, res) => {
  try {
    const { user_id } = req.query as any;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id é obrigatório.' });
    }

    const convs = db.prepare(`
      SELECT c.*, r.title as request_title,
             cust.name as customer_name, cust.avatar_url as customer_avatar,
             prov.name as provider_name, prov.profession as provider_profession, prov.avatar_url as provider_avatar
      FROM conversations c
      JOIN requests r ON c.request_id = r.id
      JOIN users cust ON c.customer_id = cust.id
      JOIN users prov ON c.provider_id = prov.id
      WHERE c.customer_id = ? OR c.provider_id = ?
      ORDER BY c.last_message_at DESC
    `).all(user_id, user_id);

    return res.json({ success: true, conversations: convs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/conversations/:id/messages', (req, res) => {
  try {
    const convId = req.params.id;
    const { requester_id } = req.query as any;

    // Strict privacy verification: only the 2 participants can see messages!
    const conv = db.prepare('SELECT customer_id, provider_id FROM conversations WHERE id = ?').get(convId) as any;
    if (conv && requester_id && requester_id !== conv.customer_id && requester_id !== conv.provider_id) {
      return res.status(403).json({ error: 'Acesso não autorizado: conversa privada entre o cliente e o profissional contratado.' });
    }

    const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(convId);
    return res.json({ success: true, messages });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/conversations/:id/messages', (req, res) => {
  try {
    const convId = req.params.id;
    const { sender_id, sender_name, sender_role, recipient_id, text, attachment_url } = req.body;

    if (!sender_id || !text) {
      return res.status(400).json({ error: 'Remetente e mensagem são obrigatórios.' });
    }

    const msgId = `msg-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, sender_name, sender_role, recipient_id, text, attachment_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      msgId,
      convId,
      sender_id,
      sender_name || 'Utilizador',
      sender_role || 'customer',
      recipient_id || 'other',
      text.trim(),
      attachment_url || null,
      now
    );

    db.prepare(`
      UPDATE conversations
      SET last_message = ?, last_message_at = ?
      WHERE id = ?
    `).run(text.trim(), now, convId);

    return res.json({ success: true, messageId: msgId, timestamp: now });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 7. UPLOAD DE FICHEIROS & CAPTURAS DE ECRÃ
// -------------------------------------------------------------
apiRouter.post('/upload', (req, res) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'Dados base64 são obrigatórios.' });
    }

    const ext = path.extname(filename || 'anexo.png') || '.png';
    const cleanFilename = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`;
    const filePath = path.join(uploadDir, cleanFilename);

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = matches && matches[2]
      ? Buffer.from(matches[2], 'base64')
      : Buffer.from(base64Data, 'base64');

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${cleanFilename}`;
    return res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 8. SIMULAÇÃO DE PERSONAGENS BOTS
// -------------------------------------------------------------
apiRouter.get('/bots/status', (req, res) => {
  try {
    const enabled = (db.prepare(`SELECT value FROM bot_config WHERE key = 'enabled'`).get() as any)?.value === '1';
    return res.json({ success: true, enabled });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bots/toggle', (req, res) => {
  try {
    const current = (db.prepare(`SELECT value FROM bot_config WHERE key = 'enabled'`).get() as any)?.value === '1';
    const next = current ? '0' : '1';
    db.prepare(`UPDATE bot_config SET value = ? WHERE key = 'enabled'`).run(next);

    if (next === '1') {
      startBotScheduler(180);
    } else {
      stopBotScheduler();
    }

    return res.json({ success: true, enabled: next === '1' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bots/trigger-now', (req, res) => {
  try {
    const result = runBotSimulationAction();
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
