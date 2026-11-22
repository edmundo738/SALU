# CHANGELOG

## Abertura directa da conta — trabalho local

- Contas com sessão activa e configuração completa entram directamente no painel ao abrir a página inicial; a página pública mantém «Entrar» para visitantes. A configuração inicial continua disponível para contas incompletas.
- A sessão é verificada antes de decidir; erro de ligação oferece nova tentativa, sem afirmar que a sessão terminou.

## Trabalho em curso — percursos de utilizador

- Logótipo encaminha para o início de quem já tem sessão e preserva o onboarding incompleto; página pública oferece acções adequadas a quem já entrou.
- Página “O meu perfil” para conta cliente ou prestador, fotografia e atalhos separados para ver e editar o perfil profissional no modo prestador.
- Fotografias nas publicações, resumo do pedido com pré-visualização, espera pelo envio, informação de imagem pública e erro de carregamento. Corrigida reposição involuntária de campos ao actualizar fotografia e endereço de conversa com espaço extra.
- Avaliação funcional e riscos por verificar: `docs/CONSULTORIA_PERCURSOS.md`. Não há confirmação em browser real nem publicação em produção.

## Trabalho em curso — segurança, perfil e experiência

- Restringidas origens autorizadas em produção; bloqueado acesso público aos ficheiros de contas eliminadas e reduzidos dados do perfil. Necessária actualização separada da API; dados retidos e caches anteriores continuam sujeitos a revisão.
- Avatar da própria conta usa os dados de sessão se o perfil não os devolver; `FileImage` tenta também URL directo e reinicia ao mudar de imagem. Ajustado alinhamento do cabeçalho do perfil.
- Listas paginadas; botão do perfil indica publicação de pedido em vez de prometer conversa directa. Falha de ligação deixou de redireccionar automaticamente para login; logout só limpa a sessão local após confirmação.
- Aplicações web instaladas que já tiverem carregado esta versão podem avisar de uma nova versão, sem interromper o trabalho nem forçar recarga.
- Testes novos de origens em ambiente de produção isolado, exclusão e foto, paginação, aviso de actualização e alternativas de imagens; não substituem teste em navegador ou produção.


## 2026-11-22 — Página inicial: três passos legíveis, convite final sem ruído

### Corrigido

- A secção "Três passos. Sem atalhos." tinha 320vh de altura, `position: sticky` e os
  três passos empilhados em `absolute` com transições de 700–900ms. Em ecrãs baixos,
  ao rolar depressa e em capturas de página inteira, os três textos apareciam ao
  mesmo tempo, sobrepostos e desalinhados. Passa a ser uma grelha estática de três
  colunas (empilhada no telemóvel): lê-se sempre, em qualquer ecrã e em qualquer captura.
- Removido o `usePinnedStory` (deixou de ter uso) e as regras CSS da secção pinada.
- No convite "Começa pelo que precisas." havia um segundo "Ver prestadores" solto por
  baixo do cartão, a repetir o botão de dentro. Removido. O cartão fica com
  **Criar conta** e **Entrar**, nada mais.
- No cabeçalho público, a conta com sessão iniciada via o botão "Início" (que não levava
  a lado nenhum na página de boas-vindas). Passa a "Entrar", como pedido, e continua a
  abrir o painel.

### Verificado

- `tsc` limpo, `npm test` 22/22 (dois testes novos: os três passos presentes no HTML e
  ausência de "Ver prestadores" na página inicial), build verde (311,60 kB / 95,03 kB gzip).

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

### Percursos cliente e prestador (local)

- Removidos os atalhos de pedidos próprios do modo prestador; adicionada lista de propostas com acesso a conversas e acordos aceites.
- Proposta também disponível no detalhe do pedido; oportunidades não incluem pedidos próprios. Listagens cliente e prestador separadas na API, mantendo o âmbito anterior para compatibilidade.
- Testes locais dos dois modos e do ciclo com contas distintas; sem deploy nem validação visual.
