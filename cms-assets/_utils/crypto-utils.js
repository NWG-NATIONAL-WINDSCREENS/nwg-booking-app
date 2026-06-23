export function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function signRequest(secret, body) {
  const timestamp = String(Date.now());
  const nonce = generateNonce();
  const payload = `${timestamp}.${nonce}.${body}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const signature = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { signature, timestamp, nonce };
}

export function buildParamsString(params) {
  if (!params || typeof params !== 'object') return '';
  return Object.keys(params)
    .filter((k) => params[k] != null)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
}
