# Modelo de dados

## Incremento 1 — implementado

```
profiles
  id            uuid  (pk)
  auth_user_id  uuid  (fk auth.users, nullable até existir entrada de conta)
  nome          text  2..60
  telefone      text  formato 2449XXXXXXXX, único
  municipio     text  um dos 7 municípios de Luanda
  bairro        text  2..60
  categoria     text  6 valores fixos
  oficio        text  2..60
  descricao     text  20..400
  preco_texto   text  ≤40, texto livre
  disponivel    bool
  exemplo       bool  perfil de demonstração, contacto desactivado
  criado_em     timestamptz

contact_events
  id          uuid  (pk)
  profile_id  uuid  (fk profiles)
  origem      text  'perfil' | 'pesquisa'
  criado_em   timestamptz
```

Relação: um perfil tem muitos eventos de contacto. Um evento pertence a um perfil.

## Regras de validação (três camadas, uma regra)

| Regra | Formulário | Domínio (`validacao.ts`) | Base de dados |
|---|---|---|---|
| nome 2..60 | sim | sim | `check` |
| telefone móvel AO | sim | sim | `check` + índice único |
| descrição 20..400 | sim | sim | `check` |
| categoria válida | sim | sim | `check` |
| preço ≤40 | sim | sim | `check` |

A duplicação é intencional: o formulário dá feedback imediato, o domínio garante a
regra nos testes, a base de dados recusa o que passar por todos os outros caminhos.
Quando as três divergirem, a base de dados é a última linha.

## Políticas de acesso (RLS)

| Tabela | Operação | Quem | Condição |
|---|---|---|---|
| profiles | select | todos | `disponivel = true` ou é o dono |
| profiles | insert | autenticados | `auth.uid() = auth_user_id` |
| profiles | update | autenticados | é o dono |
| contact_events | insert | anónimos e autenticados | sem condição (ver limitação) |
| contact_events | select | autenticados | é o dono do perfil |

## Incremento 2 — planeado, não implementado

```
requests    pedidos de clientes
responses   respostas de prestadores a pedidos
reviews     avaliações após trabalho concluído
reports     denúncias
```

Não estão criadas. Criar tabelas antes de haver um ecrã que as use é dívida, não
progresso.

## O que ainda não está verificado

Regra do projecto: nada é apresentado como funcional sem teste.

| Item | Estado |
|---|---|
| Regras de domínio (validação, telefone, filtros, WhatsApp) | **Testadas** — 36 testes, todos verdes |
| Adaptador local (criar, listar, obter, contactos, persistência) | **Testado** |
| Build de produção | **Verificado** — `tsc --noEmit` + `vite build` |
| Publicar perfil pelo formulário | **Verificado no browser** — perfil criado, telefone normalizado para 244923555111 |
| Validação a bloquear submissão inválida | **Verificado no browser** — erro mostrado, `aria-invalid=true`, sem navegação |
| Perfil público e link de WhatsApp | **Verificado no browser** — `wa.me/244923555111?text=…` com mensagem codificada |
| Registo de contacto | **Verificado no browser** — evento gravado e visível na área interna |
| Perfis de exemplo sem contacto | **Verificado no browser** — sem link de WhatsApp, aviso visível |
| Layout a 375 px | **Verificado** — sem transbordo horizontal, botão de 343×48 px |
| Migração SQL | **Não executada** — escrita, nunca corrida contra Postgres |
| Adaptador Supabase | **Não testado** — falta projecto real e credenciais |
| Autenticação | **Não implementada** |
| RLS a bloquear leitura cruzada | **Não testado** — só se prova com duas contas reais |
| Uso num telemóvel real (não emulador) | **Não verificado** |
