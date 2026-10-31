-- Vários hosts por festa: o papel (host ou convidado) passa a ficar em party_members.
-- Todos os hosts são iguais (inclusive quem criou); parties.host_id vira só "quem criou a festa".
-- Regra no banco: uma festa aberta nunca fica sem host.

alter table public.party_members
  add column role text not null default 'guest' check (role in ('host', 'guest'));

-- Quem criou cada festa existente vira host dela.
update public.party_members m set role = 'host'
from public.parties p
where p.id = m.party_id and p.host_id = m.user_id;

create index party_members_hosts_idx on public.party_members (party_id) where role = 'host';

-- Quem cria a festa entra como host.
create or replace function private.add_host_as_member()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.party_members (party_id, user_id, role) values (new.id, new.host_id, 'host');
  return new;
end;
$$;

-- "É host" agora olha o papel do usuário logado na festa, não mais quem criou.
create or replace function private.is_party_host(p_party_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.party_members
    where party_id = p_party_id and user_id = (select auth.uid()) and role = 'host'
  );
$$;

-- Bloqueia sair, ser removido ou deixar de ser host quando isso deixaria uma festa aberta sem host.
-- Security definer para enxergar todos os membros (quem acabou de sair já não passa nas regras).
create function private.ensure_party_has_host()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if old.role = 'host'
    and exists (select 1 from public.parties where id = old.party_id and ended_at is null)
    and not exists (select 1 from public.party_members where party_id = old.party_id and role = 'host')
  then
    raise exception 'A festa precisa de pelo menos um host. Promova alguém a host antes.'
      using errcode = 'P0001';
  end if;
  return null;
end;
$$;
revoke execute on function private.ensure_party_has_host() from public, anon, authenticated;

create trigger party_keeps_a_host
  after update of role or delete on public.party_members
  for each row execute function private.ensure_party_has_host();

-- Regras de segurança: o que era "quem criou" passa a ser "qualquer host".
drop policy "host edita ou encerra a festa" on public.parties;
create policy "hosts editam ou encerram a festa" on public.parties
  for update to authenticated
  using ((select private.is_party_host(id)))
  with check ((select private.is_party_host(id)));

drop policy "convidado sai da festa" on public.party_members;
create policy "sair da festa ou host remove alguém" on public.party_members
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select private.is_party_host(party_id)));

grant update (role) on public.party_members to authenticated;
create policy "hosts promovem ou rebaixam" on public.party_members
  for update to authenticated
  using ((select private.is_party_host(party_id)))
  with check ((select private.is_party_host(party_id)));

-- Promoções e remoções aparecem na hora para todos da festa.
alter publication supabase_realtime add table public.party_members;
