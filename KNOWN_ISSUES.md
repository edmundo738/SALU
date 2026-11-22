# KNOWN_ISSUES

> A tabela histórica abaixo pode conter informação ultrapassada (nomeadamente K-01, K-17 e K-15). A API de produção foi observada anteriormente e o CI da `main` passou, mas versão do alwaysdata, backup e restauro continuam por verificar. As alterações da branch actual não foram ainda verificadas em produção. Recuperação de conta, suporte real, cookies entre domínios, testes visuais e procedimentos de eliminação/retenção continuam em aberto.


Legenda: **P0** bloqueia o ciclo real; **P1** importante; **P2** melhoria.

## Aberto

| ID   | Prioridade | Problema                                                  | Impacto                                                                                                             | Evidência                                                     |
| ---- | ---------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| K-01 | P0         | Deploy de produção incompleto; `P0-12` permanece parcial  | Frontend em `salu-ao.netlify.app`, mas sem API persistente; registo falha. Guia gratuito em `docs/DEPLOY_GRATIS.md` | `docs/DEPLOY.md`; `P0-12`                                     |
| K-17 | P0         | `salu-ao.netlify.app` foi publicado sem `VITE_API_URL`    | `POST /api/auth/register` devolve 404/503; nenhuma conta é criada                                                   | `netlify/edge-functions/api-unavailable.ts`; `docs/DEPLOY.md` |
| K-02 | P1         | Recuperação de senha ausente                              | Utilizador que esquece a senha não recupera sozinho; a UI diz isso                                                  | `auth.forgotBody`                                             |
| K-03 | P1         | N1 (contacto confirmado) indisponível                     | Não há e-mail/SMS; badge N1 não aparece                                                                             | `server/api.ts` `/me/verification`; UI `available:false`      |
| K-04 | P1         | SQLite de instância única                                 | Não escala horizontalmente; rate limit em memória por processo                                                      | `server/db.ts`, `server/app.ts`                               |
| K-05 | P1         | Sem teste com browser real                                | Regressões puramente visuais/JS podem passar; teste é SSR + HTTP                                                    | `TESTING.md`                                                  |
| K-06 | P1         | Painel de administração sem UI                            | Moderação faz-se por `X-Admin-Token` na API                                                                         | `server/api.ts` `/admin/*`                                    |
| K-07 | P1         | Exportação não inclui binários                            | JSON tem metadados, não conteúdo de imagens/PDFs                                                                    | `/me/export`                                                  |
| K-08 | P1         | Ficheiros removidos logicamente não são purgados do disco | Crescimento do volume                                                                                               | `server/files.ts`                                             |
| K-09 | P1         | Moderação de avaliações limitada a denúncia               | Não há remoção/ocultação de avaliação na UI                                                                         | `reports`                                                     |
| K-10 | P2         | Sem notificações em tempo real                            | Polling de 5 s na conversa; notificações por lista                                                                  | `src/pages/Messages.tsx`                                      |
| K-11 | P2         | Sem anexos múltiplos por mensagem                         | API aceita `fileIds`, UI usa um                                                                                     | `src/pages/Messages.tsx`                                      |
| K-12 | P2         | Sem PWA offline                                           | Manifest existe; service worker não                                                                                 | `public/manifest.webmanifest`                                 |
| K-13 | P2         | Categorias fixas em código                                | Sem gestão editorial                                                                                                | `shared/categories.ts`                                        |
| K-14 | P2         | CSP permite `https:` em `connect-src`                     | Necessário para API configurável; menos restritivo                                                                  | `netlify.toml`                                                |
| K-15 | P2         | CI criado, execução no GitHub não observada               | O workflow existe, mas não há run verificado neste ambiente                                                         | `.github/workflows/ci.yml`                                    |
| K-16 | P1         | Canal de suporte público não configurado por defeito      | `VITE_SUPPORT_EMAIL` vazio; a UI diz que o canal não está configurado, em vez de inventar um e-mail                 | `src/lib/config.ts`; `docs/DEPLOY.md`                         |

## Corrigido nesta execução (amostra verificável)

- Autenticação real, guardas de rota, logout e expiração.
- Identidade sempre da sessão; acessos cruzados bloqueados.
- Persistência servidor; propostas e mensagens chegam ao outro lado.
- Perfil de prestador publicável e pesquisável.
- Ciclo bilateral com confirmação separada.
- Bots, escrow, OAuth mock e senha partilhada removidos.
- Uploads reais com validação, compressão e privacidade.
- Geo 2024 corrigida (Camama, Icolo e Bengo, Maianga/Ingombota, Kilamba/Kilamba Kiaxi).
- Deep links e rotas dinâmicas; `/api/*` já não devolve HTML.
- Dados falsos (4.9, 5.0, 97/95/96, “Just now”, preços fixos) removidos do cliente.
- `npm audit` sem vulnerabilidades conhecidas.

### Percursos por modo — dependência de publicação

Os filtros paginados de pedidos próprios e propostas dependem da versão actualizada da API. Em servidores anteriores a interface filtra os resultados recebidos, mas podem existir páginas incompletas. A disponibilidade em produção ainda não foi verificada.

As estatísticas de acordos activos do painel somam os dois papéis da conta, mesmo quando está seleccionado apenas um modo. A apresentação por papel requer alterar e testar essas contagens.
