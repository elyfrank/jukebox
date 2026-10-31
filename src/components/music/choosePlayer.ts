import { showDialog } from '@/components/ui';
import { openInPlayer, playerLinks } from '@/lib/itunes';

// Pergunta em qual app de música abrir a busca da música.
export function choosePlayer(song: { title: string; artist: string }) {
  showDialog('Abrir em qual player?', `${song.title} — ${song.artist}`, [
    ...playerLinks(song).map((p) => ({ text: p.label, onPress: () => openInPlayer(p) })),
    { text: 'Agora não', style: 'cancel' },
  ]);
}
