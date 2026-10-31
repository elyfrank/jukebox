import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, Text, View } from 'react-native';

import type { MyParty } from '@/lib/db';
import { useTheme } from '@/lib/theme';

// Card de uma festa na lista "Suas festas", com uma coroa quando o usuário é host nela.
export function PartyCard({ party, onPress }: { party: MyParty; onPress: () => void }) {
  const { colors, styles } = useTheme();
  const isHost = party.role === 'host';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <Text style={[styles.subtitle, { flex: 1 }]} numberOfLines={1}>
          {party.name}
        </Text>
        {isHost && <MaterialCommunityIcons name="crown" size={22} color={colors.primary} accessibilityLabel="Você é DJ" />}
      </View>
      <Text style={styles.muted}>
        Criada por {party.creator?.name ?? '—'}
        {isHost ? ` · código ${party.code}` : ''}
      </Text>
    </Pressable>
  );
}
