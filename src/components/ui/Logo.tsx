import { Image } from 'react-native';

import { useTheme } from '@/lib/theme';

const logos = {
  light: require('../../../public/images/tela-abertura/logo-claro-sem-slogan.png'),
  dark: require('../../../public/images/tela-abertura/logo-escuro-sem-slogan.png'),
};

// Logo do app (símbolo + nome), na versão clara ou escura conforme o tema.
export function Logo({ width = 160 }: { width?: number }) {
  const { scheme } = useTheme();
  // Largura e altura explícitas: só com aspectRatio a imagem saía no tamanho original no Android.
  return <Image source={logos[scheme]} style={{ width, height: (width * 1033) / 1000 }} resizeMode="contain" />;
}
