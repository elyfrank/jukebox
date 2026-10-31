import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { joinParty } from '@/lib/db';
import { codeFromScan } from '@/lib/qr';
import { Button, Card, errorMessage, useTheme } from '@/lib/ui';

export default function ScanScreen() {
  const { colors, styles } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  // A câmera dispara várias leituras seguidas do mesmo QR; processa só a primeira.
  const busy = useRef(false);

  async function onScanned({ data }: BarcodeScanningResult) {
    if (busy.current) return;
    const code = codeFromScan(data);
    if (!code) return setError('Esse QR code não é de uma festa do JukeBox');
    busy.current = true;
    setError('');
    setJoining(true);
    try {
      const id = await joinParty(code);
      router.replace({ pathname: '/party/[id]', params: { id } });
    } catch (e) {
      setError(errorMessage(e));
      setJoining(false);
      // Espera um pouco antes de aceitar outra leitura, para não repetir o mesmo erro.
      setTimeout(() => (busy.current = false), 1500);
    }
  }

  if (!permission) return <View style={styles.screen} />;

  if (!permission.granted) {
    return (
      <View style={[styles.screen, styles.content]}>
        <Card>
          <Text style={styles.text}>Para escanear o QR code da festa, o JukeBox precisa usar a câmera.</Text>
          <Button title="Permitir câmera" onPress={requestPermission} />
          <Button title="Digitar o código" variant="secondary" onPress={() => router.replace('/join')} />
        </Card>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onScanned}
      />
      <View style={[styles.content, { marginTop: 'auto' }]}>
        <Card>
          {joining ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.text}>Aponte a câmera para o QR code que o host está mostrando.</Text>
          )}
          {!!error && <Text style={styles.error}>{error}</Text>}
        </Card>
      </View>
    </View>
  );
}
