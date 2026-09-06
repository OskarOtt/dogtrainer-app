import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { parseInlineSpans, parseRichText, type RichTextBlock } from '@/utils/richText';

export interface RichTextViewProps {
  value: string | null | undefined;
  /** Called when a checklist row is tapped, with the source line index to toggle. Omit to render checklists as non-interactive. */
  onToggleChecklistLine?: (lineIndex: number) => void;
  placeholder?: string;
}

function InlineSpans({ text, style }: { text: string; style?: object }) {
  const spans = parseInlineSpans(text);
  return (
    <Text style={style}>
      {spans.map((span, index) => (
        <Text key={index} style={[span.bold && styles.bold, span.italic && styles.italic]}>
          {span.text}
        </Text>
      ))}
    </Text>
  );
}

function Block({ block, colors, onToggleChecklistLine }: { block: RichTextBlock; colors: ReturnType<typeof useTheme>; onToggleChecklistLine?: (line: number) => void }) {
  if (block.text.trim().length === 0 && block.type === 'paragraph') {
    // Preserve blank lines as vertical spacing rather than an empty <Text>.
    return <View style={styles.blankLine} />;
  }

  if (block.type === 'heading1') {
    return (
      <ThemedText type="subtitle" style={styles.heading1}>
        {block.text}
      </ThemedText>
    );
  }

  if (block.type === 'heading2') {
    return (
      <ThemedText type="title" style={styles.heading2}>
        {block.text}
      </ThemedText>
    );
  }

  if (block.type === 'bullet') {
    return (
      <View style={styles.row}>
        <ThemedText style={styles.bulletGlyph}>{'\u2022'}</ThemedText>
        <InlineSpans text={block.text} style={styles.rowText} />
      </View>
    );
  }

  if (block.type === 'checklist') {
    const content = (
      <View style={styles.row}>
        <Ionicons
          name={block.checked ? 'checkbox' : 'square-outline'}
          size={20}
          color={block.checked ? colors.primary : colors.textSecondary}
          style={styles.checkboxIcon}
        />
        <InlineSpans
          text={block.text}
          style={[styles.rowText, block.checked && { color: colors.textSecondary, textDecorationLine: 'line-through' }]}
        />
      </View>
    );
    if (onToggleChecklistLine) {
      return (
        <Pressable onPress={() => onToggleChecklistLine(block.line)} hitSlop={6}>
          {content}
        </Pressable>
      );
    }
    return content;
  }

  return <InlineSpans text={block.text} />;
}

/**
 * Read-only renderer for the lightweight rich-text syntax (see `src/utils/richText.ts`):
 * headings, bold/italic spans, bullet lists, and checklist rows (tappable when
 * `onToggleChecklistLine` is provided).
 */
export function RichTextView({ value, onToggleChecklistLine, placeholder }: RichTextViewProps) {
  const colors = useTheme();

  if (!value || value.trim().length === 0) {
    return placeholder ? <ThemedText themeColor="textSecondary">{placeholder}</ThemedText> : null;
  }

  const blocks = parseRichText(value);

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => (
        <Fragment key={index}>
          <Block block={block} colors={colors} onToggleChecklistLine={onToggleChecklistLine} />
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  blankLine: { height: Spacing.two },
  heading1: { fontSize: 20, lineHeight: 26, marginTop: Spacing.one },
  heading2: { fontSize: 17, lineHeight: 22, marginTop: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  rowText: { flex: 1 },
  bulletGlyph: { width: 16, textAlign: 'center' },
  checkboxIcon: { marginTop: 2 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
});
