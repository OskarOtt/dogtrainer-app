import type { Ionicons } from '@expo/vector-icons';

import type { TranslationKey } from '@/i18n';
import type { ActivityType } from '@/types/activity';

/** Every selectable physical activity type, paired with its icon. Order is display order. */
export const ACTIVITY_TYPES: { type: ActivityType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'WALK', icon: 'footsteps-outline' },
  { type: 'RUN', icon: 'walk-outline' },
  { type: 'SKI', icon: 'snow-outline' },
  { type: 'STRENGTH_TRAINING', icon: 'barbell-outline' },
  { type: 'SWIM', icon: 'water-outline' },
  { type: 'HIKE', icon: 'trail-sign-outline' },
  { type: 'PLAY_SESSION', icon: 'tennisball-outline' },
];

/** Translation key for each activity type's display label. */
export const ACTIVITY_TYPE_LABEL_KEYS: Record<ActivityType, TranslationKey> = {
  WALK: 'activity.walk',
  RUN: 'activity.run',
  SKI: 'activity.ski',
  STRENGTH_TRAINING: 'activity.strengthTraining',
  SWIM: 'activity.swim',
  HIKE: 'activity.hike',
  PLAY_SESSION: 'activity.playSession',
};
