import { useCallback, useEffect, useState } from 'react';

import { getParty, listMembers, listQueue, subscribeToParty, type Member, type Party, type QueueItem } from '@/lib/db';
import { errorMessage } from '@/lib/errors';

// Dados de uma festa (festa, fila e pessoas) do ponto de vista do usuário, atualizados em tempo real.
export function useParty(id: string, userId: string) {
  const [party, setParty] = useState<Party | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(
    () =>
      Promise.all([getParty(id), listQueue(id), listMembers(id)]).then(
        ([p, q, m]) => {
          // Sem acesso à festa ou fora da lista de pessoas: o usuário saiu ou foi removido.
          setRemoved(!p || !m.some((x) => x.user_id === userId));
          setParty(p);
          setQueue(q);
          setMembers(m);
          setError('');
        },
        (e) => setError(errorMessage(e)),
      ),
    [id, userId],
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
    removed,
    error,
    refreshing,
    refresh,
    reload,
    isHost: members.some((m) => m.user_id === userId && m.role === 'host'),
    playing: queue.find((q) => q.status === 'playing'),
    queued: queue.filter((q) => q.status === 'queued'),
    history: queue.filter((q) => q.status === 'played' || q.status === 'skipped').reverse(),
  };
}
