import { isAxiosError } from 'axios';

import { t } from '@/i18n';
import type { ApiErrorResponse } from '@/types/api';

/**
 * Extracts a human-readable message from any error thrown by the api client.
 */
export function getApiErrorMessage(error: unknown, fallback = t('errors.generic')): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getApiErrorCode(error: unknown): string | null {
  return isAxiosError<ApiErrorResponse>(error) ? (error.response?.data?.code ?? null) : null;
}
