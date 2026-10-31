import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider, useTheme } from '@/lib/ui';

// A tela de abertura (logo) fica visível até a sessão salva ser carregada.
SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { session, loading } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (!loading) SplashScreen.hide();
  }, [loading]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
