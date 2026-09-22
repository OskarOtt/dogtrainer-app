import { Image, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';

/**
 * Full-screen loading state shown while the app determines auth status,
 * matching the native splash screen's green background so the transition
 * from splash to app feels seamless.
 */
export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/noborder-doglogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3E8760',
  },
  logo: {
    width: 120,
    height: 120,
  },
  text: {
    marginTop: Spacing.three,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
