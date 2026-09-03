/**
 * Mirrors the backend's ErrorResponse shape (common.dto.ErrorResponse) so API errors
 * can be handled consistently across the app.
 */
export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: FieldError[];
}
