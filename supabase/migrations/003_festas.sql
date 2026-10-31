-- Festas: o host cria a festa, os convidados entram pelo código (ou QR code) e pedem músicas.
-- A fila é por ordem de chegada; só o host muda o status das músicas.

-- Funções auxiliares ficam fora do schema public, que é exposto pela API.
create schema if not exists private;
grant usage on schema private to authenticated;

-- Código de convite: 6 caracteres sem os que se confundem (0/O, 1/I/L).
create function private.new_party_code()
returns text
language plpgsql
volatile
security definer set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  candidate text;
begin
  loop
    candidate := '';
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.parties where code = candidate);
  end loop;
  return candidate;
end;
$$;

create table public.parties (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  code text not null unique,
  host_id uuid not null default auth.uid() references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
-- O default usa a função acima, que precisa da tabela já criada.
alter table public.parties alter column code set default private.new_party_code();
create index parties_host_id_idx on public.parties (host_id);

create table public.party_members (
  party_id uuid not null references public.parties on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (party_id, user_id)
);
create index party_members_user_id_idx on public.party_members (user_id);

create table public.queue_items (
  id bigint generated always as identity primary key,
  party_id uuid not null references public.parties on delete cascade,
  requested_by uuid not null default auth.uid() references public.profiles on delete cascade,
  track_id bigint not null,
  title text not null check (char_length(title) between 1 and 200),
  artist text not null check (char_length(artist) between 1 and 200),
  album text check (char_length(album) <= 200),
  artwork_url text check (char_length(artwork_url) <= 500),
  status text not null default 'queued' check (status in ('queued', 'playing', 'played', 'skipped')),
  created_at timestamptz not null default now()
);
create index queue_items_party_id_idx on public.queue_items (party_id, created_at, id);
create index queue_items_requested_by_idx on public.queue_items (requested_by);
-- No máximo uma música tocando por festa.
create unique index queue_items_one_playing_idx on public.queue_items (party_id) where status = 'playing';

-- Auxiliares das regras de segurança. São security definer para consultar party_members sem
-- cair na própria regra (recursão) e sempre comparam com o usuário logado.
create function private.is_party_member(p_party_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.party_members
    where party_id = p_party_id and user_id = (select auth.uid())
  );
$$;

create function private.is_party_host(p_party_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.parties
    where id = p_party_id and host_id = (select auth.uid())
  );
$$;

create function private.is_party_open(p_party_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (select 1 from public.parties where id = p_party_id and ended_at is null);
$$;

revoke execute on all functions in schema private from public, anon;
grant execute on function private.is_party_member(uuid), private.is_party_host(uuid),
  private.is_party_open(uuid), private.new_party_code() to authenticated;

-- O host vira membro da própria festa assim que ela é criada.
create function private.add_host_as_member()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.party_members (party_id, user_id) values (new.id, new.host_id);
  return new;
end;
$$;
revoke execute on function private.add_host_as_member() from public, anon, authenticated;

create trigger on_party_created
  after insert on public.parties
  for each row execute function private.add_host_as_member();

-- Ao colocar uma música para tocar, a que estava tocando passa para "tocou".
create function private.finish_previous_playing()
returns trigger
language plpgsql
security invoker set search_path = ''
as $$
begin
  update public.queue_items set status = 'played'
  where party_id = new.party_id and status = 'playing' and id <> new.id;
  return new;
end;
$$;
revoke execute on function private.finish_previous_playing() from public, anon, authenticated;

create trigger on_queue_item_playing
  before update of status on public.queue_items
  for each row when (new.status = 'playing' and old.status <> 'playing')
  execute function private.finish_previous_playing();

-- Entrar numa festa pelo código. Fica em public para ser chamada pela API (rpc), e é security
-- definer porque quem ainda não é membro não enxerga a festa.
create function public.join_party(p_code text)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_party uuid;
begin
  if v_user is null then
    raise exception 'Faça login para entrar numa festa' using errcode = '28000';
  end if;
  select id into v_party from public.parties
  where code = upper(trim(p_code)) and ended_at is null;
  if v_party is null then
    raise exception 'Festa não encontrada ou já encerrada' using errcode = 'P0002';
  end if;
  insert into public.party_members (party_id, user_id) values (v_party, v_user)
  on conflict do nothing;
  return v_party;
end;
$$;
revoke execute on function public.join_party(text) from public, anon;
grant execute on function public.join_party(text) to authenticated;

-- Regras de segurança (Row Level Security).
alter table public.parties enable row level security;
alter table public.party_members enable row level security;
alter table public.queue_items enable row level security;

-- Só as colunas que o app pode escrever; o resto vem dos defaults e dos triggers.
revoke insert, update, delete on public.parties, public.party_members, public.queue_items from anon, authenticated;
grant insert (name) on public.parties to authenticated;
grant update (name, ended_at) on public.parties to authenticated;
grant delete on public.party_members to authenticated;
grant insert (party_id, track_id, title, artist, album, artwork_url) on public.queue_items to authenticated;
grant update (status) on public.queue_items to authenticated;
grant delete on public.queue_items to authenticated;

create policy "membros veem a festa" on public.parties
  for select to authenticated
  using (host_id = (select auth.uid()) or (select private.is_party_member(id)));
create policy "criar festa como host" on public.parties
  for insert to authenticated
  with check (host_id = (select auth.uid()));
create policy "host edita ou encerra a festa" on public.parties
  for update to authenticated
  using (host_id = (select auth.uid()))
  with check (host_id = (select auth.uid()));

create policy "membros veem os outros membros" on public.party_members
  for select to authenticated
  using ((select private.is_party_member(party_id)));
create policy "convidado sai da festa" on public.party_members
  for delete to authenticated
  using (user_id = (select auth.uid()) and not (select private.is_party_host(party_id)));

create policy "membros veem a fila" on public.queue_items
  for select to authenticated
  using ((select private.is_party_member(party_id)));
create policy "membros pedem músicas com a festa aberta" on public.queue_items
  for insert to authenticated
  with check (
    requested_by = (select auth.uid())
    and status = 'queued'
    and (select private.is_party_member(party_id))
    and (select private.is_party_open(party_id))
  );
create policy "host muda o status das músicas" on public.queue_items
  for update to authenticated
  using ((select private.is_party_host(party_id)))
  with check ((select private.is_party_host(party_id)));
create policy "quem pediu tira da fila; host tira qualquer uma" on public.queue_items
  for delete to authenticated
  using (
    (requested_by = (select auth.uid()) and status = 'queued')
    or (select private.is_party_host(party_id))
  );

-- Atualização em tempo real da fila e do estado da festa (respeita as regras acima).
alter publication supabase_realtime add table public.queue_items, public.parties;
