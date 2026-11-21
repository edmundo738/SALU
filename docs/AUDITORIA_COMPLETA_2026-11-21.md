# SALU — Super auditoria geral

**Commit auditado:** `602538e` («versão de 11/21/2026 6:48»), branch `arena/06f5de50-salu`
**Data:** 21 de novembro de 2026
**Âmbito:** produto, arquitetura, UX, identidade, dados, localização, idiomas, segurança, reputação, anexos, pagamentos, deploy (Netlify) e conformidade com a diretiva do dono.
**Natureza:** Etapa 1 — auditoria. **Nenhum código de produto foi alterado.** Este relatório e o backlog em CSV são os únicos ficheiros criados.

> **ESTADO DA EXECUÇÃO (2026-11-21, mesma sessão):** este documento é o diagnóstico histórico do commit `602538e`. A execução que se seguiu substituiu o produto por um único sistema e fechou 23 dos 24 P0; `P0-12` (produção) está **Parcial** porque o deploy real não foi executado. Evidência actual: `PROJECT_STATE.md`, `CHECKPOINT.md`, `TESTING.md` e `docs/AUDITORIA_BACKLOG.csv`. O texto abaixo descreve o estado **antes** da execução e não deve ser lido como estado actual.

---

## 0. Veredicto em dez linhas

1. **O SALU atual não é um produto: são três gerações de produto sobrepostas no mesmo repositório.** A aplicação que o visitante vê (`src/App.tsx`) não usa a arquitetura nova (`src/pages`, `src/domain`, `src/data/repositorio*`, `src/state/store`), que é precisamente a única parte com regras e testes.
2. **A identidade não existe.** Não há sessão autenticada, token, conta real nem verificação. O nome inicial é `Edmundo Bunga`; o registo de cliente usado é o da `Helena Vandúnem`; o `currentUserId` é `cust-1`; e o perfil combina o nome digitado com as estatísticas, selo «verificado» e avaliações da Helena.
3. **A maioria do que o utilizador escreve desaparece ou nunca chega a outro utilizador.** Pedidos, propostas, mensagens, acordos, avaliações e perfil profissional vivem em memória no browser. Só o `POST /api/requests` chega a uma base de dados — e essa base não existe no Netlify.
4. **No Netlify, `/api/*` é reescrito para `index.html`.** O cliente recebe HTML, falha a chamada e cai no «modo local» silencioso: o registo parece funcionar, mas não cria conta; a mensagem parece enviada, mas não sai; ao recarregar, o pedido desaparece.
5. **As imagens não são publicadas.** Há 22 referências a `/src/assets/images/...` que o Vite não copia para `dist/`. Todos os retratos e imagens de portefólio dão 404 em produção; os componentes escondem a falha com um avatar genérico ou um gradiente.
6. **O produto afirma coisas que não tem:** «4.9/5», «4.8/5», «100%», «10 Estados», «verificado em cada serviço», «Acordo assinado», «Pagamento seguro retido sob custódia da plataforma», «transferido com sucesso». Nenhuma destas afirmações é sustentada por dados ou integrações reais.
7. **A Sala SALU não é uma sala entre duas pessoas.** É um chat de demonstração com conversas pré-carregadas; o botão de anexo inventa um nome de ficheiro (`Foto_Referencia_Ambito.jpg`) sem abrir sequer o seletor de ficheiros. O pedido de serviço também não anexa fotos: cria legendas.
8. **A localização está errada em pelo menos cinco listas diferentes.** Camama é município desde a Lei n.º 14/24, mas falta na lista do domínio, no wizard e no backend; Icolo e Bengo e Quiçama já não pertencem à província de Luanda; «Maianga/Ingombota» são tratados como um só município; «Benguela & Lobito» aparecem juntos.
9. **Os 101 testes verdes dão falsa confiança.** Testam `src/domain` e `src/data/repositorioLocal`, que não são importados pela aplicação ativa. Não há um único teste de `App.tsx`, dos ecrãs ativos, da autenticação, do backend Express ou dos fluxos de duas pessoas.
10. **O problema não é o Netlify nem a falta de animação.** É ausência de uma fonte de verdade única para identidade, dados, estados, localização e linguagem — e ausência de regras de autorização. Sem isso, qualquer melhoria visual volta a produzir o mesmo resultado: um site bonito que mente.

> **Frase para o dono:** o SALU não está «quase pronto». Está visualmente avançado e funcionalmente no ponto em que qualquer pessoa entra, vê dados de outra pessoa, faz ações que não se propagam e recebe promessas que o sistema não cumpre. É preferível uma demo menor e honesta do que uma demo maior e falsa.

---

## 1. Como esta auditoria foi feita

### 1.1 Método

| Passo | O que foi feito | Evidência |
|---|---|---|
| 1 | Leitura do repositório, rotas, componentes ativos, dados, domínio, backend e migrações | `FACT` |
| 2 | Mapa de dependências para separar código alcançável de código morto | `MEASURED` |
| 3 | Build de produção e contagem de bundle | `MEASURED` |
| 4 | Execução da suite de testes | `MEASURED` |
| 5 | Serviço estático do `dist/` e verificação de rotas e imagens | `OBSERVED` |
| 6 | Revisão estática de segurança (auth, autorização, upload, CORS, bots, base de dados) | `FACT` / `INFERRED` |
| 7 | Confronto com a diretiva do produto (25 secções + 4 decisões) | `INFERRED` |
| 8 | Verificação da divisão administrativa de Angola de 2024 | `FACT` externo |

### 1.2 Resultados dos comandos

```text
npm ci                 → 261 pacotes instalados
npm run build          → tsc --noEmit limpo; vite build OK
                         dist/assets/index-*.js   698,86 kB │ gzip 189,09 kB
                         dist/assets/index-*.css   80,36 kB │ gzip  13,32 kB
npm test               → 10 ficheiros, 101 testes, todos verdes
npm audit --omit=dev   → 2 vulnerabilidades moderadas (react-router)
```

### 1.3 Limitações

- Não foi feito um teste de penetração dinâmico contra o servidor a correr, nem uma auditoria legal.
- Não foi possível abrir o site publicado no Netlify; a análise de deploy é feita a partir de `netlify.toml`, do build e do comportamento do cliente.
- Não foram testados leitores de ecrã reais nem telemóveis físicos.
- **Os sintomas relatados pelo dono e pelos dois testadores foram confrontados com o código.** Alguns não existem neste commit (por exemplo «300 profissionais», «4.000 pedidos» e os nomes «Helena Bandone/Van Lumen»; aqui a conta semeada é «Helena Vandúnem»), o que sugere que o deploy público está num commit antigo ou noutra branch. O padrão do defeito, porém, é o mesmo. Isso está assinalado onde acontece.

### 1.4 Etiquetas de evidência

- `FACT` — confirmado no código.
- `MEASURED` — medido por comando.
- `OBSERVED` — reproduzido no build.
- `INFERRED` — conclusão a partir de factos, não observação direta.
- `NOT TESTED` — não verificado; não deve ser lido como aprovado.

---

## 2. O sistema real vs. o sistema que o utilizador pensa que está a usar

### 2.1 Diagrama do que está realmente ligado

```text
                         O QUE O VISITANTE VÊ
                                 │
                                 ▼
                    src/main.tsx  →  src/App.tsx
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
              ▼                                     ▼
   INITIAL_* em src/data/saluData.ts        ecrãs ativos em src/components/*
   (Helena, Mateus, 4.9, 97%, etc.)         (Landing, CustomerViews, ProviderViews,
              │                              WorkflowViews, EcosystemViews, AppShell)
              │                                     │
              └──────────────┬──────────────────────┘
                             ▼
                 estado React em memória (useState)
                             │
                 ┌───────────┴────────────┐
                 ▼                        ▼
        saluApi (fetch /api)      «modo local» silencioso
                 │                        │
                 ▼                        ▼
        Express + SQLite           nada é guardado
        (só existe em `npm run server`)
                 │
                 ▼
        data/salu.db (commitado)

   CÓDIGO MORTO (não montado): src/pages/*, src/domain/*,
   src/data/repositorio*, src/state/store, src/components/Layout,
   AvaliacaoForm, Conversa, SeletorFoto, PedidoCartao, PerfilCartao,
   FormularioProposta, Reputacao, EtiquetaEstado...
```

### 2.2 A frase que resume o defeito

> O utilizador pensa que está a usar uma plataforma com contas, dados partilhados, propostas, conversas e reputação. Na realidade está a usar **um simulador de um só browser**, alimentado por dados de demonstração, com chamadas opcionais a um backend que, em produção, não existe.

### 2.3 O que muda entre desenvolvimento e Netlify

| Comportamento | `npm run dev` + `npm run server` | Netlify (build estático) |
|---|---|---|
| Landing | Abre | Abre |
| Registo | Pode criar utilizador no SQLite (sem sessão) | `/api/auth/register` devolve `index.html`; o cliente cai no fallback e finge que criou conta |
| Login | Pode validar password no SQLite (sem sessão) | Qualquer credencial «entra» no fallback local |
| Pedido | É criado localmente e enviado ao SQLite | É criado localmente; `/api` devolve HTML; desaparece ao recarregar |
| Propostas | Ficam no estado local e podem ir ao SQLite | Ficam no estado local; desaparecem ao recarregar |
| Mensagens | Estado local; POST falha se a conversa não existir no SQLite | Estado local; desaparecem ao recarregar |
| Perfil profissional | Fica num `draft` de React | Fica num `draft` de React; nunca é publicado |
| Fotos | Já não existem no formulário ativo | Idem |
| Imagens de exemplo | Funcionam em dev (`/src/assets` é servido) | 404 em todas as 22 referências |
| Links partilhados (`/perfil/x`, `/pedidos/y`) | Abrem a landing porque a app só lê paths exatos | Idem (o rewrite devolve `index.html`) |
| Dados entre pessoas | Não | Não |

---

## 3. Métricas objetivas do repositório

| Métrica | Valor | Leitura |
|---|---:|---|
| Linhas em `src/` | 21 301 | Grande para um protótipo |
| Linhas em `tests/` | 1 156 | 101 testes |
| Ficheiros `src` totais | 66 | — |
| Ficheiros `src` alcançáveis (TS/TSX, incl. `main.tsx`) | 29 | 37 não alcançáveis, 66 no total |
| Ficheiros `src` **não alcançáveis** | **37** | 56% dos ficheiros |
| Linhas em código morto | **5 601** | 26% de `src` |
| Maior ficheiro | `LandingPage.tsx` — 1 923 linhas | 8 secções, 54 `onClick` |
| 9 maiores ficheiros ativos | 11 114 linhas | 52% do código-fonte |
| JS de produção | 698,86 kB raw / **189,09 kB gzip** | Sem code splitting |
| CSS de produção | 80,36 kB / 13,32 kB gzip | Um único ficheiro |
| Imagens em `src/assets/images` | **7,6 MB** | Nenhuma é publicada no `dist` |
| Referências a `/src/assets/...` | **22** | Todas quebradas em produção |
| Ecrãs ativos | 18 `ScreenId` (19 condições de render) | Documentação diz 11 |
| Testes que tocam no código ativo | **0** | 101 testes cobrem código morto |
| `onClick` na landing | 54 | Sobrecarga de ações |
| Chamadas `t(pt, en)` | 776 | Tradução inline, sem chaves |
| Listas geográficas divergentes | **5** | ver §8 |
| Modelos de identidade diferentes | **4** | ver §6 |
| Máquinas de estados diferentes | **3** | 10 / 4 / 5–6 estados |
| Taxonomias de categorias | **3–4** | ver §6 |

---

## 4. Bloqueadores P0 — não se deve mostrar o produto a utilizadores reais antes de resolver

> Critério P0: quebra a promessa central, expõe dados de terceiros, perde dados do utilizador, cria uma obrigação legal/financeira ou impede o ciclo de duas pessoas.

### P0-01 — Não há autenticação efetiva; qualquer visitante entra em tudo

**Sintoma.** Quem abre o site não sabe se criou conta. Qualquer URL interna abre o painel. Não há logout real, sessão, token, expiração ou proteção de rota.

**Evidência.**
- `src/App.tsx:70-84` — `getScreenFromPath()` mapeia paths exatos para ecrãs. Não há guarda de sessão.
- `src/App.tsx:671-724` — `showOnboardingWizard` e `screen === 'landing'` renderizam o wizard/landing; qualquer outro ecrã cai no `AppShell` sem verificação.
- `src/App.tsx:701-714` — `onStartRole` abre o wizard sem pedir conta; ao concluir ou saltar, vai para `dashboard`.
- `src/App.tsx:725-747` — o ecrã de auth existe, mas é opcional: basta navegar para `/painel`, `/mensagens` ou `/pedidos`.
- `src/App.tsx:92` — `userName` é lido de `localStorage.getItem('salu_user_name')`, mas **nunca há `setItem('salu_user_name', ...)` em todo o `src`**. O valor é sempre o fallback `Edmundo Bunga`.
- `src/App.tsx:93` — `currentUserId` é sempre `cust-1`, independentemente de quem entrou.

**Efeito.** O produto não tem contas. Não há como saber quem publicou, quem pode editar, quem pode aceitar, quem pode avaliar. Todos os pedidos e conversas são de todos.

**Correção mínima.**
1. Escolher um modelo real: Supabase Auth, Auth.js, Clerk ou backend próprio com sessão assinada (cookie `HttpOnly`, `SameSite`, CSRF).
2. Guarda de rota única: landing, entrar, criar conta, ajuda e perfis/pedidos públicos são públicos; **todo o resto exige sessão**.
3. `userName`, `currentUserId` e papel vêm da sessão, nunca do estado local nem de um literal.
4. Remover o wizard de role da landing; mover a escolha de modo para o onboarding autenticado e para as definições.
5. Logout real; expiração; recuperação de password real (não uma mensagem que finge enviar SMS).

**Esforço.** 2–4 dias para auth real + guardas; 1 dia para remover atalhos.

---

### P0-02 — A identidade é uma mistura de três pessoas diferentes

**Sintoma.** O nome mostrado é `Edmundo Bunga`; o perfil tem as estatísticas, o selo «verificado», 7 serviços concluídos e as avaliações da `Helena Vandúnem`; o backend usa `cust-1`; o utilizador não se reconhece.

**Evidência.**
- `src/App.tsx:92` — fallback `'Edmundo Bunga'`.
- `src/App.tsx:874-879` — `CustomerProfileView` recebe `{...customers[0], name: userName, location: municipality}`.
- `src/data/saluData.ts:333-352` — `customers[0]` é `Helena Vandúnem`, `verified: true`, `completedRequests: 7`, `reliability: 97/95/96/86`.
- `src/App.tsx:93` — `currentUserId = 'cust-1'`; no backend, o cliente semeado tem id `cli-helena`, não `cust-1` (`server/db.ts:256-266`).
- `src/data/saluData.ts:400, 470, 620, 723, 795, 833` — vários pedidos e conversas pertencem à Helena.

**Efeito.** O novo utilizador herda uma reputação que não construiu; qualquer ação é atribuída a uma identidade que não é a dele. É exatamente o sintoma descrito: «descobri que o meu nome é Helena» / «não sei se criei conta».

**Correção mínima.**
1. Eliminar `customers[0]` como perfil do utilizador atual.
2. Criar o perfil do utilizador autenticado a partir da sessão, com `completedRequests: 0`, `verified: false`, `reliability` ausente e avaliações vazias.
3. Nunca usar um registo de exemplo como fallback de identidade.
4. Adicionar um teste que falhe se o nome da sessão e o nome do perfil público divergirem.

**Esforço.** 0,5–1 dia, depois de P0-01.

---

### P0-03 — Os dados não persistem e não são partilhados

**Sintoma.** Publica-se um pedido, recarrega-se a página e ele desaparece. Noutro telemóvel, nunca apareceu. As propostas e conversas nunca chegam ao outro lado.

**Evidência.**
- `src/App.tsx:98-108` — `professionals`, `customers`, `requests`, `conversations`, `reviews`, `notifications` começam em `INITIAL_*` e vivem só em `useState`.
- `src/App.tsx:155-205` — a única leitura ao backend é `saluApi.getRequests()`; faz merge de pedidos, mas **nunca carrega propostas, conversas, mensagens, avaliações, notificações ou perfis**.
- `src/App.tsx:355-366` — `handleSendMessage` faz `setConversations` local e um `saluApi.sendMessage(...).catch(console.warn)`; não há recarregamento nem subscrição.
- `src/App.tsx:418-432` — `saluApi.createRequest(...)` é *fire-and-forget*; não há estado de erro visível.
- `src/App.tsx:465-490` — propostas são adicionadas a `requests` local e enviadas com *catch* silencioso.
- `src/lib/api.ts:150-158` — existe `getProviders`, mas nunca é chamado.
- `src/state/store.ts` e `src/data/repositorio*` — a camada que persistiria dados não é importada por `App.tsx`.
- `netlify.toml` — `/* → /index.html`; não há função, proxy ou backend.

**Efeito.** O ciclo de duas pessoas é impossível. Cada visitante vê os exemplos e perde tudo o que fez. O produto não cumpre a promessa «guarda o perfil e o pedido para amanhã».

**Correção mínima.**
1. Uma única camada de dados (Postgres/Supabase ou API com Postgres), com operações reais: criar, ler, atualizar, listar por participante.
2. Substituir `INITIAL_*` por dados de servidor; exemplos só em modo demo explícito.
3. Guardar propostas, mensagens, acordos e avaliações; carregá-las no arranque e depois de cada mutação; idealmente realtime.
4. Mostrar erro quando a escrita falha; nunca fingir sucesso.
5. Teste de dois browsers/dois utilizadores como critério de aceitação.

**Esforço.** 1–2 semanas para um MVP real; 2–3 dias para uma demo local honesta e persistente.

---

### P0-04 — O prestador nunca fica visível para ninguém

**Sintoma.** O utilizador preenche o perfil profissional, guarda, e o perfil não aparece na descoberta; outro cliente não o encontra.

**Evidência.**
- `src/App.tsx:862-869` — `ProviderProfileBuilder` recebe `onSave={(updated) => setProviderDraft(updated)}`.
- `src/App.tsx:98` — `professionals` só é alterado em `handleToggleFavoritePro` (`src/App.tsx:255`), nunca por `onSave`.
- `src/components/CustomerViews.tsx:1349` — a descoberta filtra apenas o array `professionals`, semeado com 4 pessoas fictícias.
- `src/data/saluData.ts:60-330` — os 4 profissionais de exemplo.
- `src/components/OnboardingAndAuth.tsx:818-832` — o perfil só é considerado completo se `experienceOptional` e `portfolioItems` existirem, apesar de ambos serem apresentados como opcionais; e o `handleSubmit` (`:870-875`) não valida nada.

**Efeito.** O lado da oferta não existe. Um prestador real não pode ser descoberto, não recebe pedidos e não tem perfil público. A plataforma é um catálogo de quatro personagens de demonstração.

**Correção mínima.**
1. `publicarPerfil()` real: cria `Perfil` na base de dados e devolve id.
2. A descoberta lê perfis reais; exemplos com selo «Exemplo» e ordenação separada.
3. Perfil público por URL estável (`/p/:id` ou `/perfil/:id`) e partilhável.
4. Fotografia, logótipo e portefólio com upload real.
5. Critério de aceitação: prestador A cria perfil; cliente B, noutro browser, encontra-o e abre o perfil.

**Esforço.** 3–5 dias, depois de P0-03.

---

### P0-05 — O ciclo pedido → proposta → acordo → conclusão é unilateral

**Sintoma.** A mesma pessoa pode aceitar a sua própria proposta, confirmar os dois lados do acordo, marcar o trabalho como concluído e avaliar-se. O outro lado nunca participa.

**Evidência.**
- `src/App.tsx:473-531` — ao aceitar uma proposta, cria um `Agreement` com `customerAccepted: true`, `providerAccepted: false`, preço da proposta, prazo fixo `2026-11-27` e responsabilidades inventadas; não há contraproposta nem recusa.
- `src/App.tsx:561-610` — `handleAcceptAgreement` marca a aceitação com base em `activeRole`, não na identidade. Como o mesmo utilizador pode trocar de papel no header, pode aceitar os dois lados.
- `src/App.tsx:620-663` — `handleMarkComplete` faz o mesmo com a conclusão: o mesmo utilizador confirma cliente e prestador.
- `src/App.tsx:534-559` — `handleUpdateAgreement` sobrescreve `customerAccepted`/`providerAccepted` conforme o papel ativo.
- `src/components/WorkflowViews.tsx:686-704` — os botões de aceitação aparecem ao papel ativo, sem verificar se a pessoa é parte.
- `src/components/MessagingView.tsx` — não há criação de conversa entre duas contas; as conversas vêm de `INITIAL_CONVERSATIONS` (`src/data/saluData.ts:851`).

**Efeito.** Não existe negociação nem acordo bilateral; existe um formulário que simula ambos. É a negação da Sala SALU.

**Correção mínima.**
1. O acordo é uma entidade persistida com `cliente_id`, `prestador_id`, versão, estado e duas aceitações separadas.
2. Só o cliente pode aceitar/rejeitar propostas; só o prestador pode aceitar o acordo; cada um vê apenas o seu botão.
3. Nenhuma transição acontece sem ambas as partes, ou com regra explícita de silêncio (SLA).
4. Conclusão: prestador submete prova; cliente confirma, pede correção ou abre disputa.
5. Testes negativos: o prestador não consegue aceitar pelo cliente; o cliente não consegue confirmar pelo prestador.

**Esforço.** 1 semana (modelo + API + UI + testes).

---

### P0-06 — Dados de terceiros estão expostos a qualquer visitante

**Sintoma.** Sem conta, abre-se `/mensagens` e veem-se conversas; `/pedidos` mostra todos os pedidos; o detalhe mostra propostas, acordo e valores; `/confianca` mostra avaliações de outras pessoas.

**Evidência.**
- `src/App.tsx:796-1009` — todos os ecrãs recebem `requests`, `reviews` e `conversations` completos, sem filtro por participante.
- `src/components/CustomerViews.tsx:91-115` — `activeRequests`, `completedCount`, `requestsWithProposals`, `executingRequests` são calculados sobre **todos** os pedidos, não sobre os do utilizador.
- `src/components/ProviderViews.tsx:51-67` — `openOpportunities`, `currentJobs` e `proposalsSubmittedCount` também usam todos os pedidos.
- `src/components/WorkflowViews.tsx:732` — o detalhe faz `request.proposals.map(...)` para qualquer visitante.
- `src/components/WorkflowViews.tsx:495-680` — mostra o acordo, preço acordado, responsabilidades e aceitações.
- `src/components/MessagingView.tsx` — lista todas as conversas sem verificar o utilizador.
- `server/api.ts:421-457` — `GET /conversations/:id/messages`: a verificação de privacidade só corre **se `requester_id` for enviado**; se for omitido, a conversa é devolvida.
- `server/api.ts:459-493` — `POST /conversations/:id/messages` aceita `sender_id`/`sender_role` do corpo, sem autenticação.
- `server/api.ts:321-368` — `POST /proposals/:id/accept` e `POST /agreements/:id/release-escrow` não verificam quem chama.

**Efeito.** Violação de privacidade e de confiança. Numa plataforma real, expõe nomes, telefones, valores, conversas e disputas. Mesmo em demo, mostra a terceiros o que deveria ser privado.

**Correção mínima.**
1. Filtrar sempre por `user_id` da sessão no servidor; nunca confiar no cliente.
2. RLS no Postgres/Supabase; testes de acesso cruzado.
3. Separar dados públicos (perfil, pedido aberto) de privados (propostas, acordo, mensagens, avaliações).
4. Corrigir o endpoint de mensagens para exigir `requester_id` e validar participação.
5. Remover o `onAddReview` e a exposição de conversas sem autenticação.

**Esforço.** 3–5 dias.

---

### P0-07 — Métricas, avaliações e selos de verificação inventados

**Sintoma.** A landing e o painel mostram notas, percentagens, «10 Estados», «verificado», «Reservas verificadas» e históricos que não existem.

**Evidência.**
- `src/components/LandingPage.tsx:1655` — `4.9 / 5` «Satisfação dos Clientes».
- `src/components/LandingPage.tsx:1669` — `4.8 / 5` «Fiabilidade dos Prestadores».
- `src/components/LandingPage.tsx:1683` — `100%` «Termos Privados em Kz».
- `src/components/LandingPage.tsx:1177` e `1916` — «10 Estados» / «10 Estados de Ciclo».
- `src/components/LandingPage.tsx:1093-1101` — «Feito por angolanos qualificados, verificado em cada serviço».
- `src/components/LandingPage.tsx:314` — «Reservas verificadas».
- `src/components/CustomerViews.tsx:246` — `profilePct = 95` fixo.
- `src/components/ProviderViews.tsx:182` e `384` — `5.0` fixo quando há trabalhos concluídos, mesmo sem avaliações.
- `src/components/ProviderViews.tsx:464` — `ReliabilityBar ... value={97}`.
- `src/components/EcosystemViews.tsx:102-118` — barras fixas `97/95/96/94`.
- `src/data/saluData.ts:76, 132, 224` — ratings `4.9`; `completedJobs` e `verified: true` nos quatro perfis.
- `server/api.ts:36-38` — **todo o registo novo é inserido com `verified = 1` e `rating = 5.0`**.
- `server/api.ts:95-116` — **todo o login Google cria utilizador com `verified = 1` e `rating = 5.0`**.

**Efeito.** O produto mente na primeira impressão e no painel. Destrói a confiança precisamente no ponto em que a plataforma vende confiança.

**Correção mínima.**
1. Remover todos os números não calculados de dados reais; usar estados vazios («Ainda sem avaliações»).
2. `verified` só depois de um processo real de verificação, com níveis separados (identidade, contacto, empresa, qualificação).
3. Nunca atribuir `rating = 5.0` no registo.
4. Se houver dados de demonstração, selo «Exemplo» em cada cartão e um banner global de demo.
5. Teste que impede literais como `4.9`, `4.8`, `100%`, `97`, `5.0` em componentes de produção.

**Esforço.** 1–2 dias de remoção; verificação real é um ciclo posterior.

---

### P0-08 — Anexos são ficção; não existe upload no produto ativo

**Sintoma.** O botão de anexar no chat mostra «Anexado: Foto_Referencia_Ambito.jpg» sem escolher qualquer ficheiro. No pedido, «Anexar Foto» apenas adiciona uma legenda. O perfil não permite fotografia nem portefólio visual.

**Evidência.**
- `src/components/MessagingView.tsx:251-256` — o clique no `Paperclip` faz `setAttachment('Foto_Referencia_Ambito.jpg')`; não há `<input type="file">`.
- `src/components/MessagingView.tsx:236-244` — mostra o nome do anexo.
- `src/components/MessagingView.tsx:213-225` — renderiza `msg.attachmentName`, não uma imagem.
- `src/components/CustomerViews.tsx:1030-1033` — `photos` começa com `'Foto do local 1'`, uma string.
- `src/components/CustomerViews.tsx:1230-1270` — o formulário de «Fotografias» é um campo de texto + botão «Anexar Foto»; não há ficheiro.
- `grep -rn 'type="file"' src` → **apenas um**, em `src/components/SeletorFoto.tsx:79`, que é **código morto** (não alcançável a partir de `main.tsx`).
- `src/components/OnboardingAndAuth.tsx` — o perfil profissional não tem campo de fotografia/avatar; o portefólio é texto (`title`, `summary`, `outcome`), sem imagem.
- `server/api.ts:495-513` — o endpoint `/upload` existe, mas não é chamado pela UI ativa.

**Efeito.** O utilizador não consegue mostrar o problema nem o trabalho; a plataforma parece «negar fotografias». É um dos sintomas mais concretos e mais graves.

**Correção mínima.**
1. `SeletorFoto` real no pedido e no perfil (input file, compressão, preview, remoção).
2. Upload para storage (Supabase Storage / S3) com validação de MIME, tamanho, extensão e antivírus; nunca guardar em `public/uploads`.
3. Chat: anexar imagem/documento com upload real; mensagem com URL segura.
4. Portefólio com imagens e descrição, visível no perfil público.
5. Testar em telemóvel físico (câmara e galeria).

**Esforço.** 3–4 dias.

---

### P0-09 — O sistema de avaliação não tem integridade

**Sintoma.** Qualquer pessoa pode avaliar qualquer pedido concluído; pode avaliar-se a si própria; pode avaliar antes de a conclusão estar confirmada; o alvo pode ser «Mateus Sebastião» por omissão.

**Evidência.**
- `src/App.tsx:1024-1033` — passa `requests.filter(r => ['COMPLETED','COMPLETION_PENDING'].includes(r.state))`; logo, avalia-se **antes** da confirmação final.
- `src/components/EcosystemViews.tsx:54-77` — `handleSubmit` só exige `comment` e `targetReq`; não verifica autoria, participação, duplicados ou `authorName !== targetName`.
- `src/components/EcosystemViews.tsx:63-67` — alvo: `targetReq.agreement?.providerName || 'Mateus Sebastião'` para cliente; `targetReq.customerName` para prestador. O fallback é um nome arbitrário.
- `src/App.tsx:1030-1035` — `onAddReview` acrescenta a avaliação sem validação; `date: '20 Nov 2026'` fixo.
- `src/components/ReviewsAndReputation` não distingue critérios de cliente e prestador: usa as mesmas três dimensões (`communication`, `punctuality`, `qualityOrClarity`) para ambos.
- A versão com regras e três dimensões (`src/components/AvaliacaoForm.tsx` + `src/domain/validacao.ts` + `src/domain/reputacao.ts`) existe, mas é **código morto**.

**Efeito.** A reputação é falsificável. Um prestador pode construir nota sem cliente; um cliente pode ser difamado; avaliações não correspondem a trabalhos.

**Correção mínima.**
1. Só avalia quem participou e só depois de `COMPLETED` com confirmação bilateral (ou regra explícita de silêncio).
2. Uma avaliação por autor/alvo/pedido; `author_id != target_id`.
3. Critérios diferentes para cliente e prestador, com contrato de tipos.
4. Moderação, resposta, denúncia e revisão de avaliações abusivas.
5. Apagar as barras fixas e o `5.0`; usar reputação calculada a partir de avaliações reais.
6. Testes: autoavaliação rejeitada; terceiro rejeitado; duplicado rejeitado; antes da conclusão rejeitado.

**Esforço.** 3–4 dias.

---

### P0-10 — Pagamentos e «escrow» são uma ficção com consequências legais

**Sintoma.** O backend cria um acordo com `escrow_status = 'HOLDING'`, diz «Pagamento seguro retido sob custódia da plataforma» e, num clique, responde «O valor do pagamento foi transferido com sucesso ao prestador». Não existe PSP, conta, saldo, transferência, KYC, reembolso ou disputa.

**Evidência.**
- `server/api.ts:302-343` — ao aceitar proposta, cria `agreements` com `'HOLDING'` e o texto «Pagamento seguro retido sob custódia da plataforma».
- `server/api.ts:351-368` — `release-escrow` atualiza para `'RELEASED'` e devolve «transferido com sucesso».
- `server/api.ts:370-400` — `whatsapp-confirm` também cria acordo `'HOLDING'` com «protegida no SALU».
- Não existe integração com Multicaixa Express, banco, PSP, carteira ou ledger em todo o repositório.
- `src/lib/api.ts` não expõe `releaseEscrow` nem `acceptProposal`; a UI ativa nem usa estes endpoints.

**Efeito.** A plataforma promete proteção financeira que não existe. Em Angola, receber/guardar/movimentar fundos de terceiros exige enquadramento legal e parceria autorizada. É um risco jurídico, reputacional e de confiança maior do que qualquer bug visual.

**Correção mínima.**
1. **Remover hoje** as expressões «pagamento seguro», «custódia», «escrow», «transferido com sucesso» de UI, API, docs e pitch.
2. Dizer a verdade: «O SALU registra o acordo. O pagamento é combinado diretamente entre as partes e não é processado pela plataforma.»
3. Só voltar a prometer mediação financeira com um parceiro licenciado, contrato, KYC/AML, política de reembolso, disputa e segregação de fundos.
4. Se se usar Multicaixa Express, fazê-lo através de agregador autorizado; nunca simular.
5. Um endpoint que muda estado financeiro não pode existir sem autenticação, autorização e idempotência.

**Esforço.** 0,5 dia para remover; 6–12 semanas para implementar com parceiro e jurista.

---

### P0-11 — A localização está errada e é incoerente entre cinco listas

**Sintoma.** Camama não existe como município na maioria dos sítios; Talatona, Kilamba, Maianga e Ingombota são misturados; Icolo e Bengo e Quiçama continuam tratados como Luanda; «Benguela & Lobito» é um só item.

**Evidência.**
- `src/data/saluData.ts:30-51` — 20 strings que misturam província e município, incluindo `'Icolo e Bengo, Luanda'` e `'Quiçama, Luanda'`, que já não pertencem a Luanda; `'Luanda (Maianga/Ingombota), Luanda'` junta dois municípios.
- `src/domain/types.ts:26-36` — `MUNICIPIOS` tem apenas 7: `Luanda, Belas, Cacuaco, Cazenga, Viana, Talatona, Kilamba Kiaxi`; faltam **Camama, Mulenvos, Kilamba, Hoji ya Henda, Mussulo, Sambizanga, Rangel, Maianga, Samba, Ingombota**.
- `src/components/ui/InteractiveOnboardingWizard.tsx:34-46` — lista com `'Maianga, Luanda'`, `'Ingombota, Luanda'`, `'Kilamba, Luanda'`, `'Benguela & Lobito'`; default `'Talatona, Luanda'`.
- `src/components/LandingPage.tsx:81-92` — `MUNICIPALITY_MARQUEE` com `'Ingombota & Miramar'`, `'Viana Industrial'`, `'Benguela & Lobito'`, `'Huambo · Centro'`, `'Cabinda · Norte'`.
- `src/components/LandingPage.tsx:775-791` — o seletor do hero oferece `Luanda`, `Toda Angola` e a lista de `ANGOLA_MUNICIPALITIES`.
- `server/db.ts:256-344` — seeds com `'Talatona, Luanda'`, `'Maianga, Luanda'`, `'Kilamba, Luanda'`.
- `src/components/LandingPage.tsx:118-140` — «detetar localização real» usa apenas a latitude e mapeia para três strings antigas, ignorando longitude e município.

**Efeito.** Pesquisas e filtros não encontram pessoas reais; um prestador de Camama pode não ser encontrado; a plataforma parece desconhecer o país. É um erro de produto e de respeito pelo utilizador.

**Correção mínima.**
1. Uma única fonte geográfica versionada: `Província → Município → Comuna → Bairro/Zona`.
2. Para Luanda, usar os 16 municípios da Lei n.º 14/24 e do Censo 2024 (ver §8).
3. Não guardar «Talatona, Luanda» numa string; guardar `provincia_id`, `municipio_id`, `comuna_id`, `bairro`.
4. Filtros por ids; distância aproximada com consentimento; nunca inferir município por latitude.
5. Remover listas duplicadas e validar no CI que todos os municípios usados existem na fonte.

**Esforço.** 2–3 dias + revisão de dados.

---

### P0-12 — Em produção, imagens e links profundos quebram; o Netlify não tem backend

**Sintoma.** As fotos não aparecem; um link para um perfil ou pedido abre a homepage; o site no Netlify não guarda nada.

**Evidência.**
- `grep -rn '/src/assets' src` → **22 referências** em `src/data/saluData.ts`, `src/components/ProviderViews.tsx:789` e outros.
- `dist/` contém apenas `index.html`, `index-*.js`, `index-*.css`, `favicon.svg` e `assets/sprites/*`; **nenhuma imagem** de `src/assets/images`.
- Servido o `dist` estaticamente: `GET /src/assets/images/pro_mateus_electrician_1795204346516.jpg` → **404** (`OBSERVED`).
- `src/components/ui/Primitives.tsx:337-370` — `SafeAvatar` troca a imagem por um ícone genérico quando falha.
- `src/components/ui/Primitives.tsx:372-407` — `SafeBannerImage` troca por um gradiente; a falha é invisível.
- `src/App.tsx:70-84` — só paths exatos; `/perfil/pro-mateus` e `/pedidos/req-101` devolvem `landing`.
- `src/App.tsx:118-142` — o mapa de URLs empurra `/perfil/:id` e `/pedidos/:id`, mas o parser não os reconhece; **recarregar ou partilhar o link perde o ecrã**.
- `netlify.toml` — rewrite SPA correto, mas sem funções/proxy para `/api`; `/*` também apanha `/api/*`, devolvendo `index.html`.
- `vite.config.ts:5-18` — proxy `/api` e `/uploads` só existe no servidor de desenvolvimento.

**Efeito.** A primeira impressão perde as imagens; um link partilhado não abre o conteúdo; o Netlify transforma a app numa demo em memória. O problema não é o Netlify: é a arquitetura de deploy.

**Correção mínima.**
1. Importar imagens com `import`, ou colocá-las em `public/` e referenciar `/images/...`; nunca `/src/...`.
2. Converter para WebP/AVIF, `srcset`, `loading="lazy"`; medir LCP.
3. Router real (`react-router-dom` está instalado, mas só há um `BrowserRouter` sem `Routes`) com rotas dinâmicas `:id`, `notFound`, scroll restoration.
4. `_redirects`/`netlify.toml` para SPA + função Netlify para `/api` ou API externa; SQLite não serve em Netlify (filesystem efémero).
5. Confirmar no deploy o commit publicado; o site pode estar num build antigo.

**Esforço.** 1–2 dias para imagens + router; 3–5 dias para deploy com backend.

---

### P0-13 — Bots fabricam atividade e a base de dados com credenciais está no Git

**Sintoma.** O servidor cria utilizadores, pedidos e propostas falsos a cada 4 minutos; a base de dados com hashes e telefones está versionada; todas as contas semeadas usam a mesma password.

**Evidência.**
- `server/index.ts:36` — `startBotScheduler(240)` no arranque.
- `server/db.ts:385-386` — `bot_config.enabled = '1'` e intervalo 4 minutos.
- `server/bots.ts:67-150` — cria `users`, `requests` e `proposals` com nomes como «Dona Teresa Maianga», «Eng. Paulo Kilamba».
- `server/bots.ts` — utilizadores bot inseridos com `verified = 1`.
- `data/salu.db`, `data/salu.db-shm`, `data/salu.db-wal` — **versionados** (`git ls-files data`), 1,1 MB de WAL.
- `server/db.ts:237` — `defaultPass = hashPassword('salu1234')` aplicada a todos os utilizadores semeados.
- `server/api.ts:36-38` e `95-116` — registos e «Google» com `verified = 1`, `rating = 5.0`.
- `server/api.ts:495-560` — endpoints de bots (`/bots/toggle`, `/bots/trigger-now`) sem autenticação.

**Efeito.** O servidor fabrica a atividade que o produto diz ser real. Em produção, cria dados falsos, polui métricas e pode ser acionado por qualquer pessoa. A base commitada expõe PII e credenciais.

**Correção mínima.**
1. Remover bots e endpoints de bots do produto; se forem precisos para demo, vivem num seed separado, com flag e sem escrever na base real.
2. Remover `data/*.db*` do Git e do histórico; rodar credenciais; adicionar `data/` ao `.gitignore`.
3. Nunca semear contas com password partilhada; usar utilizadores de demonstração só em ambiente isolado.
4. Autenticação e autorização em todos os endpoints de administração.
5. Registar auditoria de quem cria/altera.

**Esforço.** 0,5 dia para remover; 1 dia para limpar histórico/segredos; 2–3 dias para admin seguro.

---

### P0-14 — A documentação contradiz o código e induz as IAs em erro

**Sintoma.** O README diz «sem chat», «sem pagamentos», «sem autenticação», «sem dados inventados»; o código ativo tem chat, escrow, autenticação simulada e dados inventados. `PROJECT_STATE.md` diz 11 ecrãs, 97 testes e 90 kB; o build tem 18 ecrãs, 101 testes e 189 kB gzip. `docs/DEPLOY.md` fala em Vercel; o dono usa Netlify.

**Evidência.**
- `README.md` — «Sem autenticação no protótipo», «Sem pagamentos», «Não construímos chat», «Sem dados inventados a passar por reais».
- `PROJECT_STATE.md` — «11 ecrãs, 43 testes, 71 kB», «97 testes», «90,0 kB gzip»; URL público `UNKNOWN`.
- `docs/DEPLOY.md` — Vercel; sem Netlify.
- `docs/ARQUITECTURA.md` — descreve `src/domain`, `src/data`, `src/state`, `src/pages` como a aplicação; essa camada é morta.
- `CLAUDE.md` — exige evidência e `PROJECT_STATE` como fonte de verdade; a fonte de verdade está errada.

**Efeito.** Qualquer IA ou pessoa que leia os documentos implementa a coisa errada. O dono toma decisões com base em números que já não são verdade. É um bloqueador de governança.

**Correção mínima.**
1. Um único `PROJECT_STATE.md` gerado a partir do commit e do build, com data, hash, contagens e limitações.
2. Marcar claramente o que é demo, o que é real, o que é código morto.
3. Atualizar README, DEPLOY, ARQUITECTURA para o que está montado.
4. CI que falha se as contagens/documentos não corresponderem.
5. Regra: nenhum documento pode afirmar uma integração que não tem teste.

**Esforço.** 0,5–1 dia.

---

## 5. Problemas P1 — produto, experiência e conteúdo

> Critério P1: não impede o lançamento por si só, mas destrói a experiência, a confiança ou a acessibilidade.

### 5.1 Landing e primeira impressão

| ID | Achado | Evidência | Efeito | Correção |
|---|---|---|---|---|
| UX-01 | **Demasiada informação e demasiadas ações.** 1 923 linhas, 8 secções, 54 `onClick`, hero + working steps + specialties + trust + marketplace + testimonials + CTA. | `src/components/LandingPage.tsx` (1 923 linhas); `grep -c onClick` = 54 | O visitante não sabe qual é o próximo passo; «não é intuitivo» | 5 blocos no máximo: promessa, como funciona, para quem, prova honesta, CTA. Um CTA primário por secção. |
| UX-02 | **Provas inventadas** no topo da confiança. | `LandingPage.tsx:1655, 1669, 1683`; `:314`; `:1093` | A primeira coisa que a plataforma faz é mentir | Remover todos os números; estados vazios; prova real só quando existir |
| UX-03 | **«Explorar Mercado em Direto»** não é em direto. | `LandingPage.tsx:1074` | Expectativa falsa | «Explorar serviços» ou «Ver exemplos» |
| UX-04 | **Perfis e imagens de exemplo apresentados como pessoas reais**, com nomes, bairros e «verificado». | `LandingPage.tsx:1109-1240`; `saluData.ts:60-330` | Confusão e risco ético; o utilizador acha que são clientes reais | Selo «Exemplo» em cada imagem; secção «Demonstração»; remover nomes de pessoas reais |
| UX-05 | **Promessa de acordo assinado** sem assinatura, PDF, hash ou aceitação persistida. | `LandingPage.tsx:1258, 1686`; `WorkflowViews.tsx:495-680` | Expectativa que o produto não cumpre | Chamar «registo de acordo»; implementar assinatura/aceitação real ou remover «assinado» |
| UX-06 | **Texto longo e redundante** em várias secções; o dono e os testadores dizem que não leem. | Landing inteira; `PROJECT_STATE` também | Abandono | Copy de 1 ideia por bloco; máximo 2 linhas por parágrafo; teste de leitura de 30 s |
| UX-07 | **Duas narrativas concorrentes** («uma conta unificada, dois caminhos» vs «cliente/prestador» no header). | `LandingPage.tsx:1518-1540`; `AppShell.tsx:378-400` | O utilizador não sabe se é uma conta ou duas | Uma conta, um modo ativo nas definições; onboarding explica; remover o switch do header |
| UX-08 | **Falta de hierarquia de CTA**: «Criar conta», «Entrar», «Publicar», «Explorar», «Preciso de serviço», «Quero prestar» aparecem juntos. | `LandingPage.tsx:595-674, 918-997, 1570-1634, 1730-1761`, etc. | Paralisia de decisão | CTA primário único: «Criar conta» / «Entrar»; exploração pública secundária |
| UX-09 | **Famílias/empresas**: o dono pediu para não usar «famílias» como unidade. | `LandingPage.tsx:1520` | Linguagem menos natural | «Para quem precisa de um serviço» / «Para quem presta serviços» |
| UX-10 | **Sem ajuda/contacto funcional** na landing ativa; links antigos para `/interno` e `/planos` não existem no parser. | `App.tsx:70-84`; `Layout.tsx:119, 201-202` (código morto) | O utilizador não tem saída | Página de Ajuda real, FAQ, contacto, chat de suporte; rotas válidas |

### 5.2 Conta, onboarding e modo

| ID | Achado | Evidência | Efeito | Correção |
|---|---|---|---|---|
| UX-11 | **O registo não pede confirmação de password, não valida formato de e-mail/telefone, não exige password.** | `OnboardingAndAuth.tsx:332-375`; `:103-128` | Contas frágeis; `salu1234` por omissão | Validação real, password forte, confirmação, verificação de e-mail/telefone |
| UX-12 | **«Lembrar-me» não faz nada; «Esqueceu a senha?» finge enviar SMS/e-mail.** | `OnboardingAndAuth.tsx:378-400` | Promessa falsa e frustração | Implementar ou remover; nunca simular envio |
| UX-13 | **Google e Apple não são OAuth.** Ambos chamam `/auth/google` com o e-mail escrito no formulário. | `OnboardingAndAuth.tsx:133-146, 441-460`; `server/api.ts:85-116`; `lib/api.ts` | Conta automática e potencial tomada de conta | OAuth real (Google/Apple) ou remover os botões |
| UX-14 | **Role escolhido na landing, no wizard, no header e nas definições.** | `LandingPage.tsx:918, 945`; `App.tsx:701`; `AppShell.tsx:378-400`; `EcosystemViews.tsx:932-960` | Inconsistência e mudança acidental | Escolha de intenção no onboarding; modo ativo nas definições; header só mostra |
| UX-15 | **O wizard de onboarding pode ser saltado e leva ao painel sem conta.** | `App.tsx:671-688`; `InteractiveOnboardingWizard.tsx:70-80` | O utilizador nunca sabe se tem conta | Onboarding só depois de auth; saltar leva a «explorar» pública, não a painel |
| UX-16 | **O wizard faz 4 passos e pede categoria, município e «como ouviu falar» antes de a conta existir.** | `InteractiveOnboardingWizard.tsx:55-315` | Fricção e dados sem destino | Perguntar só o essencial; guardar no perfil; explicar cada pergunta |
| UX-17 | **O nome do utilizador não é editável antes de aparecer no painel; o default é um nome real.** | `App.tsx:92`; `AuthScreen` só define no registo | O utilizador vê «Edmundo Bunga» | Perfil editável, default neutro, nunca nome de uma pessoa real |
| UX-18 | **Mudar de modo reinicia o ecrã para o dashboard e perde contexto.** | `App.tsx:230-245` | Sensação de reinício | Manter contexto; confirmar mudança; lembrar que é a mesma conta |
| UX-19 | **Não há confirmação de mudança de modo**; um clique no header altera toda a navegação. | `AppShell.tsx:382-400` | O utilizador «vai parar como prestador» sem querer | Modo nas definições; confirmação; indicador claro |
| UX-20 | **Não há definições de privacidade reais**: toggles não persistem e não alteram comportamento. | `EcosystemViews.tsx:869-871, 967+` | Falsa sensação de controlo | Persistir preferências; explicar o que cada uma faz; endpoint de eliminação de conta |

### 5.3 Formulários e fluxos

| ID | Achado | Evidência | Efeito | Correção |
|---|---|---|---|---|
| UX-21 | **Perfil profissional com 16 campos de uma vez**, sem etapas, sem explicações contextuais, com opcionais marcados como obrigatórios para 100%. | `OnboardingAndAuth.tsx:818-832`; 16 inputs | Cansaço e abandono | Wizard por etapas; explicação por campo; opcional ≠ obrigatório |
| UX-22 | **Guardar perfil não valida nada e não persiste.** | `OnboardingAndAuth.tsx:870-875`; `App.tsx:867` | O utilizador pensa que publicou | Validação, persistência, estado de sucesso real, perfil público |
| UX-23 | **Portefólio aceita texto, mas não imagem; cria «Entrega verificada pelo cliente» automaticamente.** | `OnboardingAndAuth.tsx:848-868` | Prova falsa e portefólio invisível | Upload real; remover «verificada»; mostrar no perfil |
| UX-24 | **Pedido: «Anexar Foto» só cria legenda.** | `CustomerViews.tsx:1230-1270`; `:1030` | Não se consegue mostrar o problema | Upload real com preview, remoção e limite |
| UX-25 | **Pedido: orçamento opcional é bom, mas a proposta pré-preenche 120 000 Kz quando não há orçamento.** | `ProviderViews.tsx:764-766` | Ancora o preço e induz o prestador | Placeholder vazio; sugestão só com base em dados reais |
| UX-26 | **Proposta: `providerVerified: true`, avatar fixo do Mateus e `providerId: 'pro-current'`.** | `ProviderViews.tsx:784-796` | Proposta com identidade falsa | Usar sessão e perfil reais; sem selo automático |
| UX-27 | **Aceitar proposta cria acordo unilateral com prazo fixo e responsabilidades inventadas, sem contraproposta.** | `App.tsx:473-531` | Negociação fictícia | Acordo editável, contraproposta, recusa, prazo real |
| UX-28 | **Conclusão: um clique de cada lado, sem prova, fotografia, áudio ou confirmação do cliente.** | `App.tsx:620-663`; `WorkflowViews` | Trabalhos concluídos sem evidência | Submissão de prova, confirmação bilateral, correções, disputa |
| UX-29 | **Avaliação disponível em `COMPLETION_PENDING` e sem verificação de participação.** | `App.tsx:1027`; `EcosystemViews.tsx:54-77` | Reputação falsa | Só após conclusão confirmada e com participação |
| UX-30 | **Não há fluxo de cancelamento, rejeição, desistência, disputa ou silêncio.** | `types/salu.ts:3-13` tem estados, mas a UI não os cobre | Casos reais não têm saída | Definir máquina de estados e UI para cada transição |
| UX-31 | **O prestador não vê o pedido de forma privada: todos os pedidos e propostas são visíveis a todos.** | `CustomerViews.tsx:91-115`; `WorkflowViews.tsx:732` | Privacidade e confusão | Filtrar por participante; propostas privadas |
| UX-32 | **O painel do prestador conta propostas de todos os pedidos, não as do prestador.** | `ProviderViews.tsx:67` | Número sem significado | Calcular por `provider_id` |
| UX-33 | **O painel do cliente chama «Meus Pedidos» a todos os pedidos.** | `CustomerViews.tsx:91-115`; `:585` | «Parece que todo o trabalho é meu e não é» | Filtrar por autor; separar «meus» de «mural» |
| UX-34 | **O perfil do cliente mostra 7 serviços concluídos e 97/95/96 mesmos para toda a gente.** | `saluData.ts:333-352`; `CustomerViews.tsx:1619-1690` | Identidade e reputação herdadas | Perfil real, zeros e «sem avaliações» |
| UX-35 | **Não há estados de carregamento, erro ou vazio no fluxo ativo.** | `App.tsx:155-205` (catch silencioso); componentes sem `loading` | O utilizador não sabe se falhou | Skeletons, erro com retry, vazios explicativos |
| UX-36 | **Notificações nascem de seed e de ações locais, sem destino fiável.** | `saluData.ts:968-1017`; `App.tsx:213-230, 349-356` | Notificações espontâneas | Só notificações geradas por eventos reais, com link e read persistido |
| UX-37 | **Segurança/denúncias são um formulário local; não há ninguém do outro lado.** | `EcosystemViews.tsx:583+`; `App.tsx:1070-1094` | Falsa sensação de proteção | Backend de moderação, SLA, resposta, recurso |
| UX-38 | **Planos/modelo de negócio não existem na app ativa** (`/planos` cai na landing). | `App.tsx:70-84`; `pages/Planos.tsx` morto | Não há proposta comercial | Página de planos real ou remover do discurso |
| UX-39 | **Ajuda/contacto não existem**; `/interno` não é reconhecido. | `App.tsx:70-84`; `Layout.tsx` morto | Sem suporte | Central de ajuda, FAQ, contacto, estado do sistema |

### 5.4 Linguagem, moeda e datas

| ID | Achado | Evidência | Efeito | Correção |
|---|---|---|---|---|
| UX-40 | **Interface meio PT, meio EN.** Dados, estados, timelines e notificações em inglês; labels em PT. | `saluData.ts` (nomes, profissões, `OPEN`, `COMPLETED`, timelines); `App.tsx:407-418`; `LandingPage` | O utilizador vê duas línguas ao mesmo tempo | i18n com chaves; traduzir dados de interface; conteúdo do utilizador não se traduz |
| UX-41 | **A língua não persiste e não traduz o conteúdo.** | `App.tsx:87` (`useState('pt')`); `i18n/translations.ts:1-82` | Recarregar volta a PT; dados continuam EN | Persistir; locale completo; `lang` no `<html>` |
| UX-42 | **`t(pt, en)` inline em 776 sítios**; fácil esquecer strings e impossível validar. | `grep -rhoE "\bt\(" src/components/*.tsx` = 776 | Cobertura inconsistente | Ficheiros de tradução + chaves + CI de chaves em falta |
| UX-43 | **Moeda e números em `en-US`.** | `LandingPage.tsx:1389`; `saluData.ts:57`; `formatKwanza` | «1,220 Kz» em vez de «1 220 Kz» | `Intl.NumberFormat('pt-AO', { currency: 'AOA' })`; decidir Kz/KWANZA |
| UX-44 | **Datas fixas e «Just now» eternos.** | `App.tsx:391, 447, 479`; `saluData.ts`; `EcosystemViews` | Sensação de simulação | Datas reais ISO + formatação local; relativo calculado |
| UX-45 | **Texto de marketing sem significado** («clareza bilateral», «fiabilidade local mensurável», «100% termos privados»). | Landing 1500-1700 | Parece artificial | Copy concreta: o que acontece, quando, o que o utilizador ganha |
| UX-46 | **`html lang="pt"` mas a app pode estar em EN; sem `lang` dinâmico.** | `index.html:2`; `App.tsx:87` | Acessibilidade e SEO | Atualizar `document.documentElement.lang` |
| UX-47 | **Dark mode inicial inconsistente:** `<html class="dark">` + estado `darkMode=false`. | `index.html:2`; `App.tsx:87, 152-160` | Flash de tema; preferência perdida | Tema persistido; `prefers-color-scheme`; sem classe inicial contraditória |

### 5.5 Navegação, estados e acessibilidade

| ID | Achado | Evidência | Efeito | Correção |
|---|---|---|---|---|
| UX-48 | **Router inexistente na prática.** `BrowserRouter` é montado, mas não há `<Routes>`; a navegação é `window.history.pushState` e `screen` state. | `main.tsx:4, 12`; `App.tsx:70-150`; `grep "Routes"` = 0 | Links profundos, back/forward e refresh quebram | React Router com rotas reais e loader/error |
| UX-49 | **O botão «voltar» do browser não repõe o ecrã anterior em detalhes.** | `App.tsx:144-150` + parser exato | O utilizador perde o contexto | Rotas reais; scroll restoration |
| UX-50 | **Não há 404.** Qualquer path desconhecido mostra a landing. | `App.tsx:83` | Links errados passam despercebidos | Rota `*` com 404 útil |
| UX-51 | **Splash obrigatório de 2,2 s em cada carregamento**, mesmo para quem já conhece o produto. | `src/components/ui/SplashScreen.tsx:10-14` | Fricção e percepção de lentidão | Mostrar uma vez por sessão; ou remover |
| UX-52 | **Header com localização, modo, idioma, tema, notificações e perfil ao mesmo tempo.** | `AppShell.tsx:350-440` | Sobrecarga e mudança acidental | Mover localização/idioma/tema/modo para definições; header com pesquisa, notificações e perfil |
| UX-53 | **Sem skip link, sem landmark de navegação consistente, sem focus trap nos modais.** | `LandingPage`, `AppShell`, `ProposalSubmissionModal` | Acessibilidade fraca | Skip link, `<nav>`, `role="dialog"`, Escape, focus trap, `aria-live` |
| UX-54 | **Emojis usados como ícones** em botões e labels. | `LandingPage`, wizard, `AppShell` | Consistência e leitura por ecrã | Ícones SVG com `aria-hidden` e labels |
| UX-55 | **Carrossel automático a cada 4,5 s sem pausa.** | `LandingPage.tsx:111-116` | Distração; viola preferência do utilizador | Pausa, controlos, `prefers-reduced-motion` |
| UX-56 | **Contraste:** laranja `#F97316` sobre branco ≈ 2,8:1; usado em texto pequeno. | `LandingPage`, `CustomerViews`, `ProviderViews` | Difícil de ler | Usar `#C2410C`/`#9A3412` para texto; validar com WCAG AA |
| UX-57 | **Muitos alvos de toque abaixo de 44 px** (11–12 px de texto, botões compactos). | `LandingPage`, `AppShell`, `EcosystemViews` | Difícil no telemóvel | Mínimo 44×44; espaçamento |
| UX-58 | **Sem página de estado offline/erro global.** | `main.tsx`; sem `ErrorBoundary` | Ecrã branco em erro | Error boundary + fallback + retry |
| UX-59 | **Sem indicador de «modo demonstração».** | Toda a app | O utilizador pensa que é real | Banner persistente «Demonstração — dados de exemplo» |
| UX-60 | **Sem metadados sociais/SEO para perfis e pedidos.** | `index.html`; SPA | Partilha feia; sem indexação | SSR/SSG ou meta dinâmica; OG/Twitter; sitemap/robots |

### 5.6 Confiança e segurança percebida

| ID | Achado | Evidência | Efeito | Correção |
|---|---|---|---|---|
| UX-61 | **Selo «verificado» em todos os perfis de exemplo e em todos os novos registos.** | `saluData.ts`; `server/api.ts:36-38, 95-116` | Confiança falsa | Níveis de verificação separados; selo só com prova |
| UX-62 | **Não há níveis de confiança progressiva.** | Nenhum modelo no código | «Anti-curioso» inexistente | N0 conta, N1 contacto, N2 identidade, N3 qualificações, N4 histórico; gating por risco |
| UX-63 | **Não há verificação de telefone/e-mail.** | `AuthScreen`; backend | Spam e contas descartáveis | OTP/email verification; rate limit |
| UX-64 | **Não há política de conteúdo, termos, privacidade, cancelamento, reembolso ou disputa.** | `grep` não encontra páginas legais | Risco legal e de confiança | Textos jurídicos + consentimento + retenção |
| UX-65 | **Denúncias e apelos não persistem.** | `App.tsx:1070-1094` | Impunidade | Backend de moderação e auditoria |
| UX-66 | **O utilizador não pode eliminar a conta nem exportar dados.** | Nenhum fluxo | Direitos de dados | Eliminação/exportação; confirmação |

---

## 6. P2 — Arquitetura e engenharia

### 6.1 Três gerações no mesmo repositório

| Geração | Onde vive | Estado | Consequência |
|---|---|---|---|
| **v1 ativa** | `src/App.tsx` + `src/components/*` + `src/data/saluData.ts` | Montada em `main.tsx` | É o produto que o utilizador vê; sem auth, sem persistência, com dados fictícios |
| **v2 «papel»** | `src/pages/*`, `src/domain/*`, `src/data/repositorio*`, `src/state/*`, `src/components/{Layout,Conversa,AvaliacaoForm,SeletorFoto,PedidoCartao,PerfilCartao,FormularioProposta,Reputacao,EtiquetaEstado}` | **Morta** (37 ficheiros, 5 601 linhas) | Tem as regras, os testes e os estados vazios; não é usada |
| **backend** | `server/*` + `data/salu.db` | Só corre com `npm run server`; não existe no Netlify | API parcial, sem auth, com bots e escrow fictício |

**Conclusão.** Não há uma base única. A única parte com regras testadas é a que ninguém vê. A parte que todos veem é a menos rigorosa.

### 6.2 Quatro modelos de identidade

1. `Professional` / `CustomerSummary` / `ServiceRequest` em `src/types/salu.ts` (UI ativa).
2. `Perfil` / `Pedido` / `Avaliacao` em `src/domain/types.ts` (código morto).
3. `users` / `requests` / `proposals` / `agreements` / `messages` no SQLite (`server/db.ts`).
4. `profiles` / `requests` / `proposals` nas migrações Supabase.

Nenhum é o dono da verdade. Os campos não coincidem (`municipality` vs `municipio`, `status` vs `state`, `budgetKz` vs `orcamentoTexto`, `verified` vs níveis).

### 6.3 Três máquinas de estados

| Camada | Estados | Problema |
|---|---|---|
| UI ativa (`types/salu.ts:3-13`) | `DRAFT`, `OPEN`, `PROPOSALS_RECEIVED`, `NEGOTIATING`, `AGREEMENT_CONFIRMED`, `IN_PROGRESS`, `COMPLETION_PENDING`, `COMPLETED`, `CANCELLED`, `DISPUTED` | 10 estados, mas a UI não implementa transições reais; alguns nunca acontecem |
| Domínio (`domain/types.ts:70`) | `aberto`, `acordado`, `concluido`, `cancelado` | 4 estados, mais coerente, mas insuficiente para disputa |
| API (`lib/api.ts:32`) | `OPEN`, `IN_NEGOTIATION`, `ASSIGNED`, `COMPLETED`, `CANCELLED` | Não tem `COMPLETION_PENDING` nem `DISPUTED`; não fala com a UI |

O utilizador vê «10 Estados» na landing, mas o sistema real não os percorre.

### 6.4 Taxonomias incompatíveis

- **UI ativa:** `Electrical & Solar`, `Architecture & Renovation`, `IT & Networks`, `Plumbing & HVAC`, `Catering & Events`, `Legal & Accounting`, `Transport & Logistics`, `Cleaning & Maintenance`.
- **Domínio v2:** 12 categorias em português (`reparacoes`, `electricidade`, `canalizacao`, `limpeza`, `tecnologia`, `design`, `explicacoes`, `entregas`, `beleza`, `cozinha`, `construcao`, `administrativo`).
- **Wizard:** 6 categorias (`Construção & Manutenção`, `Tecnologia & Suporte TI`, `Design & Comunicação`, `Educação & Explicações`, `Catering & Eventos`, `Transporte & Logística`).
- **Landing:** especialidades próprias (`CUSTOMER_SPECIALTIES`).

Um pedido criado numa taxonomia não aparece na pesquisa de outra. Não há «Outros» com normalização.

### 6.5 Testes que não testam o produto

Os 10 ficheiros de teste importam `domain/*`, `data/repositorioLocal`, `data/semente`, `state/*` — todo o lado morto. Não há:

- teste de `App.tsx`;
- teste de um ecrã ativo (`LandingPage`, `CustomerViews`, ...);
- teste de autenticação/autorização;
- teste do backend (`server/api.ts`);
- teste de duas pessoas;
- teste de upload;
- teste de i18n;
- teste de acessibilidade;
- teste e2e.

**Consequência:** todos os P0 coexistem com 101 testes verdes. É a definição de falsa confiança.

### 6.6 Outros problemas estruturais

| ID | Achado | Evidência | Efeito |
|---|---|---|---|
| ARC-01 | Componentes gigantes com estado, markup e regras misturados | `LandingPage` 1 923; `CustomerViews` 1 749; `OnboardingAndAuth` 1 341 | Difícil testar, revisar e corrigir |
| ARC-02 | Sem error boundary nem estados de carregamento | `main.tsx`; `App.tsx` | Ecrã branco; erros silenciosos |
| ARC-03 | Sem code splitting; um bundle único | `vite.config.ts`; build 698 kB | Arranque lento em rede móvel |
| ARC-04 | Sem lint/format/CI; nenhum `.github/workflows` | `find .github` vazio | Regressões entram sem barreira |
| ARC-05 | Dependência `react-router-dom` usada apenas para um `BrowserRouter` sem `Routes`; vulnerabilidade moderada | `npm audit`; `grep Routes` = 0 | Dívida e superfície |
| ARC-06 | `zustand`, `@supabase/supabase-js`, `motion` usados sobretudo no lado morto | `package.json`; imports | Peso e confusão |
| ARC-07 | Duas camadas de CSS/design (navy/laranja vs papel/argila; Bricolage vs DM Sans) | `index.css`; `tailwind.config.js`; `index.html` | Interface incoerente |
| ARC-08 | DM Sans é a fonte definida em `--font-sans`, mas **não é carregada** | `index.css:8`; `tailwind.config.js:144`; `index.html:16` (carrega Inter) | Texto renderiza com fallback; design inconsistente |
| ARC-09 | `PROJECT_STATE`, README e docs desatualizados | ver P0-14 | Decisões erradas |
| ARC-10 | Migrações Supabase nunca executadas; adaptador nunca testado | `supabase/migrations/*`; `docs` | «Modo partilhado» teórico |
| ARC-11 | `data/salu.db*` no Git | `git ls-files data` | PII e credenciais |
| ARC-12 | `netlify.toml` não tem funções/proxy nem headers de segurança | `netlify.toml` | `/api` devolve HTML; falta CSP/HSTS |
| ARC-13 | Sem analytics/consentimento; métrica do README não é medida | `src` | Não se sabe se o produto funciona |
| ARC-14 | Sem `robots.txt`, `sitemap.xml`, OG/Twitter, manifest | `public/`; `index.html` | SEO/partilha fracos |
| ARC-15 | Backend SQLite não sobrevive a deploy serverless | `server/db.ts`; Netlify | Dados perdidos ou ausentes |

---

## 7. Segurança — achados detalhados

> Isto é uma revisão estática, não um teste de penetração. Os achados são suficientes para **não expor o backend publicamente**.

| ID | Severidade | Achado | Evidência | Cenário de abuso | Correção |
|---|---|---|---|---|---|
| SEC-01 | Crítica | **Sem autenticação/autorização efetiva na API.** `user_id`, `sender_id`, `provider_id` vêm do corpo. | `server/api.ts:20-52, 202-260, 459-493` | Qualquer pessoa cria pedidos/propostas/mensagens em nome de outra | Sessão assinada; autorização por recurso; nunca confiar no cliente |
| SEC-02 | Crítica | **`/auth/google` é um mock de tomada de conta.** Devolve o utilizador existente com o e-mail enviado, sem validar token OAuth. | `server/api.ts:85-116`; `OnboardingAndAuth.tsx:133-146` | Enviar `helena@salu.ao` e entrar como Helena | OAuth real com verificação de `id_token`; remover mock |
| SEC-03 | Crítica | **Mensagens privadas acessíveis sem `requester_id`.** | `server/api.ts:421-457` | `GET /api/conversations/conv-1/messages` sem parâmetro devolve tudo | Exigir sessão e participação; negar por omissão |
| SEC-04 | Crítica | **Aceitar proposta e libertar escrow sem autorização.** | `server/api.ts:321-368` | Aceitar qualquer proposta; marcar qualquer acordo como pago | Autorização por parte; idempotência; auditoria |
| SEC-05 | Alta | **Upload sem tipo/tamanho/conteúdo validado e servido do mesmo domínio.** | `server/api.ts:495-513`; `server/index.ts:18` | Enviar SVG/HTML com JavaScript e obter XSS armazenado | Storage separado; MIME real; antivírus; CSP; `Content-Disposition` |
| SEC-06 | Alta | **CORS `*` e corpo JSON de 20 MB.** | `server/index.ts:12-14` | Chamadas de qualquer origem; DoS por payload | Allowlist de origens; limite por rota; rate limit |
| SEC-07 | Alta | **Password padrão `salu1234` em todas as contas semeadas.** | `server/db.ts:237` | Login em contas de demonstração; reutilização | Remover seeds de produção; passwords aleatórias; forçar reset |
| SEC-08 | Alta | **Endpoints de bots sem auth.** | `server/api.ts:521-560` | Acionar criação massiva de dados falsos | Remover; se necessário, admin autenticado |
| SEC-09 | Alta | **Base de dados e WAL commitados com PII/hashes.** | `data/salu.db*` | Exposição de telefones, nomes, hashes | Remover do Git/histórico; rodar segredos; `.gitignore` |
| SEC-10 | Média | **Registo permite enumerar contas e não tem rate limit.** | `server/api.ts:26-28` | Descobrir e-mails/telefones; spam | Rate limit, CAPTCHA, resposta genérica |
| SEC-11 | Média | **Sem headers de segurança/CSP no Netlify.** | `netlify.toml`; sem `_headers` | XSS/clickjacking; falta HSTS | `_headers` com CSP, HSTS, `X-Frame-Options`, `Referrer-Policy` |
| SEC-12 | Média | **Dados pessoais sem política, consentimento, retenção ou eliminação.** | `src`; sem páginas legais | Risco de compliance (Lei 22/11) | Privacidade, consentimento, retenção, DSAR |
| SEC-13 | Média | **Telefones de prestadores expostos publicamente sem controlo.** | `server/api.ts:120-150`; `saluData.ts` | Scraping e assédio | Contacto mediado; opt-in; ofuscar |
| SEC-14 | Baixa | **Logs com detalhes de erro internos devolvidos ao cliente.** | `server/api.ts` (muitos `err.message`) | Divulgação de detalhes | Mensagem genérica + log interno |
| SEC-15 | Baixa | **`react-router` vulnerável (moderado).** | `npm audit` | Open redirect/SSR injection | Atualizar quando houver router real |

---

## 8. Localização — a divisão administrativa correta

### 8.1 Facto externo verificado

A Lei n.º 14/24, de 5 de setembro, e o Censo 2024 (INE) estabelecem a província de Luanda com **16 municípios**:

> Ingombota, Cacuaco, Cazenga, Viana, Belas, Kilamba Kiaxi, Talatona, Mussulo, Sambizanga, Rangel, Maianga, Samba, **Camama**, **Mulenvos**, **Kilamba** e **Hoji ya Henda**.

A nova província de **Icolo e Bengo** (sede em Catete) tem 7 municípios: **Icolo e Bengo, Quiçama, Calumbo, Cabiri, Cabo Ledo, Bom Jesus e Sequele**. Icolo e Bengo e Quiçama **já não pertencem a Luanda**.

Fontes:
- INE, *Resultados Definitivos do RGPH 2024 — Província de Luanda*: <https://censo2024.ine.gov.ao/LUANDA.pdf>
- Decreto Presidencial n.º 270/24 — Classificação dos Municípios: <https://www.angolex.com/paginas/decreto-presidencial/classificacao-dos-municipios-270a-24a.html>
- ANGOP, «Luanda celebra 449 anos com nova divisão político-administrativa»: <https://angop.ao/noticias/sociedade/luanda-celebra-449-anos-com-nova-divisao-politica-e-administrativa/>

### 8.2 O que o código faz mal

| ID | Erro | Onde | Correção |
|---|---|---|---|
| GEO-01 | Camama ausente da lista do domínio | `domain/types.ts:26-36` | Incluir Camama como município |
| GEO-02 | Camama ausente do wizard e do backend | `InteractiveOnboardingWizard.tsx:34-46`; `server/db.ts` | Usar fonte única |
| GEO-03 | Icolo e Bengo e Quiçama tratados como Luanda | `saluData.ts:40-41` | Mover para a província Icolo e Bengo |
| GEO-04 | «Maianga/Ingombota» como um só | `saluData.ts:38` | Separar: Maianga e Ingombota são municípios distintos |
| GEO-05 | «Benguela & Lobito» como um só | wizard; marquee | Separar; província Benguela |
| GEO-06 | «Kilamba» e «Kilamba Kiaxi» confundidos | listas | São municípios distintos |
| GEO-07 | Localização como string única | `municipality: 'Talatona, Luanda'` | Modelo hierárquico com ids |
| GEO-08 | Geolocalização por latitude | `LandingPage.tsx:118-140` | Não inferir; pedir seleção; usar geocoding real ou coordenadas |
| GEO-09 | `Camama` não aparece em filtros/pesquisa | `domain/filtros.ts`; `CustomerViews.tsx:1349` | Indexar por ids, não por nomes |
| GEO-10 | «Província» e «município» misturados na mesma UI | `LandingPage.tsx:775-791`; `AppShell.tsx:364` | Dois selects: província → município |

### 8.3 Modelo recomendado

```text
provincia (id, nome)
  municipio (id, provincia_id, nome)
    comuna (id, municipio_id, nome)
      bairro/zona (id, comuna_id, nome, opcional)
```

- Perfil: `municipio_base_id` + `municipios_atuacao[]` + raio opcional.
- Pedido: `municipio_id` + `bairro_texto` (opcional) + geolocalização só com consentimento.
- Pesquisa: por ids; «perto de mim» é distância aproximada, não uma string.
- Dados versionados com fonte e data; um teste valida que todos os ids usados existem.

---

## 9. Personas e jornadas reais

> As personas foram reconstruídas a partir dos relatos do dono e confrontadas com o código. Alguns sintomas não existem neste commit (provável deploy antigo); estão marcados.

### 9.1 Guterres Nogueira, 21 anos, angolano

| Passo | O que ele faz | O que acontece | Veredicto |
|---|---|---|---|
| 1 | Abre a landing | Vê 8 secções, 54 ações, 4.9/4.8/100%, testemunhos e perfis | **Sobrecarga + provas falsas** |
| 2 | «Não sei o que fazer agora» | Não há um CTA único; «Criar conta», «Explorar», «Preciso de serviço», «Quero prestar» competem | **Contra-intuitivo confirmado** |
| 3 | «Já criei conta?» | Clicar em «Preciso de um serviço» abre o wizard sem conta; saltar leva ao painel | **Confirmado** |
| 4 | Vai ao perfil | Vê `Edmundo Bunga` (ou `Helena` em build antigo) com 7 serviços, selo verificado e 97/95/96 | **Identidade herdada confirmada** |
| 5 | «Todo o trabalho parece meu e não é» | «Meus Pedidos» mostra todos os pedidos do seed | **Confirmado** |
| 6 | «Porque pergunta se quero prestar ou contratar?» | Role na landing, wizard, header e definições | **Confirmado** |
| 7 | «Quero prestar serviço, mas não sei como» | Preenche perfil; ele nunca é publicado; não aparece na descoberta | **Confirmado** |
| 8 | Tenta anexar foto | Chat inventa `Foto_Referencia_Ambito.jpg`; pedido só aceita legenda | **Confirmado** |
| 9 | Publica um pedido e entra noutra conta | Não vê nada; no Netlify, nem o próprio pedido sobrevive ao reload | **Confirmado** |
| 10 | Sem conta, abre abas internas | `/mensagens`, `/pedidos`, `/painel` abrem | **Confirmado** |
| 11 | Notificações | 5 notificações de seed, com propostas e disputas que ele nunca teve | **Confirmado** |

**Nota global: 1,5/5.** A interface é bonita; o produto não guia, não é honesto e não fecha ciclos.

### 9.2 Augusto Bunga, ~31 anos, supervisor

| Passo | O que ele diz | Evidência | Veredicto |
|---|---|---|---|
| 1 | «Tanta informação que não consigo ler» | Landing 1 923 linhas, 8 secções; dashboard com muitos cartões | **Confirmado** |
| 2 | «Botões levam a lugares onde não devia entrar» | Sem guarda de conta; CTA de role; links para o painel | **Confirmado** |
| 3 | «Entrar com Google cria conta automática com avaliações» | `/auth/google` cria utilizador com `verified=1`, `rating=5.0`; não é OAuth | **Confirmado na arquitetura**; o caso exato «Helena» não se reproduz neste commit |
| 4 | «O site já dá avaliações que não existem» | 4.9/4.8/100%, 97/95/96/94, 5.0 | **Confirmado** |

**Nota global: 1,5/5.**

### 9.3 Edmundo, dono

| Preocupação | Realidade no commit | Ação |
|---|---|---|
| Netlify não funciona como queria | O build é estático; `/api` não existe; imagens 404; links profundos caem na landing | Não é o Netlify; é a arquitetura |
| Primeira vista deve explicar o produto | Explica, mas com informação a mais e provas falsas | Cortar para 5 blocos e remover números |
| «300 profissionais / 4.000 pedidos / 95%» | **Não existem neste commit**; o deploy pode estar antigo | Confirmar hash do deploy; remover resíduos 4.9/4.8/100% |
| Uma conta, dois caminhos | Existe a ideia, mas o modo está no header e não é persistido | Mover para definições; onboarding |
| Nome errado | Default `Edmundo Bunga`; perfil da Helena | Corrigir identidade (P0-01/02) |
| Preço negociado em privado | A UI diz isso, mas o acordo é unilateral e tem prazo fixo | Acordo bilateral real |
| Pagamento mediado | Escrow fictício no backend | Remover promessa até haver parceiro |
| Localização real (Camama) | Listas erradas | Corrigir geo (P0-11) |
| Anti-curioso | Inexistente | Níveis de confiança + verificação |
| «Não inventar números» | Viola em toda a UI e no servidor | Remover e criar testes |

### 9.4 Bot / atacante

| Ação | Resultado | Gravidade |
|---|---|---|
| Abrir `/painel`, `/mensagens`, `/pedidos` sem conta | Acesso total | Crítica |
| `POST /api/auth/google` com e-mail de outra pessoa | Entra como ela | Crítica |
| `GET /api/conversations/conv-1/messages` sem `requester_id` | Lê conversa privada | Crítica |
| `POST /api/proposals/:id/accept` | Aceita proposta alheia | Crítica |
| `POST /api/agreements/:id/release-escrow` | Marca pagamento como libertado | Crítica |
| `POST /api/upload` com SVG/HTML | XSS armazenado | Alta |
| `POST /api/bots/trigger-now` | Cria atividade falsa | Alta |
| Ler `data/salu.db` no Git | Telefones, nomes, hashes | Alta |
| Enumerar `/api/register` | Descobre contas | Média |
| Scraping de `/api/providers` | Telefones | Média |

**Conclusão:** o backend não pode ser exposto na internet no estado atual.

### 9.5 Prestador honesto

| Passo | Realidade |
|---|---|
| Cria conta | Fallback local; sem verificação |
| Preenche perfil | 16 campos; guarda num draft; não publica |
| Procura pedidos | Vê pedidos de seed; não os de clientes reais |
| Envia proposta | Fica local; o cliente não a vê; reload apaga |
| Negocia | Chat de seed; anexo falso; sem sala real |
| Fecha acordo | Unilateral; sem contraparte |
| Executa e conclui | Pode confirmar os dois lados |
| Recebe | Nada; não há pagamento |
| Reputação | 5.0 fixo se houver trabalho concluído |

**Nota: 0,5/5** para o ciclo real. A UI promete; o sistema não entrega.

### 9.6 Cliente

| Passo | Realidade |
|---|---|
| Procura profissional | 4 perfis de exemplo; sem fotos em produção |
| Publica pedido | Fica em memória; desaparece ao recarregar no Netlify |
| Anexa foto | Não consegue |
| Recebe propostas | Não recebe de outros utilizadores |
| Compara | Vê propostas de seed |
| Nega/aceita | Aceita; cria acordo unilateral |
| Confirma conclusão | Pode confirmar sozinho |
| Avalia | Pode avaliar qualquer pedido concluído, inclusive a si próprio |

**Nota: 1/5.**

### 9.7 Tabela de reclamações → veredicto

| # | Reclamação | Veredicto | Evidência |
|---|---|---|---|
| 1 | Não é intuitivo; não sei o que fazer | **Confirmado** | 8 secções, 54 ações, CTA concorrentes |
| 2 | Não sei se criei conta | **Confirmado** | Auth opcional; fallback local |
| 3 | Meu nome é Helena / não é o meu | **Confirmado estruturalmente** | `customers[0]` + `userName`; default Edmundo |
| 4 | Todo o trabalho parece meu e não é | **Confirmado** | Dashboard usa todos os pedidos |
| 5 | Pergunta cliente/prestador na entrada | **Confirmado** | Landing, wizard, header, definições |
| 6 | Não entendo como prestar serviço | **Confirmado** | Perfil não publicado |
| 7 | Foto anexada sem foto | **Confirmado** | Nome de ficheiro inventado |
| 8 | Pedido não aparece noutra conta | **Confirmado** | Estado local; sem backend no Netlify |
| 9 | Quem não criou conta entra em abas | **Confirmado** | Sem guardas |
| 10 | Informação interna antes do login | **Confirmado** | Landing com pedidos/perfis/avaliações |
| 11 | Troca de modo devia estar nas configurações | **Confirmado** | Header + settings |
| 12 | Clicar num anúncio leva a prestador | **Confirmado** | `onQuickExplore` altera `activeRole` |
| 13 | Notificações espontâneas | **Confirmado** | Seed + push local |
| 14 | Google cria conta automática com avaliações | **Parcial** | Mock OAuth + `rating=5.0`; caso «Helena» não reproduzido |
| 15 | Site já dá avaliações que não existem | **Confirmado** | 4.9/4.8/100%, 97/95/96/94, 5.0 |
| 16 | Demasiada informação para supervisor | **Confirmado** | Landing/dashboards densos |
| 17 | Formulários tudo de uma vez | **Confirmado** | 16 campos no perfil |
| 18 | Site nega fotografias | **Confirmado** | Nenhum input file ativo |
| 19 | Não há conversa entre utilizadores | **Confirmado** | Dados locais; sem realtime |
| 20 | Netlify não funciona como queria | **Confirmado** | `/api` inexistente; imagens 404; links |
| 21 | 300 profissionais / 4.000 pedidos / 95% | **Não encontrado neste commit** | Deploy antigo provável |
| 22 | Camama é município, não Talatona | **Confirmado** | Camama ausente nas listas |
| 23 | Preço final negociado, não imposto | **Parcial** | Acordo unilateral com prazo/preço fixos |
| 24 | Não pode autoavaliar | **Confirmado** | Sem validação de autor/alvo |
| 25 | Avaliação diferente para cliente e prestador | **Parcial** | Mesmas 3 dimensões para ambos |
| 26 | Tudo em PT ou tudo em EN | **Confirmado** | Dados/estados em EN |
| 27 | Localização/tema não precisam de estar no topo | **Confirmado** | Header sobrecarregado |
| 28 | Perfil deve expandir/recolher | **Não implementado** | Header fixo |

---

## 10. Matriz de fluxos — o que funciona, o que é demo, o que está quebrado

| # | Fluxo | Estado real | Evidência | Mínimo para P1 |
|---|---|---|---|---|
| F01 | Abrir a landing | Funciona visualmente; provas falsas | Landing | Remover números; reduzir secções |
| F02 | Criar conta | **Fingido**; sem sessão; fallback local | Auth + `/api` | Auth real |
| F03 | Entrar | **Fingido**; qualquer credencial no Netlify | Auth fallback | Auth real |
| F04 | Recuperar password | **Fingido** (mensagem) | `AuthScreen:390-400` | Implementar ou remover |
| F05 | Onboarding | Existe, mas sem conta e com role forçado | Wizard | Pós-auth; intenção |
| F06 | Criar perfil de prestador | **Não publica** | `providerDraft` | Persistir + publicar |
| F07 | Descobrir profissionais | Só 4 exemplos | `INITIAL_PROFESSIONALS` | Dados reais |
| F08 | Filtrar/pesquisar | Funciona sobre exemplos; taxonomias erradas | Discovery | Fonte única |
| F09 | Publicar pedido | Local; desaparece; foto falsa | `handleCreateRequest` | Persistir + upload |
| F10 | Ver pedido | Funciona no browser que o criou; expõe todos | `WorkflowViews` | Autorização |
| F11 | Enviar proposta | Local; não chega ao cliente | `handleSubmitProposal` | API + notificação |
| F12 | Aceitar/recusar proposta | Unilateral; sem contraproposta | `handleAcceptProposal` | Bilateral |
| F13 | Negociar (chat) | Conversas de seed; anexo falso | `MessagingView` | Sala real |
| F14 | Acordo | Unilateral; prazo fixo | `Agreement` | Persistido + 2 aceitações |
| F15 | Execução | Estado muda localmente | `handleStartWork` | Persistir + partes |
| F16 | Conclusão | Um utilizador confirma os dois lados | `handleMarkComplete` | Prova + confirmação |
| F17 | Avaliação | Qualquer pedido; autoavaliação | Reviews | Regras |
| F18 | Notificações | Seed + local | `INITIAL_NOTIFICATIONS` | Eventos reais |
| F19 | Segurança/denúncia | Local; sem destino | `SafetyAndModeration` | Backend + SLA |
| F20 | Definições | Não persistem | `AccountSettings` | Persistir |
| F21 | Planos | Inexistente | `/planos` morto | Página real ou remover |
| F22 | Ajuda/contacto | Inexistente | `/interno` morto | Central de ajuda |
| F23 | Partilhar perfil/pedido | Link cai na landing | Router | Rotas reais |
| F24 | Recarregar | Perde tudo menos o nome default | Estado React | Persistência |
| F25 | Duas pessoas | Não existe | Sem backend/sync | E2E de 2 browsers |

---

## 11. Conformidade com a diretiva do dono

> Base: documento «SALU — DIRETRIZ CENTRAL…» e as quatro decisões adicionais.

| Secção | Tema | Estado | Lacuna principal |
|---|---|---|---|
| 1 | Compreender o produto antes de implementar | **FALHA** | Docs contradizem o código; três gerações |
| 2 | Identidade e proposta de valor | **PARCIAL** | Direção certa, provas falsas |
| 3 | Landing page | **FALHA** | Sobrecarga, números inventados, info interna |
| 4 | Navegação e organização | **FALHA** | Header sobrecarregado; links mortos; sem ajuda |
| 5 | Localização real de Angola | **FALHA** | Camama e 9 municípios ausentes; províncias erradas |
| 6 | Uma conta, várias possibilidades | **PARCIAL** | Ideia existe; role em 4 sítios; sem conta real |
| 7 | Primeira configuração | **PARCIAL** | Wizard antes de auth; sem explicações |
| 8 | Perfil profissional | **FALHA** | 16 campos, sem upload, não publica |
| 9 | Verificação e segurança | **FALHA** | Selo sem verificação; sem níveis |
| 10 | Descoberta e recomendações | **FALHA** | Só exemplos; sem algoritmo real |
| 11 | Pedidos e propostas | **PARCIAL** | Formulários existem; não se propagam |
| 12 | Sala SALU | **FALHA** | Chat local; anexo falso; sem acordo bilateral |
| 13 | Pagamentos | **FALHA** | Escrow fictício; promessa legalmente perigosa |
| 14 | Execução e conclusão | **PARCIAL** | Estados existem; confirmação unilateral |
| 15 | Avaliação e reputação | **FALHA** | Autoavaliação; dados fixos |
| 16 | Prevenção de abuso | **FALHA** | Sem verificação, limites, moderação |
| 17 | Dashboard e dados reais | **FALHA** | Todos os pedidos; métricas fixas |
| 18 | Notificações e orientação | **FALHA** | Seed; sem destino fiável |
| 19 | Idiomas consistentes | **FALHA** | PT/EN misturado; sem persistência |
| 20 | Perfil público | **PARCIAL** | Só exemplos; próprio perfil não publica |
| 21 | Modelo de negócio e planos | **FALHA** | Inexistente na app ativa |
| 22 | Design e qualidade de interface | **PARCIAL** | Bonito, mas denso, inconsistente, inacessível |
| 23 | Regras de implementação | **FALHA** | Dados inventados, integrações simuladas |
| 24 | Trabalhar por etapas | **FALHA** | Não houve auditoria antes; docs dizem concluído |
| 25 | Princípio final | **FALHA** | Declarações sem verificação de comportamento |
| D1 | Níveis de confiança separados | **FALHA** | Um selo binário |
| D2 | Pagamento protegido com estrutura real | **FALHA** | Não existe parceiro/ledger |
| D3 | Confiança progressiva anti-curioso | **FALHA** | Não existe |
| D4 | Sala SALU como coração | **FALHA** | Não existe entre duas pessoas |

**Resultado:** 0 secções plenamente cumpridas; 7 parciais; 18 falhas. Isto não é um juízo sobre a visão — é sobre a distância entre a visão e o que está montado.

---

## 12. Netlify e deploy — diagnóstico específico

### 12.1 O que o Netlify faz bem

- `netlify.toml` tem `command = "npm run build"`, `publish = "dist"` e rewrite SPA — correto.
- `npm run build` passa (`tsc --noEmit` + Vite).
- `public/_redirects` duplica a regra SPA — redundante, mas não prejudica.
- O site abre; a landing renderiza.

### 12.2 O que o Netlify não pode resolver sem arquitetura

| Problema | Causa | Correção |
|---|---|---|
| Registo/login que não criam conta | `/api/*` é reescrito para `index.html`; o cliente cai no fallback | Função Netlify ou API externa + auth real |
| Pedidos que desaparecem ao recarregar | Estado React; sem persistência | Base de dados |
| Propostas/mensagens que não chegam | Sem backend/sync | API + realtime |
| Fotos 404 | `/src/assets` não é publicado | Importar imagens ou `public/` |
| Links de perfil/pedido caem na landing | Parser de rotas exato | React Router |
| Backend Express/SQLite | Netlify é serverless/efémero | Postgres/Supabase; funções stateless |
| `data/salu.db` | Não é usado no deploy | Remover do deploy/Git |
| Sem headers de segurança | `netlify.toml` incompleto | `_headers` + CSP |
| Deploy possivelmente antigo | «300 profissionais/4.000» não existe no commit | Confirmar «Deploys → commit» no Netlify |

### 12.3 Checklist de deploy (depois das correções)

- [ ] Confirmar no Netlify o commit publicado (`602538e` ou posterior).
- [ ] `npm run build` e `npm test` verdes no CI, não só localmente.
- [ ] `dist` contém todas as imagens (verificar `find dist -name '*.jpg'`).
- [ ] Abrir `/perfil/<id>` diretamente e recarregar: mostra o perfil, não a landing.
- [ ] Abrir `/pedidos/<id>` diretamente e recarregar: mostra o pedido.
- [ ] Registar em dois browsers; confirmar que cada um vê a sua conta.
- [ ] Publicar pedido no browser A; ver no browser B.
- [ ] Enviar proposta no browser B; ver no browser A.
- [ ] Enviar mensagem e anexo; ver no outro lado.
- [ ] Confirmar que `/api/auth/google` devolve 404/erro, não conta.
- [ ] Confirmar que `/api/upload` exige auth e valida tipo.
- [ ] Verificar CSP/HSTS; sem erros na consola.
- [ ] Testar em telemóvel físico (375 px, 4G throttled).
- [ ] Confirmar que o modo demo está claramente marcado.

---

## 13. O que está bom e deve ser preservado

Não se deve apagar o que tem valor:

1. **A ambição visual e a identidade.** A landing tem direção de arte, paleta navy/laranja, fotografia de Luanda e tipografia com personalidade. É uma base estética melhor do que a média dos protótipos.
2. **A narrativa de dois lados.** A ideia «quem precisa encontra quem sabe» está clara; as secções «Para clientes» / «Para prestadores» são boas.
3. **A Sala SALU como conceito.** É o coração certo do produto; falta implementá-la.
4. **A avaliação em três dimensões.** `domain/reputacao.ts` e `AvaliacaoForm.tsx` são a versão correta; devem ser recuperados.
5. **Os tipos de prestador** (individual, pequeno negócio, empresa) e a experiência opcional são boas decisões.
6. **A camada v2** (`domain`, `data`, `state`, `pages`) tem regras, validação, testes e estados vazios honestos. É o único esqueleto coerente; deve ser a base, não o v2 a ser apagado.
7. **A intenção bilingue** é válida; falta execução.
8. **A honestidade do README antigo** («sem autenticação», «sem pagamentos», «sem dados inventados») é o tom certo — mas contradiz o código. Recuperar essa honestidade no produto.
9. **Os testes de domínio** são úteis; devem ser estendidos ao código ativo, não descartados.
10. **A preocupação com segurança/mediação** do dono é correta; deve virar requisitos, não promessas.

---

## 14. O que fazer — decisão, sequência e âmbito

### 14.1 Duas opções reais (não se pode ter as duas ao mesmo tempo)

**Opção A — «Demo honesta» para 28/11 (recomendada para o concurso)**
- Duração: 5–7 dias.
- Âmbito: uma landing curta, um percurso de demonstração explícito, dados de exemplo marcados, sem promessas de pagamento/verificação, sem multi-utilizador.
- Objetivo: mostrar a visão e a qualidade de execução sem mentir.
- O que não entra: auth real, pagamentos, verificação oficial, chat entre duas pessoas, Supabase.

**Opção B — «MVP real» (o que a diretiva pede)**
- Duração: 6–10 semanas.
- Âmbito: uma conta real, base de dados, perfis, pedidos, propostas, Sala, acordos, conclusão, avaliações, notificações, verificação por níveis, moderação.
- O que não entra em 7 dias: pagamentos mediados, integração oficial de identidade, OAuth Apple/Google completo, anti-fraude maduro.
- Objetivo: produto coerente; sem pressa de concurso.

> **Recomendação:** fazer A agora, com a arquitetura de B por baixo (uma app, um modelo, uma fonte de verdade), e não tentar fingir B em 7 dias. A pior opção é a atual: parece B, mas é A sem o dizer.

### 14.2 Plano de 7 dias para a Opção A (demonstração honesta)

**Dia 0 — Decisões (hoje)**
- Escolher A ou B; congelar funcionalidades.
- Nome da demo; banner «Demonstração».
- Lista de promessas a remover: pagamento seguro, escrow, verificado, 4.9/4.8/100%, 10 estados, «em direto», «assinado».
- Confirmar o commit que está no Netlify.

**Dia 1 — Cirurgia de honestidade**
- Remover todos os números/selos fictícios e o `rating=5.0`/`verified=1` do registo.
- Substituir testemunhos por «Exemplo».
- Remover botões Google/Apple ou rotulá-los «Demonstração».
- Remover escrow do backend ou desativar endpoints.
- Banner de demo global.

**Dia 2 — Identidade e entrada**
- Uma única entrada: landing → «Entrar na demonstração» (nome) ou «Criar conta» (se auth real).
- Remover `customers[0]`/Helena; perfil do visitante com zeros.
- Guardar nome; não usar `Edmundo Bunga` como default.
- Esconder abas internas atrás da entrada de demonstração.
- Remover role do header; modo nas definições.

**Dia 3 — Um percurso completo, local e persistente**
- Escolher um só percurso (ex.: cliente publica pedido → prestador vê → propõe → chat → aceita → conclui → avalia), tudo em `localStorage` ou backend local, com dados marcados como demo.
- Fotos reais no pedido/perfil (data URL comprimido).
- Anexo real no chat.
- Testar reload: os dados ficam.

**Dia 4 — Produção**
- Corrigir imagens (`import`/`public`), router, links, 404, 404 de perfil.
- Remover 70% da landing; manter 5 blocos.
- Testar no Netlify em dois browsers.
- Escrever o guião de 2 minutos.

**Dia 5 — Buffer e ensaio**
- Teste em telemóvel físico.
- Corrigir o que falhar.
- Gravar vídeo de reserva.

**Dias 6–7 — Não acrescentar nada.** Só estabilizar.

### 14.3 Plano de 6–8 semanas para a Opção B (MVP real)

| Semana | Entrega | Critério de saída |
|---|---|---|
| 1 | Uma app, um modelo, auth, CI, geo 2024, remoção de código morto | Registo/login/logout; rotas guardadas; build/test/CI; 16 municípios |
| 2 | Perfis e descoberta | Prestador publica; cliente encontra noutro browser; fotos |
| 3 | Pedidos e propostas | Pedido persiste; propostas chegam; notificações |
| 4 | Sala SALU | Conversa real, anexos, histórico, propostas, acordo bilateral |
| 5 | Execução, conclusão, avaliações | Prova, confirmação, disputa, reputação calculada |
| 6 | Confiança e moderação | Níveis, verificação, denúncias, limites, políticas |
| 7 | Pagamentos (se parceiro) | Contrato, KYC, ledger, reembolso, disputa; ou manter fora |
| 8 | Hardening | E2E 2 browsers, a11y, performance, segurança, docs, deploy |

### 14.4 «Stop doing» imediato

- Não acrescentar animações, secções ou ecrãs.
- Não acrescentar números, testemunhos ou nomes de pessoas.
- Não usar «verificado», «seguro», «garantido», «assinado», «escrow» sem prova.
- Não usar OAuth falso.
- Não usar bots.
- Não manter duas cópias da app.
- Não declarar uma funcionalidade concluída sem teste de duas pessoas.
- Não usar `localStorage` como base de dados de produção.
- Não expor o backend atual.

### 14.5 Definição de «pronto» (gates)

Uma funcionalidade só conta como pronta se:

1. Tem dados reais ou estado vazio explícito.
2. Persiste e sobrevive a reload.
3. Funciona para duas contas distintas.
4. Tem autorização no servidor, não só na UI.
5. Tem validação e mensagens de erro em PT e EN.
6. Tem estados de loading/erro/vazio.
7. Tem teste automatizado (unitário + e2e quando aplicável).
8. Tem link profundo e botão de voltar.
9. Tem acessibilidade básica (teclado, labels, contraste, 44 px).
10. Não contradiz nenhuma outra regra do produto.

---

## 15. Decisões que só o dono pode tomar

| # | Decisão | Opções | Recomendação |
|---|---|---|---|
| D1 | Âmbito para 28/11 | Demo honesta vs MVP real | Demo honesta agora; MVP depois |
| D2 | Fonte de dados | Supabase vs API própria vs local demo | Supabase/Postgres com RLS para o MVP; local só para demo |
| D3 | Autenticação | Supabase Auth vs Auth.js vs própria | Supabase Auth (já há migrações) ou Auth.js; nunca mock |
| D4 | Pagamentos | Fora de âmbito vs parceiro | Fora até haver parceiro licenciado; remover promessas |
| D5 | Verificação de identidade | Manual vs integração oficial | Manual com consentimento; não afirmar integração com o Governo |
| D6 | Moderação | Interna vs externa | Interna com fila, SLA e auditoria |
| D7 | Idiomas | PT + EN completo vs só PT | PT agora; EN só com tradução completa e testada |
| D8 | Geo | 16 municípios de Luanda + outras províncias | Fonte única versionada; Camama incluída |
| D9 | Modelo de negócio | Grátis vs SaaS vs taxa | Não inventar preços; estudar depois do piloto |
| D10 | Código v2 | Recuperar vs apagar | Recuperar o domínio/testes; apagar o que duplica |

---

## 16. Anexos

### Anexo A — Índice de evidência (ficheiro:linha)

| Tema | Ficheiro:linha |
|---|---|
| Rotas exatas / sem guarda | `src/App.tsx:70-84`, `:118-150`, `:671-747` |
| Nome default / user id | `src/App.tsx:92-93` |
| Perfil com dados da Helena | `src/App.tsx:874-879`; `src/data/saluData.ts:333-352` |
| Estado em memória | `src/App.tsx:98-108` |
| Única leitura de pedidos | `src/App.tsx:155-205` |
| Escrita silenciosa | `src/App.tsx:355-366`, `:418-432`, `:465-490` |
| Acordo unilateral | `src/App.tsx:473-531`, `:561-610` |
| Conclusão unilateral | `src/App.tsx:620-663` |
| Avaliação sem regras | `src/App.tsx:1024-1035`; `src/components/EcosystemViews.tsx:54-77` |
| Prestador não publica | `src/App.tsx:862-869`; `src/components/CustomerViews.tsx:1349` |
| Perfil: 16 campos / validação | `src/components/OnboardingAndAuth.tsx:818-832`, `:870-875` |
| Auth fallback | `src/components/OnboardingAndAuth.tsx:103-146` |
| Google/Apple mock | `src/components/OnboardingAndAuth.tsx:133-146`, `:441-460`; `server/api.ts:85-116` |
| Anexo falso no chat | `src/components/MessagingView.tsx:236-256` |
| Fotos como legendas | `src/components/CustomerViews.tsx:1030-1033`, `:1230-1270` |
| Único input file (morto) | `src/components/SeletorFoto.tsx:79` |
| Métricas fixas | `LandingPage.tsx:1655-1683`; `CustomerViews.tsx:246`; `ProviderViews.tsx:182,384,464`; `EcosystemViews.tsx:102-118` |
| Verificação automática | `server/api.ts:36-38`, `:95-116` |
| Escrow | `server/api.ts:302-368` |
| Upload inseguro | `server/api.ts:495-513`; `server/index.ts:12-18` |
| Bots | `server/index.ts:36`; `server/db.ts:385-386`; `server/bots.ts:67-150` |
| Password padrão | `server/db.ts:237` |
| DB no Git | `data/salu.db`, `salu.db-shm`, `salu.db-wal` |
| Imagens quebradas | 22 ocorrências `/src/assets`; build sem imagens |
| Fontes | `index.html:13-16`; `src/index.css:8`; `tailwind.config.js:142-145` |
| Geo | `saluData.ts:30-51`; `domain/types.ts:26-36`; `InteractiveOnboardingWizard.tsx:34-46`; `LandingPage.tsx:81-92` |
| Testes mortos | `tests/*.test.ts` importam `src/domain`, `src/data`, `src/state` |
| Docs contraditórias | `README.md`; `PROJECT_STATE.md`; `docs/ARQUITECTURA.md`; `docs/DEPLOY.md` |

### Anexo B — Comandos de reprodução

```bash
# 1. Instalar e construir
npm ci
npm run build
npm test

# 2. Verificar imagens no build
find dist -type f | sort
grep -rn '/src/assets' src | wc -l

# 3. Servir o build e testar links/imagens
cd dist && python3 -m http.server 4174
curl -I http://127.0.0.1:4174/src/assets/images/pro_mateus_electrician_1795204346516.jpg
curl -I http://127.0.0.1:4174/pedidos/req-101

# 4. Verificar código morto (script)
node /tmp/dead.mjs   # ver relatório; 37 ficheiros, 5601 linhas

# 5. Verificar métricas
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | tail -1
grep -c "onClick=" src/components/LandingPage.tsx
grep -rn 'type="file"' src
```

### Anexo C — Guião de teste manual com dois browsers

**Preparação:** browser A normal; browser B em janela privada; backend local ou Supabase de teste; dados limpos.

1. **Sem conta:** abrir `/painel`, `/mensagens`, `/pedidos` → deve pedir login (hoje abre).
2. **Registo A:** criar conta com nome/e-mail; confirmar nome no perfil; `completedRequests: 0`, sem selo.
3. **Registo B:** criar conta com outro nome; confirmar que não vê os dados de A.
4. **Perfil A (prestador):** preencher, carregar foto, publicar; abrir o link público em B.
5. **Pedido B (cliente):** publicar com foto; recarregar; continua; A vê no mural.
6. **Proposta A:** enviar; B vê a proposta e a notificação.
7. **Chat:** A e B trocam mensagens e um anexo; ambos veem; reload mantém.
8. **Acordo:** B aceita; A aceita; ambos veem o mesmo estado; A não consegue aceitar por B.
9. **Execução:** A marca início; B vê.
10. **Conclusão:** A submete prova; B confirma; só então `COMPLETED`.
11. **Avaliação:** A avalia B; B avalia A; não é possível autoavaliar; uma por pedido.
12. **Permissões:** B tenta abrir conversa/acordo de A → 403.
13. **Idioma:** mudar para EN; tudo (menus, botões, estados, erros, notificações, ajuda) muda; reload mantém.
14. **Mobile:** 375 px; sem scroll horizontal; alvos ≥44 px; teclado.
15. **Rede lenta:** throttling; loading/erro; nenhuma ação finge sucesso.

### Anexo D — Backlog CSV

Ver `docs/AUDITORIA_BACKLOG.csv` para uma lista acionável com ID, severidade, área, evidência, correção e esforço.

---

## 17. Última frase

O SALU tem uma visão forte e uma interface com potencial. O que falta não é «mais site»: é **verdade estrutural**. Uma conta que é uma conta. Um pedido que é um pedido. Uma conversa que chega ao outro. Um acordo que os dois aceitam. Uma avaliação que só existe depois de um trabalho. Um número que se pode explicar. Uma localização que existe. Uma língua que não se mistura. Um deploy que publica o que foi testado.

**Enquanto isso não acontecer, cada nova animação aumenta a distância entre o que o SALU promete e o que o SALU faz.**

> «Não quero apenas um site que pareça funcionar. Quero um produto que faça sentido quando uma pessoa real começa a utilizá-lo.»
> — Diretriz do dono, §25.

Esta auditoria concorda. E acrescenta: **o primeiro utilizador real é o teste mais duro que o SALU ainda não passou.**
