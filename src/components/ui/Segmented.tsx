import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

// Abas para alternar visões dentro de uma mesma tela (ex.: Fila | Já tocaram).
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderRadius: 10,
        padding: 4,
        gap: 4,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: selected ? colors.primary : 'transparent',
            }}
          >
            <Text style={{ fontWeight: '600', color: selected ? colors.onPrimary : colors.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
