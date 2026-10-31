import 'expo-sqlite/localStorage/install';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  type TextInputProps,
} from 'react-native';

const palettes = {
  light: {
    bg: '#F7F5FB',
    card: '#FFFFFF',
    input: '#FFFFFF',
    text: '#1E1A2B',
    muted: '#6B6580',
    primary: '#6D28D9',
    onPrimary: '#FFFFFF',
    border: '#E2DDEE',
    danger: '#B3261E',
  },
  dark: {
    bg: '#121019',
    card: '#1C1926',
    input: '#252131',
    text: '#EEEAF7',
    muted: '#9D96B3',
    primary: '#A78BFA',
    onPrimary: '#16101F',
    border: '#332E44',
    danger: '#F2B8B5',
  },
};

export type Colors = typeof palettes.light;
export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'jukebox.themeMode';

function makeStyles(colors: Colors) {
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

type Theme = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  scheme: 'light' | 'dark';
  colors: Colors;
  styles: ReturnType<typeof makeStyles>;
};

const ThemeContext = createContext<Theme | null>(null);

function loadMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {}
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(loadMode);
  const systemScheme = useColorScheme();
  const scheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const theme = useMemo<Theme>(() => {
    const colors = palettes[scheme];
    return {
      mode,
      setMode: (next) => {
        setModeState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {}
      },
      scheme,
      colors,
      styles: makeStyles(colors),
    };
  }, [mode, scheme]);

  // Cores das barras de navegação (cabeçalho e abas) acompanham o tema do app.
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.bg,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        {children}
        <DialogHost />
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme precisa estar dentro de ThemeProvider');
  return theme;
}

export function Button({
  title,
  onPress,
  loading,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const { colors, styles } = useTheme();
  const filled = variant === 'primary';
  const fg = filled ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        filled ? { backgroundColor: colors.primary } : { borderColor: fg, borderWidth: 1 },
        (pressed || loading) && { opacity: 0.7 },
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  const { colors, styles } = useTheme();
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, props.style]} />;
}

export function Card({ children }: { children: ReactNode }) {
  const { styles } = useTheme();
  return <View style={styles.card}>{children}</View>;
}

export type DialogButton = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };
type Dialog = { title: string; message?: string; buttons: DialogButton[] };

let openDialog: ((dialog: Dialog) => void) | null = null;

// Substitui o Alert do React Native, que não aparece no navegador. Mesma assinatura do Alert.alert.
export function showDialog(title: string, message?: string, buttons: DialogButton[] = [{ text: 'OK' }]) {
  openDialog?.({ title, message, buttons });
}

function DialogHost() {
  const { styles } = useTheme();
  const [dialog, setDialog] = useState<Dialog | null>(null);

  useEffect(() => {
    openDialog = setDialog;
    return () => {
      openDialog = null;
    };
  }, []);

  if (!dialog) return null;

  // Fecha antes de rodar a ação, para a ação poder abrir outro diálogo.
  function press(button?: DialogButton) {
    setDialog(null);
    button?.onPress?.();
  }
  const cancel = dialog.buttons.find((b) => b.style === 'cancel');
  const actions = dialog.buttons.filter((b) => b.style !== 'cancel');

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => press(cancel)}>
      <Pressable
        onPress={() => press(cancel)}
        style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        {/* Pressable vazio para que tocar dentro da caixa não feche o diálogo. */}
        <Pressable onPress={() => {}} style={[styles.card, { width: '100%', maxWidth: 400, alignSelf: 'center' }]}>
          <Text style={styles.subtitle}>{dialog.title}</Text>
          {!!dialog.message && <Text style={styles.muted}>{dialog.message}</Text>}
          {actions.map((b) => (
            <Button
              key={b.text}
              title={b.text}
              variant={b.style === 'destructive' ? 'danger' : 'primary'}
              onPress={() => press(b)}
            />
          ))}
          {cancel && <Button title={cancel.text} variant="secondary" onPress={() => press(cancel)} />}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Abas para alternar visões dentro de uma mesma tela (ex.: Fila | Já tocaram).
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderRadius: 10,
        padding: 4,
        gap: 4,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: selected ? colors.primary : 'transparent',
            }}
          >
            <Text style={{ fontWeight: '600', color: selected ? colors.onPrimary : colors.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Linha de música: capa, título, artista e uma linha extra (ex.: quem pediu).
export function SongRow({
  title,
  artist,
  artworkUrl,
  detail,
  right,
  onPress,
  highlight,
}: {
  title: string;
  artist: string;
  artworkUrl?: string | null;
  detail?: string;
  right?: ReactNode;
  onPress?: () => void;
  highlight?: boolean;
}) {
  const { colors, styles } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        styles.row,
        { padding: 10 },
        highlight && { borderColor: colors.primary, borderWidth: 2 },
        pressed && { opacity: 0.7 },
      ]}
    >
      {artworkUrl ? (
        <Image source={{ uri: artworkUrl }} style={{ width: 52, height: 52, borderRadius: 6 }} />
      ) : (
        <View style={{ width: 52, height: 52, borderRadius: 6, backgroundColor: colors.border }} />
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.text, { fontWeight: '600' }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.muted} numberOfLines={1}>
          {artist}
        </Text>
        {!!detail && (
          <Text style={[styles.muted, { fontSize: 12 }]} numberOfLines={1}>
            {detail}
          </Text>
        )}
      </View>
      {right}
    </Pressable>
  );
}

const logos = {
  light: require('../../public/images/tela-abertura/logo-claro-sem-slogan.png'),
  dark: require('../../public/images/tela-abertura/logo-escuro-sem-slogan.png'),
};

// Logo do app (símbolo + nome), na versão clara ou escura conforme o tema.
export function Logo({ width = 160 }: { width?: number }) {
  const { scheme } = useTheme();
  // Largura e altura explícitas: só com aspectRatio a imagem saía no tamanho original no Android.
  return <Image source={logos[scheme]} style={{ width, height: (width * 1033) / 1000 }} resizeMode="contain" />;
}

// Mensagem de erro legível a partir do que o Supabase devolve.
export function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'Algo deu errado';
}
