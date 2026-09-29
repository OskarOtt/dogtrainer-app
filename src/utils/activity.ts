import type { PhysicalActivity } from '@/types/activity';

export function isVisiblePhysicalActivity(activity: PhysicalActivity): boolean {
  return activity.status !== 'CANCELLED';
}
