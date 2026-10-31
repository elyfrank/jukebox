import { ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { navigationTheme } from './navigation';
import { palettes, type ColorScheme, type Colors } from './palettes';
import { loadThemeMode, saveThemeMode, type ThemeMode } from './storage';
import { makeStyles, type AppStyles } from './styles';

type Theme = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  scheme: ColorScheme;
  colors: Colors;
  styles: AppStyles;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(loadThemeMode);
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const theme = useMemo<Theme>(() => {
    const colors = palettes[scheme];
    return {
      mode,
      setMode: (next) => {
        setModeState(next);
        saveThemeMode(next);
      },
      scheme,
      colors,
      styles: makeStyles(colors),
    };
  }, [mode, scheme]);

  return (
    <ThemeContext.Provider value={theme}>
      <NavigationThemeProvider value={navigationTheme(scheme, theme.colors)}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme precisa estar dentro de ThemeProvider');
  return theme;
}
