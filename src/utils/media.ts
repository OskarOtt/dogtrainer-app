/**
 * Some stored media URLs are missing their scheme (e.g. `dogtrainer-media.oskott.com/...`
 * instead of `https://dogtrainer-media.oskott.com/...`), which native Image components fail
 * to load silently. Prepends `https://` when a URL has no scheme; leaves local `file://` URIs
 * and already-absolute URLs untouched.
 */
export function ensureMediaUri(uri: string): string;
export function ensureMediaUri(uri: string | null | undefined): string | null | undefined;
export function ensureMediaUri(uri: string | null | undefined): string | null | undefined {
  if (!uri) {
    return uri;
  }
  return /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(uri) ? uri : `https://${uri}`;
}
