import { useState } from 'react';

import { showDialog } from '@/components/ui';
import { requestSong } from '@/lib/db';
import { errorMessage } from '@/lib/errors';
import type { SearchResult } from '@/lib/itunes';

// Confirma e envia o pedido de música para a fila, lembrando o que já foi pedido nesta busca.
export function useRequestSong(partyId: string) {
  const [requested, setRequested] = useState<Set<number>>(new Set());

  async function send(song: SearchResult) {
    try {
      // Só os campos da fila; a prévia não é salva.
      const { track_id, title, artist, album, artwork_url } = song;
      await requestSong(partyId, { track_id, title, artist, album, artwork_url });
      setRequested((prev) => new Set(prev).add(track_id));
    } catch (e) {
      showDialog('Erro', errorMessage(e));
    }
  }

  function confirm(song: SearchResult) {
    showDialog('Pedir esta música?', `${song.title} — ${song.artist}`, [
      { text: 'Pedir', onPress: () => send(song) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return { confirm, wasRequested: (id: number) => requested.has(id) };
}
