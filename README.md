# SALU

Plataforma de serviços em Angola: uma pessoa publica um pedido, prestadores enviam propostas reais, as duas partes fecham um acordo, conversam, confirmam a conclusão e avaliam-se.

**Princípio central:** o SALU regista o acordo. Não processa pagamentos, não guarda dinheiro e não inventa verificações, avaliações ou números.

- Acordo de pagamento exacto, mostrado na interface: «O SALU regista o acordo entre as partes. O pagamento é combinado directamente entre cliente e prestador e não é processado pela plataforma.»
- Reputação só existe depois de um serviço concluído e confirmado pelos dois participantes.
- Identidade vem sempre da sessão do servidor; nenhum ID de utilizador enviado pelo browser é aceite como identidade.
- Divisão administrativa de 2024: Província → Município → Comuna, com IDs estáveis.

## Stack

| Camada    | Tecnologia                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------------- |
| Interface | React 18 + TypeScript + Vite 6 + Tailwind + lucide-react                                                 |
| Rotas     | react-router-dom 7 (BrowserRouter, rotas dinâmicas, 404)                                                 |
| API       | Node 22 + Express 5 + `node:sqlite`                                                                      |
| Sessões   | Cookie `HttpOnly`; `SameSite=Lax` em dev e `None; Secure` em produção; token em hash, validade de 7 dias |
| Ficheiros | multer + validação real de assinatura + `sharp` (redimensionamento e WebP)                               |
| Testes    | Vitest 5 + integração HTTP real com SQLite temporário                                                    |

## Arrancar localmente

Requisitos: Node 22 (para `node:sqlite`).

```bash
npm ci

# terminal 1 — API persistente
cp .env.example .env
npm run server

# terminal 2 — interface
npm run dev
```

- Interface: `http://localhost:5173` (bind `0.0.0.0`, proxy `/api` → `127.0.0.1:3001`).
- API: `http://localhost:3001/api`.
- Dados locais: `./data/salu.db` e `./data/uploads/` (ignorados pelo Git).
- `npm run server` lê `.env` com `--env-file-if-exists`; define `VITE_SUPPORT_EMAIL` só se existir um canal real.

Para apontar o frontend directamente para uma API externa:

```bash
VITE_API_URL=http://localhost:3001/api npm run build
```

Sem `VITE_API_URL`, o frontend usa `/api`; no Netlify essa rota devolve **503** com `api-unavailable.json`, nunca o `index.html` em silêncio. O site público `salu-ao.netlify.app` está neste estado até a API ser publicada — ver `docs/DEPLOY.md`.

## Verificar

```bash
npm run build      # tsc --noEmit + vite build
npm test           # 20 testes: fluxo real, segurança, geo, render e erros
npm audit          # 0 vulnerabilidades conhecidas
```

Resultados medidos nesta sessão (2026-11-21):

- `npm run build`: passa. Chunk inicial `304.97 kB` / `92.67 kB` gzip; 35 chunks.
- `npm test`: 4 ficheiros, **20 testes passam**.
- `npm audit`: **0 vulnerabilidades**.
- Fluxo HTTP real com duas contas (Ana cliente, Bruno prestador, Carlos estranho): registo, onboarding, perfil publicado, pedido com foto, proposta, conversa com anexo privado, acordo bilateral, conclusão com prova, confirmação, avaliação recíproca, bloqueio de acessos cruzados e persistência após reinício do servidor — **tudo observado**.

## Estrutura

```
server/            API Express, SQLite, sessões, ficheiros, serializers
shared/            tipos canónicos, categorias, geografia 2024, estados
src/app/           AuthProvider, ThemeProvider, ToastProvider, ErrorBoundary, useApiData
src/components/    Layouts, Cards, FileUpload, LocationPicker, ReportButton, Base
src/i18n/          dicionários pt/en com chaves e formatação pt-AO
src/lib/           cliente HTTP tipado e mensagens de erro
src/pages/         landing, autenticação, onboarding, painel, pedidos, acordos, chat, definições
tests/             integração real, geo, render
docs/              auditoria, arquitectura, deploy, modelo de dados, ciclos
```

## O que ainda não existe

- Deploy de produção verificado (o código de deploy está pronto; não foi executado neste ambiente).
- Recuperação automática de palavra-passe (a interface diz isso de forma explícita; não há botão falso).
- Confirmação de contacto por e-mail/SMS (N1).
- Pagamentos, escrow, carteira ou integração Multicaixa — **deliberadamente ausentes**.
- Aplicação móvel nativa.
- Teste automatizado com browser real (não há Chromium neste ambiente); a interface é verificada por render SSR e o fluxo por HTTP real com dois cookies independentes.

Ver `PROJECT_STATE.md`, `KNOWN_ISSUES.md`, `TESTING.md`, `CHECKPOINT.md`.
