export interface SessionFooterProps {
  /** Called after the user confirms the "Discard" action in the cancel dialog. */
  onCancel: () => void;
  /** Called after the user confirms the "Finish" action in the finish dialog. */
  onFinish: () => void;
  cancelLoading?: boolean;
  finishLoading?: boolean;
}
