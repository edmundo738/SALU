# ROADMAP

## Fase 1 — Protecção (concluída no código)

- [x] Sessões reais, logout, expiração.
- [x] Autorização por recurso em pedidos, propostas, acordos, conversas, ficheiros e avaliações.
- [x] Rate limit, CORS allowlist, limites de payload, validação.
- [x] Remoção de OAuth mock, bots, escrow, senha partilhada, DB no Git.
- [x] Cabeçalhos de segurança.

## Fase 2 — Fundação (concluída no código)

- [x] Modelos canónicos e uma máquina de estados.
- [x] SQLite persistente com migração idempotente.
- [x] Geografia 2024 única.
- [x] Cliente HTTP tipado, i18n, tema, toasts, ErrorBoundary.
- [x] Rotas reais com code splitting.

## Fase 3 — Produto (concluída no código; teste real em curso)

- [x] Registo, onboarding, definições, perfil.
- [x] Pedido com fotos, descoberta, propostas.
- [x] Acordo bilateral, chat, prova de conclusão, avaliações.
- [x] Notificações, denúncias, moderação e recurso.
- [x] Exportação/eliminação de conta.

## Fase 4 — Experiência (concluída no código)

- [x] Loading/erro/vazio/retry.
- [x] PT/EN por chaves, datas `pt-AO`.
- [x] Acessibilidade base: skip link, foco, modais, 44 px, reduced motion.
- [x] Landing de 5 blocos sem números inventados.
- [x] SEO/social meta, robots, sitemap, manifest, 404.

## Fase 5 — Produção (por executar)

- [ ] API num host persistente com volume e HTTPS.
- [ ] Netlify com `VITE_API_URL` e domínio final.
- [ ] Testar `/api/health`, deep links, 404 de assets e headers.
- [ ] Repetir o ciclo de duas contas em produção.
- [ ] Backups do volume e política de retenção.

## Fase 6 — Evolução

- [ ] Postgres gerido e migração dos dados.
- [ ] Recuperação de senha por e-mail.
- [ ] Confirmação de contacto (N1).
- [ ] Painel de moderação com UI.
- [ ] Testes E2E com browser (Playwright) em CI.
- [ ] Purga de ficheiros e exportação binária.
- [ ] Multi-instância e rate limit distribuído.

Regra: nenhuma fase avança com um P0 aberto. `P0-12` só fecha com deploy verificado.
