import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { DialogHost } from '@/components/ui';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider, useTheme } from '@/lib/theme';

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
        <Stack.Screen name="create-party" options={{ title: 'Nova festa' }} />
        <Stack.Screen name="join" options={{ title: 'Entrar numa festa' }} />
        <Stack.Screen name="scan" options={{ title: 'Escanear QR code' }} />
        <Stack.Screen name="party/[id]/index" options={{ title: 'Festa' }} />
        <Stack.Screen name="party/[id]/search" options={{ title: 'Pedir música' }} />
        <Stack.Screen name="party/[id]/invite" options={{ title: 'Convidar' }} />
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
      <DialogHost />
    </ThemeProvider>
  );
}
