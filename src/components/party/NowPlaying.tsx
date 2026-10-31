import { Text, View } from 'react-native';

import { SongRow } from '@/components/music';
import { SectionLabel } from '@/components/ui';
import type { QueueItem } from '@/lib/db';
import { useTheme } from '@/lib/theme';

type Props = { playing?: QueueItem; requesterName: (item: QueueItem) => string; emptyHint: string };

// Bloco "tocando agora", fixo no topo da tela da festa.
export function NowPlaying({ playing, requesterName, emptyHint }: Props) {
  const { styles } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <SectionLabel>TOCANDO AGORA</SectionLabel>
      {playing ? (
        <SongRow
          title={playing.title}
          artist={playing.artist}
          artworkUrl={playing.artwork_url}
          detail={`Pedida por ${requesterName(playing)}`}
          highlight
        />
      ) : (
        <View style={[styles.card, { padding: 12 }]}>
          <Text style={styles.muted}>{emptyHint}</Text>
        </View>
      )}
    </View>
  );
}
