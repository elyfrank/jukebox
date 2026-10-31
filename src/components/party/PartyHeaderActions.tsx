import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = { members: number; onInvite?: () => void; onMenu: () => void };

// Lado direito do cabeçalho da festa: nº de pessoas, convite (QR code) e menu.
export function PartyHeaderActions({ members, onInvite, onMenu }: Props) {
  const { colors, styles } = useTheme();
  return (
    <View style={[styles.row, { gap: 16 }]}>
      <View style={[styles.row, { gap: 4 }]} accessibilityLabel={`${members} pessoas na festa`}>
        <MaterialIcons name="group" size={20} color={colors.muted} />
        <Text style={styles.muted}>{members}</Text>
      </View>
      {onInvite && (
        <Pressable hitSlop={8} accessibilityLabel="Convidar" onPress={onInvite}>
          <MaterialIcons name="qr-code-2" size={24} color={colors.primary} />
        </Pressable>
      )}
      <Pressable hitSlop={8} accessibilityLabel="Mais opções" onPress={onMenu}>
        <MaterialIcons name="more-vert" size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}
