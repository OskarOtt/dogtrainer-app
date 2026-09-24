import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LoadingScreen } from '@/components/loading-screen';
import { queryClient } from '@/data/queryClient';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { t } from '@/i18n';
import { LocalizationProvider, useTranslation } from '@/i18n/provider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Hide the native splash screen as soon as JS has taken over, and show our
  // own green loading screen (with logo + text) until auth status resolves,
  // instead of leaving the native splash up or rendering a blank screen.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
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
        <Stack.Screen name="dog/goals/pick-dog" options={{ headerShown: true, title: t('goals.addGoal') }} />
        <Stack.Screen name="dog/[id]/goals/[goalId]/edit" options={{ headerShown: true }} />
        <Stack.Screen name="train/pick-dog" options={{ headerShown: true, title: t('dog.startTraining') }} />
        <Stack.Screen name="train/[dogId]/index" options={{ headerShown: true }} />
        <Stack.Screen name="train/start/index" options={{ headerShown: true }} />
        <Stack.Screen name="train/plan/index" options={{ headerShown: true }} />
        <Stack.Screen name="train/plan/[dogId]/new" options={{ headerShown: true }} />
        <Stack.Screen name="train/plan/[dogId]/[planId]/edit" options={{ headerShown: true }} />
        <Stack.Screen name="train/plan-picker/index" options={{ headerShown: true }} />
        <Stack.Screen name="session/new" options={{ headerShown: true }} />
        <Stack.Screen name="session/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="progress/[dogId]" options={{ headerShown: true }} />
        <Stack.Screen name="calendar/[date]/index" options={{ headerShown: true }} />
        <Stack.Screen name="calendar/[date]/new-plan" options={{ headerShown: true, title: t('plans.addPlan') }} />
        <Stack.Screen name="post/new" options={{ headerShown: true }} />
        <Stack.Screen name="post/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="user/[id]/index" options={{ headerShown: true }} />
        <Stack.Screen name="user/[id]/followers" options={{ headerShown: true }} />
        <Stack.Screen name="user/[id]/following" options={{ headerShown: true }} />
        <Stack.Screen name="user/[id]/posts" options={{ headerShown: true }} />
        <Stack.Screen name="blocked-users" options={{ headerShown: true }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { locale } = useTranslation();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigator key={locale} />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <RootLayoutContent />
      </LocalizationProvider>
    </QueryClientProvider>
  );
}
