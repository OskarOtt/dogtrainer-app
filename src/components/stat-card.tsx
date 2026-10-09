import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CardShadow, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface StatCardProps {
  icon: IoniconName;
  label: string;
  value: string;
}

/** Compact card for a single at-a-glance stat (used in grids on Home/Progress screens). */
export function StatCard({ icon, label, value }: StatCardProps) {
  const colors = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.backgroundSelected }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <ThemedText type="title" style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText themeColor="textSecondary" type="small">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.three,
    gap: Spacing.one,
    alignItems: 'flex-start',
    ...CardShadow,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 24, lineHeight: 28 },
});
