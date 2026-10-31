import { supabase } from './supabase';

export type Profile = { name: string };

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('name').eq('id', userId).single();
  if (error) throw error;
  return data as Profile;
}

export async function updateName(userId: string, name: string) {
  const { error } = await supabase.from('profiles').update({ name: name.trim() }).eq('id', userId);
  if (error) throw error;
}

export type Party = {
  id: string;
  name: string;
  code: string;
  host_id: string;
  created_at: string;
  ended_at: string | null;
  host: Profile | null;
};

export type QueueStatus = 'queued' | 'playing' | 'played' | 'skipped';

export type QueueItem = {
  id: number;
  party_id: string;
  requested_by: string;
  track_id: number;
  title: string;
  artist: string;
  album: string | null;
  artwork_url: string | null;
  status: QueueStatus;
  created_at: string;
  requester: Profile | null;
};

export type NewQueueItem = Pick<QueueItem, 'track_id' | 'title' | 'artist' | 'album' | 'artwork_url'>;

// parties e profiles se ligam por mais de um caminho (host, membros, fila); "!fkey" diz qual usar.
const partyColumns = 'id, name, code, host_id, created_at, ended_at, host:profiles!parties_host_id_fkey(name)';

// Festas abertas das quais o usuário participa (as regras do banco só devolvem essas).
export async function listMyParties() {
  const { data, error } = await supabase
    .from('parties')
    .select(partyColumns)
    .is('ended_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as Party[];
}

export async function getParty(id: string) {
  const { data, error } = await supabase.from('parties').select(partyColumns).eq('id', id).single();
  if (error) throw error;
  return data as unknown as Party;
}

// O código de convite e a entrada do host como membro são gerados pelo banco.
export async function createParty(name: string) {
  const { data, error } = await supabase.from('parties').insert({ name: name.trim() }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function joinParty(code: string) {
  const { data, error } = await supabase.rpc('join_party', { p_code: code });
  if (error) throw error;
  return data as string;
}

export async function endParty(id: string) {
  const { error } = await supabase.from('parties').update({ ended_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function leaveParty(partyId: string, userId: string) {
  const { error } = await supabase.from('party_members').delete().eq('party_id', partyId).eq('user_id', userId);
  if (error) throw error;
}

export async function countMembers(partyId: string) {
  const { count, error } = await supabase
    .from('party_members')
    .select('*', { count: 'exact', head: true })
    .eq('party_id', partyId);
  if (error) throw error;
  return count ?? 0;
}

// Fila em ordem de chegada.
export async function listQueue(partyId: string) {
  const { data, error } = await supabase
    .from('queue_items')
    .select('*, requester:profiles!queue_items_requested_by_fkey(name)')
    .eq('party_id', partyId)
    .order('created_at')
    .order('id');
  if (error) throw error;
  return data as unknown as QueueItem[];
}

export async function requestSong(partyId: string, song: NewQueueItem) {
  const { error } = await supabase.from('queue_items').insert({ party_id: partyId, ...song });
  if (error) throw error;
}

// Só o host consegue (regra no banco). Ao tocar uma, a anterior vira "tocou" automaticamente.
export async function setQueueStatus(id: number, status: QueueStatus) {
  const { error } = await supabase.from('queue_items').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function removeFromQueue(id: number) {
  const { error } = await supabase.from('queue_items').delete().eq('id', id);
  if (error) throw error;
}

// Avisa quando a fila ou a festa mudam, para a tela recarregar.
export function subscribeToParty(partyId: string, onChange: () => void) {
  const channel = supabase
    .channel(`party:${partyId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_items', filter: `party_id=eq.${partyId}` }, onChange)
    // O Realtime não aplica filtro em exclusões, então escuta todas (vêm só com o id).
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'queue_items' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'parties', filter: `id=eq.${partyId}` }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
