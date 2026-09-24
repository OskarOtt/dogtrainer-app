'use dom';

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode, REMOVE_LIST_COMMAND } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type EditorState,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface LexicalNotesEditorProps {
  /** Initial HTML content. Only read once on mount (per-editor `key` is used to force remount). */
  initialContent?: string | null;
  /** Fires (debounced) whenever the HTML content changes. */
  onChangeHtml?: (html: string) => Promise<void>;
  /** Fires once when the editor loses focus, with the latest HTML content. */
  onBlurHtml?: (html: string) => Promise<void>;
  editable?: boolean;
  /** Whether the app's color scheme is dark — passed in since this DOM component can't read RN theme hooks. */
  isDark?: boolean;
  /** Theme colors needed to style the toolbar/borders to match the surrounding native UI. */
  colors?: {
    border: string;
    primary: string;
    text: string;
    textSecondary: string;
    background: string;
  };
  labels: {
    bold: string;
    italic: string;
    bulletList: string;
    placeholder: string;
  };
  /**
   * Style applied to the outer native WebView wrapper (not used inside this file — the
   * generated native-side wrapper forwards it directly to the underlying `WebView`).
   */
  style?: unknown;
  dom?: import('expo/dom').DOMProps;
}

// Matches the system font stack used everywhere else in the app (see `Fonts.sans` in
// `src/constants/theme.ts`) so the WebView's content doesn't look mismatched.
const FONT_STACK = '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", Helvetica, Arial, sans-serif';

function $isListNodeType(node: LexicalNode): boolean {
  return node.getType() === 'listitem' || node.getType() === 'list';
}

function ToolbarButton({
  label,
  text,
  active,
  onPress,
  colors,
}: {
  label: string;
  text: string;
  active: boolean;
  onPress: () => void;
  colors: NonNullable<LexicalNotesEditorProps['colors']>;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      // Prevent the contentEditable from losing focus/selection when tapping a toolbar button.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onPress}
      style={{
        fontFamily: FONT_STACK,
        fontSize: 15,
        fontWeight: 600,
        minWidth: 30,
        height: 30,
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        color: active ? '#fff' : colors.text,
        backgroundColor: active ? colors.primary : 'transparent',
      }}
    >
      {text}
    </button>
  );
}

function Toolbar({
  colors,
  labels,
}: {
  colors: NonNullable<LexicalNotesEditorProps['colors']>;
  labels: NonNullable<LexicalNotesEditorProps['labels']>;
}) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          const anchorNode = selection.anchor.getNode();
          const parent = anchorNode.getParent();
          setIsBulletList($isListNodeType(anchorNode) || (parent !== null && $isListNodeType(parent)));
        }
      });
    });
  }, [editor]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 6px',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: 'flex', flex: 1, gap: 4 }}>
        <ToolbarButton label={labels.bold} text="B" active={isBold} colors={colors} onPress={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} />
        <ToolbarButton label={labels.italic} text="I" active={isItalic} colors={colors} onPress={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} />
        <ToolbarButton
          label={labels.bulletList}
          text="•"
          active={isBulletList}
          colors={colors}
          onPress={() => editor.dispatchCommand(isBulletList ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND, undefined)}
        />
      </div>
    </div>
  );
}

/** Reads the initial HTML (once) into the editor state on mount. */
function InitialContentPlugin({ initialContent }: { initialContent?: string | null }) {
  const [editor] = useLexicalComposerContext();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || !initialContent) {
      return;
    }
    seeded.current = true;
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialContent, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
    });
  }, [editor, initialContent]);

  return null;
}

/** Notifies the native side on blur, with the latest HTML content. */
function BlurPlugin({ onBlurHtml }: { onBlurHtml?: (html: string) => Promise<void> }) {
  const [editor] = useLexicalComposerContext();
  const latestHtmlRef = useRef('');

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        latestHtmlRef.current = $generateHtmlFromNodes(editor);
      });
    });
  }, [editor]);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement || !onBlurHtml) {
      return;
    }
    const handleBlur = () => {
      onBlurHtml(latestHtmlRef.current);
    };
    rootElement.addEventListener('blur', handleBlur);
    return () => rootElement.removeEventListener('blur', handleBlur);
  }, [editor, onBlurHtml]);

  return null;
}

function EditableSync({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);
  return null;
}

const DEFAULT_COLORS: NonNullable<LexicalNotesEditorProps['colors']> = {
  border: '#D0D5DD',
  primary: '#5B93F5',
  text: '#101828',
  textSecondary: '#667085',
  background: 'transparent',
};

/** Session notes editor backed by Lexical, rendered via an Expo DOM component ('use dom'). */
export default function LexicalNotesEditor({
  initialContent,
  onChangeHtml,
  onBlurHtml,
  editable = true,
  isDark = false,
  colors = DEFAULT_COLORS,
  labels,
}: LexicalNotesEditorProps) {
  const onChangeHtmlRef = useRef(onChangeHtml);
  useEffect(() => {
    onChangeHtmlRef.current = onChangeHtml;
  }, [onChangeHtml]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((editorState: EditorState, editor: LexicalEditor) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor);
        onChangeHtmlRef.current?.(html);
      });
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const initialConfig = {
    namespace: 'session-notes',
    nodes: [ListNode, ListItemNode],
    editable,
    onError: (error: Error) => {
      console.error('Lexical error', error);
    },
    theme: {
      text: { bold: 'lexical-bold', italic: 'lexical-italic' },
      list: { ul: 'lexical-list', listitem: 'lexical-listitem' },
    },
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <style>{`
        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          background-color: transparent;
        }
        .lexical-content-wrapper {
          flex: 1;
          min-height: 0;
          width: 100%;
          position: relative;
          overflow: auto;
          box-sizing: border-box;
        }
        .lexical-content {
          font-family: ${FONT_STACK};
          font-size: 16px;
          line-height: 24px;
          color: ${isDark ? '#F2F4F7' : colors.text};
          width: 100%;
          height: 100%;
          padding: 12px;
          outline: none;
          box-sizing: border-box;
        }
        .lexical-placeholder {
          font-family: ${FONT_STACK};
          font-size: 16px;
          color: ${colors.textSecondary};
          position: absolute;
          padding: 12px;
          pointer-events: none;
        }
        .lexical-bold { font-weight: 700; }
        .lexical-italic { font-style: italic; }
        .lexical-list { margin: 0; padding-left: 20px; }
        .lexical-listitem { margin: 4px 0; }
      `}</style>
      <LexicalComposer initialConfig={initialConfig}>
        {editable ? <Toolbar colors={colors} labels={labels} /> : null}
        <div className="lexical-content-wrapper">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="lexical-content"
                aria-placeholder={labels.placeholder}
                placeholder={<div className="lexical-placeholder">{labels.placeholder}</div>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <InitialContentPlugin initialContent={initialContent} />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        <BlurPlugin onBlurHtml={onBlurHtml} />
        <EditableSync editable={editable} />
      </LexicalComposer>
    </div>
  );
}
