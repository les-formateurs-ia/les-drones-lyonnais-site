// Cloudflare Access sits in front of the admin and signs every request with a JWT
// (Cf-Access-Jwt-Assertion). We check it here too, so the Worker stays closed even if it
// is reached by another route (workers.dev, a misconfigured Access application…).
// https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/

interface Jwk extends JsonWebKey {
  kid: string;
}

let certs: { keys: Jwk[]; fetchedAt: number } | undefined;

async function keyFor(teamDomain: string, kid: string): Promise<CryptoKey | undefined> {
  const fresh = certs && Date.now() - certs.fetchedAt < 60 * 60 * 1000;
  if (!fresh || !certs!.keys.some((k) => k.kid === kid)) {
    const res = await fetch(`${teamDomain}/cdn-cgi/access/certs`);
    if (!res.ok) throw new Error(`Access certs: ${res.status}`);
    certs = { keys: ((await res.json()) as { keys: Jwk[] }).keys, fetchedAt: Date.now() };
  }
  const jwk = certs!.keys.find((k) => k.kid === kid);
  if (!jwk) return undefined;
  return crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
}

function b64url(input: string): Uint8Array {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

const json = (part: string) => JSON.parse(new TextDecoder().decode(b64url(part)));

/** Returns the signed-in user's email, or undefined if the request is not from Access. */
export async function accessUser(req: Request, teamDomain: string, aud: string): Promise<string | undefined> {
  const token = req.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return undefined;
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return undefined;

  try {
    const header = json(h) as { alg: string; kid: string };
    const payload = json(p) as { aud: string | string[]; exp: number; iss: string; email?: string };
    if (header.alg !== 'RS256') return undefined;

    const key = await keyFor(teamDomain, header.kid);
    if (!key) return undefined;
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(s), new TextEncoder().encode(`${h}.${p}`));
    if (!valid) return undefined;

    const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!auds.includes(aud) || payload.iss !== teamDomain || payload.exp * 1000 < Date.now()) return undefined;
    return payload.email ?? 'inconnu';
  } catch {
    return undefined;
  }
}
