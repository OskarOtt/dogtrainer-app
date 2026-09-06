/** Formats a Date as a local (no timezone shift) ISO date string, YYYY-MM-DD. */
export function toIsoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses an ISO date (YYYY-MM-DD) into a local Date at midnight. Returns null when invalid/missing. */
export function parseIsoDateLocal(iso: string | null | undefined): Date | null {
  if (!iso) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** Formats an ISO date (YYYY-MM-DD) as dd-mm-yyyy for display. Returns '' when invalid/missing. */
export function formatIsoDateDMY(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) {
    return '';
  }
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}

/** Parses a dd-mm-yyyy string back into an ISO date (YYYY-MM-DD). Returns null when invalid. */
export function parseDMYToIso(dmy: string | null | undefined): string | null {
  if (!dmy) {
    return null;
  }
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dmy.trim());
  if (!match) {
    return null;
  }
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

/**
 * Formats a dog's age from an ISO birth date (YYYY-MM-DD) as a short human string,
 * e.g. "2 yrs", "8 mo", "3 wks". Returns null when no birth date is known.
 */
export function formatAge(birthDate: string | null | undefined): string | null {
  if (!birthDate) {
    return null;
  }
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()) - (now.getDate() < birth.getDate() ? 1 : 0);

  if (totalMonths < 1) {
    const days = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)));
    const weeks = Math.floor(days / 7);
    return weeks > 0 ? `${weeks} wk${weeks === 1 ? '' : 's'}` : `${days} day${days === 1 ? '' : 's'}`;
  }
  if (totalMonths < 24) {
    return `${totalMonths} mo`;
  }
  const years = Math.floor(totalMonths / 12);
  return `${years} yr${years === 1 ? '' : 's'}`;
}

/** Formats an ISO date-time as a short readable string, e.g. "Sep 3, 5:30 PM". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Formats a duration in minutes as a short human string, e.g. "1h 15m", "42m". */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null) {
    return '';
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) {
    return `${remaining}m`;
  }
  return remaining === 0 ? `${hours}h` : `${hours}h ${remaining}m`;
}

/** Formats elapsed seconds as a live session timer, e.g. "12:04". */
export function formatTimer(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
