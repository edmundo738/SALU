# DEPLOY

> **Sem dinheiro?** Segue `docs/DEPLOY_GRATIS.md` (Alwaysdata Free, 0 €, sem cartão).
> **Como ligar o site à API?** `docs/VINCULAR_SITE_API.md`.
>
> **Estado (2026-11-21):** o frontend está publicado em `https://salu-ao.netlify.app`, mas a **API persistente ainda não está publicada**. O registo falha com erro de configuração; `P0-12` continua **parcial**. Não declares produção pronta antes de completar o passo 1.

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

### Caminho rápido: Render Blueprint

O repositório inclui `render.yaml` e `Dockerfile`. O disco persistente do Render exige um plano pago; num plano sem disco o SQLite perde dados a cada deploy.

1. Abrir `https://render.com/deploy?repo=https://github.com/edmundo738/SALU` (ou **New → Blueprint** e escolher o repositório).
2. Confirmar o serviço `salu-api`, o disco `/data` e as variáveis geradas. `SALU_ADMIN_TOKEN` é gerado pelo Render.
3. Esperar por `GET https://<serviço>.onrender.com/api/health` → `{"status":"ok"}`.
4. Copiar o URL e usá-lo como `VITE_API_URL=https://<serviço>.onrender.com/api` no Netlify.
5. Fazer **Clear cache and deploy site** no Netlify.

O `Dockerfile` não foi construído neste ambiente (não há Docker); o servidor foi validado com Node 22 e `npm ci --omit=dev` no host de desenvolvimento. Confirmar o healthcheck antes de anunciar produção.

### Processo manual

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
- Opcional: `VITE_SUPPORT_EMAIL=suporte@teu-dominio.ao`; sem ela a UI diz que o canal ainda não está configurado, em vez de inventar um endereço.

Ou localmente:

```bash
VITE_API_URL=https://api.salu.ao/api npm run build
```

Sem `VITE_API_URL`, o cliente usa `/api`; o Netlify devolve **503 + `api-unavailable.json`** (incluindo POST, via `netlify/edge-functions/api-unavailable.ts`), nunca HTML disfarçado de API.

### Erro `HTTP_404` ao criar conta

Sintoma observado em `https://salu-ao.netlify.app/criar-conta`: o formulário mostra `HTTP_404`.

Causa: o build público foi feito **sem `VITE_API_URL`**. O browser fez `POST /api/auth/register` para o próprio Netlify; um POST não é servido por uma redirect estática e caiu num 404 sem JSON. **Não é um problema de palavra-passe nem de conta.**

Correcção:

1. Publicar a API num host persistente (passo 1) e confirmar `GET https://<host>/api/health`.
2. No Netlify, definir `VITE_API_URL=https://<host>/api` e fazer **Clear cache and deploy site**.
3. Abrir a consola do browser e confirmar que `/api/auth/me` já não devolve 404.
4. Repetir os dois registos e o ciclo completo do passo 4.

Se a API ainda não existir, a UI agora mostra **“Serviço temporariamente indisponível”** e desactiva o botão, em vez de expor `HTTP_404`.

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

- Cookies `Secure; SameSite=None` em `NODE_ENV=production` (frontend e API em domínios diferentes); `SameSite=Lax` em desenvolvimento.
- CORS com `Access-Control-Allow-Credentials`; o cookie só é aceite nas origens de `APP_ORIGIN`/previews.
- HSTS no servidor e no host; CSP no Netlify.
- Backups do volume e teste de restauro.
- Nunca commitar `.env`, `data/` ou `public/uploads/`.
- Rotação de `SALU_ADMIN_TOKEN`.

## 6. Limitações

- Sem deploy automático da API neste repositório; o frontend Netlify é publicado fora do Git. CI cobre build/testes, não deploy.
- Sem migração para Postgres.
- Sem e-mail/SMS.
- Sem CDN para uploads; servidos pela API com `Cache-Control` público/privado.
