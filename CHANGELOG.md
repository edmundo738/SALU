# CHANGELOG

## 2026-11-21 — Execução da auditoria

### Adicionado

- API Express 5 + SQLite com sessões, autorização por recurso, uploads validados e compressão.
- Um único cliente React Router com 16 páginas, code splitting e ErrorBoundary.
- i18n PT/EN por chaves, formatação `pt-AO`, tema persistido sem flash.
- Ciclo completo: pedido → proposta → acordo bilateral → chat → prova → confirmação → avaliação.
- Denúncias, moderação e recurso; verificação manual; exportação/eliminação.
- Geografia 2024: 16 municípios de Luanda e 7 de Icolo e Bengo.
- Testes de integração real, geo e render (15).
- Docs: `ARCHITECTURE.md`, `AGENTS.md`, `PROJECT_STATE.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `TESTING.md`, `ROADMAP.md`, `CHECKPOINT.md`.
- `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `404.html`, `api-unavailable.json`.

### Alterado

- `react-router-dom` 7.18.6; `sharp` 0.35.5; `vitest` 5.1.1.
- `vite.config.ts` em `0.0.0.0` com proxy `/api`.
- `netlify.toml` e `_redirects` sem engolir `/api` e com segurança.
- Build com chunks por rota; inicial ~92 kB gzip.

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
