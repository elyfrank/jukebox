import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

// Emoji como ícone provisório das abas, até o app ter ícones próprios.
function icon(emoji: string) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Text style={{ fontSize: size * 0.85, color }}>{emoji}</Text>;
  };
}

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Fila', tabBarIcon: icon('🎵') }} />
      <Tabs.Screen name="settings" options={{ title: 'Configurações', tabBarIcon: icon('⚙️') }} />
    </Tabs>
  );
}
