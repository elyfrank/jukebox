import type { ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = {
  title: string;
  artist: string;
  artworkUrl?: string | null;
  detail?: string;
  right?: ReactNode;
  onPress?: () => void;
  highlight?: boolean;
};

// Linha de música: capa, título, artista e uma linha extra (ex.: quem pediu).
export function SongRow({ title, artist, artworkUrl, detail, right, onPress, highlight }: Props) {
  const { colors, styles } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        styles.row,
        { padding: 10 },
        highlight && { borderColor: colors.primary, borderWidth: 2 },
        pressed && { opacity: 0.7 },
      ]}
    >
      {artworkUrl ? (
        <Image source={{ uri: artworkUrl }} style={{ width: 52, height: 52, borderRadius: 6 }} />
      ) : (
        <View style={{ width: 52, height: 52, borderRadius: 6, backgroundColor: colors.border }} />
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.text, { fontWeight: '600' }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.muted} numberOfLines={1}>
          {artist}
        </Text>
        {!!detail && (
          <Text style={[styles.muted, { fontSize: 12 }]} numberOfLines={1}>
            {detail}
          </Text>
        )}
      </View>
      {right}
    </Pressable>
  );
}
