import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, FlatList, View } from 'react-native';

import { CatalogExerciseCard } from '@/components/catalog-exercise-card';
import { EmptyState } from '@/components/empty-state';
import { FormTextInput } from '@/components/form-text-input';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTrainingCatalogFlat } from '@/hooks/use-training-catalog';
import type { CatalogExercise } from '@/types/training';
import { getApiErrorMessage } from '@/utils/apiError';

export interface ExerciseCatalogPickerProps {
  /** Short instructional line shown above the search field. */
  headerMessage: string;
  selectedIds: string[];
  onToggle: (exercise: CatalogExercise) => void;
  /** CTA rendered in the fixed footer, below the selection summary line. */
  actionButton: React.ReactNode;
}

/**
 * Single searchable/filterable list of every exercise in the training catalog
 * (tagged with its category + activity), replacing the old category →
 * activity → exercise drill-down. Used by both the "Start Training" and
 * "Training Plan" exercise pickers so exercises from any mix of
 * activities/categories can be selected in one screen.
 */
export function ExerciseCatalogPicker({
  headerMessage,
  selectedIds,
  onToggle,
  actionButton,
}: ExerciseCatalogPickerProps) {
  const colors = useTheme();
  const { data: exercises, isLoading, isError, error } = useTrainingCatalogFlat();
  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    (exercises ?? []).forEach((exercise) => seen.set(exercise.categoryId, exercise.categoryName));
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [exercises]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (exercises ?? []).filter((exercise) => {
      if (activeCategoryId && exercise.categoryId !== activeCategoryId) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        exercise.name.toLowerCase().includes(query) ||
        exercise.activityName.toLowerCase().includes(query) ||
        exercise.categoryName.toLowerCase().includes(query)
      );
    });
  }, [exercises, search, activeCategoryId]);

  function toggleCategoryFilter(categoryId: string) {
    setActiveCategoryId((current) => (current === categoryId ? null : categoryId));
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchArea}>
        <FormTextInput
          placeholder="Search by exercise, activity or category"
          onChangeText={setSearch}
          autoCapitalize="none"
          style={styles.searchInput}
        />
        {categories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {categories.map((category) => {
              const active = activeCategoryId === category.id;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => toggleCategoryFilter(category.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.backgroundElement,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}>
                  <ThemedText
                    type="small"
                    style={{ color: active ? colors.onPrimary : colors.text }}
                    numberOfLines={1}>
                    {category.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : isError ? (
        <EmptyState icon="alert-circle-outline" title="Couldn't load exercises" message={getApiErrorMessage(error)} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="checkmark-circle-outline" title="No exercises found" message="Try a different search or filter." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(exercise) => exercise.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <ThemedText themeColor="textSecondary" style={styles.header}>
              {headerMessage}
            </ThemedText>
          }
          renderItem={({ item }) => (
            <CatalogExerciseCard
              exercise={item}
              selected={selectedIds.includes(item.id)}
              onPress={() => onToggle(item)}
            />
          )}
        />
      )}

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <ThemedText themeColor="textSecondary" style={styles.summary}>
          {selectedIds.length === 0
            ? 'No exercises selected'
            : `${selectedIds.length} exercise${selectedIds.length === 1 ? '' : 's'} selected`}
        </ThemedText>
        {actionButton}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchArea: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.two },
  searchInput: { marginBottom: 0 },
  chipRow: { gap: Spacing.two, paddingBottom: Spacing.one },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  loading: { marginTop: Spacing.six },
  list: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
  header: { marginBottom: Spacing.one },
  footer: {
    padding: Spacing.four,
    borderTopWidth: 1,
    gap: Spacing.one,
  },
  summary: { textAlign: 'center' },
});
