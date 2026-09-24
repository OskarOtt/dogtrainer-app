import { Button, ConfirmationDialog, Host, HStack, Image, Text } from '@expo/ui/swift-ui';
import { background, buttonStyle, cornerRadius, disabled as disabledModifier, frame, offset, opacity, padding, tint } from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { Colors } from '@/constants/theme';

import type { SessionFooterProps } from './session-footer.types';

/**
 * Hovering `HStack` that floats above the session content instead of
 * occupying its own footer row. Cancel sits on the left, Finish (with a
 * trailing checkmark) on the right. Both buttons live in a single `Host` so
 * they can share one background/corner-radius pill.
 *
 * The Finish button uses custom children (`HStack` of `Text` + `Image`)
 * instead of the `label`/`systemImage` props, since those props always
 * render the icon *before* the text — custom children let the checkmark
 * come after "Finish".
 *
 * A native `ControlGroup` was used here previously, but on iOS it forces its
 * buttons into an icon-only label style (dropping the "Finish" text) even
 * with `labelStyle('titleAndIcon')` applied — a SwiftUI quirk unrelated to
 * this app's modifiers. Plain `HStack` gives the same visual grouping
 * without that side effect.
 *
 * Wrapping each button in a `ConfirmationDialog` (as this used to do) broke
 * SwiftUI's internal subview introspection, so the buttons rendered but
 * never responded to taps. The `ConfirmationDialog`s are therefore rendered
 * as invisible siblings *outside* the `HStack`; their `isPresented` state is
 * driven entirely by the real (tappable) buttons inside it.
 *
 * `Host` stacks its children in a `ZStack(alignment: .topLeading)`, so a
 * zero-size hidden trigger would sit at the Host's top-left corner and the
 * dialog would anchor there instead of centering under the footer. Each
 * hidden trigger is sized to fill the whole `HStack` area (same bounds,
 * opacity 0) so its center matches the footer's center.
 */
export function SessionFooter({ onCancel, onFinish, cancelLoading, finishLoading }: SessionFooterProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [cancelPresented, setCancelPresented] = useState(false);
  const [finishPresented, setFinishPresented] = useState(false);

  return (
    <SafeAreaView edges={['bottom']} style={styles.wrapper} pointerEvents="box-none">
      <Host matchContents style={styles.host}>
        <HStack
          spacing={10}
          modifiers={[
            padding({ all: 8 }),
            background(colors.card),
            cornerRadius(28),
          ]}>
          <Button
            label={cancelLoading ? '…' : t('training.cancel')}
            systemImage="xmark"
            role="destructive"
            modifiers={[
              buttonStyle('bordered'),
              frame({ minWidth: 110, maxWidth: 10000 }),
              disabledModifier(!!cancelLoading),
            ]}
            onPress={() => setCancelPresented(true)}
          />
          <Button
            modifiers={[
              buttonStyle('borderedProminent'),
              frame({ minWidth: 110, maxWidth: 10000 }),
              tint(colors.success),
              disabledModifier(!!finishLoading),
            ]}
            onPress={() => setFinishPresented(true)}>
            <HStack spacing={6}>
              <Text>{finishLoading ? '…' : t('training.finish')}</Text>
              <Image systemName="checkmark" />
            </HStack>
          </Button>
        </HStack>
        <ConfirmationDialog
          title={t('training.cancelTitle')}
          isPresented={cancelPresented}
          onIsPresentedChange={setCancelPresented}
          titleVisibility="visible">
          <ConfirmationDialog.Trigger>
            <Button
              label=""
              modifiers={[frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'center' }), offset({ y: -10 }), opacity(0)]}
              onPress={() => setCancelPresented(true)}
            />
          </ConfirmationDialog.Trigger>
          <ConfirmationDialog.Actions>
            <Button
              label={t('common.discard')}
              role="destructive"
              onPress={() => {
                setCancelPresented(false);
                onCancel();
              }}
            />
            <Button label={t('common.keepTraining')} role="cancel" onPress={() => setCancelPresented(false)} />
          </ConfirmationDialog.Actions>
          <ConfirmationDialog.Message>
            <Text>{t('training.cancelMessage')}</Text>
          </ConfirmationDialog.Message>
        </ConfirmationDialog>

        <ConfirmationDialog
          title={t('training.finishTitle')}
          isPresented={finishPresented}
          onIsPresentedChange={setFinishPresented}
          titleVisibility="visible">
          <ConfirmationDialog.Trigger>
            <Button
              label=""
              modifiers={[frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'center' }), offset({ y: -10 }), opacity(0)]}
              onPress={() => setFinishPresented(true)}
            />
          </ConfirmationDialog.Trigger>
          <ConfirmationDialog.Actions>
            <Button
              label={t('common.finish')}
              onPress={() => {
                setFinishPresented(false);
                onFinish();
              }}
            />
          </ConfirmationDialog.Actions>
          <ConfirmationDialog.Message>
            <Text>{t('training.finishMessage')}</Text>
          </ConfirmationDialog.Message>
        </ConfirmationDialog>
      </Host>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingBottom: 8,
  },
  host: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
