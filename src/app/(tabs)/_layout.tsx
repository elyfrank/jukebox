import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

function icon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    // A barra de abas sempre passa a cor como texto (ex.: "#A78BFA").
    return <MaterialIcons name={name} size={size} color={color as string} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Festas', tabBarIcon: icon('celebration') }} />
      <Tabs.Screen name="settings" options={{ title: 'Configurações', tabBarIcon: icon('settings') }} />
    </Tabs>
  );
}
