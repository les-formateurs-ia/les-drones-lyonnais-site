// Service photos, cropped to 16:10 at build time so every service picture on the site
// shares the exact same proportions, whatever the source file.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/services/*.jpg', { eager: true });
const WIDTHS = [480, 640, 960, 1280];

export interface ServicePhoto {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

export async function servicePhoto(name: string): Promise<ServicePhoto> {
  const mod = files[`../assets/services/${name}`];
  if (!mod) throw new Error(`Missing service photo: src/assets/services/${name}`);
  const crops = await Promise.all(
    WIDTHS.map((w) => getImage({ src: mod.default, width: w, height: Math.round((w * 10) / 16), fit: 'cover', format: 'webp' })),
  );
  return {
    src: crops[2].src,
    srcset: crops.map((c, i) => `${c.src} ${WIDTHS[i]}w`).join(', '),
    width: 960,
    height: 600,
  };
}
