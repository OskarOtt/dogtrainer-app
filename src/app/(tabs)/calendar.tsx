import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Radii, Spacing, StatusColors } from '@/constants/theme';
import { useAllGoals } from '@/hooks/use-goals';
import { useAllPlans } from '@/hooks/use-plans';
import { useAllSessions } from '@/hooks/use-sessions';
import { useTheme } from '@/hooks/use-theme';
import type { CalendarEvent } from '@/utils/calendar-events';
import { buildCalendarEvents } from '@/utils/calendar-events';
import { toIsoDateLocal } from '@/utils/date';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Calendar tab: month view aggregating training plans (spanning startDate → endDate),
 * completed training sessions, and goal target dates across all dogs. Tapping a day opens
 * the Day View (`/calendar/[date]`) to see/manage that day's plans, sessions, and goals.
 */
export default function CalendarScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const [viewDate, setViewDate] = useState(() => new Date());

  const { data: plans, isLoading: isLoadingPlans, isError: isPlansError } = useAllPlans();
  const { data: sessionsWithDog, isLoading: isLoadingSessions, isError: isSessionsError } = useAllSessions();
  const { data: goalsWithDog, isLoading: isLoadingGoals, isError: isGoalsError } = useAllGoals();

  const events = useMemo<CalendarEvent[]>(
    () => buildCalendarEvents(plans ?? [], sessionsWithDog ?? [], goalsWithDog ?? []),
    [plans, sessionsWithDog, goalsWithDog]
  );

  const todayIso = toIsoDateLocal(new Date());
  const isLoading = isLoadingPlans || isLoadingSessions || isLoadingGoals;
  const isError = isPlansError || isSessionsError || isGoalsError;

  function changeMonth(delta: number) {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.navRow}>
          <Pressable onPress={() => changeMonth(-1)} hitSlop={8} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </Pressable>
          <ThemedText type="subtitle" style={styles.navLabel}>
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </ThemedText>
          <Pressable onPress={() => changeMonth(1)} hitSlop={8} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <ThemedText themeColor="textSecondary" type="small">
              Training plans
            </ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: StatusColors.COMPLETED }]} />
            <ThemedText themeColor="textSecondary" type="small">
              Completed trainings
            </ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <ThemedText themeColor="textSecondary" type="small">
              Goals
            </ThemedText>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} color={colors.primary} />
        ) : isError ? (
          <EmptyState icon="alert-circle-outline" title="Couldn't load calendar" message="Please try again later." />
        ) : (
          <View style={styles.calendarWrap}>
            <Calendar<CalendarEvent>
              date={viewDate}
              events={events}
              height={windowHeight - 200 - BottomTabInset}
              mode="month"
              swipeEnabled
              showAdjacentMonths
              onSwipeEnd={setViewDate}
              onPressCell={(date) => router.push(`/calendar/${toIsoDateLocal(date)}`)}
              onPressDateHeader={(date) => router.push(`/calendar/${toIsoDateLocal(date)}`)}
              calendarCellStyle={(date) =>
                date && toIsoDateLocal(date) === todayIso
                  ? { backgroundColor: colors.backgroundSelected, borderRadius: Radii.small }
                  : {}
              }
              eventCellStyle={(event) => ({
                backgroundColor:
                  event.type === 'plan' ? colors.primary : event.type === 'goal' ? colors.warning : StatusColors.COMPLETED,
              })}
            />
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  navButton: { padding: Spacing.one },
  navLabel: { minWidth: 180, textAlign: 'center' },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.four,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  legendDot: { width: 10, height: 10, borderRadius: Radii.pill },
  loading: { marginTop: Spacing.six },
  calendarWrap: { marginBottom: Spacing.two, height: '75%' },
});
