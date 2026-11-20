-- SALU — incremento 5: urgência, orçamento indicativo e histórico do pedido.
--
-- Aplicar DEPOIS de 0001 a 0004. Não executado contra nenhuma base de dados.
--
-- O histórico é um jsonb no próprio pedido, e não uma tabela: é escrito apenas
-- pelo servidor (futuras funções Postgres) e lido sempre inteiro com o pedido.
-- Se um dia precisar de consulta transversal, promove-se a tabela.

alter table public.requests
  add column if not exists urgencia text not null default 'flexivel'
    check (urgencia in ('flexivel', 'esta-semana', 'urgente'));

alter table public.requests
  add column if not exists orcamento_texto text
    check (orcamento_texto is null or char_length(orcamento_texto) <= 40);

alter table public.requests
  add column if not exists historico jsonb not null default '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- profiles: tipo de entidade, competências e disponibilidade
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists tipo_entidade text not null default 'individual'
    check (tipo_entidade in ('individual', 'pequeno-negocio', 'empresa'));

alter table public.profiles
  add column if not exists competencias jsonb not null default '[]'::jsonb
    check (jsonb_typeof(competencias) = 'array' and jsonb_array_length(competencias) <= 8);

alter table public.profiles
  add column if not exists disponibilidade_texto text
    check (disponibilidade_texto is null or char_length(disponibilidade_texto) <= 60);

-- ---------------------------------------------------------------------------
-- reviews: três dimensões e «voltaria a trabalhar»
-- ---------------------------------------------------------------------------

alter table public.reviews
  add column if not exists dimensoes jsonb
    check (
      dimensoes is null or (
        (dimensoes->>'comunicacao')::int between 1 and 5
        and (dimensoes->>'pontualidade')::int between 1 and 5
        and (dimensoes->>'qualidade')::int between 1 and 5
      )
    );

alter table public.reviews
  add column if not exists voltaria boolean;
