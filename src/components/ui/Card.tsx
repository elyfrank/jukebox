import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/lib/theme';

export function Card({ children }: { children: ReactNode }) {
  const { styles } = useTheme();
  return <View style={styles.card}>{children}</View>;
}
