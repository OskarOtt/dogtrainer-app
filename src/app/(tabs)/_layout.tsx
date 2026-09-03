import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/tabs';
import { useColorScheme } from 'react-native';
import type { ColorValue } from 'react-native';

import { Colors } from '@/constants/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(focusedName: IoniconName, unfocusedName: IoniconName) {
  return ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? focusedName : unfocusedName} color={color as string} size={size} />
  );
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="dogs" options={{ title: 'Dogs', tabBarIcon: tabIcon('paw', 'paw-outline') }} />
      <Tabs.Screen name="train" options={{ title: 'Train', tabBarIcon: tabIcon('barbell', 'barbell-outline') }} />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: tabIcon('stats-chart', 'stats-chart-outline') }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person', 'person-outline') }} />
    </Tabs>
  );
}
