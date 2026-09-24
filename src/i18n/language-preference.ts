import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppLocale } from '@/i18n';

const LANGUAGE_PREFERENCE_KEY = 'dogtrainer.language-preference';

export type LanguagePreference = AppLocale | 'system';

function isLanguagePreference(value: string | null): value is LanguagePreference {
  return value === 'system' || value === 'en' || value === 'nb';
}

export async function loadLanguagePreference(): Promise<LanguagePreference> {
  const storedPreference = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
  return isLanguagePreference(storedPreference) ? storedPreference : 'system';
}

export async function saveLanguagePreference(preference: LanguagePreference): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, preference);
}
