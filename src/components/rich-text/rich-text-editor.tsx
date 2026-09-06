import { Host, TextInput, useNativeState } from '@expo/ui';
import { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { RichTextToolbar } from '@/components/rich-text/rich-text-toolbar';
import { RichTextView } from '@/components/rich-text/rich-text-view';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { insertInlineTemplate, toggleChecklistLine, toggleLastLinePrefix, type LinePrefixKind } from '@/utils/richText';

export interface RichTextEditorProps {
  /** Initial text, captured once on mount. Remount with a `key` (e.g. the record's id) to load different content. */
  defaultValue?: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  editable?: boolean;
  placeholder?: string;
  /** Style applied to the wrapping `Host` around the native text field (sizing/margins). */
  style?: ViewStyle;
}

/**
 * Rich notes/description editor: a formatting toolbar (`RichTextToolbar`) above a native
 * multiline `TextInput`, backed by `useNativeState` so toolbar taps (insert bold/italic
 * template, toggle a heading/bullet/checklist line) can programmatically update the native
 * field's text — plain `defaultValue`/`onChangeText` only reads changes, it can't write them.
 *
 * Shows a rendered preview (`RichTextView`, with tappable checklist rows) when not focused,
 * and the raw-syntax editor while focused — tap the preview to start editing.
 */
export function RichTextEditor({ defaultValue, onChangeText, onBlur, editable = true, placeholder, style }: RichTextEditorProps) {
  const colors = useTheme();
  const textState = useNativeState(defaultValue ?? '');
  const [text, setText] = useState(defaultValue ?? '');
  const [isFocused, setIsFocused] = useState(false);

  function commit(next: string) {
    // `textState` is an `ObservableState` (like Reanimated's shared values) — mutating
    // `.value` is the documented way to push a new value down into the native field.
    // eslint-disable-next-line react-hooks/immutability
    textState.value = next;
    setText(next);
    onChangeText(next);
  }

  function handleInsertInline(template: string) {
    commit(insertInlineTemplate(text, template));
  }

  function handleToggleLinePrefix(kind: LinePrefixKind) {
    commit(toggleLastLinePrefix(text, kind));
  }

  function handleToggleChecklistLine(lineIndex: number) {
    commit(toggleChecklistLine(text, lineIndex));
  }

  if (!editable) {
    return <RichTextView value={text} placeholder={placeholder} />;
  }

  if (!isFocused) {
    return (
      <Pressable onPress={() => setIsFocused(true)} style={[styles.previewHost, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
        <RichTextView value={text} onToggleChecklistLine={handleToggleChecklistLine} placeholder={placeholder ?? 'Tap to add notes…'} />
      </Pressable>
    );
  }

  return (
    <>
      <RichTextToolbar onInsertInline={handleInsertInline} onToggleLinePrefix={handleToggleLinePrefix} />
      {/* `Host` uses `matchContents` so it sizes to the native field's natural (top-anchored)
          content height; without it, a fixed-height Host vertically centers short text inside
          the box instead of starting at the top. The surrounding `View` supplies the visible
          box (border/background/min-height) and, via its default top-aligned column layout,
          keeps the (naturally-sized) field pinned to the top as it grows. */}
      <View style={[styles.host, { borderColor: colors.border, backgroundColor: colors.backgroundElement }, style]}>
        <Host matchContents style={styles.hostInner}>
          <TextInput
            value={textState}
            onChangeText={(next) => {
              setText(next);
              onChangeText(next);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            multiline
            autoFocus
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            textStyle={{ color: colors.text, fontSize: 16 }}
            style={styles.input}
          />
        </Host>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  host: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: Radii.medium,
    overflow: 'hidden',
  },
  hostInner: {
    width: '100%',
  },
  input: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  previewHost: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
  },
});
