import { useCallback, useEffect, useState } from 'react';

import { countMembers, getParty, listQueue, subscribeToParty, type Party, type QueueItem } from '@/lib/db';
import { errorMessage } from '@/lib/errors';

// Dados de uma festa (festa, fila e nº de pessoas), atualizados em tempo real.
export function useParty(id: string) {
  const [party, setParty] = useState<Party | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [members, setMembers] = useState(0);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(
    () =>
      Promise.all([getParty(id), listQueue(id), countMembers(id)]).then(
        ([p, q, m]) => {
          setParty(p);
          setQueue(q);
          setMembers(m);
          setError('');
        },
        (e) => setError(errorMessage(e)),
      ),
    [id],
  );

  useEffect(() => {
    reload();
    return subscribeToParty(id, reload);
  }, [id, reload]);

  async function refresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  return {
    party,
    members,
    error,
    refreshing,
    refresh,
    reload,
    playing: queue.find((q) => q.status === 'playing'),
    queued: queue.filter((q) => q.status === 'queued'),
    history: queue.filter((q) => q.status === 'played' || q.status === 'skipped').reverse(),
  };
}
