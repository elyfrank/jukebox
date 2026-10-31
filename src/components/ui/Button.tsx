import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function Button({ title, onPress, loading, variant = 'primary' }: Props) {
  const { colors, styles } = useTheme();
  const filled = variant === 'primary';
  const fg = filled ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        filled ? { backgroundColor: colors.primary } : { borderColor: fg, borderWidth: 1 },
        (pressed || loading) && { opacity: 0.7 },
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}
