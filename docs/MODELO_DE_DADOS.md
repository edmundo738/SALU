# Modelo de dados

## Incremento 2 — implementado

```
profiles                          (lado da oferta)
  id            uuid  (pk)
  auth_user_id  uuid  (fk auth.users, nullable)
  nome          text  2..60
  telefone      text  2449XXXXXXXX, único
  municipio     text  7 municípios de Luanda
  bairro        text  2..60
  categoria     text  12 valores fixos
  oficio        text  2..60
  descricao     text  20..400
  preco_texto   text  ≤40, texto livre
  foto_url      text  data URL no protótipo
  disponivel    bool
  exemplo       bool  demonstração, contacto desactivado
  criado_em     timestamptz

requests                          (lado da procura)
  id              uuid  (pk)
  auth_user_id    uuid  (fk auth.users, nullable)
  autor_nome      text  2..60
  autor_telefone  text  2449XXXXXXXX
  titulo          text  4..80
  categoria       text  12 valores fixos
  municipio       text
  bairro          text  2..60
  descricao       text  15..500
  foto_url        text
  estado          text  'aberto' | 'fechado'
  exemplo         bool
  criado_em       timestamptz

contact_events
  id          uuid  (pk)
  alvo_tipo   text  'perfil' | 'pedido'
  alvo_id     uuid
  origem      text  'perfil' | 'pesquisa' | 'pedido'
  criado_em   timestamptz
```

Relações: um perfil recebe muitos contactos; um pedido recebe muitos contactos. Um
contacto aponta para **um** alvo, identificado por `alvo_tipo` + `alvo_id`.

**Porque `alvo_tipo` existe:** um contacto a um perfil é um cliente a procurar um
profissional; um contacto a um pedido é um profissional a responder a alguém. Sem esta
distinção não se sabe qual dos lados está a puxar o mercado — e essa é a informação que
decide o próximo passo do produto.

## Regras de validação (três camadas, uma regra)

| Regra | Formulário | Domínio | Base de dados |
|---|---|---|---|
| nome 2..60 | sim | sim | `check` |
| telefone móvel AO | sim | sim | `check` (+ único em perfis) |
| título do pedido 4..80 | sim | sim | `check` |
| descrição do pedido 15..500 | sim | sim | `check` |
| categoria válida | sim | sim | `check` |

A duplicação é intencional: o formulário dá feedback imediato, o domínio garante a regra
nos testes, a base de dados recusa o que passar por todos os outros caminhos.

## Políticas de acesso (RLS)

| Tabela | Operação | Quem | Condição |
|---|---|---|---|
| profiles | select | todos | `disponivel = true` ou é o dono |
| profiles | insert/update | autenticados | é o dono |
| requests | select | todos | `estado = 'aberto'` ou é o dono |
| requests | insert/update | autenticados | é o dono |
| contact_events | insert | anónimos e autenticados | sem condição (ver limitação) |
| contact_events | select | autenticados | é o dono do alvo |

## Armazenamento local (protótipo)

Chaves `salu:v2:perfis`, `salu:v2:pedidos`, `salu:v2:contactos`, `salu:v2:sessao`.
O limite do `localStorage` ronda 5 MB, daí a compressão de fotografias para ~80 KB.

## Incremento 3 — planeado, não implementado

```
reviews   avaliações após trabalho concluído
reports   denúncias
```

Não estão criadas. Uma tabela sem ecrã que a use é dívida, não progresso.

## O que ainda não está verificado

Regra do projecto: nada é apresentado como funcional sem teste.

| Item | Estado |
|---|---|
| Regras de domínio (validação, telefone, filtros, WhatsApp) | **Testadas** — suite de testes automáticos (`npm test`) |
| Adaptador local (perfis, pedidos, contactos, persistência) | **Testado** |
| Build de produção | **Verificado** — `tsc --noEmit` + `vite build` |
| Publicar perfil com validação | **Verificado no browser** |
| Publicar pedido | **Verificado no browser** — aparece no mural em primeiro |
| Contacto a partir de um pedido | **Verificado no browser** — evento com `alvoTipo: "pedido"` |
| Contacto a partir de um perfil | **Verificado no browser** (incremento 1) |
| Área interna com contadores por lado | **Verificado no browser** — 8 / 5 / 0 / 2 |
| Layout a 375 px | **Verificado** — sem transbordo horizontal |
| Compressão de fotografia | **Não verificado** — `createImageBitmap` não testado em telemóvel real |
| Migrações SQL | **Não executadas** |
| Adaptador Supabase | **Não testado** |
| Autenticação | **Não implementada** |
| RLS a bloquear leitura cruzada | **Não testado** |
| Uso num telemóvel real (não emulador) | **Não verificado** |
