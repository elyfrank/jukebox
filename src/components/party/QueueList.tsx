import type { ReactElement } from 'react';
import { FlatList, RefreshControl, Text } from 'react-native';

import { SongRow } from '@/components/music';
import type { QueueItem } from '@/lib/db';
import { useTheme } from '@/lib/theme';

type Props = {
  items: QueueItem[];
  detail: (item: QueueItem, index: number) => string;
  onPressItem?: (item: QueueItem) => (() => void) | undefined;
  hint?: string;
  emptyText: string;
  refreshing: boolean;
  onRefresh: () => void;
  bottomSpace: number;
};

// Lista rolável de músicas da festa (fila ou histórico), com puxar para atualizar.
export function QueueList({ items, detail, onPressItem, hint, emptyText, refreshing, onRefresh, bottomSpace }: Props) {
  const { colors, styles } = useTheme();
  const header: ReactElement | undefined = hint ? <Text style={styles.muted}>{hint}</Text> : undefined;
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={[styles.content, { paddingTop: 8, gap: 8, paddingBottom: bottomSpace }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={[styles.muted, { textAlign: 'center', marginTop: 16 }]}>{emptyText}</Text>}
      renderItem={({ item, index }) => (
        <SongRow
          title={item.title}
          artist={item.artist}
          artworkUrl={item.artwork_url}
          detail={detail(item, index)}
          onPress={onPressItem?.(item)}
        />
      )}
    />
  );
}
