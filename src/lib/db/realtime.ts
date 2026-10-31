import { supabase } from '../supabase';

// O supabase-js reaproveita canais de mesmo nome; cada tela precisa do seu (ex.: festa e Pessoas abertas juntas).
let nextChannelId = 0;

// Avisa quando a festa, a fila ou as pessoas mudam, para a tela recarregar.
export function subscribeToParty(partyId: string, onChange: () => void) {
  const filter = `party_id=eq.${partyId}`;
  const channel = supabase
    .channel(`party:${partyId}:${++nextChannelId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'parties', filter: `id=eq.${partyId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_items', filter }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'party_members', filter }, onChange)
    // O Realtime não aplica filtro em exclusões, então escuta todas (vêm só com a chave).
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'queue_items' }, onChange)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'party_members' }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
