import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { FormTextInput } from '@/components/form-text-input';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-layout';
import { PrimaryButton } from '@/components/primary-button';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AuthBrandColors, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/utils/apiError';
import { getPasswordError, isValidEmail } from '@/utils/validation';
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

    if (!isValidEmail(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.registerError')));
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
        <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
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
              {t('auth.createAccount')}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {t('auth.registerSubtitle')}
            </ThemedText>

            <SocialAuthButtons
              defaultDisplayName={name}
              disabled={isSubmitting}
              onCredential={handleSocialLogin}
              onError={(err) => setError(getApiErrorMessage(err, t('auth.providerError')))}
              onVisibilityChange={setShowSocialAuth}
            />
            {showSocialAuth ? (
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <ThemedText themeColor="textSecondary">{t('auth.orUseEmail')}</ThemedText>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>
            ) : null}

            <FormTextInput
              defaultValue={name}
              onChangeText={setName}
              placeholder={t('auth.name')}
              autoComplete="name"
              style={styles.input}
            />
            <FormTextInput
              defaultValue={email}
              onChangeText={setEmail}
              placeholder={t('auth.email')}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={styles.input}
            />
            <FormTextInput
              defaultValue={password}
              onChangeText={setPassword}
              placeholder={t('auth.passwordHint')}
              secureTextEntry
              autoComplete="new-password"
              style={styles.input}
            />

            {error ? (
              <ThemedText themeColor="danger" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton
              title={t('auth.signUp')}
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
                {t('auth.hasAccount')}
              </ThemedText>
            </Link>
        </KeyboardAwareScrollView>
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
  input: { marginBottom: 0 },
  error: { textAlign: 'center' },
  button: { marginTop: Spacing.two },
  link: { alignSelf: 'center', marginTop: Spacing.three, padding: Spacing.two },
});
