// Product photos at a fixed ratio for cards and decks. Product shots are on white, so
// they are fitted inside (never cropped) on a white background.
import { getImage } from 'astro:assets';
import type { ServicePhoto } from './service-photo';
import { productImages, type Product } from '../data/catalog';

const WIDTHS = [320, 480, 720];

export async function productPhoto(product: Product, ratio = 1, index = 0): Promise<ServicePhoto | null> {
  const img = productImages(product)[index];
  if (!img) return null;
  const crops = await Promise.all(
    WIDTHS.map((w) => getImage({ src: img, width: w, height: Math.round(w / ratio), fit: 'contain', background: '#ffffff', format: 'webp' })),
  );
  return { src: crops[1].src, srcset: crops.map((c, i) => `${c.src} ${WIDTHS[i]}w`).join(', '), width: 480, height: Math.round(480 / ratio) };
}

/** Deck cards (DeckHero) for a list of products, in the given order. */
export async function productDeckCards(products: Product[], tag: (p: Product) => string) {
  const { formatPrice, productUrl } = await import('../data/catalog');
  const cards = await Promise.all(
    products.map(async (p) => {
      const photo = await productPhoto(p, 4 / 5);
      if (!photo) return null;
      const price = `${formatPrice(p.priceTTC)} TTC${p.kind === 'location' ? ' / jour' : ''}`;
      const first = p.summary.split(/(?<=\.)\s/)[0];
      // Short, so the text stays on the dark part of the card.
      const short = first.length > 90 ? `${first.slice(0, 88).replace(/\s\S*$/, '')}…` : first;
      return { href: productUrl(p), label: p.name, summary: `${price}. ${short}`, tag: tag(p), photo };
    }),
  );
  return cards.filter((c): c is NonNullable<typeof c> => c !== null);
}
