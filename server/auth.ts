import type { NextFunction, Request, Response } from 'express';
import * as crypto from 'node:crypto';
import { db, newId, nowIso } from './db.ts';

export const SESSION_COOKIE = 'salu_session';
const SESSION_DAYS = 7;

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export function sessionCookie(token: string, maxAgeSeconds = SESSION_DAYS * 86400): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

export function createSession(userId: string, res: Response): string {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400 * 1000).toISOString();
  const now = nowIso();
  db.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(newId('ses'), userId, sha256(token), expires, now, now);
  res.setHeader('Set-Cookie', sessionCookie(token));
  return token;
}

export function destroySession(req: Request, res: Response): void {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
  res.setHeader('Set-Cookie', clearSessionCookie());
}

export function userIdFromRequest(req: Request): string | null {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return null;
  const session = db
    .prepare(
      `SELECT s.id, s.user_id, s.expires_at, u.deleted_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`,
    )
    .get(sha256(token)) as { id: string; user_id: string; expires_at: string; deleted_at: string | null } | undefined;
  if (!session) return null;
  if (session.deleted_at) return null;
  if (Date.parse(session.expires_at) < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
    return null;
  }
  // Atualiza last_seen no máximo uma vez por hora para não escrever em cada pedido.
  const last = db.prepare('SELECT last_seen_at FROM sessions WHERE id = ?').get(session.id) as {
    last_seen_at: string;
  };
  if (Date.now() - Date.parse(last.last_seen_at) > 3600_000) {
    db.prepare('UPDATE sessions SET last_seen_at = ? WHERE id = ?').run(nowIso(), session.id);
  }
  return session.user_id;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = userIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: 'É necessário iniciar sessão.', code: 'AUTH_REQUIRED' });
    return;
  }
  (req as Request & { userId: string }).userId = userId;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const userId = userIdFromRequest(req);
  if (userId) (req as Request & { userId: string }).userId = userId;
  next();
}

export function currentUserId(req: Request): string {
  return (req as Request & { userId: string }).userId;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers['x-admin-token'];
  const expected = process.env.SALU_ADMIN_TOKEN;
  if (!expected || typeof token !== 'string' || token !== expected) {
    res.status(404).json({ error: 'Não encontrado.' });
    return;
  }
  next();
}
