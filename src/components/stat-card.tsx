import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
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
      <Ionicons name={icon} size={22} color={colors.primary} />
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
  },
  value: { fontSize: 24, lineHeight: 28 },
});
