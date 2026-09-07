import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DogMediaType } from '@/types/dog';

export interface MediaAvatarPickerProps {
  uri: string | null;
  mediaType?: DogMediaType | null;
  size?: number;
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
  /** Whether the library picker should also offer videos, not just photos. */
  allowVideo?: boolean;
  /** True while an upload/removal is in flight — disables the picker and shows a spinner. */
  isBusy?: boolean;
  onSelect: (asset: ImagePicker.ImagePickerAsset) => void;
}

/**
 * Circular tappable avatar used for both the user's profile picture and a dog's photo/video.
 * Owns picking + permission handling; the parent screen owns the actual upload mutation and
 * passes `isBusy` down for the loading overlay.
 */
export function MediaAvatarPicker({
  uri,
  mediaType,
  size = 96,
  placeholderIcon = 'person',
  allowVideo = false,
  isBusy = false,
  onSelect,
}: MediaAvatarPickerProps) {
  const colors = useTheme();

  async function handlePress() {
    if (isBusy) {
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to choose a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: allowVideo ? ['images', 'videos'] : ['images'],
      allowsEditing: !allowVideo,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) {
      return;
    }
    onSelect(result.assets[0]);
  }

  const isVideo = mediaType === 'VIDEO';

  return (
    <Pressable onPress={handlePress} disabled={isBusy} style={{ width: size, height: size }}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.backgroundSelected,
          },
        ]}>
        {uri && !isVideo ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" />
        ) : (
          <Ionicons name={isVideo ? 'videocam' : placeholderIcon} size={size * 0.4} color={colors.primary} />
        )}

        {isBusy ? (
          <View style={[styles.overlay, { borderRadius: size / 2 }]}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : null}
      </View>

      {isBusy ? null : (
        <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
          <Ionicons name="camera" size={size * 0.16} color={colors.onPrimary} />
        </View>
      )}
    </Pressable>
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
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: Radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
