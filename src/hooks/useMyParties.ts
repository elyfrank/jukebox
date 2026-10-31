import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { listMyParties, listNowPlaying, type MyParty, type NowPlaying } from '@/lib/db';
import { errorMessage } from '@/lib/errors';

export type HomeParty = MyParty & { nowPlaying?: NowPlaying };

// Festas abertas do usuário com o que está tocando em cada uma; recarrega ao voltar para a tela.
export function useMyParties(userId: string) {
  const [parties, setParties] = useState<HomeParty[] | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const mine = await listMyParties(userId);
      const playing = await listNowPlaying(mine.map((p) => p.id));
      setParties(mine.map((p) => ({ ...p, nowPlaying: playing.find((n) => n.party_id === p.id) })));
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return { parties, error, refreshing, refresh };
}
