# PROJECT_STATE — SALU

**Actualizado:** 20 de novembro de 2026 · **Concurso:** 28 de novembro (8 dias)
**Modo:** Application · **Fase:** estabilização e demonstração (funcionalidades congeladas)

Fonte de verdade única. Os ficheiros `SALU_PROJECT_STATE.md` e `SALU_CHECKPOINT_*.md`
na pasta de sessão são históricos e ficam substituídos por este documento.

---

## PROJECT_STATE

Protótipo funcional com dois lados do mercado, a correr no build de produção em modo
demonstração (dados locais). 11 ecrãs, 43 testes, 71 kB gzip no arranque.

| Propriedade | Evidência | Valor |
|---|---|---|
| Commits | `FACT` | 3 (`d80da2b` + alterações de estabilização por commitar) |
| Ficheiros versionados | `MEASURED` | 55 antes desta fase |
| Ecrãs | `MEASURED` | 11 rotas |
| Testes | `MEASURED` | 43, todos verdes |
| Build | `MEASURED` | `tsc --noEmit` limpo |
| Bundle inicial | `MEASURED` | 72,7 kB gzip + 73 kB de fontes woff2 (+ 61 kB Supabase lazy) |
| Modo de dados | `OBSERVED` | local |
| URL público | `UNKNOWN` | **não existe ainda** |

---

## LAST_CHECKPOINT

`FACT` — `d80da2b` «incremento 2 — os dois lados do mercado»: 37 ficheiros,
+2721/−413. A partir daí: preparação de deploy e duas correcções de identidade
(ver LATEST_EVIDENCE).

---

## CURRENT_TASK

`FACT` — Estabilização concluída. Falta: publicar na Vercel (depende da conta do dono),
testar num telemóvel físico, e gravar a demonstração.

---

## ACTIVE_MODE

Application. Funcionalidades congeladas até 28/11.

---

## ACTIVE_ALGORITHM

1. Preservar estado → 2. preparar deploy → 3. verificar em origem separada →
4. confirmar regras de identidade e direcção do contacto → 5. roteiro de 2 minutos →
6. checkpoint → 7. parar.

---

## LATEST_EVIDENCE

### E1 — Percurso completo no build de produção `FACT`
Origem separada (`localhost:4173`, `localStorage` limpo), build real, não servidor de
desenvolvimento:

1. Cliente «Marta Kilamba» publica «Frigorífico deixou de refrigerar», Kilamba Kiaxi,
   telefone `924111222` → `244924111222`.
2. A página do próprio pedido mostra «O teu pedido está publicado» e **nenhum** link
   `wa.me`.
3. Prestador «Ivo Manuel» entra numa sessão nova (`pedidoIds: 0`).
4. Encontra o pedido no mural e o botão de WhatsApp **aparece**.
5. Mensagem gerada: «Olá Marta Kilamba, vi o seu pedido no SALU («Frigorífico deixou de
   refrigerar»)…»
6. Contacto registado: `{ alvoTipo: "pedido", alvoId: "f52fb9b1-…" }`.

### E2 — Regra do perfil próprio `FACT`
Perfil criado por «Ivo Manuel» (categoria reparações, Kilamba Kiaxi) abre com «Este é o
teu perfil público» e sem link `wa.me`.

### E3 — Ligação directa funciona no build `OBSERVED`
`/perfil/exemplo-reparacoes` aberto por endereço completo carrega o perfil. Isto prova o
servidor de pré-visualização, **não** a Vercel — essa regra está em `vercel.json` e só se
verifica depois do deploy.

### E4 — Defeito encontrado e corrigido `FACT`
Ao mudar de lado, a sessão preservava `pedidoIds` da sessão anterior, pelo que o prestador
era tratado como autor do pedido e perdia o botão de contacto. Corrigido: `entrar()`
inicia sempre uma sessão nova. Verificado: `pedidoIds: 0` e botão presente.

### E5 — Redesenho visual `OBSERVED`
Linguagem substituída: papel e tinta em vez de cartões genéricos. Serifa Instrument
Serif nas manchetes e Instrument Sans no corpo, ambas servidas do próprio sítio
(73 kB woff2, sem pedidos a terceiros). Paleta de argila e ocre; verde reduzido a
contacto. Grão sobre o papel, numeração editorial em «Como funciona», barra inferior de
aplicação no telemóvel, estados de contacto iniciado a fechar o ciclo.
Verificado a 375 px e em desktop: sem transbordo horizontal; barra inferior dentro do
viewport; tipografia a carregar (família calculada confirmada).

---

## FAILED_EXPERIMENTS

**F1 — Preservar a sessão ao mudar de lado.** Primeira correcção tentava manter dados
quando o tipo não mudava; a sessão já estava contaminada e o defeito persistiu. Abandonada
em favor da regra simples: cada entrada é uma pessoa nova.

**F2 — Chaves de armazenamento `v1` → `v2`.** Sem migração de dados. Aceitável no
protótipo; inaceitável com utilizadores reais.

---

## KNOWN_LIMITATIONS

- **Um só dispositivo.** Sem base de dados partilhada, cada visitante vê apenas os
  exemplos e o que ele próprio criou. Limitação mais séria da demonstração.
- **Sem autenticação.** A sessão é um nome e um lado; não há posse nem verificação.
- **Mudar de lado perde «os meus pedidos»** da sessão anterior (consequência da regra de
  identidade).
- **Migrações SQL nunca executadas.** `0001` e `0002` escritas, não corridas.
- **Adaptador Supabase nunca testado** contra um projecto real.
- **Fotografias** comprimidas para ~80 KB; `createImageBitmap` não testado em telemóvel.
- **Sem avaliações, propostas formais, notificações, mapas ou pagamentos** — fora do
  âmbito desta fase.

---

## PENDING_DECISIONS

| # | Decisão | Dono |
|---|---|---|
| D1 | Publicar na Vercel (requer conta do dono) | Edmundo |
| D2 | Ensaio em telemóvel físico antes de gravar | Edmundo |
| D3 | Gravar vídeo de reserva | Edmundo |
| D4 | Enviar `git push` para o GitHub | Edmundo |

**Visão completa (pós-concurso)** — plano em `docs/CICLOS.md`. As decisões que bloqueiam a
arquitectura:

| # | Decisão | Efeito |
|---|---|---|
| C1 | Chat interno ou só acordo estruturado | Chat livre = +3 semanas e moderação contínua |
| C2 | Canal de notificações (in-app, email ou push) | Bloqueia o ciclo de propostas |
| C3 | Permitir publicar pedido antes de criar conta | Reduz fricção, aumenta spam |
| C7 | Denúncias e política de conteúdo antes do piloto | Impede abertura pública sem isto |

---

## NEXT_ACTION

1. `git push origin main` (valida o acesso de escrita ao GitHub).
2. Importar o repositório na Vercel — ver `docs/DEPLOY.md`.
3. Abrir o URL no telemóvel e repetir os passos de E1.
4. Ensaiar com `docs/DEMO.md`, cronometrado.
5. Parar. Não acrescentar funcionalidades.
