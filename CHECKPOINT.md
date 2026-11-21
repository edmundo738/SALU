# CHECKPOINT

## PROJECT_STATE

Branch `arena/06f5de50-salu`, base `602538e`; commit de implementação `9c9220a`. Um único sistema React Router + Express/SQLite. Auditoria executada; 23/24 P0 corrigidos; `P0-12` parcial por falta de deploy real.

## LAST_CHECKPOINT

2026-11-21, após:

- reescrita integral do cliente e do servidor;
- remoção da aplicação morta, bots, escrow, OAuth mock e DB no Git;
- 15 testes verdes (integração real, geo, render);
- build com code splitting (92 kB gzip inicial);
- `npm audit` sem vulnerabilidades;
- documentação de estado criada.

## CURRENT_TASK

Fechar a documentação e o checkpoint; preparar o deploy real (fora deste ambiente).

## ACTIVE_ALGORITHM

Auditoria → organização funcional → implementação por fluxos → teste real ponta a ponta → relatório honesto.
Cada transição de acordo é decidida no servidor. Identidade vem da sessão. Nenhum dado inventado. `NOT TESTED ≠ PASS`.

## LATEST_EVIDENCE

- `npm test`: 15/15.
- `npm run build`: OK; `303.41 kB` / `92.16 kB` gzip.
- `npm audit`: 0.
- Fluxo HTTP com Ana (cliente), Bruno (prestador) e Carlos (terceiro): todos os passos essenciais observados; acessos cruzados 403/404/409 conforme o caso.
- Reinício do servidor: pedido concluído continua presente.
- `vite preview`: `/pedidos/req_123`, `/prestadores/usr_1`, `/acordos/agr_1` devolvem a app com `#root`.

## FAILED_EXPERIMENTS

- Testar com Chromium/Playwright: não há browser no ambiente; não foi possível.
- Usar `renderToString` com rotas `React.lazy`: Suspense não é suportado; substituído por `renderToPipeableStream`.
- PNG 1×1 de teste antigo: rejeitado pelo `sharp` 0.35; substituído por PNG válido 4×4.
- `python3 -m http.server` não serve fallback SPA; usado `vite preview`.

## CONSTRAINTS

- Node 22 (`node:sqlite` experimental).
- SQLite não serve serverless efémero; produção requer host com volume ou Postgres gerido.
- Sem PostgreSQL, Redis, e-mail/SMS ou browser real neste ambiente.
- Sem deploy de produção executado.
- Não inventar dados, percentagens, avaliações ou integrações.

## NEXT ACTION

1. Publicar API num host persistente (volume) e frontend no Netlify com `VITE_API_URL`.
2. Testar em produção o runbook de duas contas.
3. Actualizar `P0-12` para corrigido apenas com evidência de produção.
