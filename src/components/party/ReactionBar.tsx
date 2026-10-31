import { Pressable, Text, View } from 'react-native';

import { REACTION_EMOJIS, type ReactionEmoji } from '@/lib/reactions';
import { useTheme } from '@/lib/theme';

// Botões de reação para a música que está tocando.
export function ReactionBar({ onReact }: { onReact: (emoji: ReactionEmoji) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
      {REACTION_EMOJIS.map((emoji) => (
        <Pressable
          key={emoji}
          onPress={() => onReact(emoji)}
          accessibilityLabel={`Reagir com ${emoji}`}
          style={({ pressed }) => ({
            flex: 1,
            alignItems: 'center',
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            transform: [{ scale: pressed ? 1.2 : 1 }],
          })}
        >
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
}
