import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = { name: string; tags: string[]; isHost: boolean; onPress?: () => void };

// Linha de pessoa na festa: ícone do papel, nome e marcadores (ex.: "você", "criou a festa").
export function MemberRow({ name, tags, isHost, onPress }: Props) {
  const { colors, styles } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, styles.row, { padding: 12 }, pressed && { opacity: 0.7 }]}
    >
      <MaterialIcons name={isHost ? 'headphones' : 'person'} size={24} color={isHost ? colors.primary : colors.muted} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.text, { fontWeight: '600' }]} numberOfLines={1}>
          {name}
        </Text>
        {tags.length > 0 && <Text style={[styles.muted, { fontSize: 12 }]}>{tags.join(' · ')}</Text>}
      </View>
      {onPress && <MaterialIcons name="more-vert" size={20} color={colors.muted} />}
    </Pressable>
  );
}
