import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { ensureMediaUri } from '@/utils/media';

export interface AvatarProps {
  uri: string | null | undefined;
  size?: number;
  /** Icon shown when there's no photo (or, for a video, in place of a still frame). Defaults to 'person'. */
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
  /** When 'VIDEO', shows a video-camera icon instead of trying to render `uri` as a still image. */
  mediaType?: 'IMAGE' | 'VIDEO' | null;
}

/** Read-only circular avatar with an icon fallback, used anywhere a user/dog photo is shown but not editable. */
export function Avatar({ uri, size = 40, placeholderIcon = 'person', mediaType }: AvatarProps) {
  const colors = useTheme();
  const isVideo = mediaType === 'VIDEO';

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.backgroundSelected },
      ]}>
      {uri && !isVideo ? (
        <Image source={{ uri: ensureMediaUri(uri) }} style={styles.image} contentFit="cover" />
      ) : (
        <Ionicons name={isVideo ? 'videocam' : placeholderIcon} size={size * 0.5} color={colors.primary} />
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
