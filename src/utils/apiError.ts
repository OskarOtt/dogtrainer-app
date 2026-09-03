import { isAxiosError } from 'axios';

import type { ApiErrorResponse } from '@/types/api';

/**
 * Extracts a human-readable message from any error thrown by the api client.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
