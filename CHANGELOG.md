# CHANGELOG

## 2026-11-22 — Segunda causa das fotos: ordem das regras e avatar do prestador

### Corrigido

- A regra `/media/*` estava só no `netlify.toml`, mas o Netlify processa `_redirects` **antes** do ficheiro de configuração: o `/*` do fim devolvia a aplicação e a imagem nunca era pedida à API. A regra passou para o topo de `public/_redirects` com `200!`.
- `providerProfileFor` lia `provider_profiles.avatar_file_id`, que nunca é preenchido (o avatar vive em `users`). Resultado: perfil público sempre sem fotografia, mesmo depois do upload. Passa a usar o avatar do utilizador.
- `FileImage` ganhou uma terceira via: se o proxy falhar, lê os bytes com a sessão (`fetch` CORS) e mostra a partir de memória. Só desiste depois de esgotar as três.

### Verificado

- Teste de regressão novo na integração: `POST /me/avatar` → 200 com `visibility: public`; `GET /providers/:id` devolve o mesmo `avatar.id`; `GET /files/:id` responde 200 sem sessão.
- `npm test` 20/20, build verde (313,10 kB / 95,43 kB gzip).

## 2026-11-22 — Fotografias servidas pelo próprio site

### Corrigido

- As fotografias (avatar, portfólio, fotos de pedido, anexos) apareciam quebradas depois de o upload dizer "feito". A causa era a leitura entre domínios: a imagem vinha de `edmundo.alwaysdata.net` dentro da página de `salu-ao.netlify.app`.
- Ficheiros públicos passam a ser servidos em `/media/*` pelo próprio domínio, com reescrita no Netlify para a API (`status = 200`, não redirect).
- Ficheiros privados (anexos, provas) são lidos com a sessão e mostrados a partir de memória, sem depender de permissões entre domínios.

### Adicionado

- `src/components/FileImage.tsx`: componente único para todas as imagens de ficheiros, com alternativa para o URL directo e desistência explícita (avatar cai para as iniciais).
- `api.fileUrlDirect()` e `api.fetchFileObjectUrl()`.
- Proxy `/media` no `vite.config.ts` para o desenvolvimento local.
- Secção reescrita em `docs/VINCULAR_SITE_API.md` com o diagnóstico e a confirmação.

### Alterado

- `api.fileUrl()` devolve caminho do próprio site para ficheiros públicos.
- Sete pontos de renderização de imagens deixaram de montar URLs à mão.

## 2026-11-21 — Cena cinematográfica da página inicial

### Adicionado

- Página inicial reconstruída como uma cena: hero escuro em camadas (aurora, grelha em perspectiva, feixes de luz, grão, horizonte), tipografia revelada palavra a palavra e carril do processo.
- Motion próprio sem dependências (`src/components/landing/motion.ts`): câmara do hero (`--s`, `--mx`, `--my`), secção pinada de três actos (`--p`), revelação por `IntersectionObserver` e holofote de ponteiro nos cartões.
- Faixa tipográfica em contorno e CTA final com a mesma linguagem visual.
- Cabeçalho em modo `overlay` em `PublicLayout`: transparente sobre a cena, sólido ao rolar; `SaluLogo` com `tone="light"`.
- Chaves novas em PT e EN: `landing.kicker`, `landing.story.*`, `landing.caps.*`, `landing.honesty.kicker`, `landing.marquee`, `landing.audience.kicker`.

### Alterado

- Movimento só com `transform`/`opacity`, um `requestAnimationFrame` por frame e tudo desligado em `prefers-reduced-motion`.
- No telemóvel a secção pinada cai para lista normal; feixes de luz desactivados.
- Cores ancoradas na identidade: `#081C41`, `#060E20`, `#1D6FE5`, `#F97316`.

## 2026-11-21 — Execução da auditoria

### Adicionado

- API Express 5 + SQLite com sessões, autorização por recurso, uploads validados e compressão.
- Um único cliente React Router com 16 páginas, code splitting e ErrorBoundary.
- i18n PT/EN por chaves, formatação `pt-AO`, tema persistido sem flash.
- Ciclo completo: pedido → proposta → acordo bilateral → chat → prova → confirmação → avaliação.
- Denúncias, moderação e recurso; verificação manual; exportação/eliminação.
- Geografia 2024: 16 municípios de Luanda e 7 de Icolo e Bengo.
- Testes de integração real, geo e render e erros (20).
- Docs: `ARCHITECTURE.md`, `AGENTS.md`, `PROJECT_STATE.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `TESTING.md`, `ROADMAP.md`, `CHECKPOINT.md`.
- `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `404.html`, `api-unavailable.json`.

### Alterado

- `react-router-dom` 7.18.6; `sharp` 0.35.5; `vitest` 5.1.1.
- `vite.config.ts` em `0.0.0.0` com proxy `/api`.
- `netlify.toml` e `_redirects` sem engolir `/api` e com segurança.
- Build com chunks por rota; inicial ~92,5 kB gzip.

### Removido

- `src/App.tsx` antigo (1.151 linhas) e 37 ficheiros da segunda aplicação.
- `server/bots.ts`, `supabase/`, `vercel.json`, `@supabase/supabase-js`, `zustand`, `motion`.
- 7,6 MB de imagens sem referências.
- OAuth Google/Apple mock, escrow fictício, senha `salu1234`, DB no Git.
- Dados fabricados no cliente (4.9/4.8/5.0/97/95/96, “Just now”, preços fixos, nomes fictícios).

### Corrigido

- Nenhuma identidade vinda do browser.
- Nenhuma conversa/ficheiro privado acessível a terceiros.
- Nenhum acordo unilateral; confirmações separadas.
- Nenhum selo/avaliação sem serviço concluído.
- Nenhuma promessa de pagamento ou verificação automática.
- `npm audit`: 0 vulnerabilidades.

### Não feito

- Deploy real e teste em produção (`P0-12` parcial).
- Recuperação de senha, N1, Postgres, browser E2E, UI de administração.
