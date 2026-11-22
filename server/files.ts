import multer from 'multer';
import sharp from 'sharp';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { db, newId, nowIso, uploadsDir } from './db.ts';
import { fileRecord } from './serializers.ts';
import type { FileRecord } from '../shared/types.ts';

export const MAX_FILE_BYTES = 6 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
});

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

const PUBLIC_PURPOSES = new Set(['avatar', 'portfolio', 'request']);
const PRIVATE_PURPOSES = new Set(['message', 'completion', 'report']);

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((b, i) => buffer[i] === b);
}

export function detectMime(buffer: Buffer): string | null {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46])) return 'application/pdf';
  return null;
}

export async function saveUploadedFile(params: {
  buffer: Buffer;
  originalName: string;
  purpose: string;
  ownerId: string;
}): Promise<FileRecord> {
  let buffer = params.buffer;
  let mime = detectMime(buffer);
  if (!mime) throw new Error('Formato não aceite. Usa JPG, PNG, WebP ou PDF.');
  if (mime === 'application/pdf' && !PRIVATE_PURPOSES.has(params.purpose)) {
    throw new Error('PDF só é aceite como documento privado (anexo ou prova).');
  }
  if (mime.startsWith('image/')) {
    const maxSide = params.purpose === 'avatar' ? 512 : 1600;
    try {
      buffer = await sharp(buffer, { failOn: 'error', limitInputPixels: 25_000_000 })
        .rotate()
        .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      mime = 'image/webp';
    } catch {
      throw new Error('Imagem inválida ou demasiado grande. Usa JPG, PNG ou WebP.');
    }
  }
  const ext = MIME_EXT[mime];
  const id = newId('file');
  const storedName = `${id}.${ext}`;
  const target = path.join(uploadsDir, storedName);
  fs.writeFileSync(target, buffer);
  const visibility = PUBLIC_PURPOSES.has(params.purpose) ? 'public' : 'private';
  db.prepare(
    `INSERT INTO files (id, owner_id, stored_name, original_name, mime, size, visibility, purpose, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    params.ownerId,
    storedName,
    String(params.originalName || `ficheiro.${ext}`).slice(0, 180),
    mime,
    buffer.length,
    visibility,
    params.purpose,
    nowIso(),
  );
  return fileRecord(id) as FileRecord;
}

export function canAccessFile(fileId: string, viewerId: string | null): boolean {
  const file = db
    .prepare(
      'SELECT files.*, users.deleted_at AS owner_deleted_at FROM files JOIN users ON users.id = files.owner_id WHERE files.id = ?',
    )
    .get(fileId) as
    | {
        id: string;
        owner_id: string;
        visibility: string;
        purpose: string;
        stored_name: string;
        mime: string;
        owner_deleted_at: string | null;
      }
    | undefined;
  if (!file) return false;
  if (file.visibility === 'public') return !file.owner_deleted_at;
  if (!viewerId) return false;
  if (file.owner_id === viewerId) return true;

  const message = db
    .prepare(
      `SELECT c.customer_id, c.provider_id
       FROM message_attachments ma
       JOIN messages m ON m.id = ma.message_id
       JOIN conversations c ON c.id = m.conversation_id
       WHERE ma.file_id = ? LIMIT 1`,
    )
    .get(fileId) as { customer_id: string; provider_id: string } | undefined;
  if (message && (message.customer_id === viewerId || message.provider_id === viewerId)) return true;

  const completion = db
    .prepare(
      `SELECT a.customer_id, a.provider_id
       FROM completion_photos cp JOIN agreements a ON a.id = cp.agreement_id
       WHERE cp.file_id = ? LIMIT 1`,
    )
    .get(fileId) as { customer_id: string; provider_id: string } | undefined;
  if (completion && (completion.customer_id === viewerId || completion.provider_id === viewerId)) return true;

  return false;
}

export function fileOnDisk(fileId: string): { path: string; mime: string; name: string; visibility: string } | null {
  const row = db.prepare('SELECT * FROM files WHERE id = ?').get(fileId) as
    { stored_name: string; mime: string; original_name: string; visibility: string } | undefined;
  if (!row) return null;
  const full = path.join(uploadsDir, row.stored_name);
  if (!fs.existsSync(full)) return null;
  return { path: full, mime: row.mime, name: row.original_name, visibility: row.visibility };
}
