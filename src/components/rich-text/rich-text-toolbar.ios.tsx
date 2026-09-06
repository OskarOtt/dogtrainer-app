import { Button, ControlGroup, Host } from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet } from 'react-native';

import type { RichTextToolbarProps } from '@/components/rich-text/rich-text-toolbar.types';

/**
 * iOS variant of the formatting toolbar: buttons are grouped in a native SwiftUI
 * `ControlGroup` for a system-consistent segmented look. `ControlGroup` has no
 * Android/web support (hence the base `rich-text-toolbar.tsx` fallback used there).
 */
// SwiftUI's ControlGroup doesn't expose a way to disable individual buttons via this API
// surface — callers avoid rendering an editable toolbar at all when read-only, so `disabled`
// is accepted only for prop-shape parity with the base (Android/web) toolbar.
export function RichTextToolbar({ onInsertInline, onToggleLinePrefix }: RichTextToolbarProps) {
  return (
    <Host style={styles.host} matchContents>
      <ControlGroup>
        <Button
          label="Title"
          systemImage="textformat.size.larger"
          onPress={() => onToggleLinePrefix('heading1')}
          modifiers={[frame({ height: 36 })]}
        />
        <Button
          label="Subtitle"
          systemImage="textformat.size.smaller"
          onPress={() => onToggleLinePrefix('heading2')}
          modifiers={[frame({ height: 36 })]}
        />
        <Button label="Bold" systemImage="bold" onPress={() => onInsertInline('**bold**')} modifiers={[frame({ height: 36 })]} />
        <Button
          label="Italic"
          systemImage="italic"
          onPress={() => onInsertInline('*italic*')}
          modifiers={[frame({ height: 36 })]}
        />
        <Button
          label="Bullet list"
          systemImage="list.bullet"
          onPress={() => onToggleLinePrefix('bullet')}
          modifiers={[frame({ height: 36 })]}
        />
        <Button
          label="Checklist"
          systemImage="checklist"
          onPress={() => onToggleLinePrefix('checklist')}
          modifiers={[frame({ height: 36 })]}
        />
      </ControlGroup>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    marginBottom: 8,
  },
});
