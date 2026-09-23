import { Host, TextInput } from '@expo/ui';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AuthBrandColors, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';
import type { SocialAuthPayload } from '@/types/auth';

export default function RegisterScreen() {
  const { register, socialLogin } = useAuth();
  const router = useRouter();
  const colors = useTheme();
  const scheme = useColorScheme();
  const isLight = scheme !== 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSocialAuth, setShowSocialAuth] = useState(false);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.length >= 8;

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create your account. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSocialLogin(payload: SocialAuthPayload) {
    setError(null);
    await socialLogin(payload);
    router.replace('/(tabs)');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {isLight ? (
              <ThemedView style={[styles.logoBackdrop, { backgroundColor: AuthBrandColors.lightBlue }]}>
                <Image
                  source={require('@/assets/images/noborder-doglogo.png')}
                  style={styles.logo}
                  contentFit="cover"
                />
              </ThemedView>
            ) : null}

            <ThemedText type="title" style={styles.title}>
              Create account
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Track training progress for every dog you love.
            </ThemedText>

            <SocialAuthButtons
              defaultDisplayName={name}
              disabled={isSubmitting}
              onCredential={handleSocialLogin}
              onError={(err) => setError(getApiErrorMessage(err, 'Could not continue with this provider.'))}
              onVisibilityChange={setShowSocialAuth}
            />
            {showSocialAuth ? (
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <ThemedText themeColor="textSecondary">or use email</ThemedText>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>
            ) : null}

            <Host style={[styles.inputHost, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
              <TextInput
                defaultValue={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor={colors.textSecondary}
                autoComplete="name"
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
                placeholder="Password (min. 8 characters)"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                autoComplete="new-password"
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
              title="Sign Up"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!canSubmit}
              style={isLight ? { ...styles.button, backgroundColor: AuthBrandColors.green } : styles.button}
            />

            <Link href="/(auth)/login" style={styles.link}>
              <ThemedText
                themeColor="primary"
                style={isLight ? { color: AuthBrandColors.green } : undefined}
              >
                Already have an account? Log in
              </ThemedText>
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
  logoBackdrop: {
    alignSelf: 'center',
    width: 86,
    height: 86,
    borderRadius: Radii.large,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  logo: { width: '100%', height: '100%' },
  title: { fontSize: 32 },
  subtitle: { marginBottom: Spacing.three },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
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
