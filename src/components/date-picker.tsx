import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import ExpoDateTimePicker from '@expo/ui/community/datetime-picker';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatIsoDateDMY } from '@/utils/date';

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

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Date field backed by @expo/ui's native `DateTimePicker` (`@expo/ui/community/datetime-picker`):
 * a SwiftUI wheel shown in our own bottom sheet on iOS, and the native Material 3 dialog on
 * Android. Displays the chosen value as dd-mm-yyyy and reports changes as an ISO (YYYY-MM-DD)
 * string.
 */
export function DatePicker({ value, onChange, placeholder = 'Select date', minYear, maxYear, disabled }: DatePickerProps) {
  const colors = useTheme();
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState<Date>(() => (value ? isoToDate(value) : new Date()));

  const minimumDate = minYear != null ? new Date(minYear, 0, 1) : undefined;
  const maximumDate = maxYear != null ? new Date(maxYear, 11, 31) : undefined;

  function open() {
    if (disabled) {
      return;
    }
    setPending(value ? isoToDate(value) : new Date());
    setVisible(true);
  }

  function close() {
    setVisible(false);
  }

  function confirm(date: Date) {
    onChange(dateToIso(date));
    close();
  }

  const field = (
    <Pressable
      onPress={open}
      disabled={disabled}
      style={[
        styles.field,
        { borderColor: colors.border, backgroundColor: colors.backgroundElement, opacity: disabled ? 0.6 : 1 },
      ]}>
      <ThemedText style={{ color: value ? colors.text : colors.textSecondary }}>
        {value ? formatIsoDateDMY(value) : placeholder}
      </ThemedText>
    </Pressable>
  );

  // Android's native dialog already provides its own modal chrome (confirm/cancel), so we
  // just mount it on demand instead of wrapping it in another modal of our own.
  if (Platform.OS === 'android') {
    return (
      <>
        {field}
        {visible ? (
          <ExpoDateTimePicker
            value={pending}
            mode="date"
            presentation="dialog"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onValueChange={(_event, date) => confirm(date)}
            onDismiss={close}
          />
        ) : null}
      </>
    );
  }

  // iOS always renders the picker inline, so we host it in our own bottom sheet with
  // Cancel/Done actions.
  return (
    <>
      {field}
      <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={styles.header}>
              <Pressable onPress={close} hitSlop={8}>
                <ThemedText type="linkPrimary" style={{ color: colors.primary }}>
                  Cancel
                </ThemedText>
              </Pressable>
              <ThemedText type="smallBold">Select date</ThemedText>
              <Pressable onPress={() => confirm(pending)} hitSlop={8}>
                <ThemedText type="linkPrimary" style={{ color: colors.primary }}>
                  Done
                </ThemedText>
              </Pressable>
            </View>
            <ExpoDateTimePicker
              value={pending}
              mode="date"
              display="spinner"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onValueChange={(_event, date) => setPending(date)}
              style={styles.picker}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Radii.large,
    borderTopRightRadius: Radii.large,
    borderWidth: 1,
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  picker: {
    height: 200,
  },
});


