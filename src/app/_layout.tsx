import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { queryClient } from '@/data/queryClient';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dog/new" options={{ headerShown: true }} />
        <Stack.Screen name="dog/[id]/index" options={{ headerShown: true }} />
        <Stack.Screen name="dog/[id]/edit" options={{ headerShown: true }} />
        <Stack.Screen name="dog/[id]/goals/index" options={{ headerShown: true }} />
        <Stack.Screen name="dog/[id]/goals/new" options={{ headerShown: true }} />
        <Stack.Screen name="dog/[id]/goals/[goalId]/edit" options={{ headerShown: true }} />
        <Stack.Screen name="train/pick-dog" options={{ headerShown: true }} />
        <Stack.Screen name="train/[dogId]/index" options={{ headerShown: true }} />
        <Stack.Screen name="train/[dogId]/[categoryId]/index" options={{ headerShown: true }} />
        <Stack.Screen name="train/[dogId]/[categoryId]/[activityId]/index" options={{ headerShown: true }} />
        <Stack.Screen name="train/start/index" options={{ headerShown: true }} />
        <Stack.Screen name="train/plan/index" options={{ headerShown: true }} />
        <Stack.Screen name="train/plan/[dogId]/new" options={{ headerShown: true }} />
        <Stack.Screen name="train/plan/[dogId]/[planId]/edit" options={{ headerShown: true }} />
        <Stack.Screen name="train/plan-picker/index" options={{ headerShown: true }} />
        <Stack.Screen name="train/plan-picker/[categoryId]/index" options={{ headerShown: true }} />
        <Stack.Screen name="train/plan-picker/[categoryId]/[activityId]/index" options={{ headerShown: true }} />
        <Stack.Screen name="session/new" options={{ headerShown: true }} />
        <Stack.Screen name="session/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="progress/[dogId]" options={{ headerShown: true }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigator />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
