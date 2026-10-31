import { Text } from 'react-native';

import { useTheme } from '@/lib/theme';

// Rótulo pequeno em caixa alta acima de um bloco (ex.: "TOCANDO AGORA").
export function SectionLabel({ children }: { children: string }) {
  const { styles } = useTheme();
  return <Text style={[styles.muted, { fontSize: 12, fontWeight: '700', letterSpacing: 1 }]}>{children}</Text>;
}
