import { ScrollView, Text } from 'react-native';

import { Card, useTheme } from '@/lib/ui';

export default function QueueScreen() {
  const { styles } = useTheme();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.subtitle}>Fila de músicas</Text>
        <Text style={styles.muted}>Em breve: entre numa sala, sugira músicas e vote nas próximas.</Text>
      </Card>
    </ScrollView>
  );
}
