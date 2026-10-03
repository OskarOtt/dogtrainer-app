/** Shared client-side mirror of the backend's UpdateUsernameRequest validation. */
export const USERNAME_MAX_LENGTH = 30;

// Letters/numbers (any script) plus spaces, periods, commas and hyphens — no emoji or
// other special characters. Must start with a letter or number.
const USERNAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} .,-]*$/u;

export type UsernameValidationError = 'required' | 'tooLong' | 'invalidChars';

/** Returns null when valid, otherwise which rule failed. */
export function validateUsername(rawName: string): UsernameValidationError | null {
  const name = rawName.trim();
  if (!name) {
    return 'required';
  }
  if (name.length > USERNAME_MAX_LENGTH) {
    return 'tooLong';
  }
  if (!USERNAME_PATTERN.test(name)) {
    return 'invalidChars';
  }
  return null;
}
