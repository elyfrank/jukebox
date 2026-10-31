import { View } from 'react-native';

import { choosePlayer } from '@/components/music';
import { Button } from '@/components/ui';
import type { QueueItem } from '@/lib/db';
import { useTheme } from '@/lib/theme';

type Props = { playing?: QueueItem; hasQueue: boolean; onNext: () => void };

// Botões do host abaixo do "tocando agora": abrir no player e passar para a próxima.
export function HostControls({ playing, hasQueue, onNext }: Props) {
  const { styles } = useTheme();
  if (!playing && !hasQueue) return null;
  const nextLabel = !playing ? 'Tocar a primeira' : hasQueue ? 'Próxima' : 'Já tocou';
  return (
    <View style={styles.row}>
      {playing && (
        <View style={{ flex: 1 }}>
          <Button title="Abrir no player" variant="secondary" onPress={() => choosePlayer(playing)} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Button title={nextLabel} onPress={onNext} />
      </View>
    </View>
  );
}
