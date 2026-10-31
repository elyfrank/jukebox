import { Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

// Saudação no topo da tela inicial.
export function Greeting({ name }: { name: string }) {
  const { styles } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text style={[styles.title, { fontSize: 28 }]}>{name ? `Oi, ${name} 👋` : 'Oi! 👋'}</Text>
      <Text style={styles.muted}>Qual vai ser a trilha sonora de hoje?</Text>
    </View>
  );
}
