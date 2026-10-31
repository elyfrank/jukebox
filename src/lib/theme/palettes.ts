export const palettes = {
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
export type ColorScheme = keyof typeof palettes;
