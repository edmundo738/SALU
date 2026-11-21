# DEPLOY

> **Estado:** configuração pronta; **nenhum deploy foi executado neste ambiente**. `P0-12` continua parcial.

## Arquitectura de produção

```
Netlify (estático)                    Host persistente (API)
salu.ao  ─── VITE_API_URL ───────────▶  https://api.salu.ao/api
   │                                         │
   └── index.html + assets                   ├── /data/salu.db (volume)
                                             └── /data/uploads/ (volume)
```

O SQLite **não** pode viver no Netlify: o filesystem serverless é efémero. Para várias instâncias, migrar para Postgres (não implementado).

## 1. API

Requisitos: Node 22, volume persistente, HTTPS.

```bash
npm ci --omit=dev
PORT=3001 \
HOST=0.0.0.0 \
NODE_ENV=production \
APP_ORIGIN=https://salu.ao \
SALU_DATA_DIR=/var/lib/salu \
SALU_ADMIN_TOKEN=<segredo-longo> \
npm run server
```

- `SALU_ADMIN_TOKEN` é obrigatório para `/api/admin/*`; sem ele, os endpoints devolvem 404.
- `SALU_DATA_DIR` deve ser um volume com backup.
- O servidor escuta em `0.0.0.0` e termina graciosamente com SIGTERM.
- Verificar `GET https://api.salu.ao/api/health` → `{"status":"ok"}`.

### Reverse proxy

Terminar TLS no proxy e encaminhar para `127.0.0.1:3001`. O servidor já define `trust proxy 1` para ler o IP real e aplicar rate limit.

## 2. Frontend

No painel Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- Variável: `VITE_API_URL=https://api.salu.ao/api`

Ou localmente:

```bash
VITE_API_URL=https://api.salu.ao/api npm run build
```

Sem `VITE_API_URL`, o cliente usa `/api`; o Netlify devolve **503 + `api-unavailable.json`**, nunca HTML disfarçado de API.

## 3. CORS

`server/app.ts` aceita:

- `http://localhost:5173`, `http://127.0.0.1:5173`;
- `http://localhost:4173`, `http://127.0.0.1:4173`;
- origens em `APP_ORIGIN` (lista separada por vírgulas);
- `*.e2b.app` e `*.netlify.app` (previews).

Adicionar o domínio final em `APP_ORIGIN`. Não usar `*`.

## 4. Verificação pós-deploy (obrigatória)

```bash
curl -i https://api.salu.ao/api/health
curl -i https://salu.ao/pedidos/req_inexistente     # 200 HTML (SPA)
curl -i https://salu.ao/api/health                  # 503 JSON, não HTML
curl -I https://salu.ao/assets/nao-existe.js        # 404
```

No browser:

1. Criar duas contas em janelas separadas.
2. Ana publica pedido; Bruno envia proposta; Ana aceita; ambos confirmam.
3. Conversa com anexo; Bruno submete prova; Ana confirma.
4. Avaliação recíproca; média real.
5. Recarregar, voltar atrás, abrir link directo.
6. Confirmar que um terceiro não vê a conversa.

Só depois actualizar `P0-12` para **Corrigido** e registar a evidência em `PROJECT_STATE.md`.

## 5. Segurança

- Cookies `Secure` em `NODE_ENV=production`.
- HSTS no servidor e no host; CSP no Netlify.
- Backups do volume e teste de restauro.
- Nunca commitar `.env`, `data/` ou `public/uploads/`.
- Rotação de `SALU_ADMIN_TOKEN`.

## 6. Limitações

- Sem deploy automático neste repositório (sem CI).
- Sem migração para Postgres.
- Sem e-mail/SMS.
- Sem CDN para uploads; servidos pela API com `Cache-Control` público/privado.
