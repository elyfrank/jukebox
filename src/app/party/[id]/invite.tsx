import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';

import { getParty, type Party } from '@/lib/db';
import { QRCode, inviteLink } from '@/lib/qr';
import { Button, Card, errorMessage, useTheme } from '@/lib/ui';

export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { styles } = useTheme();
  const [party, setParty] = useState<Party | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getParty(id)
      .then(setParty)
      .catch((e) => setError(errorMessage(e)));
  }, [id]);

  function share() {
    if (!party) return;
    Share.share({
      message: `Entra na festa "${party.name}" no JukeBox e peça suas músicas! Código: ${party.code}`,
    });
  }

  // O convite sempre abre por cima da tela da festa.
  function goToParty() {
    router.back();
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {party && (
        <Card>
          <Text style={[styles.title, { textAlign: 'center' }]}>{party.name}</Text>
          <Text style={[styles.muted, { textAlign: 'center' }]}>
            Os convidados escaneiam o QR code ou digitam o código em &quot;Entrar numa festa&quot;.
          </Text>
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <QRCode value={inviteLink(party.code)} size={240} />
          </View>
          <Text style={[styles.bigNumber, { textAlign: 'center', letterSpacing: 6 }]}>{party.code}</Text>
          <Button title="Compartilhar código" onPress={share} />
          <Button title="Ir para a festa" variant="secondary" onPress={goToParty} />
        </Card>
      )}
    </ScrollView>
  );
}
