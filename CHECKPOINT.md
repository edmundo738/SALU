# CHECKPOINT

## Abertura directa da conta — trabalho actual

A página inicial aguarda a confirmação da sessão: conta configurada abre `/inicio`, conta incompleta continua para `/bem-vindo`, e sem sessão vê a página pública com «Entrar». Se não for possível confirmar a sessão, oferece tentativa novamente. Links directos não são alterados. Alteração local por publicar; API do alwaysdata continua por verificar.

## Percursos de conta, perfil e pedidos

Foi acrescentada a página do próprio perfil, separados os atalhos de cliente e prestador, feitas correcções no logo, na página de boas-vindas, na apresentação de fotos e nos formulários. Ver `docs/CONSULTORIA_PERCURSOS.md`. Pré-visualização usa uma base de teste isolada. `npm test` passou 41 testes; build e formatação passaram. Falta inspecção em browser real e publicação coordenada do servidor.

## Trabalho em curso: correcções após consultoria

Branch `arena/4d8373c8-salu`. As alterações desta branch foram testadas localmente, mas não se deve assumir que estão publicadas ou que o alwaysdata está actualizado. Testes finais, revisão visual, domínio autorizado, publicação separada da API e teste de produção são necessários. Backup/restauro, recuperação de palavra-passe e suporte efectivo continuam por resolver. O aviso de actualização destina-se a apps instaladas que já tenham carregado a versão com esse aviso; não pode aparecer magicamente numa versão antiga que nunca foi recarregada.


## PROJECT_STATE

Branch `arena/bfd0471f-salu`, base `aa7b621`; API de produção em `edmundo.alwaysdata.net`, frontend em `salu-ao.netlify.app` com deploy automático a partir de `main`. Um único sistema React Router + Express/SQLite. Auditoria executada; 23/24 P0 corrigidos; `P0-12` parcial por falta de deploy real.

## LAST_CHECKPOINT

2026-11-21, após:

- reescrita integral do cliente e do servidor;
- remoção da aplicação morta, bots, escrow, OAuth mock e DB no Git;
- 20 testes verdes (integração real, geo, render e erros);
- build com code splitting (92 kB gzip inicial);
- `npm audit` sem vulnerabilidades;
- documentação de estado criada.

## CURRENT_TASK

Fotografias: **fechado**. Causa raiz encontrada (ordem das regras de redirect no Netlify + avatar do prestador) e confirmada em produção pelo utilizador em 2026-11-22, após deploy de `4b01e1e`.

## ANTERIOR

Imagens entre domínios corrigidas por proxy `/media` no Netlify + `FileImage`; à espera de deploy automático de `main`. A API do alwaysdata continua a correr código anterior: `git pull` + restart recomendado (deixa de ser obrigatório para as fotos aparecerem).

## ANTERIOR

Página inicial cinematográfica em curso de revisão visual (preview local em `node /tmp/preview-server.mjs` sobre `dist`). Pendente: `git pull` + restart no alwaysdata para a política `cross-origin` das fotos entrar, e confirmação do utilizador sobre a cena.

## ANTERIOR

Fechar a documentação e o checkpoint; preparar o deploy real (fora deste ambiente).

## ACTIVE_ALGORITHM

Auditoria → organização funcional → implementação por fluxos → teste real ponta a ponta → relatório honesto.
Cada transição de acordo é decidida no servidor. Identidade vem da sessão. Nenhum dado inventado. `NOT TESTED ≠ PASS`.

## LATEST_EVIDENCE

- `npm test`: 20/20.
- `npm run build`: OK; `304.97 kB` / `92.67 kB` gzip.
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

## Actualização mais recente — percursos por modo

- Alterações locais não publicadas: cliente gere pedidos; prestador procura oportunidades e acompanha propostas, conversas e acordos. Mudar de modo permanece voluntário.
- Os novos filtros paginados requerem publicação separada da API; frontend e API ainda não foram actualizados em produção. Browser real, telemóvel e produção continuam por verificar.
