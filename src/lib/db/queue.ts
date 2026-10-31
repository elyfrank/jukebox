import { supabase } from '../supabase';

import type { Profile } from './profiles';

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

// Só hosts conseguem (regra no banco). Ao tocar uma, a anterior vira "tocou" automaticamente.
export async function setQueueStatus(id: number, status: QueueStatus) {
  const { error } = await supabase.from('queue_items').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function removeFromQueue(id: number) {
  const { error } = await supabase.from('queue_items').delete().eq('id', id);
  if (error) throw error;
}
