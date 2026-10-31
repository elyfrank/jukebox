import { DarkTheme, DefaultTheme } from 'expo-router';

import type { ColorScheme, Colors } from './palettes';

// Cores das barras de navegação (cabeçalho e abas) acompanham o tema do app.
export function navigationTheme(scheme: ColorScheme, colors: Colors) {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.bg,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };
}
