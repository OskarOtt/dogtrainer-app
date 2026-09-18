/** Mirrors the reasons accepted by the backend's ModerationService. */
export const REPORT_REASONS = [
  'Spam',
  'Inappropriate content',
  'Harassment or bullying',
  'Animal welfare concern',
  'Other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export interface CreateReportPayload {
  postId?: string;
  reportedUserId?: string;
  reason: ReportReason;
  details?: string;
}
