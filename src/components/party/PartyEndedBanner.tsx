import { Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

export function PartyEndedBanner() {
  const { styles } = useTheme();
  return (
    <View style={[styles.card, { padding: 12 }]}>
      <Text style={styles.subtitle}>Festa encerrada</Text>
      <Text style={styles.muted}>Não dá mais para pedir músicas.</Text>
    </View>
  );
}
