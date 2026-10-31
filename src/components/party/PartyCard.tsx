import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, Pressable, Text, View } from 'react-native';

import type { MyParty, NowPlaying } from '@/lib/db';
import { useTheme } from '@/lib/theme';

type Props = { party: MyParty; nowPlaying?: NowPlaying; onPress: () => void };

// Card de uma festa em "Suas festas": o que está tocando, quantas pessoas e a coroa se o usuário é DJ.
export function PartyCard({ party, nowPlaying, onPress }: Props) {
  const { colors, styles } = useTheme();
  const isDj = party.role === 'host';
  const details = [`${party.memberCount} ${party.memberCount === 1 ? 'pessoa' : 'pessoas'}`];
  details.push(isDj ? `código ${party.code}` : `por ${party.creator?.name ?? '—'}`);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, styles.row, pressed && { opacity: 0.7 }]}>
      {nowPlaying?.artwork_url ? (
        <Image source={{ uri: nowPlaying.artwork_url }} style={{ width: 56, height: 56, borderRadius: 8 }} />
      ) : (
        <View
          style={{ width: 56, height: 56, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border }}
        >
          <MaterialIcons name="music-note" size={26} color={colors.muted} />
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={[styles.row, { gap: 6 }]}>
          <Text style={[styles.subtitle, { flexShrink: 1 }]} numberOfLines={1}>
            {party.name}
          </Text>
          {isDj && <MaterialCommunityIcons name="crown" size={18} color={colors.primary} accessibilityLabel="Você é DJ" />}
        </View>
        <Text style={{ color: nowPlaying ? colors.primary : colors.muted }} numberOfLines={1}>
          {nowPlaying ? `▶ ${nowPlaying.title} — ${nowPlaying.artist}` : 'Nada tocando agora'}
        </Text>
        <Text style={[styles.muted, { fontSize: 12 }]} numberOfLines={1}>
          {details.join(' · ')}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
    </Pressable>
  );
}
