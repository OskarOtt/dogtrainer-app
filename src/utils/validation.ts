import { t } from '@/i18n';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_SYMBOL_REGEX = /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~\\]/;
const PASSWORD_MIN_LENGTH = 8;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function getPasswordError(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return t('auth.passwordLength', { count: PASSWORD_MIN_LENGTH });
  }
  if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
    return t('auth.passwordCapital');
  }
  if (!PASSWORD_SYMBOL_REGEX.test(password)) {
    return t('auth.passwordSymbol');
  }
  return null;
}

export function isValidPassword(password: string): boolean {
  return getPasswordError(password) === null;
}
