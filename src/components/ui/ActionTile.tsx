import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { Pressable, Text } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  primary?: boolean;
};

// Atalho grande com ícone, título e uma linha de apoio (ex.: "Criar festa").
export function ActionTile({ icon, title, subtitle, onPress, primary }: Props) {
  const { colors, styles } = useTheme();
  const fg = primary ? colors.onPrimary : colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        { flex: 1, gap: 6, padding: 14 },
        primary && { backgroundColor: colors.primary, borderColor: colors.primary },
        pressed && { opacity: 0.8 },
      ]}
    >
      <MaterialIcons name={icon} size={28} color={primary ? colors.onPrimary : colors.primary} />
      <Text style={{ color: fg, fontSize: 16, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: primary ? colors.onPrimary : colors.muted, fontSize: 12, opacity: primary ? 0.85 : 1 }}>
        {subtitle}
      </Text>
    </Pressable>
  );
}
