import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Dog } from '@/types/dog';
import { formatAge } from '@/utils/date';

export interface DogCardProps {
  dog: Dog;
  onPress?: () => void;
  /** Optional long-press handler, used by DraggableDogList to trigger drag-to-reorder. */
  onLongPress?: () => void;
  /** Disables press handling, e.g. while this card is the one actively being dragged. */
  disabled?: boolean;
}

/** Card summarizing a dog for use in lists (Dogs tab, dog selection in Train flow). */
export function DogCard({ dog, onPress, onLongPress, disabled }: DogCardProps) {
  const colors = useTheme();
  const age = formatAge(dog.birthDate);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.backgroundElement, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.avatar, { backgroundColor: colors.backgroundSelected }]}>
        {dog.imageUrl ? (
          <Image source={{ uri: dog.imageUrl }} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <Ionicons name="paw" size={28} color={colors.primary} />
        )}
      </View>

      <View style={styles.info}>
        <ThemedText type="subtitle" style={styles.name} numberOfLines={1}>
          {dog.name}
        </ThemedText>
        <ThemedText themeColor="textSecondary" numberOfLines={1}>
          {[dog.breed, age].filter(Boolean).join(' · ') || 'No details yet'}
        </ThemedText>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 18,
  },
});
