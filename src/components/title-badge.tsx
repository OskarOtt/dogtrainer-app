import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DogTitle } from '@/types/title';
import { formatIsoDateDMY } from '@/utils/date';

export interface TitleBadgeProps {
  title: DogTitle;
  onPress?: () => void;
}

/** Compact chip showing one dog title's name and (if present) the date earned. */
export function TitleBadge({ title, onPress }: TitleBadgeProps) {
  const colors = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.badge,
        { backgroundColor: colors.backgroundSelected, borderColor: colors.primaryLight, opacity: pressed ? 0.85 : 1 },
      ]}>
      <ThemedText type="smallBold" themeColor="primaryDark" numberOfLines={1}>
        {title.title}
      </ThemedText>
      {title.dateEarned ? (
        <ThemedText themeColor="textSecondary" type="small">
          {formatIsoDateDMY(title.dateEarned)}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderWidth: 1,
    borderRadius: Radii.pill,
  },
});
