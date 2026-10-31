import 'expo-sqlite/localStorage/install';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'jukebox.themeMode';

// Preferência de tema salva no aparelho (localStorage do expo-sqlite no celular, do navegador na web).
export function loadThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {}
  return 'system';
}

export function saveThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {}
}
