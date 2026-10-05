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

/**
 * True when an error from a manual entry `/manual` endpoint is the backend's future-date
 * rejection - either the `@PastOrPresent startedAt` validation (400, field error on
 * "startedAt") or the "cannot end in the future" business rule (409). Both are the only
 * failure modes those endpoints produce for date/time input, so this lets the manual entry
 * forms show one clear message instead of a raw validation/business-rule string.
 */
export function isFutureEntryError(error: unknown): boolean {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return false;
  }
  const status = error.response?.status;
  if (status === 409) {
    return true;
  }
  return status === 400 && !!error.response?.data?.fieldErrors?.some((fe) => fe.field === 'startedAt');
}
