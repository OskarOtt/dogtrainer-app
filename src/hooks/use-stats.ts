import { useQuery } from '@tanstack/react-query';

import { statsApi } from '@/api/stats';
import { isVisibleTrainingSession } from '@/utils/session';

export function useDogStatistics(dogId: string | undefined) {
  return useQuery({
    queryKey: ['dogs', dogId, 'statistics'],
    queryFn: () => statsApi.getStatistics(dogId as string),
    enabled: !!dogId,
  });
}

export function useDogProgress(dogId: string | undefined) {
  return useQuery({
    queryKey: ['dogs', dogId, 'progress'],
    queryFn: () => statsApi.getProgress(dogId as string),
    enabled: !!dogId,
    select: (progress) => ({
      ...progress,
      history: progress.history.filter(isVisibleTrainingSession),
    }),
  });
}
