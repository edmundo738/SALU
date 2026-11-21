import { Router } from 'express';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import { db, audit, hashPassword, newId, nowIso, verifyPassword } from './db.ts';
import {
  createSession,
  currentUserId,
  destroySession,
  optionalAuth,
  requireAdmin,
  requireAuth,
  SESSION_COOKIE,
  parseCookies,
} from './auth.ts';
import { canAccessFile, fileOnDisk, saveUploadedFile, upload } from './files.ts';
import {
  fileRecord,
  providerProfileFor,
  reviewAggregate,
  serializeAgreement,
  serializeConversation,
  serializeMessage,
  serializeNotification,
  serializeProposal,
  serializeRequest,
  serializeReview,
  serializeUser,
  userStats,
} from './serializers.ts';
import { isValidCategory } from '../shared/categories.ts';
import { AVAILABLE_PROVINCES, isValidLocation, locationLabel } from '../shared/geo.ts';
import type { RequestDetail } from '../shared/types.ts';

export const apiRouter = Router();

type Row = Record<string, any>;

function bad(res: any, status: number, error: string, fields?: Record<string, string>) {
  return res.status(status).json({ error, ...(fields ? { fields } : {}) });
}

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return null;
  return trimmed;
}

function int(value: unknown, min: number, max: number): number | null {
  const n = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

function normalizeContact(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;
  if (raw.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw)) return null;
    return raw.toLowerCase();
  }
  const digits = raw.replace(/[\s().-]/g, '');
  if (/^\+244(9|2)\d{8}$/.test(digits)) return digits;
  if (/^(9|2)\d{8}$/.test(digits)) return `+244${digits}`;
  return null;
}

function validPassword(value: unknown): boolean {
  return (
    typeof value === 'string' && value.length >= 8 && value.length <= 128 && /[A-Za-z]/.test(value) && /\d/.test(value)
  );
}

function currentUser(req: any): Row {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId(req)) as Row;
}

function notify(userId: string, kind: string, title: string, body: string, link: string) {
  db.prepare(
    'INSERT INTO notifications (id, user_id, kind, title, body, link, read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
  ).run(newId('not'), userId, kind, title.slice(0, 140), body.slice(0, 600), link, nowIso());
}

function transaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function requestRow(id: string): Row | undefined {
  return db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as Row | undefined;
}

function canViewRequest(row: Row, userId: string | null): boolean {
  if (!userId) return false;
  if (row.customer_id === userId) return true;
  const proposal = db.prepare('SELECT 1 FROM proposals WHERE request_id = ? AND provider_id = ?').get(row.id, userId);
  if (proposal) return true;
  const conversation = db
    .prepare('SELECT 1 FROM conversations WHERE request_id = ? AND (customer_id = ? OR provider_id = ?)')
    .get(row.id, userId, userId);
  if (conversation) return true;
  if (row.status === 'OPEN') {
    const provider = db.prepare('SELECT 1 FROM provider_profiles WHERE user_id = ? AND published = 1').get(userId);
    return Boolean(provider);
  }
  return false;
}

function ownFileIds(value: unknown, userId: string, max = 6): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) return [];
  const ids = [...new Set(value.filter((v): v is string => typeof v === 'string'))].slice(0, max);
  const valid = ids.filter((id) => {
    const file = db.prepare('SELECT owner_id FROM files WHERE id = ?').get(id) as { owner_id: string } | undefined;
    return file?.owner_id === userId;
  });
  return valid;
}

function addPhotos(
  table: 'request_photos' | 'completion_photos',
  ownerColumn: string,
  ownerId: string,
  fileIds: string[],
) {
  const sql =
    table === 'request_photos'
      ? 'INSERT OR IGNORE INTO request_photos (request_id, file_id, position) VALUES (?, ?, ?)'
      : 'INSERT OR IGNORE INTO completion_photos (agreement_id, file_id, position) VALUES (?, ?, ?)';
  const stmt = db.prepare(sql);
  fileIds.forEach((fileId, index) => stmt.run(ownerId, fileId, index));
}

// =============================================================
// GEO + META
// =============================================================
apiRouter.get('/geo', (_req, res) => {
  res.json({ provinces: AVAILABLE_PROVINCES });
});

// =============================================================
// AUTENTICAÇÃO
// =============================================================
apiRouter.post('/auth/register', (req, res) => {
  const name = text(req.body?.name, 2, 80);
  const contact = normalizeContact(req.body?.contact);
  const password = req.body?.password;
  const confirm = req.body?.passwordConfirm;

  if (!name) return bad(res, 400, 'Indica o teu nome completo.', { name: 'Nome inválido.' });
  if (!contact)
    return bad(res, 400, 'Indica um e-mail válido ou um número angolano (9 dígitos).', {
      contact: 'Contacto inválido.',
    });
  if (!validPassword(password))
    return bad(res, 400, 'A palavra-passe precisa de 8 caracteres, com letras e números.', {
      password: 'Palavra-passe fraca.',
    });
  if (confirm != null && confirm !== password)
    return bad(res, 400, 'As palavras-passe não coincidem.', { passwordConfirm: 'Não coincidem.' });

  const existing = db.prepare('SELECT id FROM users WHERE contact = ? AND deleted_at IS NULL').get(contact);
  if (existing) return bad(res, 409, 'Já existe uma conta com este contacto.');

  const id = newId('usr');
  const now = nowIso();
  db.prepare(
    `INSERT INTO users (id, name, contact, password_hash, active_mode, locale, theme, bio, verification_level, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'customer', 'pt', 'light', '', 0, ?, ?)`,
  ).run(id, name, contact, hashPassword(password), now, now);
  createSession(id, res);
  audit(id, 'account.register', 'user', id);
  return res.status(201).json({ user: serializeUser(id), stats: userStats(id) });
});

apiRouter.post('/auth/login', (req, res) => {
  const contact = normalizeContact(req.body?.contact);
  const password = req.body?.password;
  if (!contact || typeof password !== 'string') return bad(res, 400, 'Contacto e palavra-passe são obrigatórios.');
  const user = db.prepare('SELECT id, password_hash, deleted_at FROM users WHERE contact = ?').get(contact) as
    Row | undefined;
  if (!user || user.deleted_at || !verifyPassword(password, user.password_hash)) {
    return bad(res, 401, 'Contacto ou palavra-passe incorretos.');
  }
  createSession(user.id, res);
  audit(user.id, 'account.login', 'user', user.id);
  return res.json({ user: serializeUser(user.id), stats: userStats(user.id) });
});

apiRouter.post('/auth/logout', optionalAuth, (req, res) => {
  const userId = (req as any).userId as string | undefined;
  destroySession(req, res);
  if (userId) audit(userId, 'account.logout', 'user', userId);
  return res.json({ success: true });
});

apiRouter.get('/auth/me', requireAuth, (req, res) => {
  const id = currentUserId(req);
  return res.json({ user: serializeUser(id), stats: userStats(id) });
});

apiRouter.post('/me/onboarding', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const activeMode =
    req.body?.activeMode === 'provider' ? 'provider' : req.body?.activeMode === 'customer' ? 'customer' : null;
  const provinceId = req.body?.provinceId;
  const municipalityId = req.body?.municipalityId;
  const communeId = req.body?.communeId;
  if (!activeMode) return bad(res, 400, 'Escolhe como queres usar o SALU.');
  if (!isValidLocation(provinceId, municipalityId, communeId))
    return bad(res, 400, 'Escolhe província, município e comuna.');
  db.prepare(
    'UPDATE users SET active_mode = ?, province_id = ?, municipality_id = ?, commune_id = ?, updated_at = ? WHERE id = ?',
  ).run(activeMode, provinceId, municipalityId, communeId, nowIso(), id);
  audit(id, 'account.onboarding', 'user', id);
  return res.json({ user: serializeUser(id), stats: userStats(id) });
});

apiRouter.patch('/me', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const user = currentUser(req);
  const updates: string[] = [];
  const values: any[] = [];

  if (req.body?.name != null) {
    const name = text(req.body.name, 2, 80);
    if (!name) return bad(res, 400, 'Nome inválido.', { name: 'Nome inválido.' });
    updates.push('name = ?');
    values.push(name);
    const profile = db.prepare('SELECT display_name FROM provider_profiles WHERE user_id = ?').get(id) as
      Row | undefined;
    if (profile && profile.display_name === user.name) {
      db.prepare('UPDATE provider_profiles SET display_name = ?, updated_at = ? WHERE user_id = ?').run(
        name,
        nowIso(),
        id,
      );
    }
  }

  if (req.body?.locale != null) {
    if (!['pt', 'en'].includes(req.body.locale)) return bad(res, 400, 'Idioma inválido.');
    updates.push('locale = ?');
    values.push(req.body.locale);
  }
  if (req.body?.theme != null) {
    if (!['light', 'dark'].includes(req.body.theme)) return bad(res, 400, 'Tema inválido.');
    updates.push('theme = ?');
    values.push(req.body.theme);
  }
  if (req.body?.activeMode != null) {
    if (!['customer', 'provider'].includes(req.body.activeMode)) return bad(res, 400, 'Modo inválido.');
    updates.push('active_mode = ?');
    values.push(req.body.activeMode);
  }
  if (req.body?.bio != null) {
    const bio = text(req.body.bio, 0, 600);
    if (bio == null) return bad(res, 400, 'Biografia demasiado longa.');
    updates.push('bio = ?');
    values.push(bio);
  }
  if (req.body?.provinceId != null || req.body?.municipalityId != null || req.body?.communeId != null) {
    const provinceId = req.body?.provinceId;
    const municipalityId = req.body?.municipalityId;
    const communeId = req.body?.communeId;
    if (!isValidLocation(provinceId, municipalityId, communeId))
      return bad(res, 400, 'Localização inválida. Escolhe província, município e comuna.');
    updates.push('province_id = ?', 'municipality_id = ?', 'commune_id = ?');
    values.push(provinceId, municipalityId, communeId);
    db.prepare(
      'UPDATE provider_profiles SET province_id = ?, municipality_id = ?, commune_id = ?, updated_at = ? WHERE user_id = ?',
    ).run(provinceId, municipalityId, communeId, nowIso(), id);
  }
  if (req.body?.avatarFileId != null) {
    const file = db.prepare('SELECT owner_id FROM files WHERE id = ?').get(req.body.avatarFileId) as Row | undefined;
    if (!file || file.owner_id !== id) return bad(res, 400, 'Fotografia inválida.');
    updates.push('avatar_file_id = ?');
    values.push(req.body.avatarFileId);
  }

  if (!updates.length) return bad(res, 400, 'Nada para actualizar.');
  values.push(nowIso(), id);
  db.prepare(`UPDATE users SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`).run(...values);
  audit(id, 'account.update', 'user', id);
  return res.json({ user: serializeUser(id), stats: userStats(id) });
});

apiRouter.post('/me/password', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(id) as Row;
  if (!verifyPassword(String(req.body?.currentPassword || ''), user.password_hash))
    return bad(res, 400, 'Palavra-passe actual incorrecta.');
  if (!validPassword(req.body?.newPassword))
    return bad(res, 400, 'A nova palavra-passe precisa de 8 caracteres, com letras e números.');
  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(
    hashPassword(req.body.newPassword),
    nowIso(),
    id,
  );
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE] || '';
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').run(id, tokenHash);
  audit(id, 'account.password_change', 'user', id);
  return res.json({ success: true });
});

apiRouter.get('/me/export', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const exportData = {
    exportedAt: nowIso(),
    user: serializeUser(id),
    requests: db.prepare('SELECT * FROM requests WHERE customer_id = ?').all(id),
    proposals: db.prepare('SELECT * FROM proposals WHERE provider_id = ?').all(id),
    agreements: db.prepare('SELECT * FROM agreements WHERE customer_id = ? OR provider_id = ?').all(id, id),
    messages: db
      .prepare(
        `SELECT m.* FROM messages m JOIN conversations c ON c.id = m.conversation_id
         WHERE c.customer_id = ? OR c.provider_id = ?`,
      )
      .all(id, id),
    reviews: db.prepare('SELECT * FROM reviews WHERE author_id = ? OR target_id = ?').all(id, id),
    notifications: db.prepare('SELECT * FROM notifications WHERE user_id = ?').all(id),
  };
  res.setHeader('Content-Disposition', `attachment; filename="salu-dados-${id}.json"`);
  return res.json(exportData);
});

apiRouter.delete('/me', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(id) as Row;
  if (!verifyPassword(String(req.body?.password || ''), user.password_hash))
    return bad(res, 400, 'Confirma a tua palavra-passe para eliminar a conta.');
  const now = nowIso();
  transaction(() => {
    db.prepare(
      `UPDATE users SET name = 'Conta eliminada', contact = ?, password_hash = ?, bio = '', avatar_file_id = NULL,
       deleted_at = ?, updated_at = ? WHERE id = ?`,
    ).run(`deleted-${id}@invalid.local`, hashPassword(newId('gone')), now, now, id);
    db.prepare('UPDATE provider_profiles SET published = 0, updated_at = ? WHERE user_id = ?').run(now, id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    audit(id, 'account.delete', 'user', id);
  });
  destroySession(req, res);
  return res.json({ success: true });
});

// =============================================================
// FICHEIROS
// =============================================================
apiRouter.post('/files', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return bad(res, 400, 'Escolhe um ficheiro.');
  const purpose = String(req.body?.purpose || '');
  if (!['avatar', 'portfolio', 'request', 'message', 'completion', 'report'].includes(purpose))
    return bad(res, 400, 'Tipo de ficheiro inválido.');
  try {
    const file = await saveUploadedFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      purpose,
      ownerId: currentUserId(req),
    });
    return res.status(201).json({ file });
  } catch (error: any) {
    return bad(res, 400, error.message || 'Não foi possível guardar o ficheiro.');
  }
});

apiRouter.get('/files/:id', optionalAuth, (req, res) => {
  const viewerId = (req as any).userId as string | undefined;
  const file = fileOnDisk(req.params.id);
  if (!file || !canAccessFile(req.params.id, viewerId || null)) return res.status(404).end();
  res.setHeader('Content-Type', file.mime);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // O frontend vive noutro domínio (ex.: Netlify). Sem isto o browser recusa
  // mostrar a imagem já carregada: o upload corre bem, mas a foto "não aparece".
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox");
  res.setHeader('Cache-Control', file.visibility === 'public' ? 'public, max-age=3600' : 'private, no-store');
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`);
  return res.sendFile(file.path);
});

apiRouter.post('/me/avatar', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return bad(res, 400, 'Escolhe uma fotografia.');
  try {
    const file = await saveUploadedFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      purpose: 'avatar',
      ownerId: currentUserId(req),
    });
    db.prepare('UPDATE users SET avatar_file_id = ?, updated_at = ? WHERE id = ?').run(
      file.id,
      nowIso(),
      currentUserId(req),
    );
    return res.json({ user: serializeUser(currentUserId(req)) });
  } catch (error: any) {
    return bad(res, 400, error.message || 'Fotografia inválida.');
  }
});

// =============================================================
// PERFIL DE PRESTADOR
// =============================================================
apiRouter.get('/providers', (req, res) => {
  const { category, municipality, q } = req.query as Record<string, string | undefined>;
  let sql = `SELECT u.id FROM users u JOIN provider_profiles p ON p.user_id = u.id
             WHERE p.published = 1 AND u.deleted_at IS NULL`;
  const params: any[] = [];
  if (category) {
    sql += ' AND p.category_id = ?';
    params.push(category);
  }
  if (municipality) {
    sql += ' AND u.municipality_id = ?';
    params.push(municipality);
  }
  if (q) {
    sql += ' AND (p.display_name LIKE ? OR p.headline LIKE ? OR p.bio LIKE ?)';
    const term = `%${q.slice(0, 80)}%`;
    params.push(term, term, term);
  }
  sql += ' ORDER BY p.updated_at DESC LIMIT 60';
  const ids = db.prepare(sql).all(...params) as Array<{ id: string }>;
  const providers = ids.map((row) => providerProfileFor(row.id)).filter(Boolean);
  providers.sort((a: any, b: any) => b.completedJobs - a.completedJobs || (b.rating || 0) - (a.rating || 0));
  return res.json({ providers });
});

apiRouter.get('/providers/:id', optionalAuth, (req, res) => {
  const profile = providerProfileFor(req.params.id);
  const viewerId = (req as any).userId as string | undefined;
  if (!profile) return bad(res, 404, 'Perfil não encontrado.');
  if (!profile.published && viewerId !== req.params.id) return bad(res, 404, 'Perfil não encontrado.');
  const rows = db
    .prepare('SELECT * FROM reviews WHERE target_id = ? ORDER BY created_at DESC LIMIT 30')
    .all(req.params.id) as Row[];
  return res.json({
    provider: profile,
    reviews: rows.map(serializeReview),
    reviewSummary: reviewAggregate(req.params.id, 'customer'),
    isFavorite: viewerId
      ? Boolean(
          db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND provider_id = ?').get(viewerId, req.params.id),
        )
      : false,
  });
});

apiRouter.get('/me/provider', requireAuth, (req, res) => {
  return res.json({ provider: providerProfileFor(currentUserId(req)) });
});

apiRouter.put('/me/provider', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const user = currentUser(req);
  const displayName = text(req.body?.displayName, 2, 80) || user.name;
  const headline = text(req.body?.headline, 5, 120);
  const categoryId = req.body?.categoryId;
  const bio = text(req.body?.bio, 20, 1200);
  const years = int(req.body?.yearsExperience, 0, 70);
  const whatsapp = req.body?.whatsapp == null || req.body.whatsapp === '' ? null : normalizeContact(req.body.whatsapp);
  if (!headline)
    return bad(res, 400, 'Escreve um título profissional (5–120 caracteres).', { headline: 'Obrigatório.' });
  if (!isValidCategory(categoryId))
    return bad(res, 400, 'Escolhe uma categoria válida.', { categoryId: 'Obrigatório.' });
  if (!bio) return bad(res, 400, 'Escreve uma apresentação com pelo menos 20 caracteres.', { bio: 'Obrigatório.' });
  if (years == null) return bad(res, 400, 'Indica os anos de experiência (0–70).', { yearsExperience: 'Inválido.' });
  if (whatsapp && !whatsapp.startsWith('+244')) return bad(res, 400, 'WhatsApp deve ser um número angolano.');
  if (!isValidLocation(user.province_id, user.municipality_id, user.commune_id))
    return bad(res, 400, 'Define primeiro a tua localização nas definições.');

  const now = nowIso();
  const existing = db.prepare('SELECT user_id FROM provider_profiles WHERE user_id = ?').get(id);
  if (existing) {
    db.prepare(
      `UPDATE provider_profiles SET display_name = ?, headline = ?, category_id = ?, bio = ?, years_experience = ?,
       whatsapp = ?, province_id = ?, municipality_id = ?, commune_id = ?, updated_at = ? WHERE user_id = ?`,
    ).run(
      displayName,
      headline,
      categoryId,
      bio,
      years,
      whatsapp,
      user.province_id,
      user.municipality_id,
      user.commune_id,
      now,
      id,
    );
  } else {
    db.prepare(
      `INSERT INTO provider_profiles (user_id, display_name, headline, category_id, bio, years_experience, whatsapp,
       published, province_id, municipality_id, commune_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      displayName,
      headline,
      categoryId,
      bio,
      years,
      whatsapp,
      user.province_id,
      user.municipality_id,
      user.commune_id,
      now,
      now,
    );
  }
  if (req.body?.publish === true) {
    db.prepare('UPDATE provider_profiles SET published = 1, updated_at = ? WHERE user_id = ?').run(now, id);
    db.prepare("UPDATE users SET active_mode = 'provider', updated_at = ? WHERE id = ?").run(now, id);
  }
  audit(id, 'provider.profile_save', 'provider_profile', id);
  return res.json({ provider: providerProfileFor(id), user: serializeUser(id) });
});

apiRouter.post('/me/provider/publish', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const profile = providerProfileFor(id);
  if (!profile) return bad(res, 400, 'Cria o teu perfil profissional antes de publicar.');
  if (!profile.headline || !profile.bio || !profile.categoryId || !profile.locationLabel)
    return bad(res, 400, 'Completa o perfil antes de publicar.');
  db.prepare('UPDATE provider_profiles SET published = 1, updated_at = ? WHERE user_id = ?').run(nowIso(), id);
  db.prepare("UPDATE users SET active_mode = 'provider', updated_at = ? WHERE id = ?").run(nowIso(), id);
  audit(id, 'provider.publish', 'provider_profile', id);
  return res.json({ provider: providerProfileFor(id), user: serializeUser(id) });
});

apiRouter.post('/me/provider/unpublish', requireAuth, (req, res) => {
  const id = currentUserId(req);
  db.prepare('UPDATE provider_profiles SET published = 0, updated_at = ? WHERE user_id = ?').run(nowIso(), id);
  return res.json({ provider: providerProfileFor(id), user: serializeUser(id) });
});

apiRouter.post('/me/portfolio', requireAuth, upload.single('file'), async (req, res) => {
  const id = currentUserId(req);
  const profile = db.prepare('SELECT user_id FROM provider_profiles WHERE user_id = ?').get(id);
  if (!profile) return bad(res, 400, 'Cria o perfil profissional antes de adicionar trabalhos.');
  if (!req.file) return bad(res, 400, 'Escolhe uma imagem.');
  const count = db.prepare('SELECT COUNT(*) as c FROM provider_portfolio WHERE user_id = ?').get(id) as Row;
  if (Number(count.c) >= 8) return bad(res, 400, 'O portefólio aceita no máximo 8 imagens.');
  try {
    const file = await saveUploadedFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      purpose: 'portfolio',
      ownerId: id,
    });
    db.prepare('INSERT INTO provider_portfolio (user_id, file_id, position) VALUES (?, ?, ?)').run(
      id,
      file.id,
      Number(count.c),
    );
    return res.status(201).json({ file, provider: providerProfileFor(id) });
  } catch (error: any) {
    return bad(res, 400, error.message || 'Imagem inválida.');
  }
});

apiRouter.delete('/me/portfolio/:fileId', requireAuth, (req, res) => {
  const id = currentUserId(req);
  db.prepare('DELETE FROM provider_portfolio WHERE user_id = ? AND file_id = ?').run(id, req.params.fileId);
  return res.json({ provider: providerProfileFor(id) });
});

apiRouter.post('/favorites/:providerId', requireAuth, (req, res) => {
  const id = currentUserId(req);
  db.prepare('INSERT OR IGNORE INTO favorites (user_id, provider_id, created_at) VALUES (?, ?, ?)').run(
    id,
    req.params.providerId,
    nowIso(),
  );
  return res.json({ favorite: true });
});

apiRouter.delete('/favorites/:providerId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND provider_id = ?').run(
    currentUserId(req),
    req.params.providerId,
  );
  return res.json({ favorite: false });
});

// =============================================================
// PEDIDOS
// =============================================================
apiRouter.get('/requests', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const scope = String(req.query.scope || 'mine');
  const { category, municipality, status, q } = req.query as Record<string, string | undefined>;
  let sql = '';
  const params: any[] = [];
  if (scope === 'open') {
    sql = `SELECT DISTINCT r.id FROM requests r WHERE r.status = 'OPEN' AND r.customer_id != ?`;
    params.push(id);
  } else {
    sql = `SELECT DISTINCT r.id FROM requests r
           LEFT JOIN proposals p ON p.request_id = r.id
           WHERE r.customer_id = ? OR p.provider_id = ?`;
    params.push(id, id);
  }
  if (category) {
    sql += ' AND r.category_id = ?';
    params.push(category);
  }
  if (municipality) {
    sql += ' AND r.municipality_id = ?';
    params.push(municipality);
  }
  if (status && ['OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED', 'DISPUTED'].includes(status)) {
    sql += ' AND r.status = ?';
    params.push(status);
  }
  if (q) {
    sql += ' AND (r.title LIKE ? OR r.description LIKE ?)';
    const term = `%${q.slice(0, 80)}%`;
    params.push(term, term);
  }
  sql += ' ORDER BY r.created_at DESC LIMIT 80';
  const rows = db.prepare(sql).all(...params) as Array<{ id: string }>;
  const requests = rows.map((row) => serializeRequest(row.id, id)).filter((r): r is RequestDetail => Boolean(r));
  return res.json({ requests });
});

apiRouter.post('/requests', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const title = text(req.body?.title, 6, 140);
  const description = text(req.body?.description, 20, 3000);
  const categoryId = req.body?.categoryId;
  const provinceId = req.body?.provinceId;
  const municipalityId = req.body?.municipalityId;
  const communeId = req.body?.communeId;
  const budgetType = req.body?.budgetType === 'FIXED' ? 'FIXED' : 'INSPECTION_NEEDED';
  const budgetAmount = budgetType === 'FIXED' ? int(req.body?.budgetAmount, 1, 100_000_000) : 0;
  const urgency = req.body?.urgency === 'URGENT' ? 'URGENT' : 'NORMAL';
  if (!title) return bad(res, 400, 'O título precisa de 6 a 140 caracteres.', { title: 'Inválido.' });
  if (!description) return bad(res, 400, 'A descrição precisa de pelo menos 20 caracteres.', { description: 'Curta.' });
  if (!isValidCategory(categoryId)) return bad(res, 400, 'Escolhe uma categoria.', { categoryId: 'Obrigatório.' });
  if (!isValidLocation(provinceId, municipalityId, communeId))
    return bad(res, 400, 'Escolhe província, município e comuna.', { location: 'Obrigatório.' });
  if (budgetType === 'FIXED' && budgetAmount == null)
    return bad(res, 400, 'Indica um orçamento válido em kwanzas.', { budgetAmount: 'Inválido.' });

  const requestId = newId('req');
  const now = nowIso();
  const photos = ownFileIds(req.body?.photoIds, id, 6);
  transaction(() => {
    db.prepare(
      `INSERT INTO requests (id, customer_id, title, category_id, description, province_id, municipality_id,
       commune_id, budget_type, budget_amount, urgency, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)`,
    ).run(
      requestId,
      id,
      title,
      categoryId,
      description,
      provinceId,
      municipalityId,
      communeId,
      budgetType,
      budgetAmount || 0,
      urgency,
      now,
      now,
    );
    addPhotos('request_photos', 'request_id', requestId, photos);
  });
  audit(id, 'request.create', 'request', requestId);
  return res.status(201).json({ request: serializeRequest(requestId, id) });
});

apiRouter.get('/requests/:id', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = requestRow(req.params.id);
  if (!row) return bad(res, 404, 'Pedido não encontrado.');
  if (!canViewRequest(row, id)) return bad(res, 403, 'Não tens acesso a este pedido.');
  return res.json({ request: serializeRequest(row.id, id) });
});

apiRouter.patch('/requests/:id', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = requestRow(req.params.id);
  if (!row) return bad(res, 404, 'Pedido não encontrado.');
  if (row.customer_id !== id) return bad(res, 403, 'Só o autor pode editar o pedido.');
  if (row.status !== 'OPEN') return bad(res, 409, 'Só podes editar pedidos ainda abertos.');
  const title = req.body?.title != null ? text(req.body.title, 6, 140) : row.title;
  const description = req.body?.description != null ? text(req.body.description, 20, 3000) : row.description;
  const categoryId = req.body?.categoryId ?? row.category_id;
  if (!title || !description || !isValidCategory(categoryId)) return bad(res, 400, 'Dados inválidos.');
  db.prepare('UPDATE requests SET title = ?, description = ?, category_id = ?, updated_at = ? WHERE id = ?').run(
    title,
    description,
    categoryId,
    nowIso(),
    row.id,
  );
  if (Array.isArray(req.body?.photoIds)) {
    db.prepare('DELETE FROM request_photos WHERE request_id = ?').run(row.id);
    addPhotos('request_photos', 'request_id', row.id, ownFileIds(req.body.photoIds, id, 6));
  }
  return res.json({ request: serializeRequest(row.id, id) });
});

apiRouter.post('/requests/:id/cancel', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = requestRow(req.params.id);
  if (!row) return bad(res, 404, 'Pedido não encontrado.');
  if (row.customer_id !== id) return bad(res, 403, 'Só o autor pode cancelar o pedido.');
  if (!['OPEN', 'CANCELLED'].includes(row.status)) return bad(res, 409, 'Este pedido já tem um acordo.');
  db.prepare("UPDATE requests SET status = 'CANCELLED', updated_at = ? WHERE id = ?").run(nowIso(), row.id);
  audit(id, 'request.cancel', 'request', row.id);
  return res.json({ request: serializeRequest(row.id, id) });
});

// =============================================================
// PROPOSTAS E ACORDOS
// =============================================================
apiRouter.post('/requests/:id/proposals', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = requestRow(req.params.id);
  if (!row) return bad(res, 404, 'Pedido não encontrado.');
  if (row.customer_id === id) return bad(res, 400, 'Não podes propor ao teu próprio pedido.');
  if (row.status !== 'OPEN') return bad(res, 409, 'Este pedido já não está aberto.');
  const profile = db.prepare('SELECT published FROM provider_profiles WHERE user_id = ?').get(id) as Row | undefined;
  if (!profile?.published) return bad(res, 403, 'Publica o teu perfil profissional antes de enviar propostas.');
  const amount = int(req.body?.amount, 1, 100_000_000);
  const days = int(req.body?.estimatedDays, 1, 365);
  const message = text(req.body?.message, 10, 2000);
  if (amount == null) return bad(res, 400, 'Indica um valor em kwanzas.', { amount: 'Inválido.' });
  if (days == null) return bad(res, 400, 'Indica um prazo entre 1 e 365 dias.', { estimatedDays: 'Inválido.' });
  if (!message) return bad(res, 400, 'Escreve uma mensagem com pelo menos 10 caracteres.', { message: 'Curta.' });
  const existing = db.prepare('SELECT id FROM proposals WHERE request_id = ? AND provider_id = ?').get(row.id, id) as
    Row | undefined;
  if (existing) return bad(res, 409, 'Já enviaste uma proposta para este pedido.');

  const proposalId = newId('prop');
  const now = nowIso();
  transaction(() => {
    db.prepare(
      `INSERT INTO proposals (id, request_id, provider_id, amount, estimated_days, message, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
    ).run(proposalId, row.id, id, amount, days, message, now, now);
    const conv = db.prepare('SELECT id FROM conversations WHERE request_id = ? AND provider_id = ?').get(row.id, id) as
      Row | undefined;
    if (!conv) {
      db.prepare(
        'INSERT INTO conversations (id, request_id, customer_id, provider_id, created_at, last_message_at) VALUES (?, ?, ?, ?, ?, ?)',
      ).run(newId('conv'), row.id, row.customer_id, id, now, now);
    }
  });
  notify(
    row.customer_id,
    'proposal',
    'Nova proposta recebida',
    `Recebeste uma proposta para “${row.title}”.`,
    `/pedidos/${row.id}`,
  );
  audit(id, 'proposal.create', 'proposal', proposalId);
  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(proposalId) as Row;
  return res.status(201).json({ proposal: serializeProposal(proposal), request: serializeRequest(row.id, id) });
});

apiRouter.post('/proposals/:id/accept', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!proposal) return bad(res, 404, 'Proposta não encontrada.');
  const row = requestRow(proposal.request_id);
  if (!row) return bad(res, 404, 'Pedido não encontrado.');
  if (row.customer_id !== id) return bad(res, 403, 'Só o autor do pedido pode aceitar propostas.');
  if (row.status !== 'OPEN') return bad(res, 409, 'Este pedido já não está aberto.');
  if (proposal.status !== 'PENDING') return bad(res, 409, 'Esta proposta já não está pendente.');

  const agreementId = newId('agr');
  const now = nowIso();
  const deadline = new Date(Date.now() + proposal.estimated_days * 86400000).toISOString();
  transaction(() => {
    db.prepare("UPDATE proposals SET status = 'ACCEPTED', updated_at = ? WHERE id = ?").run(now, proposal.id);
    db.prepare("UPDATE proposals SET status = 'REJECTED', updated_at = ? WHERE request_id = ? AND id != ?").run(
      now,
      row.id,
      proposal.id,
    );
    db.prepare("UPDATE requests SET status = 'ASSIGNED', updated_at = ? WHERE id = ?").run(now, row.id);
    db.prepare(
      `INSERT INTO agreements (id, request_id, customer_id, provider_id, amount, scope, deadline, status,
       customer_accepted, provider_accepted, provider_completed, customer_completed, completion_note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_PROVIDER', 1, 0, 0, 0, '', ?, ?)`,
    ).run(
      agreementId,
      row.id,
      row.customer_id,
      proposal.provider_id,
      proposal.amount,
      row.description,
      deadline,
      now,
      now,
    );
  });
  notify(
    proposal.provider_id,
    'agreement',
    'Proposta aceite',
    `O cliente aceitou a tua proposta para “${row.title}”. Falta a tua confirmação.`,
    `/acordos/${agreementId}`,
  );
  audit(id, 'proposal.accept', 'agreement', agreementId);
  return res.json({ agreement: serializeAgreement(agreementId, id) });
});

apiRouter.post('/proposals/:id/reject', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!proposal) return bad(res, 404, 'Proposta não encontrada.');
  const row = requestRow(proposal.request_id);
  if (!row || row.customer_id !== id) return bad(res, 403, 'Só o autor do pedido pode recusar propostas.');
  if (proposal.status !== 'PENDING') return bad(res, 409, 'Esta proposta já não está pendente.');
  db.prepare("UPDATE proposals SET status = 'REJECTED', updated_at = ? WHERE id = ?").run(nowIso(), proposal.id);
  notify(
    proposal.provider_id,
    'proposal',
    'Proposta não aceite',
    `A proposta para “${row.title}” não foi aceite.`,
    `/pedidos/${row.id}`,
  );
  return res.json({ success: true });
});

apiRouter.post('/proposals/:id/withdraw', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!proposal) return bad(res, 404, 'Proposta não encontrada.');
  if (proposal.provider_id !== id) return bad(res, 403, 'Só o autor pode retirar a proposta.');
  if (proposal.status !== 'PENDING') return bad(res, 409, 'Esta proposta já não está pendente.');
  db.prepare("UPDATE proposals SET status = 'WITHDRAWN', updated_at = ? WHERE id = ?").run(nowIso(), proposal.id);
  return res.json({ success: true });
});

apiRouter.get('/agreements/:id', requireAuth, (req, res) => {
  const agreement = serializeAgreement(req.params.id, currentUserId(req));
  if (!agreement) return bad(res, 404, 'Acordo não encontrado.');
  return res.json({ agreement });
});

apiRouter.post('/agreements/:id/accept', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = db.prepare('SELECT * FROM agreements WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!row) return bad(res, 404, 'Acordo não encontrado.');
  if (row.status !== 'PENDING_PROVIDER' && row.status !== 'PENDING_CUSTOMER')
    return bad(res, 409, 'Este acordo já não está pendente de aceitação.');
  const now = nowIso();
  if (row.provider_id === id) {
    if (row.provider_accepted) return bad(res, 409, 'Já confirmaste este acordo.');
    db.prepare("UPDATE agreements SET provider_accepted = 1, status = 'ACTIVE', updated_at = ? WHERE id = ?").run(
      now,
      row.id,
    );
    notify(
      row.customer_id,
      'agreement',
      'Acordo confirmado',
      'O prestador confirmou o acordo. O trabalho pode começar.',
      `/acordos/${row.id}`,
    );
  } else if (row.customer_id === id) {
    if (row.customer_accepted) return bad(res, 409, 'Já confirmaste este acordo.');
    db.prepare(
      "UPDATE agreements SET customer_accepted = 1, status = CASE WHEN provider_accepted = 1 THEN 'ACTIVE' ELSE 'PENDING_PROVIDER' END, updated_at = ? WHERE id = ?",
    ).run(now, row.id);
    notify(row.provider_id, 'agreement', 'Acordo confirmado', 'O cliente confirmou o acordo.', `/acordos/${row.id}`);
  } else {
    return bad(res, 403, 'Não participas neste acordo.');
  }
  audit(id, 'agreement.accept', 'agreement', row.id);
  return res.json({ agreement: serializeAgreement(row.id, id) });
});

apiRouter.post('/agreements/:id/decline', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = db.prepare('SELECT * FROM agreements WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!row) return bad(res, 404, 'Acordo não encontrado.');
  if (row.provider_id !== id) return bad(res, 403, 'Só o prestador pode recusar este acordo.');
  if (row.status !== 'PENDING_PROVIDER') return bad(res, 409, 'Este acordo já não está pendente.');
  const now = nowIso();
  transaction(() => {
    db.prepare("UPDATE agreements SET status = 'CANCELLED', updated_at = ? WHERE id = ?").run(now, row.id);
    db.prepare("UPDATE requests SET status = 'OPEN', updated_at = ? WHERE id = ?").run(now, row.request_id);
    db.prepare("UPDATE proposals SET status = 'REJECTED', updated_at = ? WHERE request_id = ? AND provider_id = ?").run(
      now,
      row.request_id,
      row.provider_id,
    );
  });
  notify(
    row.customer_id,
    'agreement',
    'Acordo recusado',
    'O prestador recusou o acordo. O pedido voltou a estar aberto.',
    `/pedidos/${row.request_id}`,
  );
  return res.json({ agreement: serializeAgreement(row.id, id) });
});

apiRouter.post('/agreements/:id/submit-completion', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = db.prepare('SELECT * FROM agreements WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!row) return bad(res, 404, 'Acordo não encontrado.');
  if (row.provider_id !== id) return bad(res, 403, 'Só o prestador pode submeter a conclusão.');
  if (row.status !== 'ACTIVE') return bad(res, 409, 'O acordo não está activo.');
  const note = text(req.body?.note, 10, 1500);
  if (!note) return bad(res, 400, 'Descreve o trabalho concluído (mínimo 10 caracteres).', { note: 'Curta.' });
  const photos = ownFileIds(req.body?.photoIds, id, 6);
  const now = nowIso();
  transaction(() => {
    db.prepare(
      "UPDATE agreements SET status = 'WORK_SUBMITTED', provider_completed = 1, completion_note = ?, updated_at = ? WHERE id = ?",
    ).run(note, now, row.id);
    db.prepare('DELETE FROM completion_photos WHERE agreement_id = ?').run(row.id);
    addPhotos('completion_photos', 'agreement_id', row.id, photos);
  });
  notify(
    row.customer_id,
    'completion',
    'Trabalho concluído — confirma',
    'O prestador submeteu a conclusão. Revê e confirma ou pede correcções.',
    `/acordos/${row.id}`,
  );
  audit(id, 'agreement.submit_completion', 'agreement', row.id);
  return res.json({ agreement: serializeAgreement(row.id, id) });
});

apiRouter.post('/agreements/:id/confirm', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = db.prepare('SELECT * FROM agreements WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!row) return bad(res, 404, 'Acordo não encontrado.');
  if (row.customer_id !== id) return bad(res, 403, 'Só o cliente pode confirmar a conclusão.');
  if (row.status !== 'WORK_SUBMITTED') return bad(res, 409, 'O prestador ainda não submeteu a conclusão.');
  const now = nowIso();
  transaction(() => {
    db.prepare("UPDATE agreements SET status = 'COMPLETED', customer_completed = 1, updated_at = ? WHERE id = ?").run(
      now,
      row.id,
    );
    db.prepare("UPDATE requests SET status = 'COMPLETED', updated_at = ? WHERE id = ?").run(now, row.request_id);
  });
  notify(
    row.provider_id,
    'completion',
    'Serviço confirmado',
    'O cliente confirmou a conclusão. Já podem avaliar-se.',
    `/acordos/${row.id}`,
  );
  audit(id, 'agreement.confirm', 'agreement', row.id);
  return res.json({ agreement: serializeAgreement(row.id, id) });
});

apiRouter.post('/agreements/:id/request-changes', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = db.prepare('SELECT * FROM agreements WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!row) return bad(res, 404, 'Acordo não encontrado.');
  if (row.customer_id !== id) return bad(res, 403, 'Só o cliente pode pedir correcções.');
  if (row.status !== 'WORK_SUBMITTED') return bad(res, 409, 'Não há conclusão por confirmar.');
  const note = text(req.body?.note, 5, 1000);
  if (!note) return bad(res, 400, 'Explica o que precisa de ser corrigido.');
  db.prepare(
    "UPDATE agreements SET status = 'ACTIVE', provider_completed = 0, completion_note = ?, updated_at = ? WHERE id = ?",
  ).run(`Correcção pedida: ${note}`, nowIso(), row.id);
  notify(row.provider_id, 'completion', 'Correcção pedida', note, `/acordos/${row.id}`);
  return res.json({ agreement: serializeAgreement(row.id, id) });
});

apiRouter.post('/agreements/:id/dispute', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = db.prepare('SELECT * FROM agreements WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!row) return bad(res, 404, 'Acordo não encontrado.');
  if (row.customer_id !== id && row.provider_id !== id) return bad(res, 403, 'Não participas neste acordo.');
  if (!['ACTIVE', 'WORK_SUBMITTED'].includes(row.status))
    return bad(res, 409, 'Este acordo não pode entrar em disputa.');
  const reason = text(req.body?.reason, 10, 1500);
  if (!reason) return bad(res, 400, 'Explica o motivo da disputa.');
  const now = nowIso();
  transaction(() => {
    db.prepare("UPDATE agreements SET status = 'DISPUTED', updated_at = ? WHERE id = ?").run(now, row.id);
    db.prepare("UPDATE requests SET status = 'DISPUTED', updated_at = ? WHERE id = ?").run(now, row.request_id);
    db.prepare(
      `INSERT INTO reports (id, reporter_id, target_type, target_id, reason, details, status, created_at)
       VALUES (?, ?, 'agreement', ?, 'dispute', ?, 'OPEN', ?)`,
    ).run(newId('rep'), id, row.id, reason, now);
  });
  const other = row.customer_id === id ? row.provider_id : row.customer_id;
  notify(
    other,
    'dispute',
    'Disputa aberta',
    'A outra parte abriu uma disputa. A equipa SALU vai analisar.',
    `/acordos/${row.id}`,
  );
  return res.json({ agreement: serializeAgreement(row.id, id) });
});

apiRouter.post('/agreements/:id/cancel', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = db.prepare('SELECT * FROM agreements WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!row) return bad(res, 404, 'Acordo não encontrado.');
  if (row.customer_id !== id && row.provider_id !== id) return bad(res, 403, 'Não participas neste acordo.');
  if (!['PENDING_PROVIDER', 'PENDING_CUSTOMER'].includes(row.status))
    return bad(res, 409, 'Só podes cancelar um acordo antes de começar.');
  const now = nowIso();
  transaction(() => {
    db.prepare("UPDATE agreements SET status = 'CANCELLED', updated_at = ? WHERE id = ?").run(now, row.id);
    db.prepare("UPDATE requests SET status = 'OPEN', updated_at = ? WHERE id = ?").run(now, row.request_id);
    db.prepare("UPDATE proposals SET status = 'REJECTED', updated_at = ? WHERE request_id = ? AND provider_id = ?").run(
      now,
      row.request_id,
      row.provider_id,
    );
  });
  const other = row.customer_id === id ? row.provider_id : row.customer_id;
  notify(
    other,
    'agreement',
    'Acordo cancelado',
    'O acordo foi cancelado antes do início.',
    `/pedidos/${row.request_id}`,
  );
  return res.json({ agreement: serializeAgreement(row.id, id) });
});

// =============================================================
// AVALIAÇÕES
// =============================================================
apiRouter.post('/agreements/:id/reviews', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const row = db.prepare('SELECT * FROM agreements WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!row) return bad(res, 404, 'Acordo não encontrado.');
  if (row.customer_id !== id && row.provider_id !== id) return bad(res, 403, 'Não participas neste acordo.');
  if (row.status !== 'COMPLETED') return bad(res, 409, 'Só podes avaliar depois da conclusão confirmada.');
  const existing = db.prepare('SELECT id FROM reviews WHERE request_id = ? AND author_id = ?').get(row.request_id, id);
  if (existing) return bad(res, 409, 'Já avaliaste este serviço.');
  const targetId = row.customer_id === id ? row.provider_id : row.customer_id;
  if (targetId === id) return bad(res, 400, 'Não podes avaliar-te a ti próprio.');
  const communication = int(req.body?.communication, 1, 5);
  const reliability = int(req.body?.reliability, 1, 5);
  const deadlines = int(req.body?.deadlines, 1, 5);
  const comment = text(req.body?.comment, 0, 1000) || '';
  if (communication == null || reliability == null || deadlines == null)
    return bad(res, 400, 'As três notas são obrigatórias (1 a 5).');
  const reviewId = newId('rev');
  db.prepare(
    `INSERT INTO reviews (id, request_id, author_id, target_id, author_role, communication, reliability, deadlines, comment, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    reviewId,
    row.request_id,
    id,
    targetId,
    row.customer_id === id ? 'customer' : 'provider',
    communication,
    reliability,
    deadlines,
    comment,
    nowIso(),
  );
  notify(
    targetId,
    'review',
    'Recebeste uma avaliação',
    'Uma avaliação foi publicada no teu perfil.',
    `/prestadores/${targetId}`,
  );
  audit(id, 'review.create', 'review', reviewId);
  return res
    .status(201)
    .json({ review: serializeReview(db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId) as Row) });
});

apiRouter.get('/me/reviews', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const rows = db
    .prepare('SELECT * FROM reviews WHERE author_id = ? OR target_id = ? ORDER BY created_at DESC LIMIT 100')
    .all(id, id) as Row[];
  return res.json({ reviews: rows.map(serializeReview) });
});

// =============================================================
// CONVERSAS
// =============================================================
apiRouter.get('/conversations', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const rows = db
    .prepare(
      `SELECT c.*, r.title as request_title FROM conversations c JOIN requests r ON r.id = c.request_id
       WHERE c.customer_id = ? OR c.provider_id = ? ORDER BY c.last_message_at DESC LIMIT 80`,
    )
    .all(id, id) as Row[];
  return res.json({
    conversations: rows.map((row) => serializeConversation(row, id)),
    unread: rows.reduce((sum, row) => sum + serializeConversation(row, id).unreadCount, 0),
  });
});

apiRouter.get('/conversations/:id/messages', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!conv) return bad(res, 404, 'Conversa não encontrada.');
  if (conv.customer_id !== id && conv.provider_id !== id) return bad(res, 403, 'Conversa privada.');
  const rows = db
    .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 500')
    .all(conv.id) as Row[];
  db.prepare(
    `INSERT INTO conversation_reads (conversation_id, user_id, last_read_at) VALUES (?, ?, ?)
     ON CONFLICT(conversation_id, user_id) DO UPDATE SET last_read_at = excluded.last_read_at`,
  ).run(conv.id, id, nowIso());
  return res.json({
    conversation: serializeConversation(
      {
        ...conv,
        request_title: (db.prepare('SELECT title FROM requests WHERE id = ?').get(conv.request_id) as Row)?.title,
      },
      id,
    ),
    messages: rows.map((row) => serializeMessage(row, id)),
  });
});

apiRouter.post('/conversations/:id/messages', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!conv) return bad(res, 404, 'Conversa não encontrada.');
  if (conv.customer_id !== id && conv.provider_id !== id) return bad(res, 403, 'Conversa privada.');
  const body = text(req.body?.body, 0, 4000) || '';
  const fileIds = ownFileIds(req.body?.fileIds, id, 1);
  if (!body && !fileIds.length) return bad(res, 400, 'Escreve uma mensagem ou anexa um ficheiro.');
  const messageId = newId('msg');
  const now = nowIso();
  transaction(() => {
    db.prepare('INSERT INTO messages (id, conversation_id, sender_id, body, created_at) VALUES (?, ?, ?, ?, ?)').run(
      messageId,
      conv.id,
      id,
      body,
      now,
    );
    for (const fileId of fileIds) {
      db.prepare('INSERT OR IGNORE INTO message_attachments (message_id, file_id) VALUES (?, ?)').run(
        messageId,
        fileId,
      );
    }
    db.prepare('UPDATE conversations SET last_message_at = ? WHERE id = ?').run(now, conv.id);
  });
  const other = conv.customer_id === id ? conv.provider_id : conv.customer_id;
  notify(other, 'message', 'Nova mensagem', body ? body.slice(0, 120) : 'Recebeste um anexo.', `/mensagens/${conv.id}`);
  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId) as Row;
  return res.status(201).json({ message: serializeMessage(message, id) });
});

apiRouter.post('/conversations/:id/read', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!conv) return bad(res, 404, 'Conversa não encontrada.');
  if (conv.customer_id !== id && conv.provider_id !== id) return bad(res, 403, 'Conversa privada.');
  db.prepare(
    `INSERT INTO conversation_reads (conversation_id, user_id, last_read_at) VALUES (?, ?, ?)
     ON CONFLICT(conversation_id, user_id) DO UPDATE SET last_read_at = excluded.last_read_at`,
  ).run(conv.id, id, nowIso());
  return res.json({ success: true });
});

// =============================================================
// NOTIFICAÇÕES
// =============================================================
apiRouter.get('/notifications', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const rows = db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 60')
    .all(id) as Row[];
  return res.json({
    notifications: rows.map(serializeNotification),
    unread: rows.filter((row) => !row.read).length,
  });
});

apiRouter.post('/notifications/:id/read', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, currentUserId(req));
  return res.json({ success: true });
});

apiRouter.post('/notifications/read-all', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(currentUserId(req));
  return res.json({ success: true });
});

// =============================================================
// DENÚNCIAS E VERIFICAÇÃO
// =============================================================
apiRouter.post('/reports', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const targetType = String(req.body?.targetType || '');
  if (!['user', 'request', 'message', 'review', 'agreement'].includes(targetType))
    return bad(res, 400, 'Tipo de denúncia inválido.');
  const targetId = text(req.body?.targetId, 1, 80);
  const reason = String(req.body?.reason || '');
  if (!targetId || !['abuse', 'fraud', 'impersonation', 'spam', 'safety', 'other'].includes(reason))
    return bad(res, 400, 'Indica o alvo e o motivo da denúncia.');
  const details = text(req.body?.details, 10, 2000);
  if (!details) return bad(res, 400, 'Descreve o que aconteceu (mínimo 10 caracteres).');
  const reportId = newId('rep');
  db.prepare(
    `INSERT INTO reports (id, reporter_id, target_type, target_id, reason, details, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?)`,
  ).run(reportId, id, targetType, targetId, reason, details, nowIso());
  audit(id, 'report.create', 'report', reportId);
  return res.status(201).json({ report: { id: reportId, status: 'OPEN' } });
});

apiRouter.get('/reports/mine', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.*, (SELECT a.status FROM report_appeals a WHERE a.report_id = r.id ORDER BY a.created_at DESC LIMIT 1) as appeal_status
       FROM reports r WHERE r.reporter_id = ? ORDER BY r.created_at DESC`,
    )
    .all(currentUserId(req)) as Row[];
  return res.json({ reports: rows });
});

apiRouter.post('/reports/:id/appeal', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!report || report.reporter_id !== id) return bad(res, 404, 'Denúncia não encontrada.');
  if (report.status !== 'RESOLVED') return bad(res, 409, 'Só podes recorrer depois de a denúncia ser resolvida.');
  const message = text(req.body?.message, 20, 2000);
  if (!message) return bad(res, 400, 'Explica porque queres recorrer (mínimo 20 caracteres).');
  const pending = db.prepare("SELECT id FROM report_appeals WHERE report_id = ? AND status = 'PENDING'").get(report.id);
  if (pending) return bad(res, 409, 'Já tens um recurso em análise.');
  const appealId = newId('apl');
  db.prepare(
    "INSERT INTO report_appeals (id, report_id, user_id, message, status, created_at) VALUES (?, ?, ?, ?, 'PENDING', ?)",
  ).run(appealId, report.id, id, message, nowIso());
  db.prepare("UPDATE reports SET status = 'REVIEWING' WHERE id = ?").run(report.id);
  audit(id, 'report.appeal', 'report', report.id);
  return res.status(201).json({ appeal: { id: appealId, status: 'PENDING' } });
});

apiRouter.get('/me/verification', requireAuth, (req, res) => {
  const id = currentUserId(req);
  const user = currentUser(req);
  const rows = db
    .prepare(
      'SELECT id, kind, status, notes, review_note, created_at, reviewed_at FROM verification_requests WHERE user_id = ? ORDER BY created_at DESC',
    )
    .all(id) as Row[];
  const completed = db
    .prepare("SELECT COUNT(*) as c FROM agreements WHERE provider_id = ? AND status = 'COMPLETED'")
    .get(id) as Row;
  return res.json({
    currentLevel: user.verification_level,
    historyLevel: Number(completed.c || 0) > 0 ? 4 : null,
    requests: rows,
    levels: [
      { level: 0, pt: 'Conta criada', en: 'Account created', available: true },
      { level: 1, pt: 'Contacto confirmado', en: 'Contact confirmed', available: false },
      { level: 2, pt: 'Identidade revista pela SALU', en: 'Identity reviewed by SALU', available: true },
      { level: 3, pt: 'Qualificações revistas pela SALU', en: 'Qualifications reviewed by SALU', available: true },
      { level: 4, pt: 'Histórico real de serviços', en: 'Real service history', available: true },
    ],
  });
});

apiRouter.post('/verification/requests', requireAuth, upload.single('file'), async (req, res) => {
  const id = currentUserId(req);
  if (!req.file) return bad(res, 400, 'Anexa um documento.');
  const kind = req.body?.kind === 'qualification' ? 'qualification' : req.body?.kind === 'identity' ? 'identity' : null;
  if (!kind) return bad(res, 400, 'Escolhe o tipo de verificação.');
  const notes = text(req.body?.notes, 0, 800) || '';
  const pending = db.prepare("SELECT id FROM verification_requests WHERE user_id = ? AND status = 'PENDING'").get(id);
  if (pending) return bad(res, 409, 'Já tens um pedido de verificação em análise.');
  try {
    const file = await saveUploadedFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      purpose: 'report',
      ownerId: id,
    });
    const verificationId = newId('ver');
    db.prepare(
      `INSERT INTO verification_requests (id, user_id, kind, document_file_id, notes, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
    ).run(verificationId, id, kind, file.id, notes, nowIso());
    notify(
      id,
      'verification',
      'Pedido recebido',
      'A equipa SALU vai rever o documento. Não é uma verificação automática.',
      '/definicoes',
    );
    return res.status(201).json({ id: verificationId, status: 'PENDING' });
  } catch (error: any) {
    return bad(res, 400, error.message || 'Documento inválido.');
  }
});

// =============================================================
// ADMINISTRAÇÃO MÍNIMA (token próprio; sem UI pública)
// =============================================================
apiRouter.get('/admin/reports', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM reports ORDER BY created_at DESC LIMIT 200').all();
  return res.json({ reports: rows });
});

apiRouter.get('/admin/verifications', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM verification_requests ORDER BY created_at DESC LIMIT 200').all();
  return res.json({ verifications: rows });
});

apiRouter.post('/admin/verifications/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM verification_requests WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!row) return bad(res, 404, 'Pedido não encontrado.');
  if (row.status !== 'PENDING') return bad(res, 409, 'Este pedido já foi revisto.');
  const approve = req.body?.approve === true;
  const note = text(req.body?.note, 0, 800) || '';
  const now = nowIso();
  transaction(() => {
    db.prepare(
      'UPDATE verification_requests SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?',
    ).run(approve ? 'APPROVED' : 'REJECTED', note, 'admin', now, row.id);
    if (approve) {
      const target = row.kind === 'identity' ? 2 : 3;
      db.prepare('UPDATE users SET verification_level = MAX(verification_level, ?), updated_at = ? WHERE id = ?').run(
        target,
        now,
        row.user_id,
      );
    }
  });
  notify(
    row.user_id,
    'verification',
    approve ? 'Verificação aprovada' : 'Verificação recusada',
    approve ? 'O teu documento foi revisto e aprovado pela equipa SALU.' : note || 'O documento não foi aceite.',
    '/definicoes',
  );
  return res.json({ success: true });
});

apiRouter.get('/admin/reports/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  return row ? res.json({ report: row }) : bad(res, 404, 'Denúncia não encontrada.');
});

apiRouter.post('/admin/reports/:id', requireAdmin, (req, res) => {
  const status = req.body?.status;
  if (!['OPEN', 'REVIEWING', 'RESOLVED'].includes(status)) return bad(res, 400, 'Estado inválido.');
  const row = db.prepare('SELECT id FROM reports WHERE id = ?').get(req.params.id);
  if (!row) return bad(res, 404, 'Denúncia não encontrada.');
  db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, req.params.id);
  return res.json({ success: true });
});

apiRouter.get('/admin/appeals', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM report_appeals ORDER BY created_at DESC LIMIT 200').all();
  return res.json({ appeals: rows });
});

apiRouter.post('/admin/appeals/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM report_appeals WHERE id = ?').get(req.params.id) as Row | undefined;
  if (!row) return bad(res, 404, 'Recurso não encontrado.');
  if (row.status !== 'PENDING') return bad(res, 409, 'Este recurso já foi revisto.');
  const approve = req.body?.approve === true;
  const note = text(req.body?.note, 0, 800) || '';
  const now = nowIso();
  transaction(() => {
    db.prepare('UPDATE report_appeals SET status = ?, review_note = ?, reviewed_at = ? WHERE id = ?').run(
      approve ? 'ACCEPTED' : 'REJECTED',
      note,
      now,
      row.id,
    );
    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(approve ? 'REVIEWING' : 'RESOLVED', row.report_id);
  });
  notify(
    row.user_id,
    'verification',
    approve ? 'Recurso aceite' : 'Recurso recusado',
    approve ? 'A denúncia vai ser revista novamente pela equipa SALU.' : note || 'O recurso não foi aceite.',
    '/seguranca',
  );
  return res.json({ success: true });
});
