import { useMutation } from '@tanstack/react-query';

import { reportsApi } from '@/api/reports';
import type { CreateReportPayload } from '@/types/report';

/** Reports are persisted only — there's no moderation UI yet, they're reviewed manually. */
export function useCreateReport() {
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => reportsApi.create(payload),
  });
}
