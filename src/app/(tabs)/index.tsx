import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { listMyParties, type Party } from '@/lib/db';
import { errorMessage } from '@/lib/errors';
import { useTheme } from '@/lib/theme';

export default function PartiesScreen() {
  const { session } = useAuth();
  const { colors, styles } = useTheme();
  const [parties, setParties] = useState<Party[] | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setParties(await listMyParties());
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

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
          Crie uma festa e passe o código para os amigos, ou entre numa festa com o código ou QR code do host.
        </Text>
        <Button title="Criar festa" onPress={() => router.push('/create-party')} />
        <Button title="Entrar numa festa" variant="secondary" onPress={() => router.push('/join')} />
      </Card>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {parties && parties.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={styles.subtitle}>Suas festas</Text>
          {parties.map((p) => {
            const isHost = p.host_id === session!.user.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => router.push({ pathname: '/party/[id]', params: { id: p.id } })}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
              >
                <View style={[styles.row, { justifyContent: 'space-between' }]}>
                  <Text style={[styles.subtitle, { flex: 1 }]} numberOfLines={1}>
                    {p.name}
                  </Text>
                  {isHost && <Text style={{ color: colors.primary, fontWeight: '600' }}>Host</Text>}
                </View>
                <Text style={styles.muted}>
                  {isHost ? `Código ${p.code}` : `Host: ${p.host?.name ?? '—'}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
