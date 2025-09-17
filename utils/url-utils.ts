export function sanitizeRedirect(raw: string | null): string | undefined {
  if (!raw) return undefined;
  try {
    // Resolve against current origin; rejects cross-origin
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return undefined; // blocks http(s)://evil.com
    const path = url.pathname + url.search + url.hash;
    // Disallow protocol-relative //host paths and non-rooted paths
    if (!path.startsWith("/")) return undefined;
    return path;
  } catch {
    return undefined;
  }
}
