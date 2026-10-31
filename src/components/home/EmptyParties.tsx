import { Image, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

const symbol = require('../../../public/images/simbolo/simbolo-roxo-1024.png');

// Mostrado quando o usuário ainda não está em nenhuma festa.
export function EmptyParties() {
  const { styles } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 8, paddingVertical: 32, paddingHorizontal: 24 }}>
      <Image source={symbol} style={{ width: 88, height: 88, opacity: 0.9 }} resizeMode="contain" />
      <Text style={[styles.subtitle, { textAlign: 'center' }]}>Nenhuma festa por aqui ainda</Text>
      <Text style={[styles.muted, { textAlign: 'center' }]}>
        Crie a sua e chame os amigos, ou peça o código ou o QR code para quem é o DJ.
      </Text>
    </View>
  );
}
