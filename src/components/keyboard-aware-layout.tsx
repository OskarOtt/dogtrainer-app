import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type KeyboardAvoidingViewProps,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type KeyboardAwareViewProps = PropsWithChildren<
  Omit<KeyboardAvoidingViewProps, 'behavior'> & {
    behavior?: KeyboardAvoidingViewProps['behavior'];
  }
>;

export function KeyboardAwareView({ behavior, ...props }: KeyboardAwareViewProps) {
  return (
    <KeyboardAvoidingView
      behavior={behavior ?? (Platform.OS === 'ios' ? 'padding' : 'height')}
      {...props}
    />
  );
}

export interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  keyboardContainerStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
}

export function KeyboardAwareScrollView({
  keyboardContainerStyle,
  keyboardVerticalOffset,
  keyboardDismissMode,
  keyboardShouldPersistTaps,
  automaticallyAdjustKeyboardInsets,
  ...props
}: KeyboardAwareScrollViewProps) {
  return (
    <KeyboardAwareView
      enabled={Platform.OS === 'android'}
      style={[styles.container, keyboardContainerStyle]}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets={
          automaticallyAdjustKeyboardInsets ?? Platform.OS === 'ios'
        }
        keyboardDismissMode={keyboardDismissMode ?? (Platform.OS === 'ios' ? 'interactive' : 'on-drag')}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps ?? 'handled'}
        {...props}
      />
    </KeyboardAwareView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
