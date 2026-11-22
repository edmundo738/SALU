# PROJECT_STATE — SALU

> **Estado mais recente — trabalho em curso na branch `arena/4d8373c8-salu`:** a API de produção existe, mas a versão e o restauro das cópias do alwaysdata não foram verificados. O site e a API são publicados separadamente. As secções antigas abaixo são registos históricos e podem estar desactualizadas; em particular não é correcto considerar opcional actualizar a API quando a correcção precisa do servidor.

## Percursos de utilizador — trabalho na mesma branch

- Logótipo respeita sessão/configuração inicial; perfil próprio em `/meu-perfil`, acesso a ver e editar perfil profissional no modo prestador; publicação de pedidos no modo cliente.
- Cartões de pedidos mostram fotografia junto da descrição; resumo de publicação mostra imagens e aguarda conclusão de uploads. O editor conserva campos em edição ao alterar foto, e o cartão próprio usa a foto da sessão.
- Consulta detalhada e limitações: `docs/CONSULTORIA_PERCURSOS.md`. API de produção para visitantes, política de acesso às oportunidades, backup, recuperação de conta e testes em browser/dispositivos continuam por verificar. Nada publicado nesta branch até confirmação.

## Correcções na branch actual (ainda não comprovadas em produção)

- Origem exacta para pedidos com credenciais em produção; testes locais com site correcto e origens de terceiros. Configurar quaisquer outros domínios legítimos por `APP_ORIGIN`, sem usar credenciais no repositório.
- Revogação na API de ficheiros públicos de contas eliminadas, dados do perfil profissional minimizados e aviso de retenção mais preciso. Não é eliminação completa: mensagens e outros registos permanecem; caches anteriores, cópias e prazos continuam por rever.
- Foto própria do prestador usa o avatar da sessão caso a API antiga não o devolva; a resposta para outras pessoas continua dependente da API actualizada no alwaysdata. Corrigida a terceira tentativa de `FileImage`.
- Pesquisa e listas com páginas na API e na interface; texto do perfil distingue publicar um pedido de uma conversa directa.
- Sessão não é considerada terminada após erro de comunicação; aviso de actualização opcional no site instalado, após a versão com esta funcionalidade ter sido aberta.
- Continuidade de operação, recuperação de palavra-passe, testes em browsers reais e publicação/versão do alwaysdata continuam por verificar ou implementar. Não declarar segurança ou privacidade de produção corrigidas antes da actualização e testes.


Última actualização: **2026-11-21**
Branch: `arena/bfd0471f-salu`
Base: `aa7b621` (`main`)
Último trabalho: página inicial cinematográfica + correcção de exibição de fotos
Autor: Arena Agent (execução da auditoria)

## 1. Estado em uma frase

A antiga aplicação de demonstração foi substituída por **um único sistema** com sessões reais, API persistente, fluxo bilateral completo, ficheiros reais, geografia de 2024 e 20 testes verdes; **o deploy completo de produção não foi concluído: o frontend está no Netlify, a API persistente ainda não**.

## 2. O que está implementado e verificado

| Área                                                     | Estado                          | Evidência                                                       |
| -------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| Sessões (cookie HttpOnly, hash, validade 7 dias, logout) | FEITO / OBSERVADO               | `server/auth.ts`; teste de logout → `/auth/me` 401              |
| Registo/login com normalização de telefone angolano      | FEITO / OBSERVADO               | `923000111` → `+244923000111`                                   |
| Onboarding com localização validada no servidor          | FEITO / OBSERVADO               | `AO-LUA-CAMAMA-CAMAMA`; teste de localização inválida 400       |
| Perfil de prestador com publicação/despublicação         | FEITO / OBSERVADO               | `PUT /me/provider`, `POST /me/provider/publish`                 |
| Pedido com fotos reais                                   | FEITO / OBSERVADO               | `POST /requests` com `photoIds`; fotos no serializer            |
| Proposta + conversa automática                           | FEITO / OBSERVADO               | `conversationId` na proposta                                    |
| Acordo bilateral                                         | FEITO / OBSERVADO               | `PENDING_PROVIDER` → `ACTIVE`; segundo aceite do mesmo lado 409 |
| Chat com anexo privado                                   | FEITO / OBSERVADO               | anexo `visibility: private`; terceiro recebe 404                |
| Conclusão com prova                                      | FEITO / OBSERVADO               | `WORK_SUBMITTED`; confirmar lado errado 403                     |
| Confirmação bilateral e conclusão                        | FEITO / OBSERVADO               | `COMPLETED`                                                     |
| Avaliações recíprocas, 3 critérios, sem duplicados       | FEITO / OBSERVADO               | média 4.7 com uma avaliação real                                |
| Denúncias persistentes, moderação e recurso              | FEITO / OBSERVADO               | `reports`, `report_appeals`; teste com admin                    |
| Exportação e eliminação de conta                         | FEITO / TESTADO (API)           | `/me/export`, `DELETE /me`                                      |
| Uploads validados, comprimidos, privacidade              | FEITO / OBSERVADO               | `sharp`; HTML rejeitado 400; 7 MB rejeitado 413                 |
| Geo 2024 (16 municípios em Luanda; Icolo e Bengo)        | FEITO / TESTADO                 | `tests/geo.test.ts`                                             |
| Tema/idioma persistidos, sem flash                       | FEITO / OBSERVADO no código     | script inline + `/me`                                           |
| Rotas dinâmicas, 404, deep links                         | FEITO / OBSERVADO               | `vite preview`: `/pedidos/req_123` devolve app                  |
| Build, testes, audit                                     | FEITO / MEDIDO                  | ver §5                                                          |
| Deploy Netlify + API externa                             | CONFIGURADO / **NÃO EXECUTADO** | `netlify.toml`, `.env.example`                                  |

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
                  dist/assets/index-*.js  304.97 kB │ gzip: 92.67 kB
                  35 chunks; imagem do logo 16.35 kB

npm test        → 4 ficheiros, 20 testes, 20 pass
                  api.integration.test.ts (5)
                  ui.render.test.tsx (5)
                  geo.test.ts (6)
                  errors.test.ts (4)

npm audit       → found 0 vulnerabilities
```

Integração real observada nesta sessão: duas contas independentes, pedido → proposta → acordo → chat com anexo → prova → confirmação → avaliação; acessos cruzados bloqueados; reinício do servidor preserva os dados.

## 6. O que não está feito

Ver `KNOWN_ISSUES.md`. Resumo: deploy real, recuperação de senha, verificação de contacto (N1), Postgres multi-instância, teste com browser real, painel de administração com UI, exportação de ficheiros binários, purga automática de ficheiros, moderação de avaliações (denúncia existe, remoção não).

## 7. Próxima acção

1. Publicar a API num host persistente; para 0 € e sem cartão, seguir `docs/DEPLOY_GRATIS.md`.
2. Executar o runbook de `docs/DEPLOY.md` e repetir o teste de duas contas em produção.
3. Só depois declarar P0-12 corrigido.

## 8. Actualização 2026-11-21 (deploy 0 € e cena da página inicial)

Executado e observado:

- API em produção num host gratuito: `https://edmundo.alwaysdata.net/api/health` → `{"status":"ok","storage":"sqlite"}` (OBSERVED).
- Frontend no Netlify (`salu-ao.netlify.app`) ligado ao repositório GitHub; cada push para `main` publica automaticamente (OBSERVED no painel de deploys).
- `VITE_API_URL` definida no Netlify; build de produção gerou `dist/assets/index-*.js` com o endereço da API embutido (MEASURED).
- Fotografias deixaram de ficar invisíveis: `img-src` do Netlify passou a permitir `https:` e a rota `GET /files/:id` responde `Cross-Origin-Resource-Policy: cross-origin` (FACT no código; falta tocar no servidor do alwaysdata para que a segunda parte entre).

Página inicial (nova cena):

- `src/pages/Landing.tsx` + `src/components/landing/{Hero,Story,motion}.ts` + `src/styles/landing.css`.
- Hero em camadas com parallax de scroll e de ponteiro; secção pinada de três actos (320vh, sticky, cai para lista no telemóvel); faixa tipográfica; cartões com holofote; CTA final.
- Sem bibliotecas novas: 0 dependências adicionadas; peso do bundle inicial +7,2 kB (312,16 kB, 95,02 kB gzip) e CSS +14 kB (61,79 kB, 12,07 kB gzip) (MEASURED).
- `npm test` 20/20, `tsc --noEmit` limpo, `npm run build` verde (MEASURED).

## 9. Actualização 2026-11-22 (imagens entre domínios)

Corrigido o defeito observado em produção: upload devolvia "Fotografia actualizada" mas a imagem não aparecia (avatar com iniciais, portfólio quebrado).

- Causa: `<img>` apontava para `https://edmundo.alwaysdata.net/api/files/<id>` a partir da página do Netlify. Duas barreiras — `Content-Security-Policy` do site e `Cross-Origin-Resource-Policy` da API.
- Solução sem depender do servidor: `/media/*` reescrito para a API no `netlify.toml` (mesmo domínio na página) e `FileImage` para todos os ficheiros; privados por `fetch` com sessão e object URL.
- Verificado localmente com a API real: upload → `GET /media/<id>` → `200 image/webp` (MEASURED, proxy equivalente ao do Netlify).
- `npm test` 20/20, `tsc` limpo, build verde (MEASURED).

## 10. Actualização 2026-11-22 (diagnóstico das fotos concluído)

Observado em produção, não inferido:

- `GET /media/teste` no site publicado devolvia a aplicação (404 do router), prova de que a regra de proxy não estava a ser aplicada: o Netlify lê `_redirects` antes do `netlify.toml` e o `/*  /index.html 200` do fim ganhava.
- `GET /api/providers` em produção devolvia `"avatar": null` depois de o utilizador carregar a fotografia: `providerProfileFor` lia a coluna errada (`provider_profiles.avatar_file_id`, que nunca é escrita).

Correcções: regra `/media/*` movida para o topo de `public/_redirects` com `200!`; avatar do prestador lido de `users`; `FileImage` com três vias (`/media` → bytes autenticados → URL directo). Teste de regressão acrescentado à integração.

**Confirmado em produção (2026-11-22, OBSERVED):** o utilizador confirmou que a fotografia passa a aparecer no site depois do deploy de `main` (`4b01e1e`). Esta observação não comprova o funcionamento do perfil público para outras contas; a versão do servidor e a necessidade de actualização continuam por verificar.

## Percursos separados (alterações locais, não publicadas)

- O modo cliente foca-se em publicar e acompanhar pedidos; o modo prestador em oportunidades, propostas, conversas e acordos. A selecção de modo continua manual e os dados são preservados.
- Listagens `scope=customer` e `scope=proposed` na API permitem paginação separada; o cliente anterior continua suportado. A UI filtra respostas antigas, mas paginação correcta exige actualizar o servidor.
- Proposta disponível na lista e no detalhe, com ligação à conversa após resposta bem-sucedida. O pedido próprio é excluído das oportunidades.
- Testes de interface simulada e integração HTTP local cobrem os dois modos; não substituem testes visuais nem de produção.
