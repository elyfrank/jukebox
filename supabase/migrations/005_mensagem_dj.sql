-- Na interface, o host da festa passou a se chamar "DJ". Só troca a mensagem de erro que o app mostra
-- quando a festa ficaria sem DJ; a regra é a mesma da migração 004.
create or replace function private.ensure_party_has_host()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if old.role = 'host'
    and exists (select 1 from public.parties where id = old.party_id and ended_at is null)
    and not exists (select 1 from public.party_members where party_id = old.party_id and role = 'host')
  then
    raise exception 'A festa precisa de pelo menos um DJ. Torne outra pessoa DJ antes.'
      using errcode = 'P0001';
  end if;
  return null;
end;
$$;
