import { Host, TextInput, type TextInputProps } from '@expo/ui';
import { StyleSheet, type ViewStyle } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface FormTextInputProps
  extends Pick<
    TextInputProps,
    | 'placeholder'
    | 'keyboardType'
    | 'autoCapitalize'
    | 'autoComplete'
    | 'secureTextEntry'
    | 'multiline'
    | 'numberOfLines'
    | 'editable'
    | 'onBlur'
  > {
  /** Uncontrolled initial text — the field manages its own state internally. */
  defaultValue?: string;
  onChangeText: (text: string) => void;
  /** Style applied to the wrapping `Host` (sizing/margins), not the field itself. */
  style?: ViewStyle;
}

/**
 * Shared themed text field used across the app's forms, backed by `@expo/ui`'s
 * native `TextInput` (SwiftUI `TextField` on iOS, Compose `TextField` on
 * Android, RN `TextInput` on web).
 */
export function FormTextInput({
  defaultValue,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoComplete,
  secureTextEntry,
  multiline,
  numberOfLines,
  editable,
  onBlur,
  style,
}: FormTextInputProps) {
  const colors = useTheme();

  return (
    <Host
      style={[
        styles.host,
        multiline && styles.multilineHost,
        { borderColor: colors.border, backgroundColor: colors.backgroundElement },
        style,
      ]}
    >
      <TextInput
        defaultValue={defaultValue}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        onBlur={onBlur}
        textStyle={{ color: colors.text, fontSize: 17 }}
        style={{
          paddingHorizontal: Spacing.three,
          paddingVertical: Spacing.two,
        }}
      />
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    height: 56,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderRadius: Radii.medium,
    overflow: 'hidden',
  },
  multilineHost: {
    height: 96,
  },
});
