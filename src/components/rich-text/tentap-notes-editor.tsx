import {
  darkEditorTheme,
  defaultEditorTheme,
  RichText,
  Toolbar,
  useBridgeState,
  useEditorBridge,
  useEditorContent,
} from '@10play/tentap-editor';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export interface TenTapNotesEditorProps {
  /** Initial HTML content. Only read once on mount (per-editor `key` is used to force remount). */
  initialContent?: string | null;
  /** Fires (debounced) whenever the HTML content changes. */
  onChangeHtml?: (html: string) => void;
  /** Fires once when the editor loses focus, with the latest HTML content. */
  onBlurHtml?: (html: string) => void;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Matches the system font stack used everywhere else in the app (see `Fonts.sans` in
// `src/constants/theme.ts`) so the WebView's content doesn't look mismatched.
const FONT_CSS = `
  html, body, .ProseMirror {
    font-family: -apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 24px;
  }
  .ProseMirror h1 { font-size: 24px; }
  .ProseMirror h2 { font-size: 20px; }
`;

const DARK_CSS = `
  html, body, .ProseMirror {
    background-color: transparent;
    color: #F2F4F7;
  }
  .ProseMirror a { color: #5B93F5; }
`;

// The library's default toolbar is quite tall (44px body, 28px icons) — shrink it down to
// something more compact that fits better inline above a notes field.
const compactToolbar = (base: typeof defaultEditorTheme.toolbar) => ({
  ...base,
  toolbarBody: { ...(base.toolbarBody as object), height: 34, minWidth: undefined },
  toolbarButton: { ...(base.toolbarButton as object), paddingHorizontal: 6 },
  icon: { ...(base.icon as object), height: 20, width: 20 },
});

const compactEditorTheme = {
  ...defaultEditorTheme,
  toolbar: compactToolbar(defaultEditorTheme.toolbar),
};
const compactDarkEditorTheme = {
  ...darkEditorTheme,
  toolbar: compactToolbar({ ...defaultEditorTheme.toolbar, ...darkEditorTheme.toolbar }),
};

/** Session notes editor backed by the 10Tap (TipTap/WebView) rich text editor. */
export function TenTapNotesEditor({ initialContent, onChangeHtml, onBlurHtml, editable = true, style }: TenTapNotesEditorProps) {
  const colors = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    editable,
    initialContent: initialContent ?? '',
    theme: isDark ? compactDarkEditorTheme : compactEditorTheme,
  });

  useEffect(() => {
    editor.injectCSS(FONT_CSS, 'dogtrainer-font');
    if (isDark) {
      editor.injectCSS(DARK_CSS, 'dogtrainer-dark');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  const content = useEditorContent(editor, { type: 'html', debounceInterval: 400 });
  const { isFocused } = useBridgeState(editor);
  const wasFocused = useRef(false);
  const latestContent = useRef(content);

  // Keep the latest callback refs without making them effect dependencies — `onChangeHtml`/
  // `onBlurHtml` are recreated on every parent render, and depending on them directly would
  // re-fire the effects below on every render (mutate -> refetch -> re-render -> repeat),
  // which previously caused a "Maximum update depth exceeded" crash.
  const onChangeHtmlRef = useRef(onChangeHtml);
  useEffect(() => {
    onChangeHtmlRef.current = onChangeHtml;
  }, [onChangeHtml]);
  const onBlurHtmlRef = useRef(onBlurHtml);
  useEffect(() => {
    onBlurHtmlRef.current = onBlurHtml;
  }, [onBlurHtml]);

  useEffect(() => {
    latestContent.current = content;
    if (content === undefined) {
      return;
    }
    // Save as-you-type (debounced), not just on blur — switching tabs/screens doesn't reliably
    // blur the WebView-hosted editor, so relying on blur alone can silently drop edits.
    onChangeHtmlRef.current?.(content);
  }, [content]);

  useEffect(() => {
    if (wasFocused.current && !isFocused && latestContent.current !== undefined) {
      onBlurHtmlRef.current?.(latestContent.current);
    }
    wasFocused.current = isFocused;
  }, [isFocused]);

  function dismissKeyboard() {
    editor.blur();
    Keyboard.dismiss();
  }

  return (
    <View style={[styles.container, { borderColor: colors.border }, style]}>
      {editable ? (
        <View style={[styles.toolbarRow, { borderBottomColor: colors.border }]}>
          <View style={styles.toolbarFlex}>
            <Toolbar editor={editor} hidden={false} />
          </View>
          <Pressable onPress={dismissKeyboard} hitSlop={8} style={styles.doneButton}>
            <Ionicons name="chevron-down" size={20} color={colors.primary} />
          </Pressable>
        </View>
      ) : null}
      <RichText editor={editor} style={styles.webview} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({ web: { minHeight: 260 } }),
  },
  webview: { minHeight: 220, backgroundColor: 'transparent' },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbarFlex: { flex: 1 },
  doneButton: { paddingHorizontal: 10, height: 34, alignItems: 'center', justifyContent: 'center' },
});
