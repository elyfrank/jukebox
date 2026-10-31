import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = { onPress: () => void; bottom: number };

// Botão flutuante "Pedir música", fixo no canto de baixo ao alcance do polegar.
export function RequestSongButton({ onPress, bottom }: Props) {
  const { colors, styles } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        {
          position: 'absolute',
          right: 16,
          bottom,
          gap: 8,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 28,
          backgroundColor: colors.primary,
          elevation: 4,
          shadowColor: '#000000',
          shadowOpacity: 0.25,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <MaterialIcons name="add" size={22} color={colors.onPrimary} />
      <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '700' }}>Pedir música</Text>
    </Pressable>
  );
}
