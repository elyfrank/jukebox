-- Jukebox: esquema inicial do banco.
-- Cole no Supabase em "SQL Editor" > "New query" e clique em "Run", ou aplique com
-- `npx supabase db push --linked`.

-- Perfil público de cada usuário (nome exibido para os outros).
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 60)
);

-- Cria o perfil automaticamente no cadastro, usando o nome enviado no signUp.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 'Ouvinte'), 60));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Regras de segurança (Row Level Security).
alter table public.profiles enable row level security;

create policy "perfis visíveis para usuários logados" on public.profiles
  for select to authenticated using (true);
create policy "editar o próprio perfil" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
