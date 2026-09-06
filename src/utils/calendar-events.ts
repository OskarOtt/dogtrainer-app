import type { ICalendarEventBase } from 'react-native-big-calendar';

import type { Dog } from '@/types/dog';
import type { Goal } from '@/types/goal';
import type { TrainingPlan } from '@/types/plan';
import type { TrainingSession } from '@/types/session';
import { parseIsoDateLocal, toIsoDateLocal } from '@/utils/date';

export type CalendarEventType = 'plan' | 'session' | 'goal';

export interface CalendarEvent extends ICalendarEventBase {
  type: CalendarEventType;
  refId: string;
  dogId: string;
  dogName: string | null;
}

/** Default event duration (minutes) used to render a completed session as a point-in-time block. */
const SESSION_EVENT_DURATION_MINUTES = 30;

/** Default event duration (minutes) used to render a goal target date as a point-in-time block. */
const GOAL_EVENT_DURATION_MINUTES = 30;

/**
 * Builds react-native-big-calendar events from training plans (spanning startDate → endDate),
 * completed training sessions (a short block at their completedAt/startedAt time), and goals
 * (a short block on their targetDate). Plans without a startDate, sessions that aren't
 * COMPLETED, and goals without a targetDate are skipped.
 */
export function buildCalendarEvents(
  plans: TrainingPlan[],
  sessionsWithDog: { session: TrainingSession; dog: Dog }[],
  goalsWithDog: { goal: Goal; dog: Dog }[] = []
): CalendarEvent[] {
  const planEvents: CalendarEvent[] = plans.flatMap((plan) => {
    const start = parseIsoDateLocal(plan.startDate);
    if (!start) {
      return [];
    }
    const end = parseIsoDateLocal(plan.endDate) ?? start;
    const endOfDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
    return [
      {
        type: 'plan' as const,
        refId: plan.id,
        dogId: plan.dogId,
        dogName: plan.dogName,
        title: plan.name,
        start,
        end: endOfDay,
      },
    ];
  });

  const sessionEvents: CalendarEvent[] = sessionsWithDog.flatMap(({ session, dog }) => {
    if (session.status !== 'COMPLETED') {
      return [];
    }
    const startIso = session.completedAt ?? session.startedAt;
    const start = new Date(startIso);
    if (Number.isNaN(start.getTime())) {
      return [];
    }
    const end = new Date(start.getTime() + SESSION_EVENT_DURATION_MINUTES * 60 * 1000);
    return [
      {
        type: 'session' as const,
        refId: session.id,
        dogId: session.dogId,
        dogName: dog.name,
        title: `${dog.name} training`,
        start,
        end,
      },
    ];
  });

  const goalEvents: CalendarEvent[] = goalsWithDog.flatMap(({ goal, dog }) => {
    const start = parseIsoDateLocal(goal.targetDate);
    if (!start) {
      return [];
    }
    const end = new Date(start.getTime() + GOAL_EVENT_DURATION_MINUTES * 60 * 1000);
    return [
      {
        type: 'goal' as const,
        refId: goal.id,
        dogId: goal.dogId,
        dogName: dog.name,
        title: `🎯 ${goal.title}`,
        start,
        end,
      },
    ];
  });

  return [...planEvents, ...sessionEvents, ...goalEvents];
}

/** Filters events that overlap the given ISO date (YYYY-MM-DD), comparing by local date only. */
export function eventsForDay(events: CalendarEvent[], isoDate: string): CalendarEvent[] {
  return events.filter((event) => {
    const startIso = toIsoDateLocal(event.start);
    const endIso = toIsoDateLocal(event.end);
    return startIso <= isoDate && isoDate <= endIso;
  });
}

/** Training plans whose start–end range (inclusive) covers the given ISO date. Plans without a startDate are skipped. */
export function plansForDate(plans: TrainingPlan[], isoDate: string): TrainingPlan[] {
  return plans.filter((plan) => {
    if (!plan.startDate) {
      return false;
    }
    const end = plan.endDate ?? plan.startDate;
    return plan.startDate <= isoDate && isoDate <= end;
  });
}

/** Goals (paired with their dog) whose targetDate falls on the given ISO date. Goals without a targetDate are skipped. */
export function goalsForDate(goalsWithDog: { goal: Goal; dog: Dog }[], isoDate: string): { goal: Goal; dog: Dog }[] {
  return goalsWithDog.filter(({ goal }) => goal.targetDate === isoDate);
}

/** Completed training sessions (paired with their dog) whose completedAt/startedAt falls on the given ISO date. */
export function sessionsForDate(
  sessionsWithDog: { session: TrainingSession; dog: Dog }[],
  isoDate: string
): { session: TrainingSession; dog: Dog }[] {
  return sessionsWithDog.filter(({ session }) => {
    if (session.status !== 'COMPLETED') {
      return false;
    }
    const startIso = session.completedAt ?? session.startedAt;
    const date = new Date(startIso);
    return !Number.isNaN(date.getTime()) && toIsoDateLocal(date) === isoDate;
  });
}
