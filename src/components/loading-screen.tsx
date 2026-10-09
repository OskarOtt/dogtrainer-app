import { Image, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { t } from '@/i18n';
import { Colors, Spacing } from '@/constants/theme';

/**
 * Full-screen loading state shown while the app determines auth status,
 * matching the native splash screen's green background so the transition
 * from splash to app feels seamless. Logo/text fade in softly rather than
 * popping in instantly.
 */
export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)}>
        <Image
          source={require('@/assets/images/noborder-doglogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={styles.text}>
        {t('common.loading')}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
  },
  logo: {
    width: 120,
    height: 120,
  },
  text: {
    marginTop: Spacing.three,
    color: Colors.light.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
