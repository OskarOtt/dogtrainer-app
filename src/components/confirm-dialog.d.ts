import type { ComponentType } from 'react';

import type { ConfirmDialogProps } from './confirm-dialog.types';

/**
 * Type-only placeholder: TypeScript (unlike Metro) doesn't resolve platform-suffixed
 * modules automatically, so this non-suffixed file exists purely so `@/components/confirm-dialog`
 * type-checks. The real implementation always comes from `confirm-dialog.ios.tsx`,
 * `confirm-dialog.android.tsx`, or `confirm-dialog.web.tsx` — Metro's platform-extension
 * resolution guarantees one of those shadows this file at bundle time for every
 * platform this app targets.
 */
export declare const ConfirmDialog: ComponentType<ConfirmDialogProps>;
