import type { ViewStyle } from 'react-native';

export interface ConfirmDialogProps {
  /** Label of the trigger button itself (mirrors {@link PrimaryButtonProps.title}). */
  title: string;
  /** Visual variant of the trigger button — mirrors `PrimaryButton`'s variants. */
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  /** Title of the native confirmation prompt. */
  dialogTitle: string;
  /** Optional supporting message shown below the dialog title. */
  dialogMessage?: string;
  /** Label of the action button that carries out `onConfirm`. */
  confirmLabel: string;
  /** Label of the button that dismisses without acting. Defaults to `'Cancel'`. */
  cancelLabel?: string;
  /** Styles the confirm action as destructive (for example, red) where the platform supports it. */
  destructive?: boolean;
  /** Called once the user confirms the action. */
  onConfirm: () => void;
}
