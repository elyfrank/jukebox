import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = { playing: boolean; loading: boolean; onPress: () => void };

// Botão redondo de tocar/pausar a prévia de uma música.
export function PreviewButton({ playing, loading, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={playing ? 'Pausar prévia' : 'Ouvir prévia'}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} size="small" />
      ) : (
        <Text style={{ color: colors.onPrimary, fontSize: 16 }}>{playing ? '❚❚' : '▶'}</Text>
      )}
    </Pressable>
  );
}
