# PROJECT_STATE — SALU

Última actualização: **2026-11-21**
Branch: `arena/06f5de50-salu`
Base: `602538e` (`versão de 11/21/2026 6:48`)
Commit de implementação: `9c9220a`
Autor: Arena Agent (execução da auditoria)

## 1. Estado em uma frase

A antiga aplicação de demonstração foi substituída por **um único sistema** com sessões reais, API persistente, fluxo bilateral completo, ficheiros reais, geografia de 2024 e 16 testes verdes; **o deploy de produção não foi executado neste ambiente**.

## 2. O que está implementado e verificado

| Área | Estado | Evidência |
|---|---|---|
| Sessões (cookie HttpOnly, hash, validade 7 dias, logout) | FEITO / OBSERVADO | `server/auth.ts`; teste de logout → `/auth/me` 401 |
| Registo/login com normalização de telefone angolano | FEITO / OBSERVADO | `923000111` → `+244923000111` |
| Onboarding com localização validada no servidor | FEITO / OBSERVADO | `AO-LUA-CAMAMA-CAMAMA`; teste de localização inválida 400 |
| Perfil de prestador com publicação/despublicação | FEITO / OBSERVADO | `PUT /me/provider`, `POST /me/provider/publish` |
| Pedido com fotos reais | FEITO / OBSERVADO | `POST /requests` com `photoIds`; fotos no serializer |
| Proposta + conversa automática | FEITO / OBSERVADO | `conversationId` na proposta |
| Acordo bilateral | FEITO / OBSERVADO | `PENDING_PROVIDER` → `ACTIVE`; segundo aceite do mesmo lado 409 |
| Chat com anexo privado | FEITO / OBSERVADO | anexo `visibility: private`; terceiro recebe 404 |
| Conclusão com prova | FEITO / OBSERVADO | `WORK_SUBMITTED`; confirmar lado errado 403 |
| Confirmação bilateral e conclusão | FEITO / OBSERVADO | `COMPLETED` |
| Avaliações recíprocas, 3 critérios, sem duplicados | FEITO / OBSERVADO | média 4.7 com uma avaliação real |
| Denúncias persistentes, moderação e recurso | FEITO / OBSERVADO | `reports`, `report_appeals`; teste com admin |
| Exportação e eliminação de conta | FEITO / TESTADO (API) | `/me/export`, `DELETE /me` |
| Uploads validados, comprimidos, privacidade | FEITO / OBSERVADO | `sharp`; HTML rejeitado 400; 7 MB rejeitado 413 |
| Geo 2024 (16 municípios em Luanda; Icolo e Bengo) | FEITO / TESTADO | `tests/geo.test.ts` |
| Tema/idioma persistidos, sem flash | FEITO / OBSERVADO no código | script inline + `/me` |
| Rotas dinâmicas, 404, deep links | FEITO / OBSERVADO | `vite preview`: `/pedidos/req_123` devolve app |
| Build, testes, audit | FEITO / MEDIDO | ver §5 |
| Deploy Netlify + API externa | CONFIGURADO / **NÃO EXECUTADO** | `netlify.toml`, `.env.example` |

## 3. O que mudou nesta execução

- Removida a aplicação antiga `App.tsx` (1.151 linhas) e 37 ficheiros da segunda aplicação nunca renderizada; removidos 7,6 MB de imagens sem referências.
- Backend reescrito: `server/api.ts` (≈1.300 linhas), `server/app.ts`, `server/index.ts`, `server/{auth,db,files,serializers}.ts`.
- Modelos e geo em `shared/`; 21 províncias, Luanda com 16 municípios, Icolo e Bengo com 7.
- Interface reescrita em 16 páginas + 7 componentes/utilitários; `App.tsx` passou a ser apenas rotas.
- `react-router-dom` 7.18.6, `sharp` 0.35.5, `vitest` 5.1.1; `npm audit` 0.
- Bots, escrow, OAuth mock, senha `salu1234`, DB no Git e Supabase não utilizados foram removidos.
- Documentação: este ficheiro, `README.md`, `ARCHITECTURE.md`, `AGENTS.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `TESTING.md`, `ROADMAP.md`, `CHANGELOG.md`, `CHECKPOINT.md` e `docs/DEPLOY.md`.

## 4. Achados P0

- 23 de 24 P0 da auditoria: **Corrigido**.
- `P0-12` (produção/Netlify): **Parcial** — imagens e deep links resolvidos no código, `/api/*` deixou de cair no `index.html`; falta deploy real e teste em produção.
- Nenhum P0 é declarado corrigido sem evidência; ver `docs/AUDITORIA_BACKLOG.csv`.

## 5. Verificação desta sessão

```
npm run build   → OK
                  dist/assets/index-*.js  304.48 kB │ gzip: 92.53 kB
                  35 chunks; imagem do logo 16.35 kB

npm test        → 3 ficheiros, 16 testes, 16 pass
                  api.integration.test.ts (5)
                  ui.render.test.tsx (5)
                  geo.test.ts (6)

npm audit       → found 0 vulnerabilities
```

Integração real observada nesta sessão: duas contas independentes, pedido → proposta → acordo → chat com anexo → prova → confirmação → avaliação; acessos cruzados bloqueados; reinício do servidor preserva os dados.

## 6. O que não está feito

Ver `KNOWN_ISSUES.md`. Resumo: deploy real, recuperação de senha, verificação de contacto (N1), Postgres multi-instância, teste com browser real, painel de administração com UI, exportação de ficheiros binários, purga automática de ficheiros, moderação de avaliações (denúncia existe, remoção não).

## 7. Próxima acção

1. Fazer deploy do frontend no Netlify com `VITE_API_URL` e da API num host persistente com volume.
2. Executar o runbook de `docs/DEPLOY.md` e repetir o teste de duas contas em produção.
3. Só depois declarar P0-12 corrigido.
