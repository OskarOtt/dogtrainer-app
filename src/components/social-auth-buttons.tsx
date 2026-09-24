import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { FormTextInput } from '@/components/form-text-input';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SocialAuthPayload, SocialProvider } from '@/types/auth';
import { getApiErrorCode } from '@/utils/apiError';

const defaultProviders: SocialProvider[] = ['APPLE'];

interface SocialAuthButtonsProps {
  onCredential: (credential: SocialAuthPayload) => Promise<void>;
  onError: (error: unknown) => void;
  defaultDisplayName?: string;
  providers?: SocialProvider[];
  disabled?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export function SocialAuthButtons({
  onCredential,
  onError,
  defaultDisplayName,
  providers = defaultProviders,
  disabled,
  onVisibilityChange,
}: SocialAuthButtonsProps) {
  const colors = useTheme();
  const scheme = useColorScheme();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [pendingCredential, setPendingCredential] = useState<SocialAuthPayload | null>(null);
  const [name, setName] = useState('');
  const shouldCheckApple = Platform.OS === 'ios' && providers.includes('APPLE');

  useEffect(() => {
    if (!shouldCheckApple) {
      return;
    }
    void AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, [shouldCheckApple]);

  async function submitCredential(credential: SocialAuthPayload, suppliedName?: string) {
    const displayName = suppliedName?.trim()
      || defaultDisplayName?.trim()
      || credential.displayName?.trim()
      || undefined;
    setLoadingProvider(credential.provider);
    try {
      await onCredential({ ...credential, displayName });
      setPendingCredential(null);
      setName('');
    } catch (error) {
      if (getApiErrorCode(error) === 'PROFILE_NAME_REQUIRED') {
        setPendingCredential(credential);
      } else {
        onError(error);
      }
    } finally {
      setLoadingProvider(null);
    }
  }

  async function handleApplePress() {
    if (disabled || loadingProvider) {
      return;
    }
    setLoadingProvider('APPLE');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error(t('auth.appleMissingToken'));
      }
      const displayName = credential.fullName
        ? AppleAuthentication.formatFullName(credential.fullName)
        : undefined;
      await submitCredential({
        provider: 'APPLE',
        idToken: credential.identityToken,
        authorizationCode: credential.authorizationCode ?? undefined,
        displayName,
      });
    } catch (error) {
      if (isAppleCancellation(error)) {
        return;
      }
      onError(error);
    } finally {
      setLoadingProvider(null);
    }
  }

  const showApple = providers.includes('APPLE') && appleAvailable;

  useEffect(() => {
    onVisibilityChange?.(showApple);
  }, [showApple, onVisibilityChange]);

  return (
    <>
      <View style={styles.container}>
        {showApple ? (
          <View pointerEvents={disabled || loadingProvider ? 'none' : 'auto'} style={disabled ? styles.disabled : null}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={
                scheme === 'dark'
                  ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                  : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={Radii.medium}
              style={styles.appleButton}
              onPress={() => void handleApplePress()}
            />
          </View>
        ) : null}
      </View>

      <Modal visible={pendingCredential !== null} animationType="fade" transparent>
        <View style={styles.backdrop}>
          <SafeAreaView style={[styles.nameSheet, { backgroundColor: colors.backgroundElement }]}>
            <ThemedText type="subtitle">{t('auth.finishAccount')}</ThemedText>
            <ThemedText themeColor="textSecondary">{t('auth.profileNamePrompt')}</ThemedText>
            <FormTextInput
              key={pendingCredential?.provider}
              defaultValue={name}
              onChangeText={setName}
              placeholder={t('auth.name')}
              autoComplete="name"
            />
            <PrimaryButton
              title={t('common.continue')}
              disabled={!name.trim() || loadingProvider !== null}
              loading={loadingProvider !== null}
              onPress={() => pendingCredential && void submitCredential(pendingCredential, name)}
            />
            <PrimaryButton
              title={t('common.cancel')}
              variant="secondary"
              disabled={loadingProvider !== null}
              onPress={() => {
                setPendingCredential(null);
                setName('');
              }}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

function isAppleCancellation(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && error.code === 'ERR_REQUEST_CANCELED';
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  appleButton: {
    width: 230,
    height: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  nameSheet: {
    gap: Spacing.three,
    borderRadius: Radii.large,
    padding: Spacing.four,
  },
});
