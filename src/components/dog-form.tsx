import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { DatePicker } from '@/components/date-picker';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Dog, DogPayload, DogSex } from '@/types/dog';

export interface DogFormProps {
  initialValue?: Dog;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: DogPayload) => void;
}

const SEX_OPTIONS: { label: string; value: DogSex }[] = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
];

/** Shared add/edit form used by both the "new dog" and "edit dog" screens. */
export function DogForm({ initialValue, submitLabel, isSubmitting, errorMessage, onSubmit }: DogFormProps) {
  const colors = useTheme();

  const [name, setName] = useState(initialValue?.name ?? '');
  const [breed, setBreed] = useState(initialValue?.breed ?? '');
  const [birthDate, setBirthDate] = useState(initialValue?.birthDate ?? '');
  const [sex, setSex] = useState<DogSex | null>(initialValue?.sex ?? null);
  const [weight, setWeight] = useState(initialValue?.weight != null ? String(initialValue.weight) : '');
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl ?? '');

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement },
  ];

  function handleSubmit() {
    const parsedWeight = weight.trim() ? Number(weight.trim()) : null;
    onSubmit({
      name: name.trim(),
      breed: breed.trim() || null,
      birthDate: birthDate.trim() || null,
      sex,
      weight: parsedWeight != null && !Number.isNaN(parsedWeight) ? parsedWeight : null,
      imageUrl: imageUrl.trim() || null,
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <ThemedText type="smallBold">Name</ThemedText>
      <TextInput value={name} onChangeText={setName} placeholder="Dog's name" placeholderTextColor={colors.textSecondary} style={inputStyle} />

      <ThemedText type="smallBold">Breed</ThemedText>
      <TextInput
        value={breed}
        onChangeText={setBreed}
        placeholder="e.g. Labrador Retriever"
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
      />

      <ThemedText type="smallBold">Birth date</ThemedText>
      <DatePicker
        value={birthDate || null}
        onChange={setBirthDate}
        placeholder="Select birth date"
        minYear={new Date().getFullYear() - 30}
        maxYear={new Date().getFullYear()}
      />

      <ThemedText type="smallBold">Sex</ThemedText>
      <View style={styles.sexRow}>
        {SEX_OPTIONS.map((option) => {
          const selected = sex === option.value;
          return (
            <PrimaryButton
              key={option.value}
              title={option.label}
              variant={selected ? 'primary' : 'secondary'}
              onPress={() => setSex(selected ? null : option.value)}
              style={styles.sexButton}
            />
          );
        })}
      </View>

      <ThemedText type="smallBold">Weight (kg)</ThemedText>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        placeholder="e.g. 25.5"
        placeholderTextColor={colors.textSecondary}
        keyboardType="decimal-pad"
        style={inputStyle}
      />

      <ThemedText type="smallBold">Photo URL</ThemedText>
      <TextInput
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="https://..."
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        style={inputStyle}
      />

      {errorMessage ? (
        <ThemedText themeColor="danger" style={styles.error}>
          {errorMessage}
        </ThemedText>
      ) : null}

      <PrimaryButton
        title={submitLabel}
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={!name.trim()}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    marginBottom: Spacing.two,
  },
  sexRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  sexButton: {
    flex: 1,
  },
  error: {
    textAlign: 'center',
  },
  submitButton: {
    marginTop: Spacing.three,
  },
});
