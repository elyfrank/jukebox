import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = { members: number; onMembers: () => void; onInvite?: () => void; onMenu: () => void };

// Lado direito do cabeçalho da festa: pessoas, convite (QR code) e menu.
export function PartyHeaderActions({ members, onMembers, onInvite, onMenu }: Props) {
  const { colors, styles } = useTheme();
  return (
    <View style={[styles.row, { gap: 16 }]}>
      <Pressable
        hitSlop={8}
        onPress={onMembers}
        accessibilityLabel={`Pessoas na festa: ${members}`}
        style={[styles.row, { gap: 4 }]}
      >
        <MaterialIcons name="group" size={22} color={colors.primary} />
        <Text style={{ color: colors.primary, fontWeight: '600' }}>{members}</Text>
      </Pressable>
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
