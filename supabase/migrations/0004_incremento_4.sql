-- SALU — incremento 4: estado da proposta, conclusão e avaliações.
--
-- Aplicar DEPOIS de 0001, 0002 e 0003.
-- Este ficheiro NÃO foi executado contra nenhuma base de dados.

-- ---------------------------------------------------------------------------
-- proposals: estado
-- ---------------------------------------------------------------------------

alter table public.proposals
  add column if not exists estado text not null default 'pendente'
    check (estado in ('pendente', 'aceite', 'recusada'));

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
-- Uma avaliação existe sempre ligada a um pedido concluído. A condição está na
-- política de INSERT, não apenas na aplicação: uma regra que só vive no cliente
-- não é uma regra.

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete cascade,
  request_id   uuid not null references public.requests (id) on delete cascade,
  autor_nome   text not null check (char_length(autor_nome) between 2 and 60),
  alvo_nome    text not null check (char_length(alvo_nome) between 2 and 60),
  alvo_tipo    text not null check (alvo_tipo in ('prestador', 'cliente')),
  nota         integer not null check (nota between 1 and 5),
  comentario   text check (comentario is null or char_length(comentario) <= 300),
  criado_em    timestamptz not null default now()
);

-- Uma avaliação por pessoa e por pedido.
create unique index if not exists reviews_unica_por_autor
  on public.reviews (request_id, auth_user_id);

create index if not exists reviews_alvo_idx
  on public.reviews (alvo_nome, alvo_tipo, criado_em desc);

alter table public.reviews enable row level security;

-- As avaliações são públicas: é isso que as torna úteis.
create policy "avaliacoes sao publicas"
  on public.reviews for select
  using (true);

-- Só se avalia um pedido concluído, e só quem participou nele.
create policy "avaliar pedido concluido"
  on public.reviews for insert
  to authenticated
  with check (
    auth.uid() = auth_user_id
    and exists (
      select 1 from public.requests r
      where r.id = reviews.request_id and r.estado = 'concluido'
    )
    and (
      exists (
        select 1 from public.requests r
        where r.id = reviews.request_id and r.auth_user_id = auth.uid()
      )
      or exists (
        select 1 from public.proposals p
        where p.request_id = reviews.request_id and p.auth_user_id = auth.uid()
      )
    )
  );
