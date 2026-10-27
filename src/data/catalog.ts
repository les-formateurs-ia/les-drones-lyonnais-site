// The shop and rental catalogue, imported from the WooCommerce site
// (scripts/import-catalog.mjs → catalog.json + src/assets/products/).
// Prices are stored excluding VAT (HT), as on the current site; rentals are per day.
import type { ImageMetadata } from 'astro';
import raw from './catalog.json';

export type ProductKind = 'vente' | 'location';

export interface Product {
  slug: string;
  name: string;
  kind: ProductKind;
  priceHT: number;
  priceTTC: number;
  categories: string[];
  summary: string;
  description: { type: 'p' | 'li' | 'h'; text: string }[];
  images: string[];
}

// WooCommerce stores some slugs percent-encoded (″ in a name): decode them so the pages
// are generated at the same URLs as on the current site.
export const PRODUCTS = (raw as Product[]).map((p) => ({ ...p, slug: decodeURIComponent(p.slug) }));
export const productUrl = (p: Product) => `/produit/${p.slug}/`;

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/products/*.webp', { eager: true });
export const productImages = (p: Product) => p.images.map((f) => files[`../assets/products/${f}`]?.default).filter(Boolean) as ImageMetadata[];

const euroWhole = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const euroCents = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
// Whole amounts without decimals (2 099 €), otherwise always two (94,80 €).
const euro = { format: (n: number) => (Number.isInteger(n) ? euroWhole : euroCents).format(n) };
export const formatPrice = (n: number) => euro.format(n).replace(/ /g, ' ');

/** Filters of the shop and the rental pages: a label and the WooCommerce categories it covers. */
export interface Filter {
  id: string;
  label: string;
  match: (p: Product) => boolean;
}
const has = (...cats: string[]) => (p: Product) => cats.some((c) => p.categories.includes(c));

export const SHOP_FILTERS: Filter[] = [
  { id: 'drones', label: 'Drones', match: (p) => has('drones')(p) && !has('kit-c5')(p) },
  { id: 'c5', label: 'Certifiés C5 et kits', match: has('c5', 'kit-c5', 'c6') },
  { id: 'capteurs', label: 'Capteurs et nacelles', match: (p) => p.categories.some((c) => c.startsWith('capteur')) },
  { id: 'batteries', label: 'Batteries et recharge', match: has('batterie') },
  { id: 'accessoires', label: 'Accessoires', match: (p) => has('accessoires', 'accessoires-pieces')(p) && !has('batterie')(p) },
];

export const RENTAL_FILTERS: Filter[] = [
  { id: 'packs', label: 'Packs', match: has('pack') },
  { id: 'drones', label: 'Drones', match: (p) => has('drones')(p) && !has('pack')(p) },
  { id: 'cameras', label: 'Caméras et objectifs', match: (p) => has('camera')(p) && !has('pack')(p) },
  { id: 'audio', label: 'Son', match: has('audio') },
  { id: 'lumiere', label: 'Lumière', match: has('eclairage') },
  { id: 'accessoires', label: 'Accessoires', match: (p) => has('accessoires')(p) && !has('pack', 'eclairage', 'audio', 'camera')(p) },
];

/** EASA drone class shown as a badge on shop drones. */
export const droneClass = (p: Product) => {
  const order = ['c6', 'c5', 'c3', 'c2', 'c1', 'co_c1', 'c0'];
  const c = order.find((k) => p.categories.includes(k));
  return c ? (c === 'co_c1' ? 'C0/C1' : c.toUpperCase()) : null;
};

// Catalogue order: as the filters list them (drones first), then by price, highest first.
const rank = (filters: Filter[]) => (p: Product) => {
  const i = filters.findIndex((f) => f.match(p));
  return i < 0 ? filters.length : i;
};
const ordered = (list: Product[], filters: Filter[]) => [...list].sort((a, b) => rank(filters)(a) - rank(filters)(b) || b.priceTTC - a.priceTTC);

export const forSale = ordered(PRODUCTS.filter((p) => p.kind === 'vente'), SHOP_FILTERS);
export const forRent = ordered(PRODUCTS.filter((p) => p.kind === 'location'), RENTAL_FILTERS);
export const bestSellers = PRODUCTS.filter((p) => p.categories.includes('meilleures-ventes'));
