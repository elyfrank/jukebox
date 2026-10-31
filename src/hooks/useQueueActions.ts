import { choosePlayer } from '@/components/music';
import { showDialog } from '@/components/ui';
import { removeFromQueue, setQueueStatus, type QueueItem } from '@/lib/db';

import { useRunAction } from './useRunAction';

type Params = {
  isHost: boolean;
  userId: string;
  playing?: QueueItem;
  queued: QueueItem[];
  reload: () => Promise<unknown>;
};

// Ações sobre as músicas da fila: o host toca/pula; quem pediu pode tirar a sua da fila.
export function useQueueActions({ isHost, userId, playing, queued, reload }: Params) {
  const run = useRunAction(reload);

  async function play(item: QueueItem) {
    await run(() => setQueueStatus(item.id, 'playing'));
    choosePlayer(item);
  }

  // Toca a primeira da fila (a que está tocando vira "tocou" no banco); sem fila, só encerra a atual.
  function advance() {
    if (queued[0]) play(queued[0]);
    else if (playing) run(() => setQueueStatus(playing.id, 'played'));
  }

  // Encerrar a música atual não tem volta, então confirma antes (evita toque sem querer).
  function playNext() {
    if (!playing) return advance();
    showDialog('Já tocou essa música?', `${playing.title} — ${playing.artist}`, [
      { text: queued[0] ? 'Sim, tocar a próxima' : 'Sim, já tocou', onPress: advance },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function canPress(item: QueueItem) {
    return isHost || item.requested_by === userId;
  }

  function pressQueued(item: QueueItem) {
    if (isHost) {
      showDialog(item.title, item.artist, [
        { text: 'Tocar agora', onPress: () => play(item) },
        { text: 'Pular', style: 'destructive', onPress: () => run(() => setQueueStatus(item.id, 'skipped')) },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } else if (item.requested_by === userId) {
      showDialog('Tirar da fila?', `${item.title} — ${item.artist}`, [
        { text: 'Tirar', style: 'destructive', onPress: () => run(() => removeFromQueue(item.id)) },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  }

  return { playNext, canPress, pressQueued };
}
