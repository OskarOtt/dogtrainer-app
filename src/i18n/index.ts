import { getLocales } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';

import { en } from '@/i18n/en';
import { nb } from '@/i18n/nb';

export type AppLocale = 'en' | 'nb';

type DotPath<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends { one: string; other: string }
      ? K
    : T[K] extends Record<string, unknown>
      ? `${K}.${DotPath<T[K]>}`
      : never;
}[keyof T & string];

export type TranslationKey = DotPath<typeof en>;

const i18n = new I18n({ en, nb });
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

export function resolveLocale(languageCode: string | null | undefined): AppLocale {
  const code = languageCode?.toLowerCase().split(/[-_]/)[0];
  return code === 'nb' || code === 'no' || code === 'nn' ? 'nb' : 'en';
}

export function getSystemLocale(): AppLocale {
  return resolveLocale(getLocales()[0]?.languageCode);
}

export function setAppLocale(locale: AppLocale): void {
  i18n.locale = locale;
}

export function getAppLocale(): AppLocale {
  return resolveLocale(i18n.locale);
}

export function getLocaleTag(locale = getAppLocale()): 'en-US' | 'nb-NO' {
  return locale === 'nb' ? 'nb-NO' : 'en-US';
}

export function t(key: TranslationKey, options?: TranslateOptions): string {
  return i18n.t(key, options);
}

setAppLocale(getSystemLocale());
