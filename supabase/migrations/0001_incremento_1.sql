-- SALU — incremento 1: perfis e registo de contactos.
--
-- Aplicar num projecto Supabase novo (SQL Editor) antes de ligar a aplicação.
-- Este ficheiro NÃO foi executado contra nenhuma base de dados real: foi escrito
-- a partir do modelo documentado em docs/MODELO_DE_DADOS.md e ainda não tem
-- verificação de execução (ver a secção «O que ainda não está verificado»).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete cascade,
  nome         text not null check (char_length(nome) between 2 and 60),
  telefone     text not null check (telefone ~ '^2449[0-9]{8}$'),
  municipio    text not null,
  bairro       text not null check (char_length(bairro) between 2 and 60),
  categoria    text not null check (
                 categoria in (
                   'informatica', 'electricidade', 'canalizacao',
                   'limpeza', 'explicacoes', 'cozinha'
                 )
               ),
  oficio       text not null check (char_length(oficio) between 2 and 60),
  descricao    text not null check (char_length(descricao) between 20 and 400),
  preco_texto  text check (preco_texto is null or char_length(preco_texto) <= 40),
  disponivel   boolean not null default true,
  exemplo      boolean not null default false,
  criado_em    timestamptz not null default now()
);

-- Um número pertence a um perfil só uma vez. Evita duplicados acidentais,
-- que numa plataforma de contactos significam confusão sobre quem é quem.
create unique index if not exists profiles_telefone_key on public.profiles (telefone);
create index if not exists profiles_pesquisa_idx
  on public.profiles (categoria, municipio, criado_em desc);

alter table public.profiles enable row level security;

-- Qualquer pessoa pode ver perfis disponíveis (é o produto).
create policy "perfis disponiveis sao publicos"
  on public.profiles for select
  using (disponivel = true or auth.uid() = auth_user_id);

-- Só uma conta autenticada cria o seu próprio perfil.
create policy "criar o proprio perfil"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

-- Só o dono edita o seu perfil.
create policy "editar o proprio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- ---------------------------------------------------------------------------
-- contact_events
-- ---------------------------------------------------------------------------
-- Regista que alguém iniciou contacto. É a métrica central do produto e a razão
-- pela qual esta tabela existe desde o primeiro dia: não se pode reconstruir
-- depois.

create table if not exists public.contact_events (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  origem     text not null default 'perfil' check (origem in ('perfil', 'pesquisa')),
  criado_em  timestamptz not null default now()
);

create index if not exists contact_events_profile_idx
  on public.contact_events (profile_id, criado_em desc);

alter table public.contact_events enable row level security;

-- O visitante que toca no botão não tem conta: o registo tem de ser permitido a
-- anónimos. LIMITAÇÃO CONHECIDA: sem limite de frequência, isto é um alvo de
-- spam. Mitigação planeada: função com limite por IP/dispositivo antes do piloto.
create policy "qualquer pessoa regista um contacto"
  on public.contact_events for insert
  to anon, authenticated
  with check (true);

-- Só o dono do perfil vê os contactos que recebeu.
create policy "o dono ve os contactos do seu perfil"
  on public.contact_events for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = contact_events.profile_id
        and p.auth_user_id = auth.uid()
    )
  );
