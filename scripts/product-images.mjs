// Product photos from a manufacturer page, for client requests (see .claude/CLAUDE.md).
// Only hosts listed in scripts/product-sources.json are fetched.
//
//   node scripts/product-images.mjs find <page-url>
//     Lists the page's large images (biggest first) and writes a small preview of each to
//     .claude-request/candidates/ so they can be looked at before choosing.
//   node scripts/product-images.mjs save <slug> <image-url> [<image-url>…]
//     Saves up to 4 images as src/assets/products/<slug>-<n>.webp (900 px, white
//     background, as scripts/import-catalog.mjs does) and prints the "images" array.

import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SOURCES = JSON.parse(readFileSync(join(ROOT, 'scripts/product-sources.json'), 'utf8'));
const HOSTS = [...SOURCES.sites, ...SOURCES.cdn];
const PRODUCTS = join(ROOT, 'src/assets/products');
const CANDIDATES = join(ROOT, '.claude-request/candidates');
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_IMAGES = 4;
const MIN_SIDE = 500;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

function allowed(url) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

async function get(url) {
  if (!allowed(url)) throw new Error(`Domaine non autorisé (scripts/product-sources.json) : ${url}`);
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
  if (!allowed(res.url)) throw new Error(`Redirection vers un domaine non autorisé : ${res.url}`);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  if (Number(res.headers.get('content-length')) > MAX_BYTES) throw new Error(`Fichier trop lourd : ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new Error(`Fichier trop lourd : ${url}`);
  return { buf, type: res.headers.get('content-type') ?? '' };
}

// CDNs serve one photo under many names (DJI: x@small.jpg, x@origin.png, x.jpg.webp…):
// group them by name without size suffix or extension, and keep the largest variant.
const RANK = ['@origin', '@ultra', '', '@retina', '@large', '@middle', '@small'];
const VARIANT = /@[a-z_*0-9]+(?=(\.\w+)+$)/i;
const variantOf = (url) => (new URL(url).pathname.match(VARIANT)?.[0] ?? '').toLowerCase();
const keyOf = (url) => {
  const u = new URL(url);
  return u.hostname + u.pathname.replace(VARIANT, '').replace(/(\.\w+)+$/, '');
};
// DJI's CDN serves any photo at full size with the @origin suffix.
const largest = (url) => {
  const u = new URL(url);
  if (!u.hostname.endsWith('djiits.com') || !VARIANT.test(u.pathname)) return [url];
  return [u.pathname.replace(VARIANT, '@origin'), u.pathname.replace(VARIANT, '@ultra')].map((p) => `${u.origin}${p}`).concat(url);
};
const rank = (url) => {
  const v = variantOf(url);
  const i = v ? RANK.findIndex((r) => r && v.startsWith(r)) : RANK.indexOf('');
  return i === -1 ? RANK.length : i;
};

function imageUrls(html, base) {
  const found = [];
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1];
  if (og) found.push(og);
  for (const m of html.matchAll(/(?:https?:)?\/\/[a-z0-9.-]+\/[^"'\s)<>\\]+?\.(?:jpe?g|png|webp)(?:\?[^"'\s)<>\\]*)?/gi)) found.push(m[0]);
  const best = new Map();
  for (const raw of found) {
    let url;
    try {
      url = new URL(raw.replace(/&amp;/g, '&'), base).href;
    } catch {
      continue;
    }
    if (!allowed(url)) continue;
    const key = keyOf(url);
    const current = best.get(key);
    if (!current || rank(url) < rank(current)) best.set(key, url);
  }
  return [...best.values()];
}

/** True when the photo's border is white: a packshot, like the rest of the catalogue. */
async function onWhite(buf) {
  const { data, info } = await sharp(buf).flatten({ background: '#ffffff' }).resize(24, 24, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  let edge = 0;
  let white = 0;
  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 24; x++) {
      if (x > 0 && x < 23 && y > 0 && y < 23) continue;
      const i = (y * 24 + x) * info.channels;
      edge++;
      if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) white++;
    }
  }
  return white / edge > 0.9;
}

async function find(pageUrl) {
  const { buf } = await get(pageUrl);
  const urls = imageUrls(buf.toString('utf8'), pageUrl).slice(0, 60);
  rmSync(CANDIDATES, { recursive: true, force: true });
  mkdirSync(CANDIDATES, { recursive: true });

  const results = [];
  for (let i = 0; i < urls.length; i += 6) {
    const batch = await Promise.all(
      urls.slice(i, i + 6).map(async (url) => {
        for (const candidate of largest(url)) {
          try {
            const { buf } = await get(candidate);
            const meta = await sharp(buf).metadata();
            if (Math.min(meta.width ?? 0, meta.height ?? 0) < MIN_SIDE) return null;
            return { url: candidate, buf, width: meta.width, height: meta.height, white: await onWhite(buf) };
          } catch {}
        }
        return null;
      }),
    );
    results.push(...batch.filter(Boolean));
  }
  results.sort((a, b) => Number(b.white) - Number(a.white) || b.width * b.height - a.width * a.height);

  if (!results.length) {
    console.log(`Aucune image d'au moins ${MIN_SIDE} px trouvée sur ${pageUrl}.`);
    return;
  }
  for (const [n, r] of results.slice(0, 20).entries()) {
    const file = join(CANDIDATES, `c${String(n + 1).padStart(2, '0')}.jpg`);
    await sharp(r.buf).resize(400, 400, { fit: 'inside' }).flatten({ background: '#ffffff' }).jpeg({ quality: 70 }).toFile(file);
    console.log(`${file.replace(ROOT, '')}  ${r.width}×${r.height}${r.white ? '  fond blanc' : ''}\n  ${r.url}`);
  }
}

async function save(slug, urls) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? '')) throw new Error(`Slug invalide : ${slug}`);
  if (!urls.length) throw new Error('Indiquez au moins une URL d’image.');
  if (urls.length > MAX_IMAGES) throw new Error(`${MAX_IMAGES} images maximum.`);
  const files = urls.map((_, i) => `${slug}-${i + 1}.webp`);
  const taken = files.filter((f) => existsSync(join(PRODUCTS, f)));
  if (taken.length) throw new Error(`Déjà présentes, non remplacées : ${taken.join(', ')}`);

  for (const [i, url] of urls.entries()) {
    const { buf, type } = await get(url);
    if (!type.startsWith('image/') && !(await sharp(buf).metadata().catch(() => null))) throw new Error(`Pas une image : ${url}`);
    await sharp(buf)
      .resize(900, 900, { fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .webp({ quality: 82 })
      .toFile(join(PRODUCTS, files[i]));
  }
  console.log(JSON.stringify(files));
}

const [command, ...args] = process.argv.slice(2);
try {
  if (command === 'find' && args.length === 1) await find(args[0]);
  else if (command === 'save') await save(args[0], args.slice(1));
  else {
    console.error('Usage : node scripts/product-images.mjs find <page-url> | save <slug> <image-url>…');
    process.exit(2);
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
