import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface EmptyStateProps {
  icon?: IoniconName;
  title: string;
  message?: string;
  children?: React.ReactNode;
}

/** Consistent placeholder shown for empty lists (no dogs yet, no sessions yet, etc). */
export function EmptyState({ icon = 'paw-outline', title, message, children }: EmptyStateProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textSecondary} />
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText themeColor="textSecondary" style={styles.message}>
          {message}
        </ThemedText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
