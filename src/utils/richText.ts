/**
 * Lightweight markdown-like syntax used for rich notes/descriptions
 * (`TrainingSession.notes`, `SessionExercise.notes`, `TrainingPlan.description`).
 * These fields remain plain `string | null` end to end (no backend schema
 * changes) — this module is the single place that knows how to parse,
 * render-prep, and mutate that syntax so `RichTextView`/`RichTextEditor` and
 * plain-text previews (e.g. `TrainingPlanCard`) all stay in sync.
 *
 * Supported syntax (one construct per line, inline spans within a line):
 * - `# Heading`   -> heading, size 1 (Title)
 * - `## Heading`  -> heading, size 2 (Subtitle)
 * - `- item`      -> bullet list item
 * - `- [ ] item`  -> unchecked checklist item
 * - `- [x] item`  -> checked checklist item
 * - `**bold**`    -> inline bold span
 * - `*italic*`    -> inline italic span
 * - anything else -> plain paragraph text
 */

export type RichTextBlockType = 'heading1' | 'heading2' | 'bullet' | 'checklist' | 'paragraph';

export interface RichTextBlock {
  type: RichTextBlockType;
  /** Line index within the original text — used to toggle checklist items back into the source string. */
  line: number;
  /** Raw text content of the block, with any list/checklist/heading markers stripped. */
  text: string;
  /** Only set for checklist blocks. */
  checked?: boolean;
}

export interface RichTextSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

const CHECKLIST_RE = /^-\s*\[( |x|X)\]\s?(.*)$/;
const BULLET_RE = /^-\s+(.*)$/;
const HEADING2_RE = /^##\s+(.*)$/;
const HEADING1_RE = /^#\s+(.*)$/;

/** Splits raw notes/description text into structured blocks for rendering. */
export function parseRichText(value: string | null | undefined): RichTextBlock[] {
  const lines = (value ?? '').split('\n');
  return lines.map((line, index) => {
    const checklistMatch = CHECKLIST_RE.exec(line);
    if (checklistMatch) {
      return { type: 'checklist', line: index, text: checklistMatch[2], checked: checklistMatch[1].toLowerCase() === 'x' };
    }
    const bulletMatch = BULLET_RE.exec(line);
    if (bulletMatch) {
      return { type: 'bullet', line: index, text: bulletMatch[1] };
    }
    const heading2Match = HEADING2_RE.exec(line);
    if (heading2Match) {
      return { type: 'heading2', line: index, text: heading2Match[1] };
    }
    const heading1Match = HEADING1_RE.exec(line);
    if (heading1Match) {
      return { type: 'heading1', line: index, text: heading1Match[1] };
    }
    return { type: 'paragraph', line: index, text: line };
  });
}

/** Splits a single block's text into bold/italic/plain inline spans. */
export function parseInlineSpans(text: string): RichTextSpan[] {
  const spans: RichTextSpan[] = [];
  // Bold (**text**) takes priority over italic (*text*) so `**x**` isn't parsed as italic first.
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > lastIndex) {
      spans.push({ text: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      spans.push({ text: match[1], bold: true });
    } else {
      spans.push({ text: match[2], italic: true });
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    spans.push({ text: text.slice(lastIndex) });
  }
  return spans.length > 0 ? spans : [{ text }];
}

/** Strips all rich-text syntax down to plain, readable text — used for compact card previews. */
export function stripRichTextMarkup(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return parseRichText(value)
    .map((block) => block.text)
    .join(' ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Toggles a checklist line's checked state (`[ ]` <-> `[x]`) at the given line index and
 * returns the updated full text. No-ops if that line isn't a checklist item.
 */
export function toggleChecklistLine(value: string | null | undefined, lineIndex: number): string {
  const lines = (value ?? '').split('\n');
  const line = lines[lineIndex];
  if (line === undefined) {
    return value ?? '';
  }
  const match = CHECKLIST_RE.exec(line);
  if (!match) {
    return value ?? '';
  }
  const nextChecked = match[1].toLowerCase() !== 'x';
  lines[lineIndex] = `- [${nextChecked ? 'x' : ' '}] ${match[2]}`;
  return lines.join('\n');
}

/** The line-prefix toggle applied by the H1/H2/Bullet/Checklist toolbar buttons. */
export type LinePrefixKind = 'heading1' | 'heading2' | 'bullet' | 'checklist';

function stripLinePrefix(line: string): string {
  return (
    CHECKLIST_RE.exec(line)?.[2] ??
    BULLET_RE.exec(line)?.[1] ??
    HEADING2_RE.exec(line)?.[1] ??
    HEADING1_RE.exec(line)?.[1] ??
    line
  );
}

/**
 * Toggles a line-prefix construct (heading/bullet/checklist) on the last line of `value`.
 * If the last line already has that prefix, it's removed (toggled off); otherwise the bare
 * text is re-prefixed. Used by the formatting toolbar, which can't rely on cross-platform
 * text selection to target an arbitrary line.
 */
export function toggleLastLinePrefix(value: string, kind: LinePrefixKind): string {
  const lines = value.split('\n');
  const lastIndex = lines.length - 1;
  const line = lines[lastIndex] ?? '';
  const bareText = stripLinePrefix(line);

  const alreadyApplied =
    (kind === 'checklist' && CHECKLIST_RE.test(line)) ||
    (kind === 'bullet' && BULLET_RE.test(line) && !CHECKLIST_RE.test(line)) ||
    (kind === 'heading2' && HEADING2_RE.test(line)) ||
    (kind === 'heading1' && HEADING1_RE.test(line) && !HEADING2_RE.test(line));

  if (alreadyApplied) {
    lines[lastIndex] = bareText;
  } else {
    switch (kind) {
      case 'checklist':
        lines[lastIndex] = `- [ ] ${bareText}`;
        break;
      case 'bullet':
        lines[lastIndex] = `- ${bareText}`;
        break;
      case 'heading1':
        lines[lastIndex] = `# ${bareText}`;
        break;
      case 'heading2':
        lines[lastIndex] = `## ${bareText}`;
        break;
    }
  }
  return lines.join('\n');
}

/** Inserts an inline formatting template (e.g. `**bold**`) at the end of `value`. */
export function insertInlineTemplate(value: string, template: string): string {
  if (value.length === 0 || value.endsWith('\n')) {
    return `${value}${template}`;
  }
  return `${value} ${template}`;
}
