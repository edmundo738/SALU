-- SALU — incremento 3: propostas e conversa dentro do pedido.
--
-- Aplicar DEPOIS de 0001 e 0002.
-- Este ficheiro NÃO foi executado contra nenhuma base de dados: ver a secção
-- «O que ainda não está verificado» em docs/MODELO_DE_DADOS.md.

create table if not exists public.proposals (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete cascade,
  request_id   uuid not null references public.requests (id) on delete cascade,
  autor_nome   text not null check (char_length(autor_nome) between 2 and 60),
  mensagem     text not null check (char_length(mensagem) between 10 and 500),
  preco_texto  text check (preco_texto is null or char_length(preco_texto) <= 40),
  prazo_texto  text check (prazo_texto is null or char_length(prazo_texto) <= 40),
  criado_em    timestamptz not null default now()
);

-- Um profissional propõe uma vez por pedido.
create unique index if not exists proposals_unica_por_pedido
  on public.proposals (request_id, auth_user_id);

alter table public.proposals enable row level security;

create policy "o cliente ve as propostas ao seu pedido"
  on public.proposals for select
  to authenticated
  using (
    auth_user_id = auth.uid()
    or exists (
      select 1 from public.requests r
      where r.id = proposals.request_id and r.auth_user_id = auth.uid()
    )
  );

create policy "enviar a propria proposta"
  on public.proposals for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------

create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete cascade,
  request_id   uuid not null references public.requests (id) on delete cascade,
  lado         text not null check (lado in ('cliente', 'prestador')),
  autor_nome   text not null check (char_length(autor_nome) between 2 and 60),
  texto        text not null check (char_length(texto) between 1 and 500),
  criado_em    timestamptz not null default now()
);

create index if not exists messages_pedido_idx
  on public.messages (request_id, criado_em);

alter table public.messages enable row level security;

-- Só participam da conversa o autor do pedido e quem enviou proposta.
create policy "participantes leem a conversa"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.requests r
      where r.id = messages.request_id and r.auth_user_id = auth.uid()
    )
    or exists (
      select 1 from public.proposals p
      where p.request_id = messages.request_id and p.auth_user_id = auth.uid()
    )
  );

-- Escrever exige ser participante. A regra «profissional só escreve depois de
-- propor» é garantida pela política: sem proposta, não é participante.
create policy "participantes escrevem"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = auth_user_id
    and (
      exists (
        select 1 from public.requests r
        where r.id = messages.request_id and r.auth_user_id = auth.uid()
      )
      or exists (
        select 1 from public.proposals p
        where p.request_id = messages.request_id and p.auth_user_id = auth.uid()
      )
    )
  );
