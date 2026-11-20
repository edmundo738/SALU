# SALU — Arquitectura de ciclos

Plano de construção do produto descrito na visão completa. **Não é o plano do
protótipo do concurso** — esse está em `docs/DEMO.md` e não muda.

Cada ciclo tem: objectivo, dependências, sistemas, **resultado verificável** e riscos. Um
ciclo só fecha quando o resultado verificável é observado, não quando o código existe.

---

## Princípio de construção

Três regras que ordenam tudo o resto:

1. **Nada de propostas sem identidade.** Quem propõe tem de ser alguém; sem contas não há
   acordos, avaliações nem reputação.
2. **Nada de reputação sem trabalho concluído.** Uma avaliação só vale se houver um
   serviço que ambas as partes confirmaram.
3. **Nada de moderação sem denúncias.** Abrir categorias livres ou mensagens privadas sem
   fila de moderação é abrir a porta a fraude no primeiro mês.

A ordem abaixo é uma **cadeia de dependências**, não uma lista de desejos.

---

## O que já existe

| Peça | Estado | Onde |
|---|---|---|
| Perfis de prestador, pesquisa, filtros | Construído e verificado | Ciclo 2 (parcial) |
| Pedidos com fotografia e mural | Construído e verificado | Ciclo 2 (parcial) |
| Contacto por WhatsApp com registo de evento | Construído e verificado | Transversal |
| Sessão de demonstração | Construído — **não é autenticação** | Ciclo 1 (fachada) |
| Base de dados partilhada | **Não existe** | Ciclo 0 |
| Propostas, acordos, estados, avaliações, denúncias | **Não existem** | Ciclos 4–8 |

`FACT` — hoje tudo vive no `localStorage` de um dispositivo. Nenhum ciclo de 3 a 10 é
possível sem fechar o Ciclo 0.

---

## Ciclo 0 — Fundação partilhada

**Objectivo:** duas pessoas, em dois dispositivos, a ver os mesmos dados.
**Depende de:** nada. **Bloqueia:** tudo o resto.

- Supabase: Postgres, Auth, Storage para fotografias.
- Autenticação por telefone. Decisão em aberto: PIN (gratuito, fraco) ou OTP por SMS
  (~US$ 0,32 por código, mas verifica a posse do número).
- RLS em todas as tabelas, testada com duas contas reais.
- Migrações versionadas e aplicadas em ambiente de teste.

**Verificável:** conta A cria um pedido; conta B, noutro dispositivo, vê-o. B tenta ler um
pedido privado de A e falha.
**Riscos:** RLS mal escrita é fuga de dados; OTP é custo recorrente desde o dia 1.
**Esforço:** ~2 semanas. `HYPOTHESIS`

---

## Ciclo 1 — Identidade e perfil profissional

**Objectivo:** um perfil que represente uma pessoa **ou** um pequeno negócio.
**Depende de:** Ciclo 0.

- Tipo de conta: individual, empresa, ou ambos.
- Competências, categorias, área de atendimento (município + bairro/raio aproximado),
  disponibilidade.
- Portefólio **opcional** — quem está a começar não pode ser penalizado por não ter.
- Nível de completude do perfil, distinto de verificação e de reputação.

**Verificável:** uma conta cria perfil, edita-o e vê-o público; um perfil sem portefólio
não é escondido nem marcado como inferior.
**Riscos:** confundir «completo» com «verificado» com «bom» — são três coisas.
**Esforço:** ~1,5 semanas.

---

## Ciclo 2 — Oferta e procura no mesmo espaço

**Objectivo:** ligar o protótipo actual à base de dados partilhada.
**Depende de:** Ciclos 0 e 1. **Já existe em modo local.**

- Perfis e pedidos reais, com proprietário.
- Fotografias em Storage (não em data URL).
- Estados mínimos: aberto / fechado.

**Verificável:** o perfil criado num telemóvel aparece na pesquisa de outro.
**Esforço:** ~1 semana (a interface já existe).

---

## Ciclo 3 — Descoberta e recomendação

**Objectivo:** ordenar por relevância, não por data de publicação.
**Depende de:** Ciclo 2.

Pontuação determinística e explicável — sem IA:

| Factor | Peso |
|---|---|
| Categoria e competência compatíveis | muito alto |
| Proximidade (município, bairro, raio) | muito alto |
| Disponibilidade declarada | alto |
| Completude do perfil | médio |
| Reputação (quando existir) | alto |
| Promoção paga | **limite rígido, nunca acima da relevância** |

Regra obrigatória: **novos prestadores têm uma quota garantida de exposição**. Sem isso,
o algoritmo contradiz o princípio do produto no primeiro dia.

**Verificável:** dado um pedido, os três primeiros resultados são da categoria e da zona
certas; um prestador sem avaliações aparece em pedidos compatíveis.
**Esforço:** ~1,5 semanas.

---

## Ciclo 4 — Propostas e escolha

**Objectivo:** o profissional manifesta interesse formalmente; o cliente escolhe.
**Depende de:** Ciclos 2 e 3, **e de um canal de notificação**.

- Proposta: mensagem, preço estimado (texto), prazo previsto.
- Cliente vê propostas, abre perfis, aceita uma ou recusa.
- **O primeiro a responder não ganha.** A escolha é do cliente.
- Notificação ao cliente por nova proposta; ao profissional por resposta.

**Verificável:** um prestador envia proposta; o cliente recebe aviso, vê o perfil e aceita;
as restantes ficam recusadas; o pedido deixa de aceitar propostas.
**Riscos:** sem notificações, as propostas ficam por ver e o ciclo morre.
**Esforço:** ~2 semanas.

---

## Ciclo 5 — Conversa e acordo

**Objectivo:** as partes falam dentro da plataforma e registam o que combinaram.
**Depende de:** Ciclo 4. **Alimenta:** Ciclo 8 (moderação).

Decidido pelo dono do produto: **há chat interno**, além do acordo estruturado.
As duas coisas são separadas de propósito, e essa separação é o que as torna seguras:

- **A conversa é informal.** Serve para perguntar, mostrar uma fotografia, combinar uma
  visita. Nada do que é dito ali é vinculativo.
- **O acordo é formal.** Preço, prazo e condições num formulário, confirmado por cada
  lado. **O acordo é a fonte de verdade, nunca a conversa.**

### Regras da conversa

| Regra | Porquê |
|---|---|
| Só existe **dentro de um pedido** | Não há caixa de entrada global nem conversas entre estranhos |
| O prestador só escreve **depois de enviar proposta** | Impede mensagens não solicitadas a clientes |
| A conversa fecha quando o pedido fecha | Fica em leitura, não em escrita |
| Texto e uma fotografia por mensagem | Voz e vídeo são custo de armazenamento e de moderação |
| Botão de denúncia em cada mensagem | A moderação é o Ciclo 8, não uma ideia para depois |
| Limite de mensagens por hora em contas novas | O primeiro ataque a um chat aberto é spam |

Tecnicamente usa **Supabase Realtime** — já faz parte da stack, não é dependência nova.

### O acordo

- Proposta de condições → contraproposta → confirmação explícita de cada lado.
- Preço final e condições guardados, **privados** — nunca em página pública.
- O serviço só avança quando **ambas** confirmam.

**Verificável:** um prestador sem proposta não consegue abrir conversa com o cliente; com
proposta, as mensagens chegam em tempo real ao outro dispositivo. A propõe, B
contrapropõe, A aceita, B confirma → «acordado»; com uma só confirmação, continua «em
negociação». O preço não aparece em nenhuma listagem. Um pedido concluído fecha a conversa.
**Riscos:** o chat é o sítio onde aparece fraude, assédio e conteúdo proibido — sem o
Ciclo 8 ligado no mesmo dia, não deve ser aberto a estranhos. O acordo registado tem peso
probatório e exige termos de utilização claros.
**Esforço:** ~3 semanas de construção (conversa + acordo) e **moderação contínua**.

---

## Ciclo 6 — Estados do serviço

**Objectivo:** qualquer pedido diz sempre em que ponto está.
**Depende de:** Ciclo 5.

```
rascunho → aberto → com propostas → em negociação → acordado
        → em execução → concluído
        ↘ cancelado          ↘ disputa
```

- Transições permitidas, testadas uma a uma. Transições inválidas recusadas no servidor.
- Cliente e profissional confirmam a conclusão em separado; desacordo abre disputa.
- Pedido concluído ou cancelado **recusa novas propostas**.
- Histórico de transições com autor e data.

**Verificável:** todas as transições testadas; tentar pular de «aberto» para «concluído» é
recusado; um pedido concluído não aceita propostas.
**Esforço:** ~1 semana.

---

## Ciclo 7 — Avaliações e reputação

**Objectivo:** confiança construída ao longo do tempo, nos dois sentidos.
**Depende de:** Ciclo 6.

- Avaliação só existe ligada a um pedido **concluído**.
- Avaliação mútua: o profissional também avalia o cliente.
- Reputação **não é média de estrelas**: considera número de trabalhos, consistência ao
  longo do tempo e contexto. Uma avaliação isolada não domina o perfil.
- Lista de profissionais de confiança, com prioridade nas recomendações.

**Verificável:** não é possível avaliar sem trabalho concluído; uma conta com um único
serviço avaliado não aparece como «excelente»; um cliente com histórico fraco perde
prioridade nas propostas.
**Riscos:** reputação de clientes pode afastar procura nova — arrancar só com avaliação de
profissionais e abrir a dos clientes depois de haver volume.
**Esforço:** ~2 semanas.

---

## Ciclo 8 — Denúncias e segurança

**Objectivo:** proteger utilizadores e plataforma. **Pré-requisito de qualquer abertura
pública.**
**Depende de:** Ciclos 0 e 2.

- Denúncia com provas (texto, fotografia), em fila de moderação.
- Estados: recebida → em análise → decidida, com direito a contestação.
- Uma denúncia **não** é uma condenação.
- Política de conteúdo: proibido tráfico, prostituição, medicamentos ilegais, produtos
  perigosos, falsas promessas de cura. Regras próprias para álcool, produtos
  regulamentados e actividades licenciadas.
- Filtros na publicação + revisão humana.

**Verificável:** uma publicação proibida é recusada antes de aparecer; uma denúncia chega
à fila e é decidida com registo; o denunciado consegue contestar.
**Riscos:** moderação é **custo humano recorrente**, não software. Sem orçamento para
isso, o ciclo não existe.
**Esforço:** ~2–3 semanas + operação contínua.

---

## Ciclo 9 — Reconhecimentos

**Objectivo:** reconhecer consistência sem gamificar.
**Depende de:** Ciclo 7. **Esforço:** ~3 dias.

Discreto: um selo de consistência baseado em histórico real, nunca em pontos ou moedas.
Nunca substitui a reputação.

---

## Ciclo 10 — Categorias e competências personalizadas

**Objectivo:** os utilizadores propõem actividades sem fragmentar a pesquisa.
**Depende de:** Ciclo 8 (moderação).

- Sugestão de nova competência → dicionário de sinónimos → aprovação.
- Etiquetas normalizadas para que «reparação de frigoríficos» e «arranjar geleiras» caiam
  na mesma pesquisa.

**Verificável:** duas expressões diferentes para o mesmo ofício devolvem os mesmos
resultados; uma competência nova não cria duplicado.
**Esforço:** ~2 semanas.

---

## Sistema transversal — Notificações

Não é um ciclo porque **quatro ciclos dependem dele** (4, 5, 6, 7).

Sem SMS bidireccional em Angola, os canais possíveis são: dentro da aplicação, email, ou
push (service worker). **Canal por decidir** — e é a decisão que mais atrasa o Ciclo 4.

---

## Grafo de dependências

```
0 Fundação ─┬─ 1 Identidade ── 2 Oferta/procura ── 3 Descoberta ── 4 Propostas
            │                                                          │
            │                                                          ▼
            │                                            5 Conversa + acordo
            │                                                          │
            │                                                          ▼
            │                                              6 Estados ── 7 Reputação ── 9 Reconhecimentos
            │                                                          ▲
            └─ 8 Denúncias ────────────────────────────────────────────┘
                    └─ 10 Categorias personalizadas

Notificações ──► necessárias em 4, 5, 6, 7
8 Denúncias  ──► **pré-requisito do Ciclo 5**: sem moderação não se abre chat
```

---

## Contradições a decidir antes de começar

Estas não são detalhes: mudam a arquitectura.

| # | A visão pede | O que está decidido hoje | Consequência |
|---|---|---|---|
| C1 | «A comunicação interna deve ser incentivada» | **Decidido: há chat**, separado do acordo | +3 semanas e moderação contínua. Mitigado pelas regras do Ciclo 5: conversa só dentro de um pedido, prestador só escreve após proposta, denúncia em cada mensagem |
| C2 | Notificações em vários ciclos | Não existem; canal por decidir | Bloqueia o Ciclo 4 |
| C3 | Publicar pedido **antes** de criar conta | Tudo exige identidade | Reduz fricção, aumenta spam. Exige fluxo de «reclamar pedido» e limites por dispositivo |
| C4 | Preço acordado registado | Sem pagamentos no produto | Registar não é processar — mas cria valor probatório; exige termos claros |
| C5 | Categorias livres pelos utilizadores | 12 categorias fixas | Sem moderação, abre porta a conteúdo proibido |
| C6 | Reputação também para clientes | Não existe | Pode afastar procura nova; recomendo abrir depois de haver volume |
| C7 | Denúncias e política de conteúdo | Não existem | **Impede qualquer abertura pública**, mesmo em piloto |

---

## Calendário realista

`HYPOTHESIS` — com um construtor a tempo inteiro, sem equipa:

| Bloco | Ciclos | Duração |
|---|---|---|
| Plataforma utilizável entre pessoas | 0–2 | ~5 semanas |
| Mercado a funcionar (propostas, conversa, acordo, estados) | 3–6 | ~9,5 semanas |
| Confiança (reputação, denúncias) | 7–8 | ~5 semanas |
| Refinamento | 9–10 | ~2,5 semanas |

**≈ 6 meses** até ao produto descrito. Não são 6 meses de código: dois deles são operação
(moderação, suporte, resolução de disputas), que não se automatiza. O chat acrescenta
tempo de construção **e** volume de moderação — foi o custo que a decisão assumiu.

---

## O que fazer nos próximos 8 dias

**Nada disto.** Até 28 de Novembro o objectivo é a demonstração: publicar, ensaiar, gravar.
Os ciclos começam a 29.

A única peça desta visão que vale a pena mencionar ao júri é o **Ciclo 5** — a conversa
dentro do pedido e o acordo confirmado pelas duas partes. É barato de explicar e
distingue o SALU de um grupo de WhatsApp.

Ao júri diz-se «planeado», nunca «feito». O protótipo do dia 28 não tem chat.
