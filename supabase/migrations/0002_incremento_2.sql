-- SALU — incremento 2: pedidos de clientes e contactos generalizados.
--
-- Aplicar DEPOIS de 0001_incremento_1.sql.
-- Este ficheiro NÃO foi executado contra nenhuma base de dados: ver a secção
-- «O que ainda não está verificado» em docs/MODELO_DE_DADOS.md.

-- ---------------------------------------------------------------------------
-- profiles: fotografia
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists foto_url text;

-- ---------------------------------------------------------------------------
-- requests: o lado da procura
-- ---------------------------------------------------------------------------

create table if not exists public.requests (
  id             uuid primary key default gen_random_uuid(),
  auth_user_id   uuid references auth.users (id) on delete cascade,
  autor_nome     text not null check (char_length(autor_nome) between 2 and 60),
  autor_telefone text not null check (autor_telefone ~ '^2449[0-9]{8}$'),
  titulo         text not null check (char_length(titulo) between 4 and 80),
  categoria      text not null check (
                   categoria in (
                     'reparacoes', 'electricidade', 'canalizacao', 'limpeza',
                     'tecnologia', 'design', 'explicacoes', 'entregas',
                     'beleza', 'cozinha', 'construcao', 'administrativo'
                   )
                 ),
  municipio      text not null,
  bairro         text not null check (char_length(bairro) between 2 and 60),
  descricao      text not null check (char_length(descricao) between 15 and 500),
  foto_url       text,
  estado         text not null default 'aberto' check (estado in ('aberto', 'fechado')),
  exemplo        boolean not null default false,
  criado_em      timestamptz not null default now()
);

create index if not exists requests_mural_idx
  on public.requests (categoria, municipio, estado, criado_em desc);

alter table public.requests enable row level security;

-- O mural é público por desenho: é assim que um técnico encontra trabalho.
create policy "pedidos abertos sao publicos"
  on public.requests for select
  using (estado = 'aberto' or auth.uid() = auth_user_id);

create policy "criar o proprio pedido"
  on public.requests for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

create policy "editar o proprio pedido"
  on public.requests for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- ---------------------------------------------------------------------------
-- contact_events: passa a apontar para um perfil OU para um pedido
-- ---------------------------------------------------------------------------
-- Um contacto a partir de um perfil é um cliente a procurar um profissional.
-- Um contacto a partir de um pedido é um profissional a responder a alguém.
-- Sem esta distinção não se sabe qual dos lados está a puxar o mercado.

alter table public.contact_events
  add column if not exists alvo_tipo text not null default 'perfil'
    check (alvo_tipo in ('perfil', 'pedido'));

alter table public.contact_events
  add column if not exists alvo_id uuid;

-- Preenche os registos antigos e aperta a restrição.
update public.contact_events
   set alvo_id = profile_id
 where alvo_id is null and profile_id is not null;

alter table public.contact_events
  alter column alvo_id set not null;

alter table public.contact_events
  drop constraint if exists contact_events_profile_id_fkey;

alter table public.contact_events
  alter column profile_id drop not null;

create index if not exists contact_events_alvo_idx
  on public.contact_events (alvo_tipo, alvo_id, criado_em desc);
