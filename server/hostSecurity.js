// Shared host/origin allowlist for public Rental Zone API routes.
// Add a custom production domain here when it is connected to Vercel.
export const ALLOWED_HOSTS = [
  'rental-zone-taupe.vercel.app',
  /^rental-zone-[a-z0-9-]+\.vercel\.app$/
];

function hostIsAllowed(value) {
  if (!value || typeof value !== 'string') return false;
  const hostname = value.split(':')[0].toLowerCase();
  return ALLOWED_HOSTS.some((allowed) =>
    allowed instanceof RegExp ? allowed.test(hostname) : hostname === allowed
  );
}

export function isAllowedRequestHost(req) {
  const host = String(req.headers.host || '').toLowerCase();
  if (!hostIsAllowed(host)) return false;

  const origin = req.headers.origin;
  if (!origin) return true;

  try {
    return hostIsAllowed(new URL(origin).hostname);
  } catch {
    return false;
  }
}
