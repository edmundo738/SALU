import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const PORT = 3211;
const BASE = `http://127.0.0.1:${PORT}/api`;
const dataDir = mkdtempSync(join(tmpdir(), 'salu-test-'));
let child: ChildProcess;

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const res = await fetch(`${BASE}/health`);
      if (res.ok) return;
    } catch {
      // servidor ainda a arrancar
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('Servidor de teste não arrancou.');
}

function startServer() {
  child = spawn(process.execPath, ['--experimental-strip-types', 'server/index.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(PORT),
      SALU_DATA_DIR: dataDir,
      NODE_ENV: 'test',
      SALU_ADMIN_TOKEN: 'test-admin',
    },
    stdio: 'pipe',
  });
  child.stderr?.on('data', (chunk) => {
    const text = String(chunk);
    if (text.includes('Error')) process.stderr.write(text);
  });
}

interface ApiResult {
  status: number;
  body: any;
  cookie: string;
  setCookie: string;
}

async function call(
  path: string,
  options: { method?: string; body?: unknown; cookie?: string; form?: FormData; headers?: Record<string, string> } = {},
): Promise<ApiResult> {
  const res = await fetch(BASE + path, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.form ? {} : { 'Content-Type': 'application/json' }),
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      ...options.headers,
    },
    body: options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    redirect: 'manual',
  });
  const text = await res.text();
  let body: any = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  const setCookie = res.headers.get('set-cookie') ?? '';
  return { status: res.status, body, cookie: setCookie.split(';')[0], setCookie };
}

async function register(name: string, contact: string) {
  const res = await call('/auth/register', {
    method: 'POST',
    body: { name, contact, password: 'segura123', passwordConfirm: 'segura123' },
  });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return { jar: res.cookie, setCookie: res.setCookie, user: res.body.user };
}

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWP4z8AARwgWXg4ArpMP8bh5W0YAAAAASUVORK5CYII=',
  'base64',
);

async function upload(cookie: string, purpose: string, type = 'image/png', name = 'foto.png') {
  const form = new FormData();
  form.append('purpose', purpose);
  form.append('file', new Blob([PNG], { type }), name);
  return call('/files', { method: 'POST', cookie, form });
}

beforeAll(async () => {
  startServer();
  await waitForServer();
}, 30_000);

afterAll(() => {
  child?.kill('SIGTERM');
  rmSync(dataDir, { recursive: true, force: true });
});

describe('SALU — ciclo de serviço real com duas contas', () => {
  it('exige sessão e protege os recursos de cada conta', async () => {
    const unauth = await call('/auth/me');
    expect(unauth.status).toBe(401);

    const ana = await register('Ana Teste', 'ana@teste.ao');
    expect(ana.setCookie).toMatch(/HttpOnly/i);
    expect((await call('/auth/me', { cookie: ana.jar })).status).toBe(200);

    const bruno = await register('Bruno Teste', '923000111');
    const carlos = await register('Carlos Teste', 'carlos@teste.ao');

    const onboarding = await call('/me/onboarding', {
      method: 'POST',
      cookie: ana.jar,
      body: {
        activeMode: 'customer',
        provinceId: 'AO-LUA',
        municipalityId: 'AO-LUA-CAMAMA',
        communeId: 'AO-LUA-CAMAMA-CAMAMA',
      },
    });
    expect(onboarding.status, JSON.stringify(onboarding.body)).toBe(200);
    expect(onboarding.body.user.locationLabel).toBe('Camama, Luanda');

    const badOnboarding = await call('/me/onboarding', {
      method: 'POST',
      cookie: bruno.jar,
      body: {
        activeMode: 'provider',
        provinceId: 'AO-LUA',
        municipalityId: 'AO-LUA-TALATONA',
        communeId: 'AO-LUA-CAMAMA-CAMAMA',
      },
    });
    expect(badOnboarding.status).toBe(400);

    const providerOnboarding = await call('/me/onboarding', {
      method: 'POST',
      cookie: bruno.jar,
      body: {
        activeMode: 'provider',
        provinceId: 'AO-LUA',
        municipalityId: 'AO-LUA-TALATONA',
        communeId: 'AO-LUA-TALATONA-TALATONA',
      },
    });
    expect(providerOnboarding.status).toBe(200);

    const profile = await call('/me/provider', {
      method: 'PUT',
      cookie: bruno.jar,
      body: {
        displayName: 'Bruno Teste',
        headline: 'Electricista predial',
        categoryId: 'electrical',
        bio: 'Instalações e reparações eléctricas com diagnóstico antes do orçamento.',
        yearsExperience: 5,
        publish: true,
      },
    });
    expect(profile.status, JSON.stringify(profile.body)).toBe(200);
    expect(profile.body.provider.published).toBe(true);

    const photo = await upload(ana.jar, 'request');
    expect(photo.status).toBe(201);
    const request = await call('/requests', {
      method: 'POST',
      cookie: ana.jar,
      body: {
        title: 'Reparar ar condicionado',
        categoryId: 'hvac',
        description: 'O aparelho liga mas não gela e está a pingar água em Camama.',
        provinceId: 'AO-LUA',
        municipalityId: 'AO-LUA-CAMAMA',
        communeId: 'AO-LUA-CAMAMA-CAMAMA',
        budgetType: 'INSPECTION_NEEDED',
        budgetAmount: 0,
        urgency: 'NORMAL',
        photoIds: [photo.body.file.id],
      },
    });
    expect(request.status, JSON.stringify(request.body)).toBe(201);
    const requestId = request.body.request.id;
    expect(request.body.request.isOwner).toBe(true);

    expect((await call(`/requests/${requestId}`, { cookie: carlos.jar })).status).toBe(403);

    const proposal = await call(`/requests/${requestId}/proposals`, {
      method: 'POST',
      cookie: bruno.jar,
      body: { amount: 35000, estimatedDays: 2, message: 'Posso fazer o diagnóstico amanhã de manhã.' },
    });
    expect(proposal.status, JSON.stringify(proposal.body)).toBe(201);
    const proposalId = proposal.body.proposal.id;
    const conversationId = proposal.body.proposal.conversationId;
    expect(conversationId).toBeTruthy();

    expect((await call(`/conversations/${conversationId}/messages`, { cookie: carlos.jar })).status).toBe(403);
    expect((await call(`/proposals/${proposalId}/accept`, { method: 'POST', cookie: bruno.jar })).status).toBe(403);
    expect((await call(`/proposals/${proposalId}/accept`, { method: 'POST', cookie: carlos.jar })).status).toBe(403);

    const accepted = await call(`/proposals/${proposalId}/accept`, { method: 'POST', cookie: ana.jar });
    expect(accepted.status, JSON.stringify(accepted.body)).toBe(200);
    const agreementId = accepted.body.agreement.id;
    expect(accepted.body.agreement.status).toBe('PENDING_PROVIDER');

    expect((await call(`/agreements/${agreementId}/accept`, { method: 'POST', cookie: ana.jar })).status).toBe(409);
    const providerAccepted = await call(`/agreements/${agreementId}/accept`, { method: 'POST', cookie: bruno.jar });
    expect(providerAccepted.body.agreement.status).toBe('ACTIVE');

    const attachment = await upload(bruno.jar, 'message');
    const sent = await call(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      cookie: bruno.jar,
      body: { body: 'Cheguei ao local. O filtro está obstruído.', fileIds: [attachment.body.file.id] },
    });
    expect(sent.status).toBe(201);
    expect(sent.body.message.attachment.id).toBe(attachment.body.file.id);

    const inbox = await call(`/conversations/${conversationId}/messages`, { cookie: ana.jar });
    expect(inbox.status).toBe(200);
    expect(inbox.body.messages).toHaveLength(1);

    const completionPhoto = await upload(bruno.jar, 'completion');
    const completion = await call(`/agreements/${agreementId}/submit-completion`, {
      method: 'POST',
      cookie: bruno.jar,
      body: { note: 'Filtro limpo, dreno corrigido e testado.', photoIds: [completionPhoto.body.file.id] },
    });
    expect(completion.status).toBe(200);
    expect(completion.body.agreement.status).toBe('WORK_SUBMITTED');
    expect((await call(`/agreements/${agreementId}/confirm`, { method: 'POST', cookie: bruno.jar })).status).toBe(403);

    const confirmed = await call(`/agreements/${agreementId}/confirm`, { method: 'POST', cookie: ana.jar });
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.agreement.status).toBe('COMPLETED');

    const review = await call(`/agreements/${agreementId}/reviews`, {
      method: 'POST',
      cookie: ana.jar,
      body: { communication: 5, reliability: 5, deadlines: 4, comment: 'Trabalho bem feito.' },
    });
    expect(review.status).toBe(201);
    expect(
      (
        await call(`/agreements/${agreementId}/reviews`, {
          method: 'POST',
          cookie: ana.jar,
          body: { communication: 5, reliability: 5, deadlines: 5 },
        })
      ).status,
    ).toBe(409);
    expect(
      (
        await call(`/agreements/${agreementId}/reviews`, {
          method: 'POST',
          cookie: carlos.jar,
          body: { communication: 5, reliability: 5, deadlines: 5 },
        })
      ).status,
    ).toBe(403);

    const publicProvider = await call(`/providers/${bruno.user.id}`);
    expect(publicProvider.body.provider.rating).toBe(4.7);
    expect(publicProvider.body.provider.reviewCount).toBe(1);

    const report = await call('/reports', {
      method: 'POST',
      cookie: ana.jar,
      body: {
        targetType: 'user',
        targetId: bruno.user.id,
        reason: 'other',
        details: 'Denúncia de teste com detalhes suficientes.',
      },
    });
    expect(report.status, JSON.stringify(report.body)).toBe(201);
    const reportId = report.body.report.id;
    const admin = { 'X-Admin-Token': 'test-admin' };
    expect(
      (await call(`/admin/reports/${reportId}`, { method: 'POST', headers: admin, body: { status: 'RESOLVED' } }))
        .status,
    ).toBe(200);
    const appeal = await call(`/reports/${reportId}/appeal`, {
      method: 'POST',
      cookie: ana.jar,
      body: { message: 'Peço revisão porque a decisão não considerou as provas enviadas.' },
    });
    expect(appeal.status, JSON.stringify(appeal.body)).toBe(201);
    const mine = await call('/reports/mine', { cookie: ana.jar });
    expect(mine.body.reports[0].status).toBe('REVIEWING');
    expect(mine.body.reports[0].appeal_status).toBe('PENDING');
    expect(
      (
        await call(`/admin/appeals/${appeal.body.appeal.id}`, {
          method: 'POST',
          headers: admin,
          body: { approve: true, note: 'Rever' },
        })
      ).status,
    ).toBe(200);

    const privateFile = await call(`/files/${attachment.body.file.id}`, { cookie: carlos.jar });
    expect(privateFile.status).toBe(404);
    expect((await call(`/files/${attachment.body.file.id}`, { cookie: ana.jar })).status).toBe(200);

    const html = new FormData();
    html.append('purpose', 'avatar');
    html.append('file', new Blob(['<script>alert(1)</script>'], { type: 'text/html' }), 'x.html');
    expect((await call('/files', { method: 'POST', cookie: ana.jar, form: html })).status).toBe(400);

    expect(
      (await call('/agreements/' + agreementId + '/release-escrow', { method: 'POST', cookie: ana.jar })).status,
    ).toBe(404);
    expect((await call('/bots/status')).status).toBe(404);
    expect(
      (await call('/auth/login', { method: 'POST', body: { contact: 'helena@salu.ao', password: 'salu1234' } })).status,
    ).toBe(401);
    expect(
      (
        await call('/auth/login', {
          method: 'POST',
          headers: { Origin: 'https://evil.example' },
          body: { contact: 'ana@teste.ao', password: 'segura123' },
        })
      ).status,
    ).toBe(403);
  }, 30_000);

  it('mantém os dados depois de reiniciar o servidor', async () => {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
    startServer();
    await waitForServer();

    const login = await call('/auth/login', {
      method: 'POST',
      body: { contact: 'ana@teste.ao', password: 'segura123' },
    });
    expect(login.status).toBe(200);
    const me = await call('/auth/me', { cookie: login.cookie });
    expect(me.status).toBe(200);
    const requests = await call('/requests?scope=mine', { cookie: login.cookie });
    expect(requests.status).toBe(200);
    expect(requests.body.requests[0]?.status).toBe('COMPLETED');
  }, 30_000);

  it('termina a sessão no servidor', async () => {
    const login = await call('/auth/login', {
      method: 'POST',
      body: { contact: 'ana@teste.ao', password: 'segura123' },
    });
    expect(login.status).toBe(200);
    expect((await call('/auth/me', { cookie: login.cookie })).status).toBe(200);
    expect((await call('/auth/logout', { method: 'POST', cookie: login.cookie })).status).toBe(200);
    expect((await call('/auth/me', { cookie: login.cookie })).status).toBe(401);
  });

  it('rejeita ficheiros acima do limite e endpoints de administração sem token', async () => {
    const login = await call('/auth/login', {
      method: 'POST',
      body: { contact: 'ana@teste.ao', password: 'segura123' },
    });
    const big = new FormData();
    big.append('purpose', 'avatar');
    big.append('file', new Blob([Buffer.alloc(7 * 1024 * 1024, 1)], { type: 'image/png' }), 'enorme.png');
    expect((await call('/files', { method: 'POST', cookie: login.cookie, form: big })).status).toBe(413);
    expect((await call('/admin/reports')).status).toBe(404);
    expect((await call('/admin/reports', { headers: { 'X-Admin-Token': 'errado' } })).status).toBe(404);
  }, 30_000);

  it('limita tentativas repetidas de autenticação', async () => {
    let lastStatus = 0;
    for (let attempt = 0; attempt < 22; attempt += 1) {
      const res = await call('/auth/login', { method: 'POST', body: { contact: 'ana@teste.ao', password: 'errada' } });
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  }, 30_000);
});
