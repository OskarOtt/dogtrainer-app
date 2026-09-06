import type { LinePrefixKind } from '@/utils/richText';

export interface RichTextToolbarProps {
  /** Inserts an inline formatting template (e.g. `**bold**`) at the end of the text. */
  onInsertInline: (template: string) => void;
  /** Toggles a line-prefix construct (heading/bullet/checklist) on the last line. */
  onToggleLinePrefix: (kind: LinePrefixKind) => void;
  disabled?: boolean;
}
