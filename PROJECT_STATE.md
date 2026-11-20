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
| Testes | `MEASURED` | 66, todos verdes |
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

### E7 — Proposta e conversa `FACT`
Ciclo completo verificado no build de produção, numa só origem:

1. Cliente «Marta Kilamba» publica o pedido; a posse fica registada por nome.
2. Prestador «Ivo Manuel» abre o pedido, envia proposta (mensagem, 15.000 Kz, amanhã) e
   escreve na conversa.
3. A cliente volta a entrar **com o mesmo nome**, recupera a autoria, vê a proposta, lê a
   mensagem do prestador e responde.
4. Ordem final dos lados: `prestador, prestador, cliente` — sem inversões.
5. A autora continua **sem** botão de WhatsApp.

**Defeito encontrado e corrigido no caminho:** trocar de sessão apagava a autoria, e o
cliente nunca via as propostas que recebia. A posse passou a ser guardada por nome
(`salu:v2:pertence`), fora da sessão activa.

### E8 — Ciclo do trabalho e avaliação `FACT`
Estados do pedido: `aberto → acordado → concluido` (mais `cancelado`, sem interface
ainda). Verificado no build de produção, num pedido criado de raiz para o teste:

1. Cliente «Ana Teste» publica; prestador «Bruno Teste» propõe.
2. Cliente volta, vê a proposta, **aceita** → pedido `acordado`, proposta `aceite`.
3. Cliente **marca como concluído** → pedido `concluido`; a conversa fecha em leitura.
4. Aparece o formulário de avaliação; nota 5 e comentário gravados com
   `alvoNome: "Bruno Teste"`, `pedidoId` correcto.

Regras garantidas no repositório local e nos testes: não se aceita em pedido que não
esteja aberto; não se conclui sem acordo; não se avalia sem conclusão; uma avaliação por
autor e por pedido. O mural só mostra pedidos `aberto`.

`OBSERVED` — uma avaliação anterior ficou com nota 2 e alvo «Edmundo Bunga» num pedido em
que o dono estava a interagir ao vivo durante a verificação automática. Causa não
atribuível com certeza (interacção concorrente); o teste isolado acima é a evidência.

### E9 — Ciclo completo em origem limpa, com recarga `FACT`
Repetido em `localhost:5173` com `localStorage` apagado, sem interacção concorrente:
«Ana Cliente» publica → «Bruno Técnico» propõe → Ana aceita (`acordado`) → conclui
(`concluido`, conversa fechada) → avalia 5 com comentário, `alvoNome: "Bruno Técnico"`.
Bruno cria perfil → o perfil mostra **5,0 · 1 trabalho avaliado** e o comentário em
«O que dizem de Bruno». Depois de **recarregar a página**, uma terceira prestadora vê o
pedido com selo «Concluído», aviso «já tem profissional», sem botão de WhatsApp e sem
formulário de proposta. O pedido concluído não aparece no mural.

Também adicionado: botão «Apagar dados e repor exemplos» na Área interna, para limpar o
dispositivo antes de gravar ou apresentar.

---

## FAILED_EXPERIMENTS

**F0 — Pedidos concluídos desapareciam ao recarregar.** `FACT` A leitura inicial da
camada de dados aplicava o filtro do mural («só abertos»), por isso um pedido acordado ou
concluído deixava de existir para o cliente e para o prestador escolhido assim que a
página recarregava. Passou despercebido porque, sem recarregar, o estado em memória era
actualizado no sítio. **Como foi apanhado:** ao verificar a vista de um terceiro num
pedido concluído, a página mostrava «não encontrado». **Correcção:** a camada de dados
devolve todos os estados; o filtro «só abertos» vive apenas no mural
(`filtrarPedidos` com `apenasAbertos`, por omissão verdadeiro). Coberto por teste.

**F1 — Preservar a sessão ao mudar de lado.** Primeira correcção tentava manter dados
quando o tipo não mudava; a sessão já estava contaminada e o defeito persistiu. Abandonada
em favor da regra simples: cada entrada é uma pessoa nova.

**F2 — Chaves de armazenamento `v1` → `v2`.** Sem migração de dados. Aceitável no
protótipo; inaceitável com utilizadores reais.

---

## KNOWN_LIMITATIONS

- **Um só dispositivo.** Sem base de dados partilhada, cada visitante vê apenas os
  exemplos e o que ele próprio criou. Limitação mais séria da demonstração.
- **Sem autenticação.** A sessão é um nome e um lado. A posse do que cada pessoa criou é
  guardada **por nome** — duas pessoas com o mesmo nome colidem.
- **A conversa é de um só dispositivo.** Os dois papéis são interpretados pela mesma
  pessoa ao trocar de sessão; não há mensagens entre telemóveis diferentes.
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
| C1 | **Decidido (20/11):** há chat interno, separado do acordo | +3 semanas e moderação contínua. Regras em `docs/CICLOS.md` §Ciclo 5 |
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
