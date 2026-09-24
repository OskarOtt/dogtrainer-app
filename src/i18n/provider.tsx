import { useQueryClient } from '@tanstack/react-query';
import { useLocales } from 'expo-localization';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';

import {
  getLocaleTag,
  getSystemLocale,
  setAppLocale,
  t,
  type AppLocale,
} from '@/i18n';
import {
  loadLanguagePreference,
  saveLanguagePreference,
  type LanguagePreference,
} from '@/i18n/language-preference';

interface LocalizationContextValue {
  locale: AppLocale;
  localeTag: 'en-US' | 'nb-NO';
  languagePreference: LanguagePreference;
  setLanguagePreference: (preference: LanguagePreference) => void;
  t: typeof t;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

function isLocalizedQuery(queryKey: readonly unknown[]): boolean {
  const [root, , resource] = queryKey;
  return (
    (root === 'training' || root === 'training-plans') ||
    (root === 'dogs' && (resource === 'training-plans' || resource === 'statistics' || resource === 'progress'))
  );
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  useLocales();
  const queryClient = useQueryClient();
  const [, refreshLocale] = useReducer((value: number) => value + 1, 0);
  const [languagePreference, setStoredLanguagePreference] = useState<LanguagePreference | null>(null);
  const systemLocale = getSystemLocale();
  const locale = languagePreference === null || languagePreference === 'system'
    ? systemLocale
    : languagePreference;

  setAppLocale(locale);

  useEffect(() => {
    let isMounted = true;

    loadLanguagePreference()
      .then((preference) => {
        if (isMounted) {
          setStoredLanguagePreference(preference);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStoredLanguagePreference('system');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguagePreference = useCallback((preference: LanguagePreference) => {
    setStoredLanguagePreference(preference);
    void saveLanguagePreference(preference).catch((error: unknown) => {
      console.warn('Could not save language preference.', error);
    });
  }, []);

  useEffect(() => {
    if (languagePreference === null) {
      return;
    }
    setAppLocale(locale);
    void queryClient.resetQueries({
      predicate: (query) => isLocalizedQuery(query.queryKey),
    });
  }, [languagePreference, locale, queryClient]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshLocale();
      }
    });
    return () => subscription.remove();
  }, []);

  const value = useMemo<LocalizationContextValue>(
    () => ({
      locale,
      localeTag: getLocaleTag(locale),
      languagePreference: languagePreference ?? 'system',
      setLanguagePreference,
      t,
    }),
    [languagePreference, locale, setLanguagePreference],
  );

  if (languagePreference === null) {
    return null;
  }

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useTranslation(): LocalizationContextValue {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useTranslation must be used within LocalizationProvider');
  }
  return context;
}
