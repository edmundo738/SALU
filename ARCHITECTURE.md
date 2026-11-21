# Arquitectura do SALU

## Decisão central

O SALU tem **um único sistema**:

1. `shared/` — modelos canónicos, estados, categorias e geografia.
2. `server/` — API Express 5 + SQLite (`node:sqlite`), sessões e ficheiros.
3. `src/` — uma aplicação React Router com um único `App.tsx` de rotas.

Não existem dois produtos, dois repositórios de dados nem duas máquinas de estados. O antigo `App.tsx` de 1.151 linhas, os componentes `CustomerViews`/`ProviderViews`/`WorkflowViews`/`EcosystemViews` e a segunda aplicação em `src/pages` + `src/domain` + `src/state` foram removidos depois de confirmados como código morto (ver `DECISIONS.md`).

## Fluxo de dados

```
Browser (React)
   │  fetch credentials: 'include'
   ▼
Express 5 — /api
   │  sessão: cookie HttpOnly → hash SHA-256 → tabela sessions
   │  autorização por recurso em cada transição
   ▼
SQLite (data/salu.db)
   ├── users, sessions
   ├── provider_profiles, provider_portfolio
   ├── requests, request_photos, proposals
   ├── conversations, messages, message_attachments, conversation_reads
   ├── agreements, completion_photos, reviews
   ├── files (visibilidade pública/privada)
   ├── notifications, reports, report_appeals, verification_requests
   └── audit_log
```

## Modelos canónicos (`shared/types.ts`)

- `User` — identidade da sessão, modo activo, localização, nível de verificação.
- `ProviderProfile` — perfil profissional publicado, categoria, portefólio, média real.
- `Request` / `RequestDetail` — pedido, fotos, propostas, `isOwner`, `myProposal`.
- `Proposal` — valor, prazo, mensagem, estado, `conversationId`.
- `Conversation` / `Message` — participantes reais, anexo privado, leitura.
- `Agreement` — âmbito, prazo, aceitação bilateral, conclusão bilateral, avaliações.
- `Review` — três critérios (comunicação, seriedade/responsabilidade, cumprimento de prazos), autor e alvo reais.
- `Notification`, `Report`, `FileRecord`.

## Máquina de estados

```
Request:      OPEN → ASSIGNED → COMPLETED
                       ↘ CANCELLED / DISPUTED

Proposal:     PENDING → ACCEPTED | REJECTED | WITHDRAWN

Agreement:    PENDING_CUSTOMER ⇄ PENDING_PROVIDER
                 │ (ambos aceitam)
                 ▼
               ACTIVE → WORK_SUBMITTED → COMPLETED
                 │           │
                 │           ├─ request-changes → ACTIVE
                 │           └─ dispute → DISPUTED
                 └─ cancel → CANCELLED
```

Servidor, não o cliente, decide cada transição. Exemplos observados nos testes:

- o cliente não pode aceitar duas vezes o mesmo lado (`409`);
- o prestador não pode confirmar o lado do cliente (`403`);
- um terceiro não pode ler conversa, aceitar proposta ou avaliar (`403`);
- avaliação duplicada do mesmo autor no mesmo pedido (`409`);
- avaliação antes de `COMPLETED` (`409`).

## Sessões e autorização

- Registo/login devolvem cookie de sessão; o browser nunca envia `user_id`.
- `requireAuth` resolve o utilizador a partir do token; `optionalAuth` só para recursos públicos.
- Cada rota de recurso compara o utilizador da sessão com `customer_id`, `provider_id` ou participante da conversa.
- Ficheiros privados (mensagens, prova de conclusão, documentos) só são servidos ao dono ou aos participantes do acordo/conversa.
- CSRF: `SameSite=Lax` + verificação de `Origin` em métodos mutáveis + CORS com allowlist.
- Limites: 512 kB JSON, 6 MB por ficheiro, 20 pedidos/min em autenticação, 300/min na API.
- Cabeçalhos: `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS em produção.

## Ficheiros

- Assinatura real: JPEG, PNG, WebP, PDF; extensão e MIME do cliente não são suficientes.
- PDF apenas em finalidades privadas (anexo, prova, documento de verificação).
- Imagens redimensionadas com `sharp` (máx. 512 px para avatar, 1600 px para restantes) e convertidas para WebP.
- Visibilidade derivada da finalidade: `avatar`, `portfolio`, `request` públicos; `message`, `completion`, `report` privados.
- Remoção de portefólio; fotos de pedido e prova de conclusão ficam ligadas ao recurso.

## Interface

- Rotas reais: `/`, `/entrar`, `/criar-conta`, `/bem-vindo`, `/inicio`, `/explorar`, `/pedidos`, `/pedidos/:id`, `/publicar-pedido`, `/oportunidades`, `/mensagens`, `/mensagens/:id`, `/acordos/:id`, `/prestadores/:id`, `/notificacoes`, `/definicoes`, `/perfil-profissional`, `/ajuda`, `/seguranca`, `/termos`, `/privacidade`, `/cookies`, `*` (404).
- Code splitting por rota (`React.lazy`); chunk inicial ~92 kB gzip.
- `ErrorBoundary` global; estados de loading/erro/vazio/sucesso em cada fluxo; sem `catch` silencioso.
- Tema e idioma persistidos no servidor e em `localStorage` (apenas preferência visual; identidade nunca).
- Script inline no `index.html` evita flash de tema antes do React montar.
- Foco movido para `#conteudo` em cada navegação; skip link; modais com foco preso e Escape; alvos ≥ 44 px.

## Geografia

`shared/geo.ts` é a única fonte. 21 províncias, com Luanda (16 municípios) e Icolo e Bengo (7 municípios) disponíveis na interface. IDs derivados de slugs maiúsculos; validação servidor usa exactamente a mesma fonte. Maianga e Ingombota são comunas distintas; Kilamba e Kilamba Kiaxi são municípios distintos; Camama é município próprio.

## Limites conhecidos

- SQLite é adequado a uma instância persistente com volume, não a serverless efémero. Para múltiplas instâncias é necessário Postgres gerido (não implementado).
- Não há Redis; rate limit é em memória por processo.
- Não há envio de e-mail/SMS; nenhuma verificação automática é prometida.
- Sem testes com browser real neste ambiente; ver `TESTING.md`.
