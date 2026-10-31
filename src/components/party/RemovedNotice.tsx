import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { useTheme } from '@/lib/theme';

// Mostrado quando o usuário não faz mais parte da festa (saiu ou foi removido por um host).
export function RemovedNotice() {
  const { styles } = useTheme();
  return (
    <View style={[styles.screen, styles.content]}>
      <Card>
        <Text style={styles.subtitle}>Você não está mais nesta festa</Text>
        <Text style={styles.muted}>Um host removeu você. Se tiver o código, pode entrar de novo.</Text>
        <Button title="Voltar" onPress={() => router.back()} />
      </Card>
    </View>
  );
}
