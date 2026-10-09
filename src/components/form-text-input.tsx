import { useId, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { KeyboardDismissAccessory } from '@/components/keyboard-dismiss-accessory';
import { KEYBOARD_ACCESSORY_ID } from '@/constants/keyboard';
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
    | 'maxLength'
  > {
  /** Uncontrolled initial text — the field manages its own state internally. */
  defaultValue?: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<TextStyle>;
}

/** Shared themed React Native text field used across the app's forms. */
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
  maxLength,
  style,
}: FormTextInputProps) {
  const colors = useTheme();
  const accessoryId = `${KEYBOARD_ACCESSORY_ID}-${useId().replace(/:/g, '')}`;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
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
        onFocus={() => setIsFocused(true)}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        maxLength={maxLength}
        inputAccessoryViewID={Platform.OS === 'ios' ? accessoryId : undefined}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          {
            borderColor: isFocused ? colors.primary : colors.border,
            borderWidth: isFocused ? 1.5 : 1,
            backgroundColor: colors.backgroundElement,
            color: colors.text,
          },
          style,
        ]}
      />
      <KeyboardDismissAccessory nativeID={accessoryId} />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 17,
  },
  multilineInput: {
    height: 96,
    textAlignVertical: 'top',
  },
});
