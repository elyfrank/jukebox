import { StyleSheet } from 'react-native';

import type { Colors } from './palettes';

// Estilos compartilhados pelas telas, gerados a partir das cores do tema atual.
export function makeStyles(colors: Colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 16, gap: 16 },
    title: { fontSize: 24, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    text: { fontSize: 16, color: colors.text },
    muted: { color: colors.muted },
    bigNumber: { fontSize: 40, fontWeight: '800', color: colors.primary },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
    },
    button: { borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
    buttonText: { fontSize: 16, fontWeight: '600' },
    error: { color: colors.danger },
  });
}

export type AppStyles = ReturnType<typeof makeStyles>;
