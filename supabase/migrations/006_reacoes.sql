-- Reações ao vivo: emojis transmitidos pelo Broadcast do Supabase Realtime no canal privado
-- "reactions:<id da festa>". Nada é salvo; estas regras só dizem quem pode enviar e receber:
-- apenas quem é membro da festa.
-- (RLS em realtime.messages já vem ativado pelo Supabase; não ativar aqui.)

create policy "membros recebem reações da festa" on realtime.messages
  for select to authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and exists (
      select 1 from public.party_members
      where user_id = (select auth.uid()) and 'reactions:' || party_id::text = (select realtime.topic())
    )
  );

create policy "membros enviam reações na festa" on realtime.messages
  for insert to authenticated
  with check (
    realtime.messages.extension = 'broadcast'
    and exists (
      select 1 from public.party_members
      where user_id = (select auth.uid()) and 'reactions:' || party_id::text = (select realtime.topic())
    )
  );
