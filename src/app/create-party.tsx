import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button, Card, Input } from '@/components/ui';
import { createParty } from '@/lib/db';
import { errorMessage } from '@/lib/errors';
import { useTheme } from '@/lib/theme';

export default function CreatePartyScreen() {
  const { styles } = useTheme();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!name.trim()) return setError('Dê um nome para a festa');
    setError('');
    setLoading(true);
    try {
      const id = await createParty(name);
      // Abre a festa e, por cima, o convite com o QR code; voltar do convite cai na festa.
      router.replace({ pathname: '/party/[id]', params: { id } });
      router.push({ pathname: '/party/[id]/invite', params: { id } });
    } catch (e) {
      setError(errorMessage(e));
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.muted}>Você será o DJ: recebe os pedidos e coloca as músicas para tocar.</Text>
        <Input
          placeholder="Nome da festa (ex.: Niver da Ana)"
          value={name}
          onChangeText={setName}
          maxLength={60}
          autoFocus
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button title="Criar festa" onPress={submit} loading={loading} />
      </Card>
    </ScrollView>
  );
}
