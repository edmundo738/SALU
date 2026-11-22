import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const port = 3215;
const base = `http://127.0.0.1:${port}/api`;
const data = mkdtempSync(join(tmpdir(), 'salu-security-'));
let server: ChildProcess;

beforeAll(async () => {
  server = spawn(process.execPath, ['--experimental-strip-types', 'server/index.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'production',
      APP_ORIGIN: 'https://dominio-salu.test',
      SALU_DATA_DIR: data,
    },
    stdio: 'pipe',
  });
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${base}/health`)).ok) return;
    } catch {
      /* a arrancar */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Servidor de teste não iniciou');
}, 30_000);

afterAll(async () => {
  if (server && server.exitCode === null) {
    const exited = new Promise((resolve) => server.once('exit', resolve));
    server.kill('SIGTERM');
    await exited;
  }
  rmSync(data, { recursive: true, force: true });
});

describe('origens em produção', () => {
  it('rejeita origens alheias e locais mesmo quando enviam pedidos com credenciais', async () => {
    for (const origin of ['https://outro.netlify.app', 'https://terceiro.e2b.app', 'http://localhost:5173']) {
      const res = await fetch(`${base}/auth/me`, { headers: { Origin: origin, Cookie: 'salu_session=exemplo' } });
      expect(res.status).toBe(403);
      expect(res.headers.get('access-control-allow-origin')).toBeNull();
    }
  });

  it('permite o site e um domínio explicitamente configurado', async () => {
    for (const origin of ['https://salu-ao.netlify.app', 'https://dominio-salu.test']) {
      const res = await fetch(`${base}/auth/me`, { headers: { Origin: origin } });
      expect(res.status).toBe(401);
      expect(res.headers.get('access-control-allow-origin')).toBe(origin);
      expect(res.headers.get('access-control-allow-credentials')).toBe('true');
    }
  });
});
