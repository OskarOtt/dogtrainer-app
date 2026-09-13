import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export interface AvatarProps {
  uri: string | null | undefined;
  size?: number;
}

/** Read-only circular avatar with an icon fallback, used anywhere a user/dog photo is shown but not editable. */
export function Avatar({ uri, size = 40 }: AvatarProps) {
  const colors = useTheme();

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.backgroundSelected },
      ]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" />
      ) : (
        <Ionicons name="person" size={size * 0.5} color={colors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
