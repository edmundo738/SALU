# DECISIONS — decisões arquitecturais

## D-01 — Um único sistema; remover a segunda aplicação

**Contexto:** existiam duas aplicações: `src/App.tsx` (live, 1.151 linhas, estado em memória) e `src/pages` + `src/domain` + `src/state` (37 ficheiros, mais completa, nunca renderizada). Os 101 testes cobriam apenas a segunda.

**Decisão:** manter um só produto; remover o `AppShell`/`CustomerViews`/`ProviderViews`/`WorkflowViews`/`EcosystemViews` e a segunda aplicação. O histórico Git preserva tudo (base `602538e`).

**Consequência:** menos 21.301 linhas de código concorrente; uma única fonte de verdade.

## D-02 — Sessão em cookie HttpOnly, não identidade no browser

**Contexto:** o sistema antigo confiava em `currentUserId` do cliente e não tinha sessões; qualquer visitante via tudo.

**Decisão:** token aleatório de 32 bytes, guardado apenas como SHA-256, cookie `HttpOnly; SameSite=Lax; Path=/`, 7 dias. `requireAuth` resolve sempre do servidor.

**Consequência:** logout e expiração reais; CSRF mitigado; nenhuma rota aceita IDs de identidade do cliente.

## D-03 — SQLite com volume, não serverless

**Contexto:** Netlify é estático/serverless; SQLite no filesystem serverless perde dados.

**Decisão:** API Express separada, com `SALU_DATA_DIR` num volume persistente; Netlify serve apenas o frontend e aponta `VITE_API_URL` para a API.

**Consequência:** o frontend continua estático e barato; a API precisa de um host persistente. Postgres fica como evolução, não como promessa.

## D-04 — Acordo bilateral, sem escrow

**Contexto:** o sistema antigo criava acordo unilateralmente e tinha `/release-escrow` fictício.

**Decisão:** o cliente aceita a proposta; o prestador confirma o seu lado; cada parte confirma a sua conclusão. O SALU registra o acordo e **não** processa pagamentos.

**Consequência:** não há linguagem de custódia, carteira ou transferência; a frase de pagamento é explícita na UI.

## D-05 — Reputação só depois de conclusão bilateral

**Contexto:** avaliações antes da conclusão, autoavaliação e alvo fallback “Mateus”.

**Decisão:** só participantes reais, só em `COMPLETED`, uma avaliação por autor/alvo/pedido, três critérios, média calculada de avaliações reais. Nenhum selo de verificação automático.

**Consequência:** perfil novo mostra `—`/sem avaliações, não 5.0.

## D-06 — Uma geografia de 2024, versionada

**Contexto:** cinco listas divergentes; Camama ausente; Icolo e Bengo tratado como Luanda.

**Decisão:** `shared/geo.ts` é a única fonte; IDs `AO-PROVÍNCIA-MUNICÍPIO-COMUNA`; validação no servidor; nunca inferir município de coordenadas.

**Consequência:** Luanda com 16 municípios; Icolo e Bengo com 7; Maianga ≠ Ingombota; Kilamba ≠ Kilamba Kiaxi.

## D-07 — Uploads com validação de assinatura e compressão

**Decisão:** multer em memória (6 MB), detecção por bytes, `sharp` para imagens (WebP, máx. 1600 px; avatar 512 px), visibilidade por finalidade, acesso privado verificado por participação.

## D-08 — Tradução por chaves; PT-AO primeiro

**Decisão:** `src/i18n/index.tsx` com dicionários `pt`/`en`, interpolação, formatação `pt-AO`, persistência em `salu_locale` e no servidor. Datas ISO em armazenamento; apresentação local.

## D-09 — Remover dependências não usadas

**Decisão:** remover `@supabase/supabase-js`, `zustand`, `motion`; remover `supabase/`, `server/bots.ts`, `vercel.json` e imagens sem referências. Adicionar `sharp` (compressão real) e actualizar `react-router-dom`/`vitest` para versões sem CVEs conhecidas.

## D-10 — Segurança de produção no código de deploy

**Decisão:** `netlify.toml` com CSP, HSTS via host, `X-Frame-Options`, `/api/*` → 503 JSON quando não configurado, assets inexistentes → 404, fallback SPA apenas para rotas de UI.

**Limite:** não foi executado um deploy real; ver `P0-12`.
