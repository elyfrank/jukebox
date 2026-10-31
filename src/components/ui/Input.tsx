import { TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/lib/theme';

export function Input(props: TextInputProps) {
  const { colors, styles } = useTheme();
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, props.style]} />;
}
