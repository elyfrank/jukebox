import { View } from 'react-native';

import { ActionTile } from '@/components/ui';

type Props = { onCreate: () => void; onJoin: () => void };

// Atalhos principais da tela inicial: criar uma festa ou entrar numa.
export function QuickActions({ onCreate, onJoin }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <ActionTile primary icon="celebration" title="Criar festa" subtitle="Você vira o DJ" onPress={onCreate} />
      <ActionTile icon="qr-code-scanner" title="Entrar" subtitle="Com código ou QR code" onPress={onJoin} />
    </View>
  );
}
