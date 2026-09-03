import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatIsoDateDMY, parseDMYToIso } from '@/utils/date';

export interface DatePickerProps {
  /** Selected date as an ISO string (YYYY-MM-DD), or null/undefined when unset. */
  value: string | null | undefined;
  /** Called with an ISO date string (YYYY-MM-DD) once a date has been chosen. */
  onChange: (iso: string) => void;
  placeholder?: string;
  /** Earliest selectable year. */
  minYear?: number;
  /** Latest selectable year. */
  maxYear?: number;
  disabled?: boolean;
}

/**
 * Web fallback for {@link DatePicker}: @expo/ui's native `DateTimePicker` only supports
 * iOS and Android, so on web this renders a plain dd-mm-yyyy text field instead.
 */
export function DatePicker({ value, onChange, placeholder = 'dd-mm-yyyy', disabled }: DatePickerProps) {
  const colors = useTheme();
  const [text, setText] = useState(formatIsoDateDMY(value));

  function handleChangeText(next: string) {
    setText(next);
    const iso = parseDMYToIso(next);
    if (iso) {
      onChange(iso);
    }
  }

  return (
    <TextInput
      value={text}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      editable={!disabled}
      style={[
        styles.field,
        { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement, opacity: disabled ? 0.6 : 1 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    marginBottom: Spacing.two,
  },
});
