import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

import { PartyCard } from '@/components/party';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { listMyParties, type MyParty } from '@/lib/db';
import { errorMessage } from '@/lib/errors';
import { useTheme } from '@/lib/theme';

export default function PartiesScreen() {
  const userId = useAuth().session!.user.id;
  const { colors, styles } = useTheme();
  const [parties, setParties] = useState<MyParty[] | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setParties(await listMyParties(userId));
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [userId]);

  // Recarrega ao voltar para esta aba (ex.: depois de sair ou encerrar uma festa).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />}
    >
      <Card>
        <Text style={styles.subtitle}>Bora fazer a festa?</Text>
        <Text style={styles.muted}>
          Crie uma festa e passe o código para os amigos, ou entre numa festa com o código ou QR code do DJ.
        </Text>
        <Button title="Criar festa" onPress={() => router.push('/create-party')} />
        <Button title="Entrar numa festa" variant="secondary" onPress={() => router.push('/join')} />
      </Card>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {parties && parties.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={styles.subtitle}>Suas festas</Text>
          {parties.map((p) => (
            <PartyCard
              key={p.id}
              party={p}
              onPress={() => router.push({ pathname: '/party/[id]', params: { id: p.id } })}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
