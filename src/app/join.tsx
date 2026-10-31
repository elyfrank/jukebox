import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button, Card, Input } from '@/components/ui';
import { joinParty } from '@/lib/db';
import { errorMessage } from '@/lib/errors';
import { useTheme } from '@/lib/theme';

export default function JoinScreen() {
  const { styles } = useTheme();
  // O código pode vir do link do convite (jukebox://join?code=...).
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code?.toUpperCase() ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (code.trim().length !== 6) return setError('O código tem 6 caracteres');
    setError('');
    setLoading(true);
    try {
      const id = await joinParty(code);
      router.replace({ pathname: '/party/[id]', params: { id } });
    } catch (e) {
      setError(errorMessage(e));
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.muted}>Digite o código que o host passou.</Text>
        <Input
          placeholder="Código (ex.: K7QX2M)"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          onSubmitEditing={submit}
          returnKeyType="go"
          style={{ fontSize: 22, letterSpacing: 4, textAlign: 'center' }}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button title="Entrar" onPress={submit} loading={loading} />
      </Card>
      <Button title="Escanear QR code" variant="secondary" onPress={() => router.replace('/scan')} />
    </ScrollView>
  );
}
