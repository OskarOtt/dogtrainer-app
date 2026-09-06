import { Host, TextInput } from '@expo/ui';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const colors = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not log in. Check your email and password.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <ThemedText type="title" style={styles.title}>
              Welcome back
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Log in to keep training your dog.
            </ThemedText>

            <Host style={[styles.inputHost, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
              <TextInput
                defaultValue={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textStyle={{ color: colors.text, fontSize: 17 }}
                style={{
                  paddingHorizontal: Spacing.three,
                  paddingVertical: Spacing.two,
                  height: 56,
                }}
              />
            </Host>
            <Host style={[styles.inputHost, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
              <TextInput
                defaultValue={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                autoComplete="password"
                textStyle={{ color: colors.text, fontSize: 17 }}
                style={{
                  paddingHorizontal: Spacing.three,
                  paddingVertical: Spacing.two,
                  height: 56,
                }}
              />
            </Host>

            {error ? (
              <ThemedText themeColor="danger" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton
              title="Log In"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!email || !password}
              style={styles.button}
            />

            <Link href="/(auth)/register" style={styles.link}>
              <ThemedText themeColor="primary">Don&apos;t have an account? Sign up</ThemedText>
            </Link>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: { fontSize: 32 },
  subtitle: { marginBottom: Spacing.three },
  inputHost: {
    height: 56,
    borderWidth: 1,
    borderRadius: Radii.medium,
    overflow: 'hidden',
  },
  error: { textAlign: 'center' },
  button: { marginTop: Spacing.two },
  link: { alignSelf: 'center', marginTop: Spacing.three, padding: Spacing.two },
});
